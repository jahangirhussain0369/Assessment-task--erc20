import { Web3 } from 'web3';
import { ethers } from 'ethers';

// Full ERC20 ABI for better compatibility
const ERC20_ABI = [
  {
    "constant": true,
    "inputs": [],
    "name": "name",
    "outputs": [{ "name": "", "type": "string" }],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "decimals",
    "outputs": [{ "name": "", "type": "uint8" }],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "symbol",
    "outputs": [{ "name": "", "type": "string" }],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [{ "name": "_owner", "type": "address" }],
    "name": "balanceOf",
    "outputs": [{ "name": "balance", "type": "uint256" }],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "totalSupply",
    "outputs": [{ "name": "", "type": "uint256" }],
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "name": "from", "type": "address" },
      { "indexed": true, "name": "to", "type": "address" },
      { "indexed": false, "name": "value", "type": "uint256" }
    ],
    "name": "Transfer",
    "type": "event"
  }
];

/**
 * Format token amount from wei to decimal string
 * @param {string} amount - Amount in wei
 * @param {number} decimals - Token decimals
 * @returns {string} Formatted amount
 */
function formatTokenAmount(amount, decimals) {
  try {
    // Convert to string first in case it's a BigInt
    const amountStr = amount.toString();
    // Use Web3's fromWei and divide by the appropriate power of 10 for the decimals
    const divisor = Math.pow(10, decimals - 18); // Adjust for tokens with different decimals
    return (Number(Web3.utils.fromWei(amountStr)) / divisor).toString();
  } catch (error) {
    console.error('Error formatting amount:', error);
    return '0';
  }
}

/**
 * Get token balance and information for any ERC20 token
 * @param {string} tokenAddress - The token contract address
 * @param {string} walletAddress - The wallet address to check balance for
 * @returns {Promise<{balance: string, decimals: number, symbol: string}>} Token information
 */
export async function getTokenBalance(tokenAddress, walletAddress) {
  try {
    console.log('Checking balance with parameters:', {
      tokenAddress,
      walletAddress
    });

    // Check if MetaMask is installed
    if (!window.ethereum) {
      throw new Error('Please install MetaMask to use this feature');
    }

    // Initialize Web3 with MetaMask provider
    const web3 = new Web3(window.ethereum);

    // Request account access if needed
    await window.ethereum.request({ method: 'eth_requestAccounts' });

    // Validate addresses
    try {
      const cleanTokenAddress = web3.utils.toChecksumAddress(tokenAddress.trim());
      const cleanWalletAddress = web3.utils.toChecksumAddress(walletAddress.trim());

      console.log('Cleaned addresses:', {
        cleanTokenAddress,
        cleanWalletAddress
      });

      // Create contract instance
      const contract = new web3.eth.Contract(ERC20_ABI, cleanTokenAddress);

      try {
        // First verify if this is a valid ERC20 token by checking symbol
        const symbol = await contract.methods.symbol().call();
        console.log('Token symbol:', symbol);

        // Get token information
        const [balance, decimals] = await Promise.all([
          contract.methods.balanceOf(cleanWalletAddress).call(),
          contract.methods.decimals().call()
        ]);

        console.log('Retrieved data:', {
          symbol,
          balance,
          decimals
        });

        return { balance, decimals, symbol };
      } catch (contractError) {
        console.error('Contract interaction error:', contractError);
        throw new Error('Invalid token contract. Please verify you are using a valid ERC20 token address.');
      }
    } catch (addressError) {
      console.error('Address validation error:', addressError);
      if (addressError.message.includes('invalid address')) {
        throw new Error('Please enter valid Ethereum addresses (0x...)');
      }
      throw addressError;
    }
  } catch (error) {
    console.error('Detailed error:', {
      message: error.message,
      code: error.code,
      data: error.data
    });

    // Handle specific error cases
    if (error.message.includes('Provided address')) {
      throw new Error('Invalid token contract address. Please verify the address.');
    }
    if (error.message.includes('execution reverted')) {
      throw new Error('Contract execution failed. This might not be a valid ERC20 token.');
    }
    if (error.message.includes('gas')) {
      throw new Error('Transaction failed. Please verify the token contract address.');
    }
    if (error.message.includes('network')) {
      throw new Error('Please make sure MetaMask is connected to Sepolia network.');
    }
    
    throw error;
  }
}

/**
 * Get last 5 transactions for a token
 * @param {string} tokenAddress - The token contract address
 * @returns {Promise<Array>} List of transactions
 */
export async function getTokenTransactions(tokenAddress) {
  try {
    // Check if MetaMask is installed
    if (!window.ethereum) {
      throw new Error('Please install MetaMask to use this feature');
    }

    // Initialize Web3 with MetaMask provider
    const web3 = new Web3(window.ethereum);

    // Clean and validate token address
    const cleanTokenAddress = web3.utils.toChecksumAddress(tokenAddress.trim());

    // Create contract instance
    const contract = new web3.eth.Contract(ERC20_ABI, cleanTokenAddress);

    // Log the contract ABI and address for debugging
    console.log('Contract ABI:', ERC20_ABI);
    console.log('Contract Address:', cleanTokenAddress);

    // Check if contract is initialized
    if (!contract) {
      throw new Error('Failed to create contract instance.');
    }

    // Get current block number as a regular number
    const currentBlock = Number(await web3.eth.getBlockNumber());
    
    // Get Transfer events for the last 1000 blocks
    const events = await contract.getPastEvents('Transfer', {
      fromBlock: currentBlock - 1000,
      toBlock: 'latest'
    });

    // Log the events retrieved
    console.log('Retrieved Transfer Events:', events);

    // Check if events were retrieved
    if (!events || events.length === 0) {
      console.warn('No Transfer events found for this token.');
      return [];
    }

    // Sort events by block number and take last 5
    const lastFiveTransactions = events
      .sort((a, b) => b.blockNumber - a.blockNumber)
      .slice(0, 5)
      .map(event => {
        // Convert value to string and use web3.utils.fromWei
        const valueInWei = event.returnValues.value.toString();
        const valueInEth = web3.utils.fromWei(valueInWei, 'ether');
        
        return {
          from: event.returnValues.from,
          to: event.returnValues.to,
          value: Number(valueInEth).toFixed(6),
          transactionHash: event.transactionHash,
          blockNumber: Number(event.blockNumber)
        };
      });

    return lastFiveTransactions;
  } catch (error) {
    console.error('Error getting transactions:', error);
    throw new Error('Failed to fetch transactions: ' + error.message);
  }
}
