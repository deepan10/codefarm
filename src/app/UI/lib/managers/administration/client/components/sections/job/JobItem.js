
import React from "react";
import PropTypes from "prop-types";
import {
    Section as TASection
} from "ui-components/type_admin";
import { JobView } from "ui-components/data_view";

class Item extends React.PureComponent {
    render() {
        return (
            <TASection
                controls={this.props.controls}
                breadcrumbs={this.props.breadcrumbs}
                menuItems={this.props.menuItems}
            >
                <div className={this.props.theme.container}>
                    <JobView
                        theme={this.props.theme}
                        item={this.props.item}
                    />
                </div>
            </TASection>
        );
    }
}

Item.propTypes = {
    theme: PropTypes.object,
    item: PropTypes.object.isRequired,
    pathname: PropTypes.string.isRequired,
    breadcrumbs: PropTypes.array.isRequired,
    controls: PropTypes.array.isRequired,
    menuItems: PropTypes.array.isRequired
};

export default Item;
