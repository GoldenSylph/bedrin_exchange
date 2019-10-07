import React, { Component } from 'react';
import { connect } from 'react-redux';
import Spinner from '../Spinner/Spinner.js';
import { Tab, Tabs } from 'react-bootstrap';

import {
  exchangeSelector,
  tokenSelector,
  accountSelector,
  web3Selector,
  buyOrderSelector,
  sellOrderSelector
} from '../../store/selectors.js';

import {
  buyOrderAmountChanged,
  sellOrderAmountChanged,
  buyOrderPriceChanged,
  sellOrderPriceChanged
} from '../../store/actions.js';

import {
  makeBuyOrder,
  makeSellOrder
} from '../../store/interactions.js';


class NewOrder extends Component {

  showCustomForm(operationName, toDoOnSubmit, amountChangedActionCreator,
      priceChangedActionCreator, order, isTotalAvailable) {
    return (
      <form onSubmit={(e1) => {
          e1.preventDefault();
          toDoOnSubmit();
      }}>
        <div className="form-group small">
          <label>{operationName} Amount (BUT)</label>
          <div className="input-group">
            <input
              type="text"
              className="form-control form-control-sm bg-dark text-white"
              placeholder={`${operationName} Amount`}
              onChange={(e2) => this.props.dispatch(amountChangedActionCreator(e2.target.value))}
              required />
          </div>
        </div>
        <div className="form-group small">
          <label>{operationName} Price</label>
          <div className="input-group">
            <input
              type="text"
              className="form-control form-control-sm bg-dark text-white"
              placeholder={`${operationName} Price`}
              onChange={(e3) => this.props.dispatch(priceChangedActionCreator(e3.target.value))}
              required />
          </div>
        </div>
        <button type="submit" className="btn btn-primary btn-sm btn-block" >Make {operationName} Order</button>
        {isTotalAvailable ? <small>Total {order.amount * order.price} ETH</small> : null}
      </form>
    );
  }

  showBuyForm() {
    return this.showCustomForm(
      "Buy",
      () => {
        makeBuyOrder(this.props.dispatch, this.props.exchange,
          this.props.token, this.props.web3, this.props.buyOrder, this.props.account);
      },
      buyOrderAmountChanged, buyOrderPriceChanged, this.props.buyOrder, this.props.isBuyTotalAvailable);
  }

  showSellForm() {
    return this.showCustomForm(
      "Sell",
      () => {
        makeSellOrder(this.props.dispatch, this.props.exchange,
          this.props.token, this.props.web3, this.props.sellOrder, this.props.account);
      },
      sellOrderAmountChanged, sellOrderPriceChanged, this.props.sellOrder, this.props.isSellTotalAvailable);
  }

  showForm() {
    return (
      <Tabs defaultActiveKey="buy" className="bg-dark text-white">
        <Tab eventKey="buy" title="Buy" className="bg-dark">
          {this.showBuyForm()}
        </Tab>
        <Tab eventKey="sell" title="Sell" className="bg-dark">
          {this.showSellForm()}
        </Tab>
      </Tabs>
    );
  }

  render() {
    return (
      <div className="card bg-dark text-white">
        <div className="card-header">
          Make new order
        </div>
        <div className="card-body">
          {this.props.isReadyToShowForm ? this.showForm() : <Spinner />}
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {

  const buyOrder = buyOrderSelector(state);
  const sellOrder = sellOrderSelector(state);

  return {
    account: accountSelector(state),
    exchange: exchangeSelector(state),
    token: tokenSelector(state),
    web3: web3Selector(state),
    buyOrder,
    sellOrder,
    isReadyToShowForm: !buyOrder.making && !sellOrder.making,
    isBuyTotalAvailable: buyOrder.amount && buyOrder.price,
    isSellTotalAvailable: sellOrder.amount && sellOrder.price
  };
}

export default connect(mapStateToProps)(NewOrder);
