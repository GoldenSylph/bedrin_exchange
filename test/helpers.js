export const ETHER_ADDRESS = '0x0000000000000000000000000000000000000000';
export const EVM_REVERT = 'VM Exception while processing transaction: revert';

export const wait = (seconds) => {
  const millis = seconds * 1000;
  return new Promise(resolve => setTimeout(resolve, millis));
};

export const ether = (n) => {
  return new web3.utils.BN(
    web3.utils.toWei(n.toString(), 'ether')
  );
};

export const tokens = (n) => ether(n);

export const checkOnEvent = (result, eventName, processArgs) => {
  const log = result.logs[0];
  log.event.should.eq(eventName);
  const eventArgs = log.args;
  processArgs(eventArgs);
};

export const checkOnTransferEvent = (result, from, to, amount) => {
  checkOnEvent(result, 'Transfer', (eventArgs) => {
    eventArgs.from.should.equal(from, 'from is not correct');
    eventArgs.to.should.equal(to, 'to is not correct');
    eventArgs.value.toString().should
      .equal(amount.toString(), 'value is not correct');
  });
};

export const checkOnApproveEvent = (result, owner, spender, amount) => {
  checkOnEvent(result, 'Approval', (eventArgs) => {
    eventArgs.owner.should.equal(owner, 'owner is not correct');
    eventArgs.spender.should.equal(spender, 'spender is not correct');
    eventArgs.value.toString().should
      .equal(amount.toString(), 'value is not correct');
  });
};

export const checkOnWithdrawOrDepositEvent = (result, tokenAddress, user, amount,
    balance, isDeposit) => {
  checkOnEvent(result, isDeposit ? 'Deposit' : 'Withdraw', (eventArgs) => {
    eventArgs.token.should.equal(tokenAddress, 'token address is not correct');
    eventArgs.user.should.equal(user, 'user address is not correct');
    eventArgs.amount.toString().should
      .equal(amount.toString(), 'amount is not correct');
    eventArgs.balance.toString().should
      .equal(balance.toString(), 'balance is not correct');
  });
};

export const checkOnDepositEvent =
  (result, tokenAddress, user, amount, balance) =>
    checkOnWithdrawOrDepositEvent(result, tokenAddress,
      user, amount, balance, true);

export const checkOnWithdrawEvent =
  (result, tokenAddress, user, amount, balance) =>
    checkOnWithdrawOrDepositEvent(result, tokenAddress,
      user, amount, balance, false);

export const checkTheOrder = (order, id, user, tokenGet, amountGet,
    tokenGive, amountGive, timestamp) => {
  order.id.toString().should.equal(id, 'id is not correct');
  order.user.should.equal(user, 'user is not correct');
  order.tokenGet.should.equal(tokenGet, 'tokenGet is not correct');
  order.amountGet.toString().should.equal(amountGet.toString(), 'amountGet is not correct');
  order.tokenGive.should.equal(tokenGive, 'tokenGive is not correct');
  order.amountGive.toString().should.equal(amountGive.toString(), 'amountGive is not correct');
  order.timestamp.toString().length.should.be.at.least(1, 'timestamp is not present');
  if (timestamp != undefined) {
    order.timestamp.toString().should.equal(timestamp, 'timestamp is not correct');
  }
};

export const checkOnTradeEvent = (result, id, user, tokenGet, amountGet,
    tokenGive, amountGive, userFill, timestamp) => {
      checkOnEvent(result, 'Trade', (eventArgs) => {
        checkTheOrder(eventArgs, id, user, tokenGet, amountGet, tokenGive, amountGive, timestamp);
        eventArgs.userFill.should.equal(userFill, 'userFill is not correct');
      });
};

export const checkOnOrderOrCancelEvent = (result, id, user, tokenGet, amountGet,
    tokenGive, amountGive, timestamp, isOrder) => {
  checkOnEvent(result, isOrder ? 'Order' : 'Cancel',
    (eventArgs) => checkTheOrder(eventArgs, id, user,
      tokenGet, amountGet, tokenGive, amountGive, timestamp));
};

export const checkOnOrderEvent = (result, id, user, tokenGet, amountGet,
    tokenGive, amountGive, timestamp) =>
      checkOnOrderOrCancelEvent(result, id, user, tokenGet, amountGet,
          tokenGive, amountGive, timestamp, true);

export const checkOnCancelEvent = (result, id, user, tokenGet, amountGet,
    tokenGive, amountGive, timestamp) =>
      checkOnOrderOrCancelEvent(result, id, user, tokenGet, amountGet,
          tokenGive, amountGive, timestamp, false);
