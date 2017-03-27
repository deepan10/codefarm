
import React from "react";
import LightComponent from "ui-lib/light_component";
import { CardTitle, CardText } from "react-toolbox/lib/card";
import UserAvatar from "ui-components/user_avatar";
import DateTime from "ui-components/datetime";
import ExpandableCard from "ui-components/expandable_card";
import stateVar from "ui-lib/state_var";
import UserName from "ui-components/user_name";

class CommentCard extends LightComponent {
    constructor(props) {
        super(props);

        this.state = {
            expanded: stateVar(this, "expanded", props.expanded)
        };
    }

    render() {
        let title;
        let avatar;
        if (this.props.item.creatorRef && this.props.item.creatorRef.type === "userrepo.user") {
            title = (
                <UserName
                    userId={this.props.item.creatorRef ? this.props.item.creatorRef.id : false}
                    notFoundText="Someone"
                    suffixText="said..."
                />
            );
            avatar = (
                <UserAvatar
                    className={this.props.theme.avatar}
                    userId={this.props.item.creatorRef ? this.props.item.creatorRef.id : false}
                />
            );
        } else if (this.props.item.creatorRef) {
            title = (
                <span>
                    Type: {this.props.item.creatorRef.type} - id: {this.props.item.creatorRef.id}
                </span>
            );
        } else {
            title = (
                <span>Unkown creator</span>
            );
        }

        return (
            <ExpandableCard
                className={this.props.theme.card}
                expanded={this.state.expanded}
                expandable={this.props.expandable}
            >
                <CardTitle
                    avatar={avatar}
                    title={title}
                    subtitle={(
                        <DateTime
                            value={this.props.item.created}
                            niceDate={true}
                        />
                    )}
                />
                <If condition={this.state.expanded.value}>
                    <CardText>
                        <span className={this.props.theme.commentLineWrap}>
                            {this.props.item.text}
                        </span>
                    </CardText>
                </If>
            </ExpandableCard>
        );
    }
}

CommentCard.defaultProps = {
    expanded: false,
    expandable: true
};

CommentCard.propTypes = {
    theme: React.PropTypes.object,
    item: React.PropTypes.object.isRequired,
    expanded: React.PropTypes.bool,
    expandable: React.PropTypes.bool
};

export default CommentCard;
