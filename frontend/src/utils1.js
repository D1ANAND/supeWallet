import { ethers } from "ethers";
import { MyNFTABI, SourceMinterABI, DestinationMinterABI } from "./config";
import { ToastContainer, toast } from 'react-toastify';


import web3Modal from "web3modal";
// const { JsonRpcProvider } = ethers.providers;
import {JsonRpcProvider, Wallet, Contract } from "ethers";


const MyNFT_contractAddress = "0x8236B857d732582D1f563f143B0BF3479F6d961e";
const DestinationMinter_contractAddress = "0xB4655038272D0451200aa52729075F88316331Bf";
const SourceMinter_contractAddress = "0x8557892bC88E53fbfB273430D5cf3F44EBaD65eB";

const privateKey = process.env.REACT_APP_PRIVATE_KEY_1;
const AlchemyProjectId = process.env.ALCHEMY_PROJECT_ID;

// Network switching functions
export async function switchNetworkToAmoy() {
    await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x13882" }]
    });
}

export async function switchNetworkToFuji() {
    await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0xa869" }]
    });
}


export async function getProviderFromAlchemy() {
  const provider = new ethers.providers.JsonRpcProvider(`https://polygon-amoy.g.alchemy.com/v2/${AlchemyProjectId}`);
  const signer = new Wallet(privateKey, provider);
  const contract = new Contract(MyNFT_contractAddress, SourceMinterABI, signer);
  return contract;
}

export async function getProviderForCommodities() {
 const provider = new ethers.providers.JsonRpcProvider(`https://polygon-amoy.g.alchemy.com/v2/${AlchemyProjectId}`);
  const signer = new Wallet(privateKey, provider);
  const contract = new Contract(SourceMinter_contractAddress, MyNFTABI, signer);
  return contract;
}

export async function getProviderForSender() {
 const provider = new ethers.providers.JsonRpcProvider(`https://polygon-amoy.g.alchemy.com/v2/${AlchemyProjectId}`);
  const signer = new Wallet(privateKey, provider);
  const contract = new Contract(MyNFT_contractAddress, DestinationMinterABI, signer);
  return contract;
}

export async function getMyNFTContract(providerOrSigner) {
  const modal = new web3Modal();
  const connection = await modal.connect();
  const provider = new ethers.providers.Web3Provider(connection);

  let contract;
  if (providerOrSigner === true) {
    const signer = provider.getSigner();
    contract = new ethers.Contract(MyNFT_contractAddress, MyNFTABI, signer);
  } else {
    contract = new ethers.Contract(MyNFT_contractAddress, MyNFTABI, provider);
  }

  return contract;
}

export async function getSourceMinterContract(providerOrSigner) {
  const modal = new web3Modal();
  const connection = await modal.connect();
  const provider = new ethers.providers.Web3Provider(connection);

  let contract;
  if (providerOrSigner === true) {
    const signer = provider.getSigner();
    contract = new ethers.Contract(SourceMinter_contractAddress, SourceMinterABI, signer);
  } else {
    contract = new ethers.Contract(SourceMinter_contractAddress, SourceMinterABI, provider);
  }

  return contract;
}


// Get user address
export async function getUserAddress() {
  const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
  console.log(accounts[0]);
  return accounts[0];
}

export async function transerOwnership(DestinationMinter_contractAddress) {
  try {
    const contract = await getMyNFTContract(true);
    const tx = await contract.transferOwnership(DestinationMinter_contractAddress, {
      gasLimit: ethers.utils.hexlify(500000), // Adjust the gas limit as needed
    });
    await tx.wait();
    console.log(tx);
  } catch (error) {
    console.error("Error in transferOwnership:", error);
  }
}

// const destinationChainSelector = "14767482510784806043";
// const receiver = "0xB4655038272D0451200aa52729075F88316331Bf";
// const payFeesIn = 0;
// export async function mint(destinationChainSelector, receiver, payFeesIn) {
//   const contract = await getSourceMinterContract(true);
//   const tx = await contract.mint(destinationChainSelector, receiver, payFeesIn);
//   await tx.wait();
//   console.log(tx);
// }




/**
 * Function to mint an NFT cross-chain using the SourceMinter contract
 * @param {number} destinationChainSelector - The selector (chain ID) of the destination chain.
 * @param {string} receiver - The address of the receiver on the destination chain.
 * @param {number} payFeesIn - 0 for Native currency, 1 for LINK.
 * @returns {Promise<object>} The transaction object.
 */
export async function mintNFTCrossChain() {
  try {
    // Get the SourceMinter contract instance
    const contract = await getSourceMinterContract(true);

    // Estimate the gas required for the transaction
    // const gasEstimate = await contract.estimateGas.mint("14767482510784806043", DestinationMinter_contractAddress, 0);

    // Call the mint function on the contract
    const tx = await contract.mint("16281711391670634445", DestinationMinter_contractAddress, 0)
      // gasLimit: gasEstimate.add(10000)  // Add a buffer to the estimated gas limit
    // });

    // Wait for the transaction to be mined
    const receipt = await tx.wait();
    console.log('Cross-chain NFT minting transaction successful:', receipt);

    // Log the transaction hash
    console.log('Transaction Hash:', tx.hash);
    // const notify = () => toast("tx hash",tx.hash);
    // notify();
    alert(tx.hash);

    // Optionally, add a delay to ensure the transaction is processed by CCIP
    // await new Promise(resolve => setTimeout(resolve, 60000)); // 1 minute delay

    // Check the transaction status on the network
    const txStatus = await contract.provider.getTransactionReceipt(tx.hash);
    console.log('Transaction Receipt:', txStatus);

    // Return the transaction receipt for further handling
    return receipt;
  } catch (error) {
    console.error('Error during cross-chain NFT minting:', error);
    throw error;
  }
}







