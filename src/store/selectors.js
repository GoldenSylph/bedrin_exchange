import { createSelector } from 'reselect';
import { get, reject, groupBy, minBy, maxBy } from 'lodash';
import moment from 'moment';
import { ETHER_ADDRESS, ether, tokens, RED,
  GREEN, BUY, SELL, POS_SIGN, NEG_SIGN, TOKEN_PRICE_FIELD, formatBalance } from '../helpers.js';

const accountSelectorLambda = state => get(state, 'web3.account');
export const accountSelector = createSelector(accountSelectorLambda, account => account);

const web3 = state => get(state, 'web3.connection');
export const web3Selector = createSelector(web3, w => w);

const tokenLoaded = state => get(state, 'token.loaded', false);
export const tokenLoadedSelector = createSelector(tokenLoaded, tl => tl);

const token = state => get(state, 'token.contract');
export const tokenSelector = createSelector(token, t => t);

const exchangeLoaded = state => get(state, 'exchange.loaded', false);
export const exchangeLoadedSelector = createSelector(exchangeLoaded, el => el);

const exchange = state => get(state, 'exchange.contract');
export const exchangeSelector = createSelector(exchange, e => e);

export const contractsLoadedSelector = createSelector(
  tokenLoaded, exchangeLoaded,
  (tl, el) => (tl && el)
);

const cancelledOrdersLoaded = state => get(state, 'exchange.cancelledOrders.loaded', false);
export const cancelledOrdersLoadedSelector = createSelector(cancelledOrdersLoaded, loaded => loaded);
const cancelledOrders = state => get(state, 'exchange.cancelledOrders.data', []);
export const cancelledOrdersSelector = createSelector(cancelledOrders, co => co);

const filledOrdersLoaded = state => get(state, 'exchange.filledOrders.loaded', false);
export const filledOrdersLoadedSelector = createSelector(filledOrdersLoaded, loaded => loaded);
const filledOrders = state => get(state, 'exchange.filledOrders.data', []);
export const filledOrdersSelector = createSelector(filledOrders, (orders) => {
  orders = orders.sort((a, b) => a.timestamp - b.timestamp);
  orders = decorateFilledOrders(orders);
  orders = orders.sort((a, b) => b.timestamp - a.timestamp);
  // console.log(orders);
  return orders;
});

const decorateFilledOrders = (orders) => {
  let previousOrder = orders[0];
  return orders.map((order) => {
    order = decorateOrder(order);
    order = decorateFilledOrder(order, previousOrder);
    previousOrder = order;
    return order;
  });
};

const decorateFilledOrder = (order, previousOrder) => {
  return({
    ...order,
    tokenPriceClass: getTokenPriceClass(order.tokenPrice, order.id, previousOrder)
  });
};

const getTokenPriceClass = (tokenPrice, orderId, previousOrder) => {
  if (orderId === previousOrder.id) {
    return GREEN;
  }

  if (previousOrder.tokenPrice <= tokenPrice) {
    return GREEN;
  } else {
    return RED;
  }
};

const decorateOrder = (order) => {
  let etherAmount;
  let tokenAmount;
  if (order.tokenGive === ETHER_ADDRESS) {
    etherAmount = order.amountGive;
    tokenAmount = order.amountGet;
  } else {
    etherAmount = order.amountGet;
    tokenAmount = order.amountGive;
  }

  const precision = 100000;
  let tokenPrice = (etherAmount / tokenAmount);
  tokenPrice = Math.round(tokenPrice * precision) / precision;

  return ({
    ...order,
    etherAmount: ether(etherAmount),
    tokenAmount: tokens(tokenAmount),
    tokenPrice,
    formattedTimestamp: moment.unix(order.timestamp).format('h:mm:ss a M/D/Y')
  });
};

const allOrdersLoaded = state => get(state, 'exchange.allOrders.loaded', false);
const allOrders = state => get(state, 'exchange.allOrders.data', []);

const orderBookLoaded = state => cancelledOrdersLoaded(state)
  && filledOrdersLoaded(state) && allOrdersLoaded(state);
export const orderBookLoadedSelector = createSelector(orderBookLoaded, loaded => loaded);

const openOrders = state => {
  const all = allOrders(state);
  const cancelled = cancelledOrders(state);
  const filled = filledOrders(state);

  const result = reject(all, (order) => {
    const isOrderFilled = filled.some((o) => o.id === order.id);
    const isOrderCancelled = cancelled.some((o) => o.id === order.id);
    return isOrderFilled || isOrderCancelled;
  });
  return result;
};

const notMineOpenOrders = state => {
  const me = accountSelectorLambda(state);
  const result = reject(openOrders(state), (order) => {
    return order.user === me;
  });
  return result;
}

export const orderBookSelector = createSelector(
  notMineOpenOrders,
  (orders) => {
    orders = decorateOrderBookOrders(orders);
    orders = groupBy(orders, 'orderType');
    const buyOrders = get(orders, BUY, []);
    const sellOrders = get(orders, SELL, []);
    const byTokenPrice = (a, b) => b.tokenPrice - a.tokenPrice;
    orders = {
      ...orders,
      buyOrders: buyOrders.sort(byTokenPrice),
      sellOrders: sellOrders.sort(byTokenPrice)
    }
    return orders;
  }
);

const decorateOrderBookOrders = (orders) => {
  return orders.map((order) => {
    order = decorateOrder(order);
    order = decorateOrderBookOrder(order);
    return order;
  });
};

const decorateOrderBookOrder = (order) => {
  const orderType = order.tokenGive === ETHER_ADDRESS ? BUY : SELL;
  return {
    ...order,
    orderType,
    orderTypeClass: (orderType === BUY ? GREEN : RED),
    orderFillAction: orderType === BUY ? SELL : BUY
  };
};

export const myFilledOrdersLoadedSelector = createSelector(filledOrdersLoaded, loaded => loaded);

export const myFilledOrdersSelector = createSelector(
  accountSelectorLambda,
  filledOrders,
  (acc, orders) => {
    orders = orders.filter((o) => o.user === acc || o.userFill === acc);
    orders = orders.sort((a, b) => a.timestamp - b.timestamp);
    orders = decorateMyFilledOrders(orders, acc);
    return orders;
  }
);

const decorateMyFilledOrders = (orders, account) => {
  return (
    orders.map((order) => {
      order = decorateOrder(order);
      order = decorateMyFilledOrder(order, account);
      return order;
    })
  );
};

const decorateMyFilledOrder = (order, account) => {
  const isMyOrder = order.user === account;
  let orderType;
  if (isMyOrder) {
    orderType = order.tokenGive === ETHER_ADDRESS ? BUY : SELL;
  } else {
    orderType = order.tokenGive === ETHER_ADDRESS ? SELL : BUY;
  }
  const isOrderTypeBuy = orderType === BUY;
  return {
    ...order,
    orderType,
    orderTypeClass: isOrderTypeBuy ? GREEN : RED,
    orderSign: isOrderTypeBuy ? POS_SIGN : NEG_SIGN
  };
};

export const myOpenOrdersLoadedSelector = createSelector(orderBookLoaded, loaded => loaded);

export const myOpenOrdersSelector = createSelector(
  accountSelectorLambda,
  openOrders,
  (acc, orders) => {
    orders = orders.filter((o) => o.user === acc);
    orders = decorateMyOpenOrders(orders);
    orders = orders.sort((a, b) => b.timestamp - a.timestamp);
    return orders;
  }
);

const decorateMyOpenOrders = (orders, account) => {
  return orders.map((order) => {
    order = decorateOrder(order);
    order = decorateMyOpenOrder(order, account);
    return order;
  });
};

const decorateMyOpenOrder = (order, account) => {
  let orderType = order.tokenGive === ETHER_ADDRESS ? BUY : SELL;
  return {
    ...order,
    orderType,
    orderTypeClass: orderType === BUY ? GREEN : RED
  };
};

export const priceChartLoadedSelector = createSelector(filledOrdersLoaded, loaded => loaded);

export const priceChartSelector = createSelector(
  filledOrders,
  (orders) => {
    orders = orders.sort((a, b) => a.timestamp - b.timestamp);
    orders = orders.map((o) => decorateOrder(o));
    let secondLastOrder, lastOrder;
    [secondLastOrder, lastOrder] = orders.slice(orders.length - 2, orders.length);
    const lastPrice = get(lastOrder, TOKEN_PRICE_FIELD, 0);
    const secondLastPrice = get(secondLastOrder, TOKEN_PRICE_FIELD, 0);
    return {
      lastPrice,
      lastPriceChange: lastPrice >= secondLastPrice ? POS_SIGN : NEG_SIGN,
      series: [{
        data: buildGraphData(orders)
      }]
    };
  }
);

const buildGraphData = (orders) => {
  orders = groupBy(orders, (o) => moment.unix(o.timestamp).startOf('hour').format());
  const hours = Object.keys(orders);
  const graphData = hours.map((hour) => {
    const group = orders[hour];
    const open = group[0];
    const low = minBy(group, TOKEN_PRICE_FIELD);
    const max = maxBy(group, TOKEN_PRICE_FIELD);
    const close = group[group.length - 1];
    return {
      x: new Date(hour),
      y: [open.tokenPrice, low.tokenPrice, max.tokenPrice, close.tokenPrice]
    };
  });
  return graphData;
};

const orderCancelling = state => get(state, 'exchange.orderCancelling', false);
export const orderCancellingSelector = createSelector(orderCancelling, status => status);

const orderFilling = state => get(state, 'exchange.orderFilling', false);
export const orderFillingSelector = createSelector(orderFilling, status => status);

const balancesLoading = state => get(state, 'balances.balancesLoading', true);
export const balancesLoadingSelector = createSelector(balancesLoading, loading => loading);

const exchangeEtherBalance = state => get(state, 'balances.exchangeEtherBalance', 0);
export const exchangeEtherBalanceSelector = createSelector(exchangeEtherBalance, (balance) => {
  return formatBalance(balance);
});

const exchangeTokenBalance = state => get(state, 'balances.exchangeTokenBalance', 0);
export const exchangeTokenBalanceSelector = createSelector(exchangeTokenBalance, (balance) => {
  return formatBalance(balance);
});

const tokenBalance = state => get(state, 'balances.tokenBalance', 0);
export const tokenBalanceSelector = createSelector(tokenBalance, (balance) => {
  return formatBalance(balance);
});

const etherBalance = state => get(state, 'balances.etherBalance', 0);
export const etherBalanceSelector = createSelector(etherBalance, (balance) => {
  return formatBalance(balance);
});

const etherDepositAmount = state => get(state, 'exchange.etherDepositAmount', null);
export const etherDepositAmountSelector = createSelector(etherDepositAmount, amount => amount);

const etherWithdrawAmount = state => get(state, 'exchange.etherWithdrawAmount', null);
export const etherWithdrawAmountSelector = createSelector(etherWithdrawAmount, amount => amount);

const tokenDepositAmount = state => get(state, 'exchange.tokenDepositAmount', null);
export const tokenDepositAmountSelector = createSelector(tokenDepositAmount, amount => amount);

const tokenWithdrawAmount = state => get(state, 'exchange.tokenWithdrawAmount', null);
export const tokenWithdrawAmountSelector = createSelector(tokenWithdrawAmount, amount => amount);

const buyOrder = state => get(state, 'exchange.buyOrder', {});
export const buyOrderSelector = createSelector(buyOrder, order => order);

const sellOrder = state => get(state, 'exchange.sellOrder', {});
export const sellOrderSelector = createSelector(sellOrder, order => order);
