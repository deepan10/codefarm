"use strict";

const DEFAULT_HEARTBEAT_INTERVAL = 10000;
const DEFAULT_HEARTBEAT_TIMEOUT = 20000;
const DEFAULT_DISPOSE_RUN_WAIT_TIMEOUT = 5000;
/** Minimun run-time before restart. Limits the restart frequency. */
const DEFAULT_MIN_RUN_TIME = 2500;

module.exports = {
    DEFAULT_HEARTBEAT_INTERVAL,
    DEFAULT_HEARTBEAT_TIMEOUT,
    DEFAULT_DISPOSE_RUN_WAIT_TIMEOUT,
    DEFAULT_MIN_RUN_TIME
};
