import React, { useEffect, useState } from "react";
import {
  Divider,
  Tooltip,
  List,
  Avatar,
  Spin,
  Tabs,
  Input,
  Button,
} from "antd";
import { LogoutOutlined } from "@ant-design/icons";
import { useNavigate, Routes, Route } from "react-router-dom";
import logo from "../noImg.png";
import axios from "axios";
import { CHAINS_CONFIG } from "../chains";
import { ethers } from "ethers";

import {
  mintPKPUsingEthWallet,
  pkpSignTx,
} from "../utils";
import Fundpkp from './Fundpkp';
import FileUpload from './FileUpload';
// import { main } from "../galadriel-contracts/examples/sendcryptointentAgent/sendintent";
import {mintNFTCrossChain} from "../utils1";
import {main} from "../galadriel-functions/sendintent";
import * as LitJsSdk from "@lit-protocol/lit-node-client";
import { LitNodeClient } from "@lit-protocol/lit-node-client";
import { AuthMethodScope, LitNetwork } from "@lit-protocol/constants";
import {uploadFile , transferNft} from "../services/api";

function WalletView({
  wallet,
  setWallet,
  seedPhrase,
  setSeedPhrase,
  selectedChain,
}) {

  const navigate = useNavigate();
  const [tokens, setTokens] = useState(null);
  const [nfts, setNfts] = useState(null);
  const [balance, setBalance] = useState(0);
  const [fetching, setFetching] = useState(true);
  const [amount, setamount] = useState(null);
  const [address, setaddress] = useState(null);
  const [amountToSend, setAmountToSend] = useState(null);
  const [sendToAddress, setSendToAddress] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [hash, setHash] = useState(null);
  const [value, setValue] = useState(null);
  const [ethAddress, setEthAddress] = useState("");
  const [showFundpkp, setShowFundpkp] = useState(false);
  const [fundpkpComplete, setFundpkpComplete] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [fileUrl, setFileUrl] = useState(null);
  const [tokenId, setTokenId] = useState(null);

  // Add these state variables to your existing useState hooks
const [file, setFile] = useState(null);
const [cid, setCid] = useState('');
const [encrypted, setEncrypted] = useState(false);
const [decryptCid, setDecryptCid] = useState(null);


  const handleChange = (e) => { 
    setValue(e.target.value);
  };

   const handleFileChange = (e) => {
    setFile(e.target.files[0]); // Get the first selected file
  };
  
  const doSomething = async () => {
    try {
      const intent1 = value;  // Use the input value entered by the user
      if (!intent1) {
        console.log("Please enter a prompt");
        return;
      }
  
      // Call the main function with the user's prompt
      const response = await main(intent1);  // Assuming main is imported correctly
      console.log("Main Function Response (String):", response);
  
      // Convert the response string to a JSON object
      let parsedResponse;
      try {
        parsedResponse = JSON.parse(response);
      } catch (parseError) {
        console.error("Failed to parse response as JSON:", parseError);
        return;
      }
  
      console.log('Parsed Response (Object):', parsedResponse);
      console.log('Response Structure:', JSON.stringify(parsedResponse, null, 2));
  
      // Destructure the parsed response to get intent and entities
      const { intent, entities } = parsedResponse;
  
      console.log('Extracted Intent:', intent);
      console.log('Extracted Entities:', entities);
  
      // Check if intent and entities are valid
      if (!intent || !entities) {
        console.log("Invalid intent or entities in response");
        return;
      }
  
      // Extract the address, amount, and currency from the entities object
      const { address, amount, currency } = entities;
  
      console.log("Address:", address);
      console.log("Amount:", amount);
      console.log("Currency:", currency);
  
      // Perform the action based on the extracted intent
      if (intent === "send_crypto" || intent === "send") {
        // Use the extracted address and amount
        // const recipientAddress = "0x49C2E4DB36D3AC470ad072ddC17774257a043097";
        // const transactionAmount = amount;
  
        // Handle the transaction (with optional currency handling)
        await sendTransaction(address, amount);
      } 
      else if (intent === "MintNFT" || intent === "mintNFT" || intent === "mint_nft" || intent === "mint_NFT") {
          await mintNFTCrossChain();
      }
      // else if (intent === "encrypt" || intent === "encrypt_file" || intent === "encryptFile" || "EncryptFile"){
      //   if (!file) {
      //     alert("Please select a file to encrypt.");
      //     return;
      //   }
      //   await handleEncrypt(file);
      // }
      else if(intent === "tokenizeRWA" || intent === 'tokenize' ||  intent === "tokenize_real_world_assets" || intent === "Tokenize") {
            await uploadFile(file);
      }
      else if (intent === "transferRWA" || intent === "transfer" || intent === "tokenize_rwa" || intent === "tokenizeRealWorldAssets") {
        console.log("transfering rwa")
        await transferNft(address, "1");
        console.log("transferd rwa")
      }
      else {
        console.log("No valid action extracted from the prompt.");
      }
  
    } catch (error) {
      console.error("Error during processing:", error);
    }
  };
  

  // Function to extract intent and entities like address and amount from the response
  // const extractEntities = (response) => {
  //   // Assuming the response is in JSON format and contains intent, address, and amount
  //   const intentType = response.intent ;
  //   console.log(intentType);
  //   const address = response.address;
  //   console.log(address);
  //   const amount = response.amount ;
  //   console.log(amount);
  //   return { intentType, address, amount };
  // };
  

  
  // Callback function for Fundpkp completion
  const handleFundpkpComplete = async () => {
    setFundpkpComplete(true);
    await pkpSignTx();  
  };


  //for encryption and upload to ipfs 

  
//  const handleEncrypt = async (fileToEncrypt) => {
//   try {
//     setProcessing(true);

//     // Connect to Lit Protocol
//     const client = new LitNodeClient({
//       litNetwork: 'cayenne',
//       debug: false
//     });
//     await client.connect();
//     console.log('Connected to Lit Network', client);

//     // Authenticate with Lit Protocol
//     const authSig = await LitJsSdk.checkAndSignAuthMessage({ chain: 'ethereum' });
//     console.log('Auth Signature:', authSig);

//     // Define Access Control Conditions (Customize as needed)
//     const accs = [
//       {
//         contractAddress: '',
//         standardContractType: '',
//         chain: 'ethereum',
//         method: 'eth_getBalance',
//         parameters: [':userAddress', 'latest'],
//         returnValueTest: {
//           comparator: '>=',
//           value: '0',
//         },
//       },
//     ];

//     // Encrypt the file
//     const encryptedZip = await LitJsSdk.encryptFileAndZipWithMetadata({
//       accessControlConditions: accs,
//       authSig,
//       chain: 'ethereum',
//       file: fileToEncrypt,
//       litNodeClient: client,
//       readme: "Use IPFS CID of this file to decrypt it"
//     });

//     const encryptedBlob = new Blob([encryptedZip], { type: 'application/zip' });
//     const encryptedFile = new File([encryptedBlob], `${fileToEncrypt.name}.encrypted.zip`);
//     console.log("Encrypted file:", encryptedFile);

//     // Upload to IPFS via Pinata
//     const formData = new FormData();
//     formData.append('file', encryptedFile);

//     const metadata = JSON.stringify({
//       name: encryptedFile.name,
//     });
//     formData.append('pinataMetadata', metadata);

//     const res = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
//       maxBodyLength: 'Infinity',
//       headers: {
//         'Content-Type': 'multipart/form-data',
//         pinata_api_key: process.env.REACT_APP_PINATA_API_KEY,
//         pinata_secret_api_key: process.env.REACT_APP_PINATA_SECRET_API_KEY,
//       },
//     });

//     const ipfsHash = res.data.IpfsHash;
//     const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
//     setCid(ipfsHash);
//     setFileUrl(ipfsUrl);
//     setEncrypted(true);
//     console.log('Encrypted File uploaded to IPFS via Pinata:', ipfsUrl);

//     setProcessing(false);
//     alert(`File encrypted and uploaded successfully! CID: ${ipfsHash}`);

//   } catch (error) {
//     console.error('Error during encryption and upload:', error);
//     setProcessing(false);
//     alert("Error during encryption and upload: " + error.message);
//   }
// };


// const handleDecrypt = async (cidToDecrypt) => {
//   try {
//     setProcessing(true);

//     // Connect to Lit Protocol
//     const client = new LitJsSdk.LitNodeClient({
//       litNetwork: 'cayenne',
//       debug: false
//     });
//     await client.connect();
//     console.log('Connected to Lit Network', client);

//     // Authenticate with Lit Protocol
//     const authSig = await LitJsSdk.checkAndSignAuthMessage({ chain: 'ethereum' });
//     console.log('Auth Signature:', authSig);

//     // Fetch the encrypted file from IPFS
//     const response = await fetch(`https://gateway.pinata.cloud/ipfs/${cidToDecrypt}`);
//     if (!response.ok) {
//       throw new Error('Failed to fetch file from IPFS');
//     }
//     const encryptedBlob = await response.blob();
//     const encryptedFile = new File([encryptedBlob], `decrypted.zip`);

//     // Define Access Control Conditions (Must match encryption conditions)
//     const accs = [
//       {
//         contractAddress: '',
//         standardContractType: '',
//         chain: 'ethereum',
//         method: 'eth_getBalance',
//         parameters: [':userAddress', 'latest'],
//         returnValueTest: {
//           comparator: '>=',
//           value: '0',
//         },
//       },
//     ];

//     // Decrypt the file
//     const { decryptedFile, metadata } = await LitJsSdk.decryptZipFileWithMetadata({
//       accessControlConditions: accs,
//       chain: 'ethereum',
//       file: encryptedFile,
//       litNodeClient: client,
//       decryptCid: cidToDecrypt,
//       authSig
//     });

//     // Create a download link for the decrypted file
//     const blob = new Blob([decryptedFile], { type: 'application/octet-stream' });
//     const downloadLink = document.createElement('a');
//     downloadLink.href = URL.createObjectURL(blob);
//     downloadLink.download = metadata.name;
//     downloadLink.click();

//     setProcessing(false);
//     alert('File decrypted successfully!');

//   } catch (error) {
//     console.error('Error during decryption:', error);
//     setProcessing(false);
//     alert("Error during decryption: " + error.message);
//   }
// };


//tokenizatation part
// async function uploadToIpfsAndMintNft(file) {
//   try {
//     const formData = new FormData();
//     formData.append('file', file); // Use the correct file object

//     const metadata = JSON.stringify({
//       name: file.name || 'Unnamed File',
//     });
//     formData.append('pinataMetadata', metadata);

//     const res = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
//       maxBodyLength: 'Infinity',
//       headers: {
//         'Content-Type': 'multipart/form-data',
//         pinata_api_key: process.env.REACT_APP_PINATA_API_KEY,
//         pinata_secret_api_key: process.env.REACT_APP_PINATA_SECRET_API_KEY,
//       },
//     });

//     const ipfsHash = res.data.IpfsHash;
//     console.log(`IPFS Hash: ${ipfsHash}`);

//     // Mint the NFT using the IPFS hash as metadata
//     await mintNftWithMetadata(ipfsHash);
//   } catch (err) {
//     console.error("Error uploading to IPFS and minting NFT:", err);
//     throw err;
//   }
// }


  const items = [
    {
      key: "3",
      label: `Tokens`,
      children: (
        <>
          {tokens ? (
            <>
              <List
                bordered
                itemLayout="horizontal"
                dataSource={tokens}
                renderItem={(item, index) => (
                  <List.Item key={`${index}-${item.symbol}`} style={{ textAlign: "left" }}>
                    <List.Item.Meta
                      avatar={<Avatar src={item.logo || logo} />}
                      title={item.symbol}
                      description={item.name}
                    />
                    <div>
                      {(
                        Number(item.balance) /
                        10 ** Number(item.decimals)
                      ).toFixed(2)}{" "}
                      Tokens
                    </div>
                  </List.Item>
                )}
              />
            </>
          ) : (
            <>
              <span>You seem to not have any tokens yet</span>
              <p className="frontPageBottom">
                Find Alt Coin Gems:{" "}
                <a
                  href="https://moralismoney.com/"
                  target="_blank"
                  rel="noreferrer"
                >
                  money.moralis.io
                </a>
              </p>
            </>
          )}
        </>
      ),
    },
    {
      key: "2",
      label: `NFTs`,
      children: (
        <>
          {nfts ? (
            <>
              {nfts.map((e, i) => (
                e && (
                  <img
                    key={i}
                    className="nftImage"
                    alt="nftImage"
                    src={e}
                  />
                )
              ))}
            </>
          ) : (
            <>
              <span>You seem to not have any NFTs yet</span>
              <p className="frontPageBottom">
                Find Alt Coin Gems:{" "}
                <a
                  href="https://moralismoney.com/"
                  target="_blank"
                  rel="noreferrer"
                >
                  money.moralis.io
                </a>
              </p>
            </>
          )}
        </>
      ),
    },
    {
      key: "1",
      label: `Transfer`,
      children: (
        <>
          <h3>Native Balance </h3>
          <h1>
            {balance.toFixed(4)} {CHAINS_CONFIG[selectedChain].ticker}
          </h1>

          <div>
          <Input
        placeholder="Enter the prompt"
        onChange={handleChange}
      />
      <input
        type="file"
        onChange={handleFileChange}
        style={{ marginLeft: '10px' }} // To add some space between the input fields
      />
      {file && <p>Selected File: {file.name}</p>}



      {encrypted && (
  <div>
    <h4>Decrypt File</h4>
    <Input
      placeholder="Enter CID to decrypt"
      value={decryptCid}
      onChange={(e) => setDecryptCid(e.target.value)}
    />
    {/* <Button onClick={() => handleDecrypt(decryptCid)} disabled={!decryptCid}>
      Decrypt
    </Button> */}
    {fileUrl && (
      <div>
        <h4>Encrypted File URL:</h4>
        <a href={fileUrl} target="_blank" rel="noopener noreferrer">
          {fileUrl}
        </a>
      </div>
    )}
  </div>
)}


{/* for decryption */}
{encrypted && (
  <div>
    <h4>Decrypt File</h4>
    <Input
      placeholder="Enter CID to decrypt"
      value={decryptCid}
      onChange={(e) => setDecryptCid(e.target.value)}
    />
    {/* <Button onClick={() => handleDecrypt(decryptCid)} disabled={!decryptCid}>
      Decrypt
    </Button> */}
    {fileUrl && (
      <div>
        <h4>Encrypted File URL:</h4>
        <a href={fileUrl} target="_blank" rel="noopener noreferrer">
          {fileUrl}
        </a>
      </div>
    )}
  </div>
)}




      {/* {showFileUpload && <FileUpload />}  */}
          </div>
          {/* <div className="sendRow">
            <p style={{ width: "90px", textAlign: "left" }}> To:</p>
            <Input
              value={address}
              onChange={(e) => setaddress(e.target.value)}
              placeholder="0x..."
            />
          </div>
          <div className="sendRow">
            <p style={{ width: "90px", textAlign: "left" }}> Amount:</p>
             <Input
              value={amount}
              onChange={(e) => setamount(e.target.value)}
              placeholder="Native tokens you wish to send..."
            />
          </div>  */}
          <Button
            style={{ width: "100%", marginTop: "20px", marginBottom: "20px" }}
             type="primary"
            // onClick={() => sendTransaction(address, amount)}
            onClick={() => doSomething()}
          >
            Send The prompt
          </Button>
          {encrypted && (
  <div>
    <h4>Encrypted File CID:</h4>
    <p>{cid}</p>
    <a href={`https://gateway.pinata.cloud/ipfs/${cid}`} target="_blank" rel="noopener noreferrer">
      View Encrypted File
    </a>
  </div>
)}

          {processing && (
            <>
              <Spin />
              {hash && (
                <Tooltip title={hash}>
                  <p>Hover For Tx Hash</p>
                </Tooltip>
              )}
            </>
          )}
        </>
        
      ),
    },
  ];
  // async function sendTransaction(to, amount) {

  //   const chain = CHAINS_CONFIG[selectedChain];

  //  const provider = new ethers.providers.JsonRpcProvider(chain.rpcUrl);

  //   const privateKey = process.env.REACT_APP_PRIVATE_KEY_1;

  //   const wallet = new ethers.Wallet(privateKey, provider);

  //   const tx = {
  //     to: to,
  //     value: ethers.utils.parseEther(amount.toString()),
  //   };

  //   setProcessing(true);
  //   try{
  //     const transaction = await wallet.sendTransaction(tx);

  //     setHash(transaction.hash);
  //     const receipt = await transaction.wait();

  //     setHash(null);
  //     setProcessing(false);
  //     setAmountToSend(null);
  //     setSendToAddress(null);

  //     if (receipt.status === 1) {
  //       getAccountTokens();
  //     } else {
  //       console.log("failed");
  //     }


  //   }catch(err){
  //     setHash(null);
  //     setProcessing(false);
  //     setAmountToSend(null);
  //     setSendToAddress(null);
  //   }
  // }

  async function sendTransaction(to, amount) {
    if (!amount || !to) {
      alert('Please fill out all fields and connect your wallet.');
      return;
    }
  
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
  
      // Create transaction object
      const tx = {
        to: to, // Use the 'to' parameter passed into the function
        value: ethers.utils.parseEther(amount), // Convert amount to ethers
      };
  
      // Send transaction
      const transactionResponse = await signer.sendTransaction(tx);
      console.log('Transaction Response:', transactionResponse);
  
      // Wait for transaction confirmation
      await transactionResponse.wait();
      alert('Transaction successful!');
    } catch (error) {
      console.error('Transaction error:', error);
      alert('Transaction failed!');
    }
  }
  

  async function getAccountTokens() {
    setFetching(true);
    const res = await axios.get(`http://localhost:3001/getTokens`, {
      params: {
        userAddress: wallet,
        chain: selectedChain,
      },
    });

    const response = res.data;
    if (response.tokens.length > 0) {
      setTokens(response.tokens);
    }
    if (response.nfts.length > 0) {
      setNfts(response.nfts);
    }
    setBalance(response.balance);
    setFetching(false);
  }

  function logout() {
    setSeedPhrase(null);
    setWallet(null);
    setNfts(null);
    setTokens(null);
    setBalance(0);
    navigate("/");
  }

  useEffect(() => {
    if (!wallet || !selectedChain) return;
    setNfts(null);
    setTokens(null);
    setBalance(0);
    getAccountTokens();
  }, []);

  useEffect(() => {
    if (!wallet) return;
    setNfts(null);
    setTokens(null);
    setBalance(0);
    getAccountTokens();
  }, [selectedChain]);


  return (
    <>
      <div className="content">
        <div className="logoutButton" onClick={logout}>
          <LogoutOutlined />
        </div>
        <div className="walletName">Wallet</div>
        <Tooltip title={wallet}>
          <div>
            {wallet.slice(0, 4)}...{wallet.slice(38)}
          </div>
        </Tooltip>
        <Divider />
        {fetching ? (
          <Spin />
        ) : (
          <Tabs defaultActiveKey="1" items={items} className="walletView" />
        )}

          {showFundpkp && <Fundpkp onComplete={handleFundpkpComplete} />}
      </div>
      
    </>
  );
}

export default WalletView;
