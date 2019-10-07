import React, { Component } from 'react';
import './App.css';
import { connect } from 'react-redux';
import Navbar from '../Navbar/Navbar.js';
import Content from '../Content/Content.js';
import Spinner from '../Spinner/Spinner.js';
import { contractsLoadedSelector } from '../../store/selectors.js';

import {
  loadWeb3,
  loadNetworkType,
  loadNetworkId,
  loadAccount,
  loadToken,
  loadExchange
} from '../../store/interactions.js';

class App extends Component {

  componentWillMount() {
    this.loadBlockchainData(this.props.dispatch);
  }

  async loadBlockchainData(dispatch) {
    const web3 = loadWeb3(dispatch);
    await loadNetworkType(web3, dispatch);
    const networkId = await loadNetworkId(web3, dispatch);
    await loadAccount(web3, dispatch);
    const token = await loadToken(web3, networkId, dispatch);
    const exchange = await loadExchange(web3, networkId, dispatch);
    if (!token || !exchange) {
      window.alert('The contract was not deployed. Showing the feedback modal');
    }
  }

  render() {
    return (
      <div>
        <Navbar />
        {this.props.contractsLoaded ? <Content /> : <div className="content"><h1>Loading...<Spinner/></h1></div>}
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    contractsLoaded: contractsLoadedSelector(state)
  };
}

export default connect(mapStateToProps)(App);
