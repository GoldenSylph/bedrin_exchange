function makeActionCreator(type, ...argNames) {
  return function(...args) {
    const action = { type }
    argNames.forEach((arg, index) => {
      action[argNames[index]] = args[index]
    })
    return action
  }
}

export const WEB3_LOADED = 'WEB3_LOADED';
export const web3Loaded = makeActionCreator(WEB3_LOADED, 'connection');

export const EXCHANGE_ETHER_BALANCE_LOADED = 'EXCHANGE_ETHER_BALANCE_LOADED';
export const exchangeEtherBalanceLoaded = makeActionCreator(EXCHANGE_ETHER_BALANCE_LOADED, 'balance');

export const ETHER_BALANCE_LOADED = 'ETHER_BALANCE_LOADED';
export const etherBalanceLoaded = makeActionCreator(ETHER_BALANCE_LOADED, 'balance');

export const EXCHANGE_TOKEN_BALANCE_LOADED = 'EXCHANGE_TOKEN_BALANCE_LOADED';
export const exchangeTokenBalanceLoaded = makeActionCreator(EXCHANGE_TOKEN_BALANCE_LOADED, 'balance');

export const TOKEN_BALANCE_LOADED = 'TOKEN_BALANCE_LOADED';
export const tokenBalanceLoaded = makeActionCreator(TOKEN_BALANCE_LOADED, 'balance');

export const BALANCES_LOADED = 'BALANCES_LOADED';
export const balancesLoaded = makeActionCreator(BALANCES_LOADED);

export const BALANCES_LOADING = 'BALANCES_LOADING';
export const balancesLoading = makeActionCreator(BALANCES_LOADING);

export const WEB3_NETWORK_TYPE_LOADED = 'WEB3_NETWORK_TYPE_LOADED';
export const web3NetworkTypeLoaded = makeActionCreator(WEB3_NETWORK_TYPE_LOADED, 'network');

export const WEB3_NETWORK_ID_LOADED = 'WEB3_NETWORK_ID_LOADED';
export const web3NetworkIdLoaded = makeActionCreator(WEB3_NETWORK_ID_LOADED, 'networkId');

export const WEB3_ACCOUNT_LOADED = 'WEB3_ACCOUNT_LOADED';
export const web3AccountLoaded = makeActionCreator(WEB3_ACCOUNT_LOADED, 'account');

export const TOKEN_LOADED = 'TOKEN_LOADED';
export const tokenLoaded = makeActionCreator(TOKEN_LOADED, 'contract');

export const EXCHANGE_LOADED = 'EXCHANGE_LOADED';
export const exchangeLoaded = makeActionCreator(EXCHANGE_LOADED, 'contract');

export const CANCELLED_ORDERS_LOADED = 'CANCELLED_ORDERS_LOADED';
export const cancelledOrdersLoaded = makeActionCreator(CANCELLED_ORDERS_LOADED, 'cancelledOrders');

export const FILLED_ORDERS_LOADED = 'FILLED_ORDERS_LOADED';
export const filledOrdersLoaded = makeActionCreator(FILLED_ORDERS_LOADED, 'filledOrders');

export const ALL_ORDERS_LOADED = 'ALL_ORDERS_LOADED';
export const allOrdersLoaded = makeActionCreator(ALL_ORDERS_LOADED, 'allOrders');

export const ORDER_CANCELLING = 'ORDER_CANCELLING';
export const orderCancelling = makeActionCreator(ORDER_CANCELLING);

export const ORDER_CANCELLED = 'ORDER_CANCELLED';
export const orderCancelled = makeActionCreator(ORDER_CANCELLED,  'order');

export const ORDER_FILLING = 'ORDER_FILLING';
export const orderFilling = makeActionCreator(ORDER_FILLING);

export const ORDER_FILLED = 'ORDER_FILLED';
export const orderFilled = makeActionCreator(ORDER_FILLED,  'order');

export const ETHER_DEPOSIT_AMOUNT_CHANGED = 'ETHER_DEPOSIT_AMOUNT_CHANGED';
export const etherDepositAmountChanged = makeActionCreator(ETHER_DEPOSIT_AMOUNT_CHANGED, 'amount');

export const ETHER_WITHDRAW_AMOUNT_CHANGED = 'ETHER_WITHDRAW_AMOUNT_CHANGED';
export const etherWithdrawAmountChanged = makeActionCreator(ETHER_WITHDRAW_AMOUNT_CHANGED, 'amount');

export const TOKEN_DEPOSIT_AMOUNT_CHANGED = 'TOKEN_DEPOSIT_AMOUNT_CHANGED';
export const tokenDepositAmountChanged = makeActionCreator(TOKEN_DEPOSIT_AMOUNT_CHANGED, 'amount');

export const TOKEN_WITHDRAW_AMOUNT_CHANGED = 'TOKEN_WITHDRAW_AMOUNT_CHANGED';
export const tokenWithdrawAmountChanged = makeActionCreator(TOKEN_WITHDRAW_AMOUNT_CHANGED, 'amount');

export const ORDER_MADE = 'ORDER_MADE';
export const orderMade = makeActionCreator(ORDER_MADE, "order");

export const BUY_ORDER_AMOUNT_CHANGED = 'BUY_ORDER_AMOUNT_CHANGED';
export const buyOrderAmountChanged = makeActionCreator(BUY_ORDER_AMOUNT_CHANGED, 'amount');

export const BUY_ORDER_PRICE_CHANGED = 'BUY_ORDER_PRICE_CHANGED';
export const buyOrderPriceChanged = makeActionCreator(BUY_ORDER_PRICE_CHANGED, 'price');

export const BUY_ORDER_MAKING = 'BUY_ORDER_MAKING';
export const buyOrderMaking = makeActionCreator(BUY_ORDER_MAKING);

export const SELL_ORDER_AMOUNT_CHANGED = 'SELL_ORDER_AMOUNT_CHANGED';
export const sellOrderAmountChanged = makeActionCreator(SELL_ORDER_AMOUNT_CHANGED, 'amount');

export const SELL_ORDER_PRICE_CHANGED = 'SELL_ORDER_PRICE_CHANGED';
export const sellOrderPriceChanged = makeActionCreator(SELL_ORDER_PRICE_CHANGED, 'price');

export const SELL_ORDER_MAKING = 'SELL_ORDER_MAKING';
export const sellOrderMaking = makeActionCreator(SELL_ORDER_MAKING);
