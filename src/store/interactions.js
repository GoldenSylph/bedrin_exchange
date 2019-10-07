import Web3 from 'web3';
import Token from '../abis/Token.json';
import Exchange from '../abis/Exchange.json';
import { ETHER_ADDRESS } from '../helpers.js';

import {
  web3Loaded,
  web3NetworkTypeLoaded,
  web3NetworkIdLoaded,
  web3AccountLoaded,
  tokenLoaded,
  exchangeLoaded,
  cancelledOrdersLoaded,
  filledOrdersLoaded,
  allOrdersLoaded,
  orderCancelling,
  orderCancelled,
  orderFilling,
  orderFilled,
  etherBalanceLoaded,
  tokenBalanceLoaded,
  exchangeEtherBalanceLoaded,
  exchangeTokenBalanceLoaded,
  balancesLoaded,
  balancesLoading,
  buyOrderMaking,
  sellOrderMaking,
  orderMade
} from './actions.js';

export const loadWeb3 = (dispatch) => {
  const web3 = new Web3(Web3.givenProvider || 'http://localhost:8545');
  dispatch(web3Loaded(web3));
  return web3;
};

export const loadNetworkType = async (web3, dispatch) => {
  const networkType = await web3.eth.net.getNetworkType();
  dispatch(web3NetworkTypeLoaded(networkType));
  return networkType;
};

export const loadNetworkId = async (web3, dispatch) => {
  const networkId = await web3.eth.net.getId();
  dispatch(web3NetworkIdLoaded(networkId));
  return networkId;
};

export const loadAccount = async (web3, dispatch) => {
  const accounts = await web3.eth.getAccounts();
  console.log('accounts', accounts);
  const account = accounts[0];
  dispatch(web3AccountLoaded(account));
  return account;
};


////////////////////////////////////////////////////////
// Contracts
////////////////////////////////////////////////////////

const loadContract = async (contractJson, web3, networkId, dispatch, actionCreator) => {
  try {
    const contract = await web3.eth.Contract(contractJson.abi, contractJson.networks[networkId].address);
    dispatch(actionCreator(contract));
    return contract;
  } catch (error) {
    console.error('Error during contract loading!', error)
    return null;
  }
};

export const loadToken = async (web3, networkId, dispatch) => await loadContract(Token, web3, networkId, dispatch, tokenLoaded);
export const loadExchange = async (web3, networkId, dispatch) => await loadContract(Exchange, web3, networkId, dispatch, exchangeLoaded);

const loadOrdersFromEventStream = async (eventName, contract, fromBlock, toBlock) => {
  let stream = await contract.getPastEvents(eventName, { fromBlock, toBlock });
  return stream.map((event) => event.returnValues);
};

export const loadAllOrders = async (exchange, dispatch) => {
  const cancelledOrders = await loadOrdersFromEventStream('Cancel', exchange, 0, 'latest');
  dispatch(cancelledOrdersLoaded(cancelledOrders));

  const filledOrders = await loadOrdersFromEventStream('Trade', exchange, 0, 'latest');
  dispatch(filledOrdersLoaded(filledOrders));

  const allOrders = await loadOrdersFromEventStream('Order', exchange, 0, 'latest');
  dispatch(allOrdersLoaded(allOrders));
};

const subscribeToEvents = async (dispatch, eventKind, actionCreator, selectFromEventData = null) => {
  eventKind({}, (error, eventData) => {
    if (selectFromEventData != null) {
      dispatch(actionCreator(...selectFromEventData(eventData)))
    } else {
      dispatch(actionCreator())
    }
  });
};

export const subscribeToTradeEvent = async (dispatch, eventKind) =>
  subscribeToEvents(dispatch, eventKind, orderFilled, (eventData) => [eventData.returnValues]);

export const subscribeToCancelEvent = async (dispatch, eventKind) =>
  subscribeToEvents(dispatch, eventKind, orderCancelled, (eventData) => [eventData.returnValues]);

export const subscribeToDepositEvent = async (dispatch, eventKind) =>
  subscribeToEvents(dispatch, eventKind, balancesLoaded);

export const subscribeToWithdrawEvent = async (dispatch, eventKind) =>
  subscribeToDepositEvent(dispatch, eventKind);

export const subscribeToOrderEvent = async (dispatch, eventKind) =>
  subscribeToEvents(dispatch, eventKind, orderMade, (eventData) => [eventData.returnValues]);

const sendContractMethod = (dispatch, actionCreator, actionArgs,
    method, methodArgs, account, value = 0, hashReceivedFunction, failureFunction) => {
  method(...methodArgs)
    .send({from: account, value})
    .on('transactionHash', (hash) => {
      if (hashReceivedFunction != null) {
        hashReceivedFunction(hash);
      }
      if (dispatch != null && actionCreator != null) {
        dispatch(actionCreator(...actionArgs));
      }
    })
    .on('error', (error) => {
      console.log(error);
      if (failureFunction != null) {
        failureFunction(error);
      }
      window.alert("There was error!");
    });
};

export const cancelOrder = (dispatch, exchange, order, account) => {
  sendContractMethod(dispatch, orderCancelling, [], exchange.methods.cancelOrder, [order.id], account);
};

export const fillOrder = (dispatch, exchange, order, account) => {
  sendContractMethod(dispatch, orderFilling, [], exchange.methods.fillOrder, [order.id], account);
};

export const loadBalances = async (dispatch, web3, exchange, token, account) => {

  const etherBalance = await web3.eth.getBalance(account);
  dispatch(etherBalanceLoaded(etherBalance));

  const tokenBalance = await token.methods.balanceOf(account).call();
  dispatch(tokenBalanceLoaded(tokenBalance));

  const exchangeEtherBalance = await exchange.methods.balanceOf(ETHER_ADDRESS, account).call();
  dispatch(exchangeEtherBalanceLoaded(exchangeEtherBalance));

  const exchangeTokenBalance = await exchange.methods.balanceOf(token.options.address, account).call();
  dispatch(exchangeTokenBalanceLoaded(exchangeTokenBalance));

  dispatch(balancesLoaded());
};

export const depositEther = (dispatch, exchange, web3, amount, account) => {
  sendContractMethod(dispatch, balancesLoading, [], exchange.methods.depositEther, [], account, web3.utils.toWei(amount, 'ether'));
};

export const withdrawEther = (dispatch, exchange, web3, amount, account) => {
  sendContractMethod(dispatch, balancesLoading, [], exchange.methods.withdrawEther, [web3.utils.toWei(amount, 'ether')], account);
};

export const depositToken = (dispatch, exchange, token, web3, amount, account) => {
  amount = web3.utils.toWei(amount, 'ether');
  sendContractMethod(null, null, null, token.methods.approve, [exchange.options.address, amount], account, 0, (hash) => {
    sendContractMethod(dispatch,
      balancesLoading, [],
      exchange.methods.depositToken,
      [token.options.address,
        amount],
        account);
  });
};

export const withdrawToken = (dispatch, exchange, token, web3, amount, account) => {
  sendContractMethod(dispatch, balancesLoading, [], exchange.methods.withdrawToken,
    [token.options.address, web3.utils.toWei(amount, 'ether')], account);
};

export const makeBuyOrder = (dispatch, exchange, token, web3, order, account) => {
  const tokenGet = token.options.address;
  const amountGet = web3.utils.toWei(order.amount.toString(), 'ether');
  const tokenGive = ETHER_ADDRESS;
  const amountGive = web3.utils.toWei((order.amount * order.price).toString(), 'ether');
  sendContractMethod(dispatch, buyOrderMaking, [], exchange.methods.makeOrder,
    [tokenGet, amountGet, tokenGive, amountGive], account);
};

export const makeSellOrder = (dispatch, exchange, token, web3, order, account) => {
  const tokenGet = ETHER_ADDRESS;
  const amountGet = web3.utils.toWei((order.amount * order.price).toString(), 'ether');
  const tokenGive = token.options.address;
  const amountGive = web3.utils.toWei(order.amount.toString(), 'ether');
  sendContractMethod(dispatch, sellOrderMaking, [], exchange.methods.makeOrder,
    [tokenGet, amountGet, tokenGive, amountGive], account);
};
