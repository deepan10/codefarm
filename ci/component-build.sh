#!/bin/bash -e

startTime=$(($(date +%s%N)/1000000))

function printUsage() {
  echo "Usage: $0 [-C <cli_path>] <component> <dev/rel>"
}

if [ $# -lt 2 ]; then
  echo "Error: Illegal number of arguments"
  printUsage
  exit 1
fi

# Extract optional CLI path
while getopts ":C:" opt; do
  case "$opt" in
    C) CLI=$OPTARG ;;
  esac
done
shift $(( OPTIND - 1 ))

# Define CLI as doing nothing if flag is not set
if [[ "$CLI" == "" ]]; then
  CLI=`which true`
else
  CLI="node ${CLI}"
fi

target=$1
mode=$2

gitroot=$(git rev-parse --show-toplevel)
source $gitroot/ci/common.source

if [[ " ${components[*]} " != *" ${target} "* ]]; then
  echo "Error: Component must be one of ${components[*]}"
  printUsage
  exit 1
fi

if [[ "${mode}" != "rel" && "${mode}" != "dev" ]]; then
  echo "Error: Second argument must be 'dev' or 'rel'"
  printUsage
  exit 1
fi

installFlag=""
if [ "${mode}" == "rel" ]; then
  installFlag="--production"
fi

result=0

pushd ${gitroot}/src/app/${target}
  echo "Running install on ${target}"

  subJobName="${target}_build_${mode}"
  subJobId=$($CLI -q '$._id' --format values create_subjob build "${subJobName}" ongoing)

  yarn install ${installFlag} |& tee ${subJobName}.log
  result=${PIPESTATUS[0]}

  $CLI upload_log ${PWD}/${subJobName}.log ${subJobName}.log

  stopTime=$(($(date +%s%N)/1000000))
  testDuration=`expr $stopTime - $startTime`
  testDurationStr={\"timeMs\":$testDuration}
  #Need to restart clock for possible UI compile-client build
  startTime=$(($(date +%s%N)/1000000))

  if [[ $result -eq 1 ]]; then
    $CLI update_subjob $subJobId -s fail --result $testDurationStr
    exit 1
  else
    $CLI update_subjob $subJobId -s success --result $testDurationStr
  fi
popd

# Special case for UI in release mode: run compile-client
if [[ "${target}" == "UI" && "${mode}" == "rel" ]]; then
  echo "Running UI compile-client"
  pushd ${gitroot}/src/app/${target}
    subJobName="${component}_compile_client_build_${mode}"
    subJobId=$($CLI -q '$._id' --format values create_subjob build "${subJobName}" ongoing)

    yarn compile-client --production |& tee ${subJobName}.log
    result=${PIPESTATUS[0]}

    $CLI upload_log ${PWD}/${subJobName}.log ${subJobName}.log

    stopTime=$(($(date +%s%N)/1000000))
    testDuration=`expr $stopTime - $startTime`
    testDurationStr={\"timeMs\":$testDuration}

    if [[ $result -eq 1 ]]; then
      $CLI update_subjob $subJobId -s fail --result $testDurationStr
      exit 1
    else
      $CLI update_subjob $subJobId -s success --result $testDurationStr
    fi

  popd
fi

# Special case for Exec in release mode: run compile
if [[ "${target}" == "Exec" && "${mode}" == "rel" ]]; then
  echo "Running Exec compile"
  pushd ${gitroot}/src/app/${target}
    subJobName="${component}_compile_build_${mode}"
    subJobId=$($CLI -q '$._id' --format values create_subjob build "${subJobName}" ongoing)

    yarn compile --production |& tee ${subJobName}.log
    result=${PIPESTATUS[0]}

    $CLI upload_log ${PWD}/${subJobName}.log ${subJobName}.log

    stopTime=$(($(date +%s%N)/1000000))
    testDuration=`expr $stopTime - $startTime`
    testDurationStr={\"timeMs\":$testDuration}

    if [[ $result -eq 1 ]]; then
      $CLI update_subjob $subJobId -s fail --result $testDurationStr
      exit 1
    else
      $CLI update_subjob $subJobId -s success --result $testDurationStr
    fi

  popd
fi
