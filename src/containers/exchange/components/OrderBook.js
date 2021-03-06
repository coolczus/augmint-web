import React from "react";
//import { Button } from "semantic-ui-react";
import { Pblock } from "components/PageLayout";
import { MyListGroup, MyListGroupRow as Row, MyListGroupColumn as Col, MyGridTable } from "components/MyListGroups";
import { ErrorPanel } from "components/MsgPanels";
import { MoreInfoTip } from "components/ToolTip";
import { PriceToolTip } from "./ExchangeToolTips";
import CancelOrderButton from "./CancelOrderButton";

import { TOKEN_SELL } from "modules/reducers/orders";

const OrderItem = props => {
    const { order, userAccountAddress } = props;
    const ret = [
        <Col textAlign="right" width={3} key={`${order.orderType}-amount`}>
            {order.amount}
            {order.orderType === TOKEN_SELL ? " A-EUR" : " ETH"}
        </Col>,
        <Col width={2} textAlign="right" key={`${order.orderType}-price`}>
            {order.price}
        </Col>,
        <Col textAlign="right" key={`${order.orderType}-action`}>
            <MoreInfoTip>
                Maker: {order.maker}
                <br />Time: {order.addedTimeText}
                <br />Order Id: {order.id} | index: {order.index}
            </MoreInfoTip>
            {order.maker.toLowerCase() === userAccountAddress.toLowerCase() && <CancelOrderButton order={order} />}
        </Col>
    ];
    return ret;
};

const DummyCols = props => {
    const ret = [];
    for (let i = 0; i < props.count; i++) {
        ret.push(<Col key={i} />);
    }
    return ret;
};

const OrderList = props => {
    const { sellOrders, buyOrders, userAccountAddress } = props;

    const totalBuyAmount = buyOrders.reduce((sum, order) => order.bn_amountConverted.add(sum), 0).toString();
    const totalSellAmount = sellOrders.reduce((sum, order) => order.bn_amountConverted.add(sum), 0).toString();
    const listLen = Math.max(buyOrders.length, sellOrders.length);
    const itemList = [];

    for (let i = 0; i < listLen; i++) {
        itemList.push(
            <Row columns={7} key={`ordersRow-${i}`}>
                {i < buyOrders.length ? (
                    <OrderItem order={buyOrders[i]} userAccountAddress={userAccountAddress} />
                ) : (
                    <DummyCols count={3} />
                )}
                <Col width={1} />

                {i < sellOrders.length ? (
                    <OrderItem order={sellOrders[i]} userAccountAddress={userAccountAddress} />
                ) : (
                    <DummyCols count={3} />
                )}
            </Row>
        );
    }

    return (
        <MyListGroup>
            <Row textAlign="center" columns={2}>
                <Col header="Buy A-EUR">{totalBuyAmount > 0 && <p>Total: {totalBuyAmount} ETH</p>}</Col>
                <Col header="Sell A-EUR">
                    {totalSellAmount > 0 && (
                        <p>
                            Total: {totalSellAmount} A-EUR
                        </p>
                    )}
                </Col>
            </Row>
            <Row columns={7} textAlign="center">
                <Col width={3}>
                    <strong>Amount</strong>
                </Col>
                <Col width={2}>
                    <strong>Price</strong> <PriceToolTip />
                </Col>
                <Col />
                <Col width={1} />
                <Col width={3}>
                    <strong>Amount</strong>
                </Col>
                <Col width={2}>
                    <strong>Price</strong> <PriceToolTip />
                </Col>
                <Col />
            </Row>
            {itemList}
        </MyListGroup>
    );
};

export default class OrderBook extends React.Component {
    render() {
        const { filter, header, userAccountAddress } = this.props;
        const { orders, refreshError, isLoading } = this.props.orders;
        const buyOrders = orders == null ? [] : orders.buyOrders.filter(filter);
        const sellOrders = orders == null ? [] : orders.sellOrders.filter(filter);

        return (
            <Pblock loading={isLoading} header={header}>
                {refreshError && (
                    <ErrorPanel header="Error while fetching order list">{refreshError.message}</ErrorPanel>
                )}
                {orders == null && !isLoading && <p>Connecting...</p>}
                {isLoading ? (
                    <p>Refreshing orders...</p>
                ) : (
                    <MyGridTable>
                        <OrderList
                            buyOrders={buyOrders}
                            sellOrders={sellOrders}
                            userAccountAddress={userAccountAddress}
                        />
                    </MyGridTable>
                )}
            </Pblock>
        );
    }
}

OrderBook.defaultProps = {
    orders: null,
    userAccountAddress: null,
    filter: () => {
        return true; // no filter passed
    },
    header: <h3>Open orders</h3>
};
