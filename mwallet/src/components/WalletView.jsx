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

// import {Home} from "../pages/Encrypt";

// import {handleFund, handleButtonClick,Fundpkp} from "./Fundpkp"

import Fundpkp from './Fundpkp';
import Encrypt from "./Encrypt";


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
  const [processing, setProcessing] = useState(false);
  const [hash, setHash] = useState(null);
  const [value, setValue] = useState(null);
  const [ethAddress, setEthAddress] = useState("");
  const [showFundpkp, setShowFundpkp] = useState(false);
  const [fundpkpComplete, setFundpkpComplete] = useState(false);

  const handleChange = (e) => { 
    setValue(e.target.value);
  };
  
  console.log(value);
  
  const doSomething = async () => {
    try {
      // Make the API call to your backend to extract intent and entities
      const response = await axios.post('http://localhost:3000/api/extract_intent_entities', { prompt: value });
      const { intent, entities } = response.data;
  
      console.log('Extracted Intent:', intent);
      console.log('Extracted Entities:', entities);
  
      // Check if intent is 'send'
      if (intent === "send") {
        await sendTransaction(entities.destination_address, entities.amount)
        try {
          const pkp = await mintPKPUsingEthWallet();  
          setEthAddress(pkp?.ethAddress);
          console.log("Minted PKP Eth Address:", pkp?.ethAddress);
  
          setShowFundpkp(true);
        } catch (error) {
          console.error("Error minting PKP:", error);
        }
      } else {
        console.log("Please enter the correct prompt");
      }
    } catch (error) {
      console.error("Error extracting intent:", error);
    }
  };
  
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
  async function sendTransaction(to, amount) {
    // Validate the input
    if (!ethers.utils.isAddress(to)) {
        console.error('Invalid recipient address:', to);
        return;
    }

    const chain = CHAINS_CONFIG[selectedChain];

    // Ensure RPC URL is set
    if (!chain.rpcUrl) {
        console.error('RPC URL is not set for the chain:', selectedChain);
        return;
    }

    const provider = new ethers.providers.JsonRpcProvider(chain.rpcUrl);

    // Resolve ENS name if on mainnet and the address ends with .eth
    if (selectedChain === 'mainnet' && to.endsWith('.eth')) {
        try {
            const resolvedAddress = await provider.resolveName(to);
            if (!resolvedAddress) {
                console.error('Unable to resolve ENS name:', to);
                return;
            }
            to = resolvedAddress;
        } catch (err) {
            console.error('Error resolving ENS name:', err);
            return;
        }
    }

    // Validate the amount
    if (isNaN(amount) || Number(amount) <= 0) {
        console.error('Invalid amount:', amount);
        return;
    }

    try {
        const privateKey = ethers.Wallet.fromMnemonic(seedPhrase).privateKey;
        const wallet = new ethers.Wallet(privateKey, provider);

        // Fetch fee data
        const feeData = await provider.getFeeData();
        const gasPrice = feeData.gasPrice || ethers.utils.parseUnits('10', 'gwei'); 

        // Estimate gas
        const estimatedGas = await provider.estimateGas({
            to: to,
            value: ethers.utils.parseUnits(amount.toString(), 'ether') 
        });

        const tx = {
            to: to,
            value: ethers.utils.parseUnits(amount.toString(), 'ether'),
            gasPrice: gasPrice,
            gasLimit: estimatedGas
        };

        setProcessing(true);
        console.log('Sending transaction:', tx);

        const transaction = await wallet.sendTransaction(tx);
        setHash(transaction.hash);
        console.log('Transaction sent, hash:', transaction.hash);

        const receipt = await transaction.wait();
        console.log('Transaction receipt:', receipt);

        setHash(null);
        setProcessing(false);
        setamount(null);
        setaddress(null);

        if (receipt.status === 1) {
            getAccountTokens();
        } else {
            console.error("Transaction failed:", receipt);
        }
    } catch (err) {
        console.error('Error sending transaction:', err);
        setHash(null);
        setProcessing(false);
        setamount(null);
        setaddress(null);
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

          <Encrypt />
      </div>
      
    </>
  );
}

export default WalletView;



