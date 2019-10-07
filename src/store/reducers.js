import { combineReducers } from 'redux';
import {
  WEB3_LOADED,
  WEB3_NETWORK_TYPE_LOADED,
  WEB3_NETWORK_ID_LOADED,
  WEB3_ACCOUNT_LOADED,
  TOKEN_LOADED,
  EXCHANGE_LOADED,
  CANCELLED_ORDERS_LOADED,
  FILLED_ORDERS_LOADED,
  ALL_ORDERS_LOADED,
  ORDER_CANCELLING,
  ORDER_CANCELLED,
  ORDER_FILLING,
  ORDER_FILLED,
  BALANCES_LOADING,
  BALANCES_LOADED,
  EXCHANGE_ETHER_BALANCE_LOADED,
  ETHER_BALANCE_LOADED,
  EXCHANGE_TOKEN_BALANCE_LOADED,
  TOKEN_BALANCE_LOADED,
  ETHER_DEPOSIT_AMOUNT_CHANGED,
  ETHER_WITHDRAW_AMOUNT_CHANGED,
  TOKEN_WITHDRAW_AMOUNT_CHANGED,
  TOKEN_DEPOSIT_AMOUNT_CHANGED,
  ORDER_MADE,
  BUY_ORDER_AMOUNT_CHANGED,
  BUY_ORDER_PRICE_CHANGED,
  BUY_ORDER_MAKING,
  SELL_ORDER_AMOUNT_CHANGED,
  SELL_ORDER_PRICE_CHANGED,
  SELL_ORDER_MAKING
} from './actions.js';

function web3(state={}, action) {
  switch (action.type) {

    case WEB3_LOADED:
      return { ...state, connection: action.connection };

    case WEB3_NETWORK_TYPE_LOADED:
      return { ...state, networkType: action.network };

    case WEB3_NETWORK_ID_LOADED:
      return { ...state, networkId: action.networkId };

    case WEB3_ACCOUNT_LOADED:
      return { ...state, account: action.account };

    default:
      return state;
  }
}

function token(state={}, action) {
  switch (action.type) {

    case TOKEN_LOADED:
      return { ...state, loaded: true, contract: action.contract };

    default:
      return state;
  }
}

function exchange(state={}, action) {
  switch (action.type) {

    case EXCHANGE_LOADED:
      return { ...state, loaded: true, contract: action.contract };

    case CANCELLED_ORDERS_LOADED:
      return { ...state, cancelledOrders: { loaded: true, data: action.cancelledOrders } };

    case FILLED_ORDERS_LOADED:
      return { ...state, filledOrders: { loaded: true, data: action.filledOrders } };

    case ALL_ORDERS_LOADED:
      return { ...state, allOrders: { loaded: true, data: action.allOrders } };

    case ORDER_CANCELLING:
      return { ...state, orderCancelling: true };

    case ORDER_CANCELLED:
      return {
        ...state,
        orderCancelling: false,
        cancelledOrders: {
          ...state.cancelledOrders,
          data: [
            ...state.cancelledOrders.data,
            action.order
          ]
        }
      };

      case ORDER_FILLING:
        return { ...state, orderFilling: true };

      case ORDER_FILLED:
        //Prevent duplicate orders
        let index = state.filledOrders.data.findIndex(order => order.id === action.order.id);
        let data = [];

        if (index === -1) {
          data = [...state.filledOrders.data, action.order];
        } else {
          data = state.filledOrders.data;
        }
        return {
          ...state,
          orderFilling: false,
          filledOrders: {
            ...state.filledOrders,
            data
          }
        };

      case ETHER_DEPOSIT_AMOUNT_CHANGED:
        return {
          ...state,
          etherDepositAmount: action.amount
        };

      case ETHER_WITHDRAW_AMOUNT_CHANGED:
        return {
          ...state,
          etherWithdrawAmount: action.amount
        };

      case TOKEN_DEPOSIT_AMOUNT_CHANGED:
        return {
          ...state,
          tokenDepositAmount: action.amount
        };

      case TOKEN_WITHDRAW_AMOUNT_CHANGED:
        return {
          ...state,
          tokenWithdrawAmount: action.amount
        };

      case BUY_ORDER_AMOUNT_CHANGED:
        return {
          ...state,
          buyOrder: {
            ...state.buyOrder,
            amount: action.amount
          }
        };

      case BUY_ORDER_PRICE_CHANGED:
        return {
          ...state,
          buyOrder: {
            ...state.buyOrder,
            price: action.price
          }
        };

      case BUY_ORDER_MAKING:
        return {
          ...state,
          buyOrder: {
            ...state.buyOrder,
            amount: null,
            price: null,
            making: true
          }
        };

      case SELL_ORDER_AMOUNT_CHANGED:
        return {
          ...state,
          sellOrder: {
            ...state.sellOrder,
            amount: action.amount
          }
        };

      case SELL_ORDER_PRICE_CHANGED:
        return {
          ...state,
          sellOrder: {
            ...state.sellOrder,
            price: action.price
          }
        };

      case SELL_ORDER_MAKING:
        return {
          ...state,
          sellOrder: {
            ...state.sellOrder,
            amount: null,
            price: null,
            making: true
          }
        };

      case ORDER_MADE:
        index = state.allOrders.data.findIndex(order => order.id === action.order.id);
        data = [];
        if (index === -1) {
          data = [...state.allOrders.data, action.order];
        } else {
          data = state.allOrders.data;
        }
        return {
          ...state,
          allOrders: {
            ...state.allOrders,
            data
          },
          buyOrder: {
            ...state.buyOrder,
            making: false
          },
          sellOrder: {
            ...state.sellOrder,
            making:false
          }
        };

    default:
      return state;
  }
}

function balances(state={}, action) {
  switch (action.type) {

    case BALANCES_LOADING:
      return {
        ...state,
        balancesLoading: true
      };

    case BALANCES_LOADED:
      return {
        ...state,
        balancesLoading: false
      };

    case EXCHANGE_ETHER_BALANCE_LOADED:
      return {
        ...state,
        exchangeEtherBalance: action.balance
      };

    case ETHER_BALANCE_LOADED:
      return {
        ...state,
        etherBalance: action.balance
      };

    case EXCHANGE_TOKEN_BALANCE_LOADED:
      return {
        ...state,
        exchangeTokenBalance: action.balance
      };

    case TOKEN_BALANCE_LOADED:
      return {
        ...state,
        tokenBalance: action.balance
      }

    default: return state;
  }
}

const rootReducer = combineReducers({
  web3, token, exchange, balances
});

export default rootReducer;
