
import React from "react";
import PropTypes from "prop-types";
import LightComponent from "ui-lib/light_component";
import GerritDiffyIcon from "./diffymute.svg";
import GitHubMarkerIcon from "./GitHubMarkerIcon";
import GitLabLogoIcon from "./GitLabLogoIcon";
import CodeRepoAndBackend from "ui-observables/code_repo_and_backend";

class CodeRepoBackendIcon extends LightComponent {
    constructor(props) {
        super(props);

        this.repoAndBackend = new CodeRepoAndBackend({
            repoId: props.repoId || false
        });

        this.state = {
            repoBackend: this.repoAndBackend.backend.getValue()
        };
    }

    componentDidMount() {
        this.addDisposable(this.repoAndBackend.start());
        this.addDisposable(this.repoAndBackend.backend.subscribe((repoBackend) => this.setState({ repoBackend })));
    }

    componentWillReceiveProps(nextProps) {
        this.repoAndBackend.setOpts({
            repoId: nextProps.repoId || false
        });
    }

    render() {
        this.log("render", this.props, this.state);

        let backendType = this.props.backendType;
        if (!backendType) {
            backendType = this.state.repoBackend.get("backendType", false);
        }

        const classNames = [
            this.props.theme.appIcon,
            this.props.theme.repoBackendIcon
        ];

        let icon = (
            <div className={classNames.join(" ")} />
        );
        if (backendType === "github") {
            icon = (
                <GitHubMarkerIcon
                    theme={this.props.theme}
                    className={classNames.join(" ")}
                />
            );
        } else if (backendType === "gitlab") {
            icon = (
                <GitLabLogoIcon
                    theme={this.props.theme}
                    className={classNames.join(" ")}
                />
            );
        } else if (backendType === "gerrit") {
            icon = (
                <GerritDiffyIcon className={classNames.join(" ")} />
            );
        }

        return icon;
    }
}

CodeRepoBackendIcon.propTypes = {
    theme: PropTypes.object,
    repoId: PropTypes.string,
    backendType: PropTypes.string
};

export default CodeRepoBackendIcon;
