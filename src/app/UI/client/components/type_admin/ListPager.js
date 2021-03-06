
import React from "react";
import PropTypes from "prop-types";
import ImmutablePropTypes from "react-immutable-proptypes";
import { Button } from "react-toolbox/lib/button";

class ListPager extends React.PureComponent {
    render() {
        const pagingInfo = this.props.pagingInfo.toJS();

        return (
            <div className={this.props.theme.pager}>
                <Button
                    className={this.props.theme.pagerButton}
                    icon="first_page"
                    disabled={pagingInfo.isFirstPage}
                    onClick={() => this.props.pagedList.setFirstPage()}
                />
                <Button
                    className={this.props.theme.pagerButton}
                    icon="navigate_before"
                    disabled={!pagingInfo.hasPrevPage || pagingInfo.isFirstPage}
                    onClick={() => this.props.pagedList.setPrevPage()}
                />
                <Button
                    className={this.props.theme.pagerButton}
                    icon="navigate_next"
                    disabled={!pagingInfo.hasNextPage}
                    onClick={() => this.props.pagedList.setNextPage()}
                />
                <Button
                    className={this.props.theme.pagerButton}
                    icon="last_page"
                    disabled={pagingInfo.isLastPage || !pagingInfo.hasNextPage}
                    onClick={() => this.props.pagedList.setLastPage()}
                />
            </div>
        );
    }
}

ListPager.propTypes = {
    theme: PropTypes.object,
    pagedList: PropTypes.object.isRequired,
    pagingInfo: ImmutablePropTypes.map.isRequired
};

export default ListPager;
