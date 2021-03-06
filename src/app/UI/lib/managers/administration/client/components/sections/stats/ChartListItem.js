import React from "react";
import PropTypes from "prop-types";
import LightComponent from "ui-lib/light_component";
import { ListItem } from "react-toolbox/lib/list";
import { ListItemIcon } from "ui-components/type_admin";

class StatListItem extends LightComponent {
    render() {
        this.log("render", this.props, this.state);

        const item = this.props.item;

        let rightIcon;
        if (item.pinned) {
            rightIcon = (<ListItemIcon icon="location_on" />);
        }

        return (
            <ListItem
                onClick={() => {
                    if (this.props.onClick) {
                        this.props.onClick(item);
                    }
                }}
                leftIcon={<ListItemIcon icon="timeline" />}
                rightIcon={rightIcon}
                selectable={!!this.props.onClick}
                caption={item.name}
                legend={item._id || ""}
            />
        );
    }
}

StatListItem.propTypes = {
    theme: PropTypes.object,
    item: PropTypes.object.isRequired,
    itemContext: PropTypes.array,
    onClick: PropTypes.func
};

export default StatListItem;
