
import React from "react";
import PropTypes from "prop-types";
import { States as ObservableDataStates } from "ui-lib/observable_data";
import LightComponent from "ui-lib/light_component";
import { AppMenu } from "ui-components/app_menu";
import { Loading } from "ui-components/layout";
import { CodeRepoBackendIcon } from "ui-components/app_icons";
import BaselineRepositories from "ui-observables/baseline_repositories";

class Page extends LightComponent {
    constructor(props) {
        super(props);

        this.repositoryList = new BaselineRepositories();

        this.state = {
            list: this.repositoryList.value.getValue(),
            state: this.repositoryList.state.getValue()
        };
    }

    componentDidMount() {
        this.addDisposable(this.repositoryList.start());
        this.addDisposable(this.repositoryList.value.subscribe((list) => this.setState({ list })));
        this.addDisposable(this.repositoryList.state.subscribe((state) => this.setState({ state })));
        console.log(this.repositoryList);
    }

    render() {
        this.log("render", this.props, this.state);

        const pathname = this.getPathname();
        const items = this.state.list.toJS().map((item) => {
            const pn = `${pathname}/${item._id}`;
            const active = this.context.router.location.pathname.startsWith(pn);

            return {
                label: item._id,
                pathname: pn,
                active: active,
                icon: (
                    <CodeRepoBackendIcon
                        repoId={item._id}
                        theme={this.props.theme}
                    />
                )
            };
        });

        return (
            <div>
                <Loading show={this.state.state === ObservableDataStates.LOADING} />
                <AppMenu
                    primaryText="Baseline"
                    icon="/Cheser/256x256/devices/drive-multidisk.png"
                    items={items}
                />
                <div className={this.props.theme.content}>
                    {this.props.children && React.cloneElement(this.props.children, { theme: this.props.theme })}
                </div>
            </div>
        );
    }
}

Page.propTypes = {
    theme: PropTypes.object,
    children: PropTypes.node,
    route: PropTypes.object.isRequired
};

Page.contextTypes = {
    router: PropTypes.object.isRequired
};

export default Page;
