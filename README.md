# MyToken Smart Contract

This repository includes two distinct tasks:

1.ERC20 Token Transfers: Enables transferring ERC20 tokens from your connected wallet to another wallet.

2.Check Token Balance: Allows checking the balance of any Sepolia testnet token contract for any specified wallet.





<img width="1676" alt="image" src="https://github.com/user-attachments/assets/39e10751-65ee-4556-8cb1-59fd1d51aa4a" />




Try running some of the following tasks:

 Clone the Repo
```shell
git clone https://github.com/jahangirhussain0369/Assessment-task--erc20

```
 To Build the smart contract
```shell
npx hardhat compile

```

To Deploy the smart contract
```shell

npx hardhat run scripts/deploy.js --network <network-name>

```
Testing the smart contract 

```shell

npx hardhat run scripts/checkbalance.js --network <network-name>

npx hardhat run scripts/mint.js --network <network-name>

npx hardhat run scripts/transfer.js --network <network-name>
```


```shell

git clone https://github.com/jahangirhussain0369/Assessment-task--erc20

cd frontend

npm install

npm start 
```

# How to Use the ERC-20 DApp

Connect Your Wallet (MetaMask):
Open your browser and ensure the MetaMask extension is installed.
Click the "Connect Wallet" button on the DApp interface and select MetaMask.
Approve the connection in your MetaMask wallet.
Features:
1. Check Token Balance:
Fill in the token contract address.
Enter the wallet address whose balance you want to check.
The DApp will display the balance for the specified wallet.
Note: This feature works only for Sepolia testnet contracts.

3. Transfer Tokens to Another Address:
You can transfer your tokens to any valid Ethereum address:
Enter the recipient’s wallet address.
Specify the amount of tokens to transfer.
Click the "Transfer" button to send tokens from your connected wallet to the recipient’s wallet.
Confirm the transaction in MetaMask.

5. Transaction History:
Click on the "History" button to view the latest 5 transactions of the selected token.
