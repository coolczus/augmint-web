import React from "react";
import { Container, Message, Button, Icon } from "semantic-ui-react";

export default class MsgPanel extends React.Component {
    constructor(props) {
        super(props);
        this.state = { dismissed: false };
        this.dismiss = this.dismiss.bind(this);
    }

    dismiss() {
        if (this.props.dismissable) {
            this.setState({ dismissed: true });
        }
        if (this.props.onDismiss) {
            this.props.onDismiss();
        }
    }

    render() {
        let { children, eth, dismissable, dismissed, onDismiss, header, ...other } = this.props;
        return (
            (!this.state.dismissed || !dismissable) && (
                <Container style={{ margin: "1em" }}>
                    <Message onDismiss={onDismiss ? this.dismiss : null} {...other}>
                        <Message.Header>{header}</Message.Header>
                        {children !== null && children}
                        {onDismiss && (
                            <Button as="a" onClick={this.dismiss}>
                                OK
                            </Button>
                        )}
                    </Message>
                </Container>
            )
        );
    }
}
MsgPanel.defaultProps = {
    dismissed: false,
    dismissable: false
};

export function SuccessPanel(props) {
    return <MsgPanel success {...props} />;
}

export function InfoPanel(props) {
    const { info = true, icon = "info", header, ...other } = props;
    return (
        <MsgPanel info={info} icon={icon ? true : false} {...other}>
            {icon && <Icon name={icon} />}
            <Message.Header>{header}</Message.Header>
            {props.children}
        </MsgPanel>
    );
}

export function WarningPanel(props) {
    return <MsgPanel warning {...props} />;
}

export function ErrorPanel(props) {
    return <MsgPanel error {...props} />;
}

export function LoadingPanel(props) {
    const { info = true, header, ...other } = props;
    return (
        <MsgPanel info={info} icon {...other}>
            <Icon name="circle notched" loading />
            <Message.Header>{header}</Message.Header>
            {props.children}
        </MsgPanel>
    );
}

export class EthSubmissionErrorPanel extends React.Component {
    render() {
        let { children, error, ...other } = this.props;
        return (
            <MsgPanel error {...other}>
                {children}
                {error && error.title}
                {error != null &&
                    error.eth && (
                        <div>
                            <p>Tx hash: {error.eth.tx}</p>
                            <p>
                                Gas used: {error.eth.gasUsed} (from {error.eth.gasProvided} provided)
                            </p>
                        </div>
                    )}
                {error != null &&
                    error.details != null &&
                    error.details.message && <ErrorDetails>{error.details.message}</ErrorDetails>}
            </MsgPanel>
        );
    }
}

EthSubmissionErrorPanel.defaultProps = {
    header: <h3>Submission error</h3>,
    dismissable: false // pass onDismiss={() => {clearSubmitErrors();}} instead
};

export class EthSubmissionSuccessPanel extends React.Component {
    render() {
        var { children, eth, ...other } = this.props;

        return (
            <MsgPanel {...other}>
                {children}
                <small>
                    <p>Tx hash: {eth.tx}</p>
                    <p>
                        Gas used: {eth.gasUsed} (from {eth.gasProvided} provided)
                    </p>
                </small>
            </MsgPanel>
        );
    }
}

EthSubmissionSuccessPanel.defaultProps = {
    success: true,
    header: <h3>Successfull transaction</h3>,
    dismissable: true
};

export function ConnectionStatus(props) {
    const { contract, error = true, size = "tiny", ...other } = props;
    return (
        contract.connectionError && (
            <Message size={size} error={error} {...other}>
                Couldn't connect to Ethereum contract.
            </Message>
        )
    );
}

export function ErrorDetails(props) {
    const { header = "Error details:", style = { fontSize: "0.8em", overflow: "auto" } } = props;
    return (
        <div>
            <p>{header}</p>
            <pre style={style}>{props.children}</pre>
        </div>
    );
}
