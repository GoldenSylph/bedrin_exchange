import { tokens, EVM_REVERT, checkOnTransferEvent, checkOnApproveEvent } from './helpers';

const Token = artifacts.require('./Token');
require('chai').use(require('chai-as-promised')).should();

contract('Token', ([deployer, receiver, exchange, hacker]) => {

  const name = 'Bedrin utility token';
  const symbol = 'BUT';
  const decimals = '18';
  const totalSupply = tokens(1000).toString();

  let token;

  beforeEach(async () => {
    token = await Token.new();
  });

  describe('deployment', () => {

    it('tracks the name', async () => {
      const result = await token.name();
      result.should.equal(name);
    });

    it('tracks the symbol', async () => {
      const result = await token.symbol();
      result.should.equal(symbol);
    });

    it('tracks the decimals', async () => {
      const result = await token.decimals();
      result.toString().should.equal(decimals);
    });

    it('tracks the total supply', async () => {
      const result = await token.totalSupply();
      result.toString().should.equal(totalSupply.toString());
    });

    it('assigns total supply to the deployer', async () => {
      const result = await token.balanceOf(deployer);
      result.toString().should.equal(totalSupply.toString());
    });

  });

  describe('delegated sending tokens', () => {

    let amount;
    let result;

    beforeEach(async () => {
      amount = tokens(100);
      await token.approve(exchange, amount, { from: deployer });
    });

    describe('success', () => {

      beforeEach(async () => {
        result = await token.transferFrom(deployer, exchange, amount, { from: deployer });
      });

      it('transfers token balances', async () => {
        let balanceOf;
        balanceOf = await token.balanceOf(deployer);
        balanceOf.toString().should.equal(tokens(900).toString());
        balanceOf = await token.balanceOf(exchange);
        balanceOf.toString().should.equal(tokens(100).toString());
      });

      it('resets the allowance', async () => {
        const allowance = await token.allowance(deployer, exchange);
        allowance.toString().should.equal('0');
      });

      it('emits the Transfer event', async () => {
        checkOnTransferEvent(result, deployer, exchange, amount);
      });

    });

    describe('failure', () => {

      it('forbids the illegal token transfers', async () => {
        await token.transferFrom(deployer, hacker, amount, { from: deployer })
          .should.be.rejected;
      });

      it('forbids the illegal value for token transfer', async () => {
        const invalidAmount = tokens(1000);
        await token.transferFrom(deployer, exchange, invalidAmount, { from: deployer })
          .should.be.rejectedWith(EVM_REVERT);
      });

      it('forbids the insufficient recipients', async () => {
        await token.transferFrom(deployer, 0x0, amount, { from: deployer })
          .should.be.rejected;
      });

    });

  });

  describe('sending tokens', () => {

    let amount;
    let result;

    describe('success', () => {

      beforeEach(async () => {
        amount = tokens(100);
        result = await token.transfer(receiver, amount, { from: deployer });
      });

      it('transfers token balances', async () => {
        let balanceOf;
        balanceOf = await token.balanceOf(deployer);
        balanceOf.toString().should.equal(tokens(900).toString());
        balanceOf = await token.balanceOf(receiver);
        balanceOf.toString().should.equal(tokens(100).toString());
      });

      it('emits the Transfer event', async () => {
        checkOnTransferEvent(result, deployer, receiver, amount);
      });
    });

    describe('failure', () => {

      it('rejects insufficient balances', async () => {
        let invalidAmount = tokens(2000);

        await token.transfer(receiver, invalidAmount, { from: deployer })
          .should.be
          .rejectedWith(EVM_REVERT);

        invalidAmount = tokens(10);
        await token.transfer(deployer, invalidAmount, { from: receiver })
          .should.be
          .rejectedWith(EVM_REVERT);
      });

      it('rejects insufficient recipients', async () => {
        await token.transfer(0x0, tokens(amount), { from: deployer })
          .should.be.rejected;
      });

    });
  });

  describe('approving tokens', () => {
    let result;
    let amount;

    beforeEach(async () => {
      amount = tokens(100);
      result = await token.approve(exchange, amount, { from: deployer });
    });

    describe('success', () => {

      it('allocates an allowance for delegated token spending on exchange', async () => {
        const allowance = await token.allowance(deployer, exchange);
        allowance.toString().should.equal(amount.toString());
      });

      it('emits the Approval event', async () => {
        checkOnApproveEvent(result, deployer, exchange, amount);
      });

    });

    describe('failure', () => {
      it('rejects invalid spenders', async () => {
        await token.approve(0x0, tokens(amount), { from: deployer })
          .should.be.rejected;
      });
    });
  });

});
