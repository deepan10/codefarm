
import React from "react";
import RevisionCard from "./RevisionCard";
import CodeRepositoryCard from "./CodeRepositoryCard";
import ArtifactCard from "./ArtifactCard";
import ArtifactRepositoryCard from "./ArtifactRepositoryCard";
import JobCard from "./JobCard";
import SubJobCard from "./SubJobCard";
import LogCard from "./LogCard";
import LogRepositoryCard from "./LogRepositoryCard";
import UserCard from "./UserCard";
import TeamCard from "./TeamCard";
import UserPolicyCard from "./UserPolicyCard";
import StatSpecCard from "./StatSpecCard";
import StatStatCard from "./StatStatCard";
import StatChartCard from "./StatChartCard";
import SlaveCard from "./SlaveCard";
import FlowCard from "./FlowCard";
import BaselineSpecificationCard from "./BaselineSpecificationCard";
import BaselineCard from "./BaselineCard";
import CollectorCard from "./CollectorCard";

const Cards = {
    "coderepo.revision": RevisionCard,
    "coderepo.repository": CodeRepositoryCard,
    "artifactrepo.artifact": ArtifactCard,
    "artifactrepo.repository": ArtifactRepositoryCard,
    "exec.job": JobCard,
    "exec.subjob": SubJobCard,
    "logrepo.log": LogCard,
    "logrepo.repository": LogRepositoryCard,
    "userrepo.user": UserCard,
    "userrepo.team": TeamCard,
    "userrepo.policy": UserPolicyCard,
    "stat.spec": StatSpecCard,
    "stat.stat": StatStatCard,
    "stat.chart": StatChartCard,
    "exec.slave": SlaveCard,
    "flowctrl.flow": FlowCard,
    "baselinegen.specification": BaselineSpecificationCard,
    "baselinegen.baseline": BaselineCard,
    "baselinegen.collector": CollectorCard
};

class TypeCard extends React.PureComponent {
    render() {
        const Card = Cards[this.props.item.type];

        if (!Card) {
            return (
                <div>No card for type {this.props.item.type}</div>
            );
        }

        return (
            <Card {...this.props} />
        );
    }
}

TypeCard.propTypes = {
    theme: React.PropTypes.object,
    item: React.PropTypes.object.isRequired,
    expanded: React.PropTypes.bool,
    expandable: React.PropTypes.bool
};

export default TypeCard;
