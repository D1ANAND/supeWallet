import "./App.css";
import { useState } from "react";
import logo from "./moralisLogo.svg";
import { Select } from "antd";
import { Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import CreateAccount from "./components/CreateAccount";
import RecoverAccount from "./components/RecoverAccount";
import WalletView from "./components/WalletView";

import {
  mintPKPUsingEthWallet,
  transferPKPToItself,
  fundPKP,
  addAnotherAuthToPKP,
  RemoveInitialAuthMethod,
  seeAuthMethods,
  pkpSignTx,
} from "./utils";

function App() {
  const [wallet, setWallet] = useState(null);
  const [seedPhrase, setSeedPhrase] = useState(null);
  const [selectedChain, setSelectedChain] = useState("0x13882");
  const [ethAddress, setEthAddress] = useState("");
  // var num = prompt("number? ");

  
  let s1 = "send" || "dxsl";
  let amt = 5;
  let xyz = "0xe8FA5C28CA55B1DFBb6BCDBAcE5A6F22F487d662";

  // const verify = async(s1,amt,xyz) => {
  //     if(s1 === "send" || s1 === "transfer"){

  //     }
  // }

    async function mintPKPCall() {
            if(s1 === "send" || s1 === "transfer"){
              const pkp = await mintPKPUsingEthWallet();
              setEthAddress(pkp?.ethAddress);
      }
      else {
        console.log("please enter the correct prompt");
      }

  }



  return (
    <div className="App">
      <header>
        {/* <div>
        <h2>LIT DEMO</h2>

<p>pkp eth address, {ethAddress}</p>

<button onClick={mintPKPCall}>Mint PKP With First Auth</button>

<button onClick={transferPKPToItself}>
    Transfer PKP To Itself
</button>

<button onClick={fundPKP}>Fund PKP</button>

<button onClick={addAnotherAuthToPKP}>Add Another Auth</button>

<button onClick={RemoveInitialAuthMethod}>
    Remove Initial Auth
</button>

<button onClick={seeAuthMethods}>See Permitted Method</button>

<button onClick={pkpSignTx}>PKP Sign</button>
        </div> */}
        <img src={logo} className="headerLogo" alt="logo" />
        <Select
          onChange={(val) => setSelectedChain(val)}
          value={selectedChain}
          options={[
            {
              label: "Ethereum",
              value: "0x1",
            },
            {
              label: "Mumbai Testnet",
              value: "0x13881",
            },
            {
              label: "Amoy",
              value: "0x13882",
            },
            {
              label: "Avalanche",
              value: "0xa86a",
            },
          ]}
          className="dropdown"
        ></Select>
      </header>
      {wallet && seedPhrase ? (
        <Routes>
          <Route
            path="/yourwallet"
            element={
              <WalletView
                wallet={wallet}
                setWallet={setWallet}
                seedPhrase={seedPhrase}
                setSeedPhrase={setSeedPhrase}
                selectedChain={selectedChain}
              />
            }
          />
        </Routes>
      ) : (
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/recover"
            element={
              <RecoverAccount
                setSeedPhrase={setSeedPhrase}
                setWallet={setWallet}
              />
            }
          />
          <Route
            path="/yourwallet"
            element={
              <CreateAccount
                setSeedPhrase={setSeedPhrase}
                setWallet={setWallet}
              />
            }
          />
        </Routes>
      )}
    </div>
  );
}

export default App;
