import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Tabs, Tab } from 'react-bootstrap';
import Spinner from '../Spinner/Spinner.js';

import {
  myFilledOrdersSelector,
  myFilledOrdersLoadedSelector,
  myOpenOrdersSelector,
  myOpenOrdersLoadedSelector,
  exchangeSelector,
  accountSelector,
  orderCancellingSelector
} from '../../store/selectors.js'

import {
  cancelOrder
} from '../../store/interactions.js'

class MyTransactions extends Component {

  constructor(props) {
    super(props);
    this.getOpenOrderStructure = this.getOpenOrderStructure.bind(this);
  }

  getFilledOrderStructure(order) {
    return (
      <tr key={order.id}>
        <td className="text-muted">{order.formattedTimestamp}</td>
        <td className={`text-${order.orderTypeClass}`}>{order.orderSign}{order.tokenAmount}</td>
        <td className={`text-${order.orderTypeClass}`}>{order.tokenPrice}</td>
      </tr>
    );
  }

  getOpenOrderStructure(order) {
    //Remap props
    return(
      <tr key={order.id}>
        <td className={`text-${order.orderTypeClass}`}>{order.orderSign}{order.tokenAmount}</td>
        <td className={`text-${order.orderTypeClass}`}>{order.tokenPrice}</td>
        <td className="text-muted cancel-order" onClick={(e) => {
            cancelOrder(this.props.dispatch, this.props.exchange, order, this.props.account);
            console.log("cancelling order...");
          }}>
          X
        </td>
      </tr>
    );
  }

  showMyOrders(orders, orderStructure) {
    return (
      <tbody>
        {
          orders.map((order) => {
            return orderStructure(order);
          })
        }
      </tbody>
    );
  }

  render() {
    return (
      <div className="card bg-dark text-white">
        <div className="card-header">
          My Transactions
        </div>
        <div className="card-body">
          <Tabs defaultActiveKey="trades" className="bg-dark text-white">
            <Tab eventKey="trades" title="Trades" className="bg-dark">
              <table className="table table-dark table-sm small">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>BUT</th>
                    <th>BUT/ETH</th>
                  </tr>
                </thead>
                { this.props.isMyFilledOrdersLoaded ? this.showMyOrders(this.props.myFilledOrders, this.getFilledOrderStructure) :
                  <tbody><tr><td><Spinner /></td></tr></tbody> }
              </table>
            </Tab>
            <Tab eventKey="orders" title="Orders">
              <table className="table table-dark table-sm small">
                <thead>
                  <tr>
                    <th>Amount</th>
                    <th>BUT</th>
                    <th>Cancel</th>
                  </tr>
                </thead>
                { this.props.isMyOpenOrdersLoaded ? this.showMyOrders(this.props.myOpenOrders, this.getOpenOrderStructure) :
                  <tbody><tr><td><Spinner /></td></tr></tbody> }
              </table>
            </Tab>
          </Tabs>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  const isMyOpenOrdersLoaded = myOpenOrdersLoadedSelector(state);
  const isOrderCancelling = orderCancellingSelector(state);
  const result = {
    myFilledOrders: myFilledOrdersSelector(state),
    isMyFilledOrdersLoaded: myFilledOrdersLoadedSelector(state),
    myOpenOrders: myOpenOrdersSelector(state),
    isMyOpenOrdersLoaded: isMyOpenOrdersLoaded && !isOrderCancelling,
    exchange: exchangeSelector(state),
    account: accountSelector(state)
  };
  return result;
}

export default connect(mapStateToProps)(MyTransactions);
