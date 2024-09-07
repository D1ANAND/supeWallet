require('dotenv').config();
const express = require('express');
const multer = require('multer');
const streamifier = require('streamifier');
const pinataSDK = require('@pinata/sdk');
const cors = require('cors');
const { 
  Client, 
  PrivateKey, 
  TokenCreateTransaction, 
  TokenType, 
  TokenSupplyType, 
  TokenMintTransaction, 
  TransferTransaction, 
  AccountId, 
  TokenId, 
  TokenAssociateTransaction 
} = require("@hashgraph/sdk");

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Hedera client
const client = Client.forTestnet();
client.setOperator(process.env.MY_ACCOUNT_ID, process.env.MY_PRIVATE_KEY);
console.log("client" ,client);

// Initialize Pinata client
const pinata = new pinataSDK(process.env.PINATA_API_KEY, process.env.PINATA_API_SECRET);
console.log("pinata",pinata);

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
console.log("upload",upload);

// Mint NFT with metadata
async function mintNftWithMetadata(metadata) {
  const treasuryAccountId = AccountId.fromString(process.env.MY_ACCOUNT_ID);
  const treasuryPrivateKey = PrivateKey.fromStringECDSA(process.env.MY_PRIVATE_KEY);

  let tokenId;

  // Step 1: Create the NFT
  try {
    const createNftTx = new TokenCreateTransaction()
      .setTokenName("MINTED1")
      .setTokenSymbol("TNFT1")
      .setTokenType(TokenType.NonFungibleUnique)
      .setSupplyType(TokenSupplyType.Finite)
      .setMaxSupply(1)
      .setTreasuryAccountId(treasuryAccountId)
      .setAdminKey(treasuryPrivateKey.publicKey)
      .setSupplyKey(treasuryPrivateKey.publicKey)
      .freezeWith(client);
    const signedCreateNftTx = await createNftTx.sign(treasuryPrivateKey);
    const createNftResponse = await signedCreateNftTx.execute(client);
    const createNftReceipt = await createNftResponse.getReceipt(client);
    tokenId = createNftReceipt.tokenId;
    console.log(`Created NFT with Token ID: ${tokenId}`);
  } catch (err) {
    console.error('Error creating NFT on Hedera:', err);
    throw new Error('NFT creation failed');
  }

  // Step 2: Mint the NFT with metadata
  try {
    const mintTx = new TokenMintTransaction()
      .setTokenId(tokenId)
      .setMetadata([Buffer.from(metadata)])
      .freezeWith(client);

    const signedMintTx = await mintTx.sign(treasuryPrivateKey);
    const mintResponse = await signedMintTx.execute(client);
    const mintReceipt = await mintResponse.getReceipt(client);

    console.log(`Mint status: ${mintReceipt.status}`);
  } catch (err) {
    console.error('Error minting NFT:', err);
    throw new Error('Minting failed');
  }

  return tokenId.toString();
}

// Associate Token with Account
async function associateTokenWithAccount(tokenId) {
  const receiverAccountId = AccountId.fromString(process.env.RECEIVER_ACCOUNT_ID);
  const receiverPrivateKey = PrivateKey.fromStringECDSA(process.env.RECEIVER_PRIVATE_KEY);

  const receiverClient = Client.forTestnet();
  receiverClient.setOperator(receiverAccountId, receiverPrivateKey);

  try {
    const associateTx = new TokenAssociateTransaction()
      .setAccountId(receiverAccountId)
      .setTokenIds([TokenId.fromString(tokenId)])
      .freezeWith(receiverClient);

    const signedAssociateTx = await associateTx.sign(receiverPrivateKey);
    const associateResponse = await signedAssociateTx.execute(receiverClient);
    const receipt = await associateResponse.getReceipt(receiverClient);

    console.log(`Association status: ${receipt.status}`);
  } catch (err) {
    console.error('Error associating token:', err);
    throw new Error('Token association failed');
  }
}

// Transfer NFT
// Transfer NFT function on the backend
async function transferNft(tokenId, serialNumber) {
  const senderAccountId = AccountId.fromString(process.env.MY_ACCOUNT_ID);
  const senderPrivateKey = PrivateKey.fromStringECDSA(process.env.MY_PRIVATE_KEY);
  const receiverAccountId = AccountId.fromString(process.env.RECEIVER_ACCOUNT_ID);

  console.log(`Attempting to transfer token ${tokenId} with serial number ${serialNumber}`);
  
  try {
    await associateTokenWithAccount(tokenId);  // Check if token is associated with the receiver

    const client = Client.forTestnet();
    client.setOperator(senderAccountId, senderPrivateKey);

    const transferTx = new TransferTransaction()
      .addNftTransfer(tokenId, serialNumber, senderAccountId, receiverAccountId)
      .freezeWith(client);

    console.log('Transaction constructed. Signing transaction...');

    const signedTransferTx = await transferTx.sign(senderPrivateKey);
    const transferResponse = await signedTransferTx.execute(client);
    const receipt = await transferResponse.getReceipt(client);

    console.log(`Transfer status: ${receipt.status}`);  // Log the status of the transfer

    return receipt;
  } catch (err) {
    console.error('Error during NFT transfer:', err);  // Log the error
    throw new Error(`Transfer failed: ${err.message}`);
  }
}



// API endpoint for file upload and NFT minting
app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const fileStream = streamifier.createReadStream(req.file.buffer);

    const options = {
      pinataMetadata: { name: req.file.originalname },
      pinataOptions: { cidVersion: 0 }
    };

    const pinataResult = await pinata.pinFileToIPFS(fileStream, options);
    console.log("Pinata Result:", pinataResult);  // Add this to see the response
    
    const metadata = JSON.stringify({ cid: pinataResult.IpfsHash });

    const tokenId = await mintNftWithMetadata(metadata);
    res.json({ tokenId });
  } catch (error) {
    console.error('Error processing upload:', error);
    res.status(500).json({ error: 'Failed to upload and mint NFT' });
  }
});

// API endpoint for NFT transfer
app.post('/transfer', async (req, res) => {
  const { tokenId, serialNumber } = req.body;

  try {
    if (!tokenId || !serialNumber) {
      throw new Error('Missing required parameters');  // Ensure parameters exist
    }

    await transferNft(TokenId.fromString(tokenId), parseInt(serialNumber));
    res.json({ message: 'NFT transferred successfully.' });
  } catch (error) {
    console.error('Error transferring NFT:', error);  // Log error details
    res.status(500).json({ error: error.message });   // Send error details in response
  }
});


// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
