const Exchange = artifacts.require('Exchange');
const Token = artifacts.require('Token');

module.exports = async function(callback) {

  console.log('Seeding exchange...');

  const ETHER_ADDRESS = '0x0000000000000000000000000000000000000000';

  const wait = (seconds) => {
    const millis = seconds * 1000;
    return new Promise(resolve => setTimeout(resolve, millis));
  };

  const ether = (n) => {
    return new web3.utils.BN(
      web3.utils.toWei(n.toString(), 'ether')
    );
  };

  const tokens = (n) => ether(n);

  try {
    const accounts = await web3.eth.getAccounts();

    const exchange = await Exchange.deployed();
    console.log('Exchange fetched: ' + exchange.address);
    const token = await Token.deployed();
    console.log('Token fetched: ' + token.address);

    const sender = accounts[0];
    const receiver = accounts[1];
    console.log(`Sender is ${sender}.`);
    console.log(`Receiver is ${receiver}.`);
    let amount = tokens(500);

    await token.transfer(receiver, amount, { from: sender });
    console.log(`Transferred ${amount} tokens from ${sender} to ${receiver}`);

    const user1 = accounts[0]
    const user2 = accounts[1]

    amount = ether(1);

    await exchange.depositEther({ from: user1, value: amount });
    console.log(`Deposited ${amount} ether from ${user1}`);

    amount = tokens(500);
    await token.approve(exchange.address, amount, { from: user2 });
    console.log(`Approved ${amount} from ${user2}`);

    await exchange.depositToken(token.address, amount, { from: user2 });
    console.log(`Deposited ${amount} tokens from ${user2}`);

    let result;
    let orderId;
    result = await exchange.makeOrder(token.address, amount, ETHER_ADDRESS,
      ether(0.1), { from: user1 });
    console.log(`Made order from ${user1}`);

    orderId = result.logs[0].args.id;
    await exchange.cancelOrder(orderId, { from: user1 });
    console.log(`Cancelled order from ${user1}`);

    amount = tokens(100);

    result = await exchange.makeOrder(token.address, amount, ETHER_ADDRESS,
      ether(0.1), { from: user1 });
    console.log(`Made order from ${user1}`);

    orderId = result.logs[0].args.id;
    await exchange.fillOrder(orderId, { from: user2 });
    console.log(`Filled order from ${user1}`);

    await wait(1);

    result = await exchange.makeOrder(token.address, tokens(50),
      ETHER_ADDRESS, ether(0.01), { from: user1 });
    console.log(`Made order from ${user1}`);

    orderId = result.logs[0].args.id;
    await exchange.fillOrder(orderId, { from: user2 });
    console.log(`Filled order from ${user1}`);

    await wait(1);

    result = await exchange.makeOrder(token.address, tokens(200),
      ETHER_ADDRESS, ether(0.15), { from: user1 });
    console.log(`Made order from ${user1}`);

    orderId = result.logs[0].args.id;
    await exchange.fillOrder(orderId, { from: user2 });
    console.log(`Filled order from ${user1}`);

    await wait(1);

    const openOrdersAmount = 10;
    for (i = 1; i <= openOrdersAmount; i++) {
      await exchange.makeOrder(token.address, tokens(2 * i),
        ETHER_ADDRESS, ether(0.01), { from: user1 });
      console.log(`Made order from ${user1}`);
      await wait(1);
      await exchange.makeOrder(ETHER_ADDRESS, ether(0.01), token.address,
        tokens(2 * i), { from: user2 });
      console.log(`Made order from ${user2}`);
      await wait(1);
    }

  } catch(error) {
    console.log(error);
  }
  callback();
};
