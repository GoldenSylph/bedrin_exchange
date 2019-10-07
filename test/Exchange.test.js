import { tokens, EVM_REVERT, ETHER_ADDRESS,
  ether, checkOnDepositEvent, checkOnWithdrawEvent,
  checkTheOrder, checkOnOrderEvent, checkOnCancelEvent,
  checkOnTradeEvent } from './helpers';

const Exchange = artifacts.require('./Exchange');
const Token = artifacts.require('./Token');

require('chai').use(require('chai-as-promised')).should();

contract('Exchange', ([deployer, feeAccount, user1, user2]) => {

  let exchange;
  let token;
  const feePercent = 10;

  beforeEach(async () => {

    token = await Token.new();
    token.transfer(user1, tokens(100), { from: deployer });

    exchange = await Exchange.new(feeAccount, feePercent);
  });

  describe('fallback', () => {
    it('reverts when ether is sent', async () => {
      await exchange.sendTransaction({ value: 1, from: user1})
        .should.be.rejectedWith(EVM_REVERT);
    });
  });

  describe('deployment', () => {

    it('tracks the fee account', async () => {
      const result = await exchange.feeAccount();
      result.should.equal(feeAccount);
    });

    it('tracks the fee percent', async () => {
      const result = await exchange.feePercent();
      result.toString().should.equal(feePercent.toString());
    });

  });

  describe('checking balances', () => {

    let amount;

    beforeEach(async () => {
      amount = ether(1);
      await exchange.depositEther({ from: user1, value: amount });
    });

    it('returns user balance', async () => {
      const result = await exchange.balanceOf(ETHER_ADDRESS, user1);
      result.toString().should.equal(amount.toString());
    });

  });

  describe('withdrawing tokens', () => {

    let amount;
    let result;

    beforeEach(async () => {
      amount = ether(1);
    });

    describe('success', () => {

      beforeEach(async () => {
        await token.approve(exchange.address, amount, { from: user1 });
        await exchange.depositToken(token.address, amount, { from: user1 });
        result = await exchange.withdrawToken(token.address, amount, { from: user1 });
      });

      it('withdraws token funds', async () => {
        const balance = await exchange.tokens(token.address, user1);
        balance.toString().should.equal('0');
      });

      it('emits the Withdraw event', async () => {
        checkOnWithdrawEvent(result, token.address, user1, amount, '0');
      });
    });

    describe('failure', () => {

      let amount;

      beforeEach(async () => {
        amount = tokens(10);
      });

      it('rejects Ether withdraws', async () => {
        await exchange.withdrawToken(ETHER_ADDRESS, amount, { from: user1 })
          .should.be.rejectedWith(EVM_REVERT);
      });

      it('rejects withdrawing without depositing any first', async () => {
        await exchange.withdrawToken(token.address, amount, { from: user1 })
          .should.be.rejectedWith(EVM_REVERT);
      });

    });
  });

  describe('withdrawing ether', () => {

    let result;
    let amount;

    beforeEach(async () => {
      amount = ether(1);
      await exchange.depositEther({ from: user1, value: amount });
    });

    describe('success', () => {

      beforeEach(async () => {
        result = await exchange.withdrawEther(amount, { from: user1 });
      });

      it('withdraws ether funds', async () => {
        const balance = await exchange.tokens(ETHER_ADDRESS, user1);
        balance.toString().should.equal('0');
      });

      it('emits the Withdraw event', async () => {
        checkOnWithdrawEvent(result, ETHER_ADDRESS, user1, amount, '0');
      });

    });

    describe('failure', () => {
      it('rejects withdraws for insufficient balances', async () => {
        await exchange.withdrawEther(ether(100), { from: user1 })
          .should.be.rejectedWith(EVM_REVERT);
      });
    });

  });

  describe('depositing ether', () => {
    let amount;
    let result;

    beforeEach(async () => {
      amount = ether(10);
      result = await exchange.depositEther({ from: user1, value: amount });
    });

    it('tracks the ether deposit', async () => {
      const balance = await exchange.tokens(ETHER_ADDRESS, user1, { from: deployer});
      balance.toString().should.equal(amount.toString());
    });

    it('emits the Deposit event', async () => {
      checkOnDepositEvent(result, ETHER_ADDRESS, user1, amount, amount);
    });

  });

  describe('depositing tokens', () => {

    let result;
    let amount;

    describe('success', () => {

      beforeEach(async () => {
        amount = tokens(10);
        await token.approve(exchange.address, amount, { from: user1 });
        result = await exchange.depositToken(token.address, amount, { from: user1 });
      });

      it('tracks the token deposit', async () => {
        //check exchange token balance
        let balance;

        balance = await token.balanceOf(exchange.address);
        balance.toString().should.equal(amount.toString());

        balance = await exchange.tokens(token.address, user1);
        balance.toString().should.equal(amount.toString());
      });

      it('emits the Deposit event', async () => {
        checkOnDepositEvent(result, token.address, user1, amount, amount);
      });
    });

    describe('failure', () => {

      let someAmount = tokens(10);

      it('rejects Ether deposits', async () => {
        await exchange.depositToken(ETHER_ADDRESS, someAmount, { from: user1 })
          .should.be.rejectedWith(EVM_REVERT);
      });

      it('fails when no tokens are approved', async () => {
        await exchange.depositToken(token.address, someAmount, { from: user1 })
          .should.be.rejectedWith(EVM_REVERT);
      });
    });
  });

  describe('order actions', () => {

    let amountEther = ether(1);
    let amountTokens = tokens(100);
    let amountTokensToBuy = tokens(1);
    let amountTokensToSell = tokens(2);
    const id = '1';

    beforeEach(async () => {
      await exchange.depositEther({from: user1, value: amountEther});

      await token.transfer(user1, amountTokens, { from: deployer });
      await token.approve(exchange.address, amountTokensToSell, { from: user1 });
      await exchange.depositToken(token.address, amountTokensToSell, { from: user1 });


      await token.transfer(user2, amountTokens, { from: deployer });
      await token.approve(exchange.address, amountTokensToSell, { from: user2 });
      await exchange.depositToken(token.address, amountTokensToSell, { from: user2 });

      await exchange.makeOrder(token.address, amountTokensToBuy, ETHER_ADDRESS,
        amountEther, { from: user1 });
    });

    describe('filling orders', () => {
      let result;

      describe('success', () => {

        beforeEach(async () => {
          result = await exchange.fillOrder(id, { from: user2 });
        });

        it('executes the trade & Charge fees', async () => {
          let balance;
          balance = await exchange.balanceOf(token.address, user1);
          balance.toString().should.equal(tokens(3).toString(), 'user1 did not received tokens');
          balance = await exchange.balanceOf(ETHER_ADDRESS, user2);
          balance.toString().should.equal(amountEther.toString(), 'user2 did not received ether');
          balance = await exchange.balanceOf(ETHER_ADDRESS, user1);
          balance.toString().should.equal('0', 'user2 is not ether deducted');
          balance = await exchange.balanceOf(token.address, user2);
          balance.toString().should.equal(tokens(0.9).toString(), 'user2 is not token deducted with fee applied');
          const feeAccount = await exchange.feeAccount();
          balance = await exchange.balanceOf(token.address, feeAccount);
          balance.toString().should.equal(tokens(0.1).toString(), 'fee account did not received a fee');
        });

        it('updates filled orders', async () => {
          const orderFilled = await exchange.orderFilled(id);
          orderFilled.should.equal(true);
        });

        it('emits a Trade event', async () => {
          checkOnTradeEvent(result, id, user1, token.address, amountTokensToBuy,
            ETHER_ADDRESS, amountEther, user2);
        });

      });

      describe('failure', () => {

        it('rejects self-filling order', async () => {
          await exchange.fillOrder(id, { from: user1 })
            .should.be.rejectedWith(EVM_REVERT);
        });

        it('rejects invalid order ids', async () => {
          const invalidOrderId = 99999;
          await exchange.fillOrder(invalidOrderId, { from: user2 })
            .should.be.rejectedWith(EVM_REVERT);
        });

        it('rejects already filled orders', async () => {
          await exchange.fillOrder(id, { from: user2 }).should.be.fulfilled;
          await exchange.fillOrder(id, { from: user2 })
            .should.be.rejectedWith(EVM_REVERT);
        });

        it('rejects cancelled orders', async () => {
          await exchange.cancelOrder(id, { from: user1 }).should.be.fulfilled;
          await exchange.fillOrder(id, { from: user2 })
            .should.be.rejectedWith(EVM_REVERT);
        });

      });

    });

    describe('cancelling orders', () => {

      let result;

      describe('success', () => {

        beforeEach(async () => {
          result = await exchange.cancelOrder(id, { from: user1 });
        });

        it('updates cancelled orders', async () => {
          const orderCancelled = await exchange.orderCancelled(id);
          orderCancelled.should.equal(true);
        });

        it('emits the Cancel event', async () => {
          checkOnCancelEvent(result, id, user1, token.address, amountTokensToBuy,
            ETHER_ADDRESS, amountEther);
        });

      });

      describe('failure', () => {

        it('rejects invalid order ids', async () => {
          const invalidOrderId = 9999;
          await exchange.cancelOrder(invalidOrderId, { from: user1 })
            .should.be.rejectedWith(EVM_REVERT);
        });

        it('rejects unauthorized cancelations', async () => {
          await exchange.cancelOrder(id, { from: user2 })
            .should.be.rejectedWith(EVM_REVERT);
        });

      });

    });

  });

  describe('making orders', () => {

    let result;
    let amountTokens;
    let amountEther;
    const id = '1';

    beforeEach(async () => {
      amountTokens = tokens(1);
      amountEther = ether(1);
      result = await exchange.makeOrder(token.address, amountTokens,
        ETHER_ADDRESS, amountEther, { from: user1 });
    });

    it('tracks the newly created order', async () => {
      const orderCount = await exchange.orderCount();
      orderCount.toString().should.equal(id);
      const order = await exchange.orders(id);
      checkTheOrder(order, id, user1, token.address,
        amountTokens, ETHER_ADDRESS, amountEther);
    });

    it('emits the Order event', async () => {
      checkOnOrderEvent(result, id, user1,
        token.address, amountTokens, ETHER_ADDRESS, amountEther);
    });

  });

});
