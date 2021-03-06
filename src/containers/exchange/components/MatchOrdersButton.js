import React from "react";
import { connect } from "react-redux";
import { Pblock } from "components/PageLayout";
import { Button } from "semantic-ui-react";
import { matchOrders, MATCH_ORDERS_SUCCESS } from "modules/reducers/orders";
import { EthSubmissionErrorPanel, EthSubmissionSuccessPanel } from "components/MsgPanels";
//import { LoadingPanel } from "components/MsgPanels";

class MatchOrdersButton extends React.Component {
    async handleClick(values) {
        //values.preventDefault();
        this.setState({ submitting: true, submitSucceeded: false, error: null, result: null });
        const { buyOrder, sellOrder } = this.props;
        const res = await this.props.matchOrders(buyOrder, sellOrder);

        if (res.type !== MATCH_ORDERS_SUCCESS) {
            this.setState({
                submitting: false,
                error: {
                    title: "Ethereum transaction failed",
                    details: res.error,
                    eth: res.eth
                }
            });
        } else {
            this.setState({
                submitting: false,
                submitSucceeded: true,
                error: null,
                result: res.result
            });

            return;
        }
    }

    onDismiss() {
        this.setState({ error: null, submitSucceeded: false });
    }

    constructor(props) {
        super(props);
        this.state = { submitSucceeded: false, submitting: false, error: null, result: null };
        this.handleClick = this.handleClick.bind(this);
        this.onDismiss = this.onDismiss.bind(this);
    }

    render() {
        const { buyOrder, sellOrder, isLoading, size = "medium", primary = true, label = "Match" } = this.props;
        const { submitSucceeded, submitting, error, result } = this.state;

        const isMatching = sellOrder && buyOrder && sellOrder.price <= buyOrder.price;
        return (
            <Pblock>
                {error && (
                    <EthSubmissionErrorPanel error={error} header="Order match failed." onDismiss={this.onDismiss}>
                        <p>Error matching the orders.</p>
                    </EthSubmissionErrorPanel>
                )}

                {!isMatching && <p>No matching orders</p>}

                {!submitSucceeded &&
                    isMatching &&
                    !isLoading && (
                        <Button
                            size={size}
                            primary={primary}
                            className="MatchOrderButton"
                            id={`MatchOrderButton-${buyOrder.id}-${sellOrder.id}`}
                            disabled={submitting === 0}
                            onClick={this.handleClick}
                        >
                            {submitting ? "Submitting..." : label}
                        </Button>
                    )}

                {submitSucceeded && (
                    <EthSubmissionSuccessPanel
                        header={<h3>Successful match </h3>}
                        onDismiss={this.onDismiss}
                        eth={result.eth}
                    />
                )}
            </Pblock>
        );
    }
}

const mapStateToProps = state => ({
    isLoading: state.exchange.isLoading
});

const mapDispatchToProps = { matchOrders };

export default (MatchOrdersButton = connect(mapStateToProps, mapDispatchToProps)(MatchOrdersButton));
