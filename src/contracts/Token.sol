pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";

contract Token {
  using SafeMath for uint;

  string constant WRONG_USER = "The address is inconsistent.";

  // Variables
  string public name = "Bedrin utility token";
  string public symbol = "BUT";

  uint256 public decimals = 18;
  uint256 public totalSupply;

  mapping(address => uint256) public balanceOf;
  mapping(address => mapping(address => uint256)) public allowance;

  // Events
  event Transfer(address indexed from, address indexed to, uint256 value);
  event Approval(address indexed owner, address indexed spender, uint256 value);

  constructor() public {
    totalSupply = 1000 * (10 ** decimals);
    balanceOf[msg.sender] = totalSupply;
  }

  function transfer(address to, uint256 value) public returns(bool success) {
    return _transferFrom(msg.sender, to, value);
  }

  function approve(address spender, uint256 value) public returns(bool success) {
    require(spender != address(0), WRONG_USER);
    allowance[msg.sender][spender] = value;
    emit Approval(msg.sender, spender, value);
    return true;
  }

  function transferFrom(address from, address to, uint256 value) public returns (bool success) {
    require(value <= allowance[from][to], "The request value is greater then allowed.");
    bool result = _transferFrom(from, to, value);
    if (result) {
      allowance[from][to] = allowance[from][to].sub(value);
    }
    return result;
  }

  function _transferFrom(address from, address to, uint256 value) internal returns (bool success) {
    require(to != address(0), WRONG_USER);
    require(balanceOf[from] >= value, "The balance of the user must be greater or equal to value.");
    balanceOf[from] = balanceOf[from].sub(value);
    balanceOf[to] = balanceOf[to].add(value);
    emit Transfer(from, to, value);
    return true;
  }
}
