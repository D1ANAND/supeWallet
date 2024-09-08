import React from "react";
// import mwallet from "../mwallet.png";
import { Button } from "antd";
import { useNavigate } from "react-router-dom";
import cryptoVideo from "../crypto1.mp4"; 
import supewalletImage from "./supewallet34.png";
function Home() {
  const navigate = useNavigate();

  return (
    <>
      <div className="content ">
      <img src={supewalletImage} alt="bg-image" />
        <div className="">
          <video className="w-[50rem]" autoPlay loop muted playsInline>
            <source src={cryptoVideo} type="video/mp4" />
          </video>
        </div>
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
      </div>
     
    </>
  );
}

export default Home;
