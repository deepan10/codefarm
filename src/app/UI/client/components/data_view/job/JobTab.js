
import React from "react";
import PropTypes from "prop-types";
import LightComponent from "ui-lib/light_component";
import { JobCard } from "ui-components/data_card";
import { Row, Column, Header, Section } from "ui-components/layout";
import { BaselineContent } from "ui-components/baseline_content";
import CommentList from "./CommentList";

class JobTab extends LightComponent {
    render() {
        this.log("render", this.props, this.state);

        return (
            <Row>
                <Column xs={12} md={6}>
                    <Section>
                        <Header label="Properties" />
                        <JobCard
                            item={this.props.job}
                            expanded={true}
                            expandable={false}
                        />
                    </Section>
                    <Section>
                        <Header label="Comments" />
                        <CommentList
                            theme={this.props.theme}
                            item={this.props.job}
                        />
                    </Section>
                </Column>
                <If condition={this.props.job.baseline !== false}>
                    <Column xs={12} md={6}>
                        <Header label="In this run" />
                        <BaselineContent
                            theme={this.props.theme}
                            baselineRef={{
                                _ref: true,
                                id: this.props.job.baseline._id,
                                type: this.props.job.baseline.type
                            }}
                        />
                    </Column>
                </If>
            </Row>
        );
    }
}

JobTab.propTypes = {
    theme: PropTypes.object,
    job: PropTypes.object.isRequired
};

export default JobTab;
