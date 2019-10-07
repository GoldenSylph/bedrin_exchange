import React, { Component } from 'react';
import { connect } from 'react-redux';
import { exchangeSelector } from '../../store/selectors.js';
import Trades from '../Trades/Trades.js';
import OrderBook from '../OrderBook/OrderBook.js';
import MyTransactions from '../MyTransactions/MyTransactions.js'
import PriceChart from '../PriceChart/PriceChart.js';
import Balance from '../Balance/Balance.js';
import NewOrder from '../NewOrder/NewOrder.js';

import {
  loadAllOrders,
  subscribeToCancelEvent,
  subscribeToTradeEvent,
  subscribeToDepositEvent,
  subscribeToWithdrawEvent,
  subscribeToOrderEvent
} from '../../store/interactions.js';

class Content extends Component {

  componentWillMount() {
    this.loadBlockchainData(this.props.dispatch);
  }

  async loadBlockchainData(dispatch) {
    await loadAllOrders(this.props.exchange, dispatch);
    await subscribeToCancelEvent(this.props.dispatch, this.props.exchange.events.Cancel);
    await subscribeToTradeEvent(this.props.dispatch, this.props.exchange.events.Trade);
    await subscribeToDepositEvent(this.props.dispatch, this.props.exchange.events.Deposit);
    await subscribeToWithdrawEvent(this.props.dispatch, this.props.exchange.events.Withdraw);
    await subscribeToOrderEvent(this.props.dispatch, this.props.exchange.events.Order);
  }

  render() {
    return (
      <div className="content">
        <div className="vertical-split">
          <Balance />
          <NewOrder />
        </div>
        <OrderBook />
        <div className="vertical-split">
          <PriceChart />
          <MyTransactions />
        </div>
        <Trades />
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    exchange: exchangeSelector(state)
  };
}

export default connect(mapStateToProps)(Content);
