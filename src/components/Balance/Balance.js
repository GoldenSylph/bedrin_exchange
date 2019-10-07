import React, { Component } from 'react';
import { connect } from 'react-redux';
import Spinner from '../Spinner/Spinner.js';
import { Tabs, Tab } from 'react-bootstrap';
import './Balance.css';

import {
  etherDepositAmountChanged,
  etherWithdrawAmountChanged,
  tokenDepositAmountChanged,
  tokenWithdrawAmountChanged
} from '../../store/actions.js';

import {
  accountSelector,
  exchangeSelector,
  web3Selector,
  tokenSelector,
  exchangeEtherBalanceSelector,
  exchangeTokenBalanceSelector,
  tokenBalanceSelector,
  etherBalanceSelector,
  balancesLoadingSelector,
  etherDepositAmountSelector,
  etherWithdrawAmountSelector,
  tokenDepositAmountSelector,
  tokenWithdrawAmountSelector
} from '../../store/selectors.js';

import {
  loadBalances,
  depositEther,
  withdrawEther,
  depositToken,
  withdrawToken
} from '../../store/interactions.js';

class Balance extends Component {

  constructor(props) {
    super(props);
    this.showCustomForm = this.showCustomForm.bind(this);
    this.showEtherDepositForm = this.showEtherDepositForm.bind(this);
    this.showEtherWithdrawForm = this.showEtherWithdrawForm.bind(this);
    this.showTokenDepositForm = this.showTokenDepositForm.bind(this);
    this.showTokenWithdrawForm = this.showTokenWithdrawForm.bind(this);
  }

  componentWillMount() {
    this.loadBlockchainData();
  }

  async loadBlockchainData() {
    await loadBalances(this.props.dispatch, this.props.web3,
      this.props.exchange, this.props.token, this.props.account);
  }

  showCustomForm(contractMethod, actionCreator, placeholderString, buttonString, buttonClassName) {
    return (
      <form onSubmit={
          (event) => {
            event.preventDefault();
            contractMethod();
          }
        }>
        <div className="form-group">
          <input
            type="text"
            placeholder={placeholderString}
            onChange={(e) => this.props.dispatch(actionCreator(e.target.value))}
            className="form-control form-control-sm bg-dark text-white"
            required/>
        </div>
        <div className="form-group">
          <button type="submit" className={`btn btn-${buttonClassName} btn-block btn-sm`}>{buttonString}</button>
        </div>
      </form>
    );
  }

  showTokenDepositForm() {
    return this.showCustomForm(
      () => {
        depositToken(this.props.dispatch, this.props.exchange, this.props.token,
          this.props.web3, this.props.tokenDepositAmount, this.props.account);
      },
      tokenDepositAmountChanged, "BUT Amount", "Deposit", "primary"
    );
  }

  showEtherDepositForm() {
    return this.showCustomForm(
      () => {
        depositEther(this.props.dispatch, this.props.exchange, this.props.web3,
          this.props.etherDepositAmount, this.props.account);
      },
      etherDepositAmountChanged, "ETH Amount", "Deposit", "primary"
    );
  }

  showEtherWithdrawForm() {
    return this.showCustomForm(
      () => {
        withdrawEther(this.props.dispatch, this.props.exchange, this.props.web3,
          this.props.etherWithdrawAmount, this.props.account);
      },
      etherWithdrawAmountChanged, "ETH Amount", "Withdraw", "danger"
    );
  }

  showTokenWithdrawForm() {
    return this.showCustomForm(
      () => {
        withdrawToken(this.props.dispatch, this.props.exchange, this.props.token,
          this.props.web3, this.props.tokenWithdrawAmount, this.props.account);
      },
      tokenWithdrawAmountChanged, "BUT Amount", "Withdraw", "danger"
    );
  }

  showBalances(showEtherWithdrawOrDepositForms, showTokenWithdrawOrDepositForms) {
    return (
      <div className="container">
        <div className="row">
          <table className="table table-dark table-sm small">
            <thead>
              <tr>
                <th>Token</th>
                <th>Wallet</th>
                <th>Exchange</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>ETH</td>
                <td>{this.props.etherBalance.toString()}</td>
                <td>{this.props.exchangeEtherBalance.toString()}</td>
              </tr>
              <tr>
                <td>BUT</td>
                <td>{this.props.tokenBalance.toString()}</td>
                <td>{this.props.exchangeTokenBalance.toString()}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <Tabs defaultActiveKey="ether" className="row bg-dark text-white">
          <Tab eventKey="ether" title="Ether" className="bg-dark">
            {showEtherWithdrawOrDepositForms()}
          </Tab>
          <Tab eventKey="token max" title="Token" className="bg-dark">
            {showTokenWithdrawOrDepositForms()}
          </Tab>
        </Tabs>
      </div>
    );
  }

  showForm() {
    return (
      <Tabs defaultActiveKey="deposit" className="bg-dark text-white">
        <Tab eventKey="deposit" title="Deposit" className="bg-dark">
          {this.showBalances(this.showEtherDepositForm, this.showTokenDepositForm)}
        </Tab>
        <Tab eventKey="withdraw" title="Withdraw" className="bg-dark">
          {this.showBalances(this.showEtherWithdrawForm, this.showTokenWithdrawForm)}
        </Tab>
      </Tabs>
    );
  }



  render() {
    return (
      <div className="card bg-dark text-white">
        <div className="card-header">
          Balance
        </div>
        <div className="card-body">
          {!this.props.isBalancesLoading ? this.showForm() : <Spinner />}
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  const result = {
    web3: web3Selector(state),
    exchange: exchangeSelector(state),
    token: tokenSelector(state),
    account: accountSelector(state),
    exchangeEtherBalance: exchangeEtherBalanceSelector(state),
    exchangeTokenBalance: exchangeTokenBalanceSelector(state),
    etherBalance: etherBalanceSelector(state),
    tokenBalance: tokenBalanceSelector(state),
    isBalancesLoading: balancesLoadingSelector(state),
    etherDepositAmount: etherDepositAmountSelector(state),
    etherWithdrawAmount: etherWithdrawAmountSelector(state),
    tokenDepositAmount: tokenDepositAmountSelector(state),
    tokenWithdrawAmount: tokenWithdrawAmountSelector(state)
  };
  return result;
}

export default connect(mapStateToProps)(Balance);
