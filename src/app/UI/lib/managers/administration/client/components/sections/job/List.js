
import React from "react";
import Component from "ui-lib/component";
import Input from "react-toolbox/lib/input";
import {
    Section as TASection,
    PagedList as TAPagedList
} from "ui-components/type_admin";
import JobListItem from "./ListItem";

class List extends Component {
    constructor(props) {
        super(props);

        this.addStateVariable("filter", "");
        this.addStateVariable("relative", "__HEAD__", true);
    }

    render() {
        this.log("render", this.props, this.state);

        const controls = this.props.controls.slice(0);

        controls.push((
            <Input
                key="filter"
                className={this.props.theme.filterInput}
                type="text"
                label="Filter list"
                name="filter"
                value={this.state.filter.value}
                onChange={this.state.filter.set}
            />
        ));

        return (
            <TASection
                controls={controls}
                breadcrumbs={this.props.breadcrumbs}
            >
                <TAPagedList
                    type={this.props.type}
                    filter={this.state.filter.value}
                    filterFields={[ "name", "status", "criteria" ]}
                    pageSize={5}
                    ListItemComponent={JobListItem}
                    onSelect={(item) => {
                        this.context.router.push({
                            pathname: `${this.props.pathname}/${item._id}`
                        });
                    }}
                    location={this.props.location}
                    route={this.props.route}
                    relative={this.state.relative}
                />
            </TASection>
        );
    }
}

List.propTypes = {
    theme: React.PropTypes.object,
    pathname: React.PropTypes.string.isRequired,
    type: React.PropTypes.string.isRequired,
    breadcrumbs: React.PropTypes.array.isRequired,
    controls: React.PropTypes.array.isRequired,
    location: React.PropTypes.object.isRequired,
    route: React.PropTypes.object.isRequired
};

List.contextTypes = {
    router: React.PropTypes.object.isRequired
};

export default List;
