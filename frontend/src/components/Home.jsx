import React from "react";
// import logo from "./logo.jpg";
import { Button } from "antd";
import { useNavigate } from "react-router-dom";
import cryptoVideo from "../crypto6.mp4"; 
import supewalletImage from "./bg.jpg";
function Home() {
  const navigate = useNavigate();

  return (
    <>
      <div className="content ">
      <img src={supewalletImage} alt="bg-image" className="-z-50" />
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
