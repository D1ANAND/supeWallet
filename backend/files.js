// server.js (using CommonJS)
const express = require('express');
const multer = require('multer');
const fs = require('fs');
const dotenv = require('dotenv');
const pinataSDK = require('@pinata/sdk');
const cors = require('cors');


dotenv.config();

// Initialize Pinata client
const pinata = new pinataSDK(process.env.PINATA_API_KEY, process.env.PINATA_API_SECRET);

const app = express();
const upload = multer({ dest: 'uploads/' });
app.use(cors()); // Allows all origins - you can also configure it to allow specific origins

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API endpoint to handle file upload and NFT minting
app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const filePath = req.file.path;
    const fileStream = fs.createReadStream(filePath);

    // Provide metadata required by Pinata
    const options = {
      pinataMetadata: {
        name: req.file.originalname,
      },
      pinataOptions: {
        cidVersion: 0,
      },
    };

    // Upload file to Pinata with metadata
    const pinataResult = await pinata.pinFileToIPFS(fileStream, options);
    console.log(`File uploaded to Pinata with CID: ${pinataResult.IpfsHash}`);

    // Remove the temporary file
    fs.unlinkSync(filePath);

    // Create metadata for the NFT
    const metadata = JSON.stringify({ cid: pinataResult.IpfsHash });

    // Mint the NFT on Hedera
    // const tokenId = await mintNftWithMetadata(metadata);
    // console.log`(NFT created with Token ID: ${tokenId}`);

    // res.json({ tokenId });

  } catch (error) {
    console.error('Error processing upload:', error);
  }
});

// Start the server
const PORT = process.env.PORT || 6000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
