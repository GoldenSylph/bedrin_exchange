import React, { Component } from 'react';
import Spinner from '../Spinner/Spinner.js';
import { connect } from 'react-redux';
import { fillOrder } from '../../store/interactions.js';

import {
  orderBookSelector,
  orderBookLoadedSelector,
  exchangeSelector,
  accountSelector,
  orderFillingSelector
} from '../../store/selectors';

import {
  OverlayTrigger,
  Tooltip
} from 'react-bootstrap';


class OrderBook extends Component {

  constructor(props) {
    super(props);
    this.renderOrder = this.renderOrder.bind(this);
  }

  renderOrder(order) {
    return (
      <OverlayTrigger
        key={order.id}
        placement='auto'
        overlay={
          <Tooltip id={order.id}>
            {`Click here to ${order.orderFillAction}`}
          </Tooltip>
        }
      >
        <tr key={order.id}
          className="order-book-order"
          onClick={(e) => {
            fillOrder(this.props.dispatch, this.props.exchange, order, this.props.account);
          }}>
          <td>{order.tokenAmount}</td>
          <td className={`text-${order.orderTypeClass}`}>{order.tokenPrice}</td>
          <td>{order.etherAmount}</td>
        </tr>
    </OverlayTrigger>
    );
  }

  renderHeaders() {
    return (
      <tr>
        <th>BUT</th>
        <th>BUT/ETH</th>
        <th>ETH</th>
      </tr>
    );
  }

  renderOnEmptySellOrBuyOrders(buyOrSell) {
    let message = buyOrSell ? 'No buy orders available' : 'No sell orders available';
    return (
      <tr>
        <td>-</td>
        <td>{message}</td>
        <td>-</td>
      </tr>
    );
  }

  showOrderBook() {
    return (
      <tbody>
        {this.renderHeaders()}
        {this.props.orderBook.sellOrders.length > 0 ?
          this.props.orderBook.sellOrders.map((order) => this.renderOrder(order)) : this.renderOnEmptySellOrBuyOrders(false)}
        {this.renderHeaders()}
        {this.props.orderBook.buyOrders.length > 0 ?
          this.props.orderBook.buyOrders.map((order) => this.renderOrder(order)) : this.renderOnEmptySellOrBuyOrders(true)}
      </tbody>
    );
  }

  render() {
    // console.log(this.props.orderBookLoaded, this.props.orderBook);
    return (
      <div className="vertical">
        <div className="card bg-dark text-white">
          <div className="card-header">
            Order Book
          </div>
          <div className="card-body order-book">
            <table className="table table-dark table-sm small">
              { this.props.orderBookLoaded ? this.showOrderBook() : <Spinner type="table"/> }
            </table>
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  const orderBookLoaded = orderBookLoadedSelector(state);
  const orderBookFilling = orderFillingSelector(state);
  return {
    orderBookLoaded: orderBookLoaded && !orderBookFilling,
    orderBook: orderBookSelector(state),
    exchange: exchangeSelector(state),
    account: accountSelector(state)
  };
}

export default connect(mapStateToProps)(OrderBook);
