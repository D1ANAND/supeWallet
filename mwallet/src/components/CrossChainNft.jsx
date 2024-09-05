import React from 'react'
import {mintNFTCrossChain} from "../utils1";

const CrossChainNft = () => {
const[intent, setIntent] = useState("");
const[isloading, setLoading] = useState(false);

const handleClick = async() => {
  if(intent === "Mint"){
    setLoading(true);
    const mint = await mintNFTCrossChain();
    console.log("NFT minted",mint);
    setLoading(false);
  }
  else {
    alert("please enter the correct prompt");
  }

}

  return (
    <div>
          <Input
              value={amount}
              onChange={(e) => setIntent(e.target.value)}
              placeholder="enter the prompt"
            />
            {isloading ? (
                          <button onClick={handleClick}>
                         ....
                        </button>
            ) : (
              <button onClick={handleClick}>
              Enter the prompt to mint the NFT
            </button>
            )}
      


    </div>
  )
}

export default CrossChainNft