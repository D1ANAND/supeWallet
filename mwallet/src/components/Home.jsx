import React from "react";
// import mwallet from "../mwallet.png";
import { Button } from "antd";
import { useNavigate } from "react-router-dom";
import { transerOwnership ,mintNFTCrossChain} from "../utils1";

function Home() {
  const navigate = useNavigate();

  const handleOwnership = async () => {
    try {
      const address = "0xB4655038272D0451200aa52729075F88316331Bf";
      const transfer = await transerOwnership(address);
      console.log('Ownership transfer result:', transfer);
    } catch (error) {
      console.error("Error during ownership transfer:", error);
    }
  };
  const handleMint = async () => {
    try {
        // const destination = "14767482510784806043";
        // const receiver = "0xB4655038272D0451200aa52729075F88316331Bf";
        // const pay = 0;
        const mintResult = await mintNFTCrossChain(/*destination, receiver, pay*/); // The result of mint function
        console.log(mintResult);
    } catch (error) {
        console.error("Error during minting:", error); // Updated error message to be more specific
    }
};
  

  return (
    <>
      <div className="content">
        <h1>supeWallet</h1>
        <h2> Welcome </h2>
        <h4 className="h4">to your Web3 Wallet</h4>
        <Button
          onClick={() => navigate("/yourwallet")}
          className="frontPageButton"
          type="primary"
        >
          Create A Wallet
        </Button>
        <Button
          onClick={() => navigate("/recover")}
          className="frontPageButton"
          type="default"
        >
          Sign In With Seed Phrase
        </Button>
        {/* <button onClick={handleOwnership}>transfer</button>
        <button onClick={handleMint} className="ml-12">mint</button> */}
      </div>
     
    </>
  );
}

export default Home;
