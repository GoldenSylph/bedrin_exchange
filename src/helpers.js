import React from 'react';

export const ETHER_ADDRESS = '0x0000000000000000000000000000000000000000';
export const RED = 'danger';
export const GREEN = 'success';
export const DECIMALS = (10**18);
export const BUY = 'buy';
export const SELL = 'sell';
export const POS_SIGN = '+';
export const NEG_SIGN = '-';
export const QUESTION_SIGN = '?';
export const TOKEN_PRICE_FIELD = 'tokenPrice';
export const TRIANGLE_UP = <span className="text-success">&#9650;</span>;
export const TRIANGLE_DOWN = <span className="text-success">&#9660;</span>;

export const ether = (wei) => {
  if (wei) {
    return (wei / DECIMALS);
  }
};

export const tokens = (n) => ether(n);

export const formatBalance = (balance) => {
  const precision = 100;
  balance = ether(balance);
  balance = Math.round(balance * precision) / precision;
  return balance;
};
