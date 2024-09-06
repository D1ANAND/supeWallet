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
import { JsonRpcProvider } from '@ethersproject/providers';
import { parseUnits, isAddress } from 'ethers/lib/utils';

import {
  mintPKPUsingEthWallet,
  pkpSignTx,
} from "../utils";

// import {handleFund, handleButtonClick,Fundpkp} from "./Fundpkp"

import Fundpkp from './Fundpkp';
// import { main } from "../galadriel-contracts/examples/sendcryptointentAgent/sendintent";
import {main} from "../sendintent";


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

  const handleChange = (e) => { 
    setValue(e.target.value);
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
      } else {
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



