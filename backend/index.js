const express = require("express");
const Moralis = require("moralis").default;
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = 3001;

app.use(cors({
  origin: 'https://supe-wallet.vercel.app', // Allow only your frontend
  methods: ['GET', 'POST'], // Specify allowed methods
  credentials: true,
  optionsSuccessStatus: 200 // Handle preflight requests with status 200
}));

app.use(express.json());

app.get("/getTokens", async (req, res) => {

  const { userAddress, chain } = req.query;

  try {
    const tokens = await Moralis.EvmApi.token.getWalletTokenBalances({
      chain: chain,
      address: userAddress,
    });

    const nfts = await Moralis.EvmApi.nft.getWalletNFTs({
      chain: chain,
      address: userAddress,
      mediaItems: true,
    });

    const myNfts = nfts.raw.result.map((e) => {
      if (e?.media?.media_collection?.high?.url && !e.possible_spam && (e?.media?.category !== "video")) {
        return e["media"]["media_collection"]["high"]["url"];
      }
    });

    const balance = await Moralis.EvmApi.balance.getNativeBalance({
      chain: chain,
      address: userAddress
    });

    const jsonResponse = {
      tokens: tokens.raw,
      nfts: myNfts,
      balance: balance.raw.balance / (10 ** 18)
    };

    return res.status(200).json(jsonResponse);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

Moralis.start({
  apiKey: process.env.MORALIS_KEY,
}).then(() => {
  app.listen(port, () => {
    console.log(`Listening for API Calls on port ${port}`);
  });
});
