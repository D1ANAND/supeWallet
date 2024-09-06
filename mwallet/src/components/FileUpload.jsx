import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as LitJsSdk from "@lit-protocol/lit-node-client";
import { LitNodeClient } from "@lit-protocol/lit-node-client";
import { AuthMethodScope, LitNetwork } from "@lit-protocol/constants";

async function connectToLit() {
  try {
    const client = new LitNodeClient({
      litNetwork: 'cayenne',
      debug: false
    });

    await client.connect();
    console.log('Connected to Lit Network', client);
    return client;
  } catch (error) {
    console.error('Failed to connect to Lit Network:', error);
    throw error; 
  }
}

function FileUpload() {
  const [file, setFile] = useState(null);
  const [fileUrl, setFileUrl] = useState('');
  const [cid, setCid] = useState('');
  const [decryptCid, setDecryptCid] = useState(''); 
  const [litNodeClient, setLitNodeClient] = useState(null);  
  useEffect(() => {
    const initializeLitClient = async () => {
      try {
        const client = await connectToLit();
        setLitNodeClient(client);
      } catch (error) {
        console.error('Error initializing Lit Node Client:', error);
      }
    };

    initializeLitClient();
  }, []);

  const pinataApiKey = process.env.REACT_APP_PINATA_API_KEY;
  const pinataSecretApiKey = process.env.REACT_APP_PINATA_SECRET_API_KEY;

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      console.error('No file selected');
      return;
    }

    if (!litNodeClient) {
      console.error('Lit Node Client is not connected');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    const metadata = JSON.stringify({
      name: file.name,
    });

    formData.append('pinataMetadata', metadata);

    try {
      const authSig = await LitJsSdk.checkAndSignAuthMessage({
        chain: 'ethereum'
      });
      console.log(authSig);
   
      const accs = [
        {
          contractAddress: '',
          standardContractType: '',
          chain: 'ethereum',
          method: 'eth_getBalance',
          parameters: [':userAddress', 'latest'],
          returnValueTest: {
            comparator: '>=',
            value: '0',
          },
        },
      ];

      const encryptedZip = await LitJsSdk.encryptFileAndZipWithMetadata({
        accessControlConditions: accs,
        authSig,
        chain: 'ethereum',
        file: file,
        litNodeClient: litNodeClient,
        readme: "Use IPFS CID of this file to decrypt it"
      });

      const encryptedBlob = new Blob([encryptedZip], { type: 'application/zip' });
      const encryptedFile = new File([encryptedBlob], `${file.name}.encrypted.zip`);
      console.log("encrypted file", encryptedFile);

      formData.set('file', encryptedFile);

      const res = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
        maxBodyLength: 'Infinity',
        headers: {
          'Content-Type': 'multipart/form-data',
          pinata_api_key: pinataApiKey,
          pinata_secret_api_key: pinataSecretApiKey,
        },
      });

      const ipfsHash = res.data.IpfsHash;
      const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
      setFileUrl(ipfsUrl);
      setCid(ipfsHash);
      console.log('File uploaded to IPFS via Pinata:', ipfsUrl);
    } catch (error) {
      console.error('Error uploading file to Pinata:', error);
    }
  };

  const handleDecrypt = async () => {
    if (!litNodeClient) {
      console.error('Lit Node Client is not connected');
      return;
    }
  
    try {
      const response = await fetch(`https://gateway.pinata.cloud/ipfs/${decryptCid}`);
      if (!response.ok) {
        throw new Error('Failed to fetch file from IPFS');
      }
      const file = await response.blob();
  
      const litNodeClient = new LitJsSdk.LitNodeClient({
        litNetwork: 'cayenne',
      });
      // Then get the authSig
      await litNodeClient.connect();
      // Ensure authSig is correctly generated
      const authSig = await LitJsSdk.checkAndSignAuthMessage({
        chain: 'ethereum'
      });
  
      // Log authSig for debugging
      console.log('Auth Signature:', authSig);

         
      const accs = [
        {
          contractAddress: '',
          standardContractType: '',
          chain: 'ethereum',
          method: 'eth_getBalance',
          parameters: [':userAddress', 'latest'],
          returnValueTest: {
            comparator: '>=',
            value: '0',
          },
        },
      ];
  
      // Verify that authSig is valid
      if (!authSig || !authSig.signature || !authSig.publicKey) {
        throw new Error('Invalid authSig');
      }

      const signnature = await litNodeClient.signSessionKey();
  
      const { decryptedFile, metadata } = await LitJsSdk.decryptZipFileWithMetadata({
        // accessControlConditions: accs,
        chain: 'ethereum',
        file: file,
        litNodeClient: litNodeClient, 
        decryptCid,
        signnature
      });
  
      // Create a download link for the decrypted file
      const blob = new Blob([decryptedFile], { type: 'application/octet-stream' });
      const downloadLink = document.createElement('a');
      downloadLink.href = URL.createObjectURL(blob);
      downloadLink.download = metadata.name;
      downloadLink.click();
  
    } catch (error) {
      console.error('Error during decryption:', error);
      alert("Trouble decrypting file: " + error.message);
    }
  };
  
  

  return (
    <div className="mt-10">
      <h2>Encrypt file</h2>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>Encrypt</button>

      {fileUrl && (
        <div>
          <h4>CID:</h4>
          <p>{cid}</p>
        </div>
      )}

      <div>
        <h4>Decrypt File</h4>
        <input
          type="text"
          placeholder="Enter CID"
          value={decryptCid}
          onChange={(e) => setDecryptCid(e.target.value)}
        />
        <button onClick={handleDecrypt}>Decrypt</button>
        <h4>File URL:</h4>
          <a href={fileUrl} target="_blank" rel="noopener noreferrer">
            {fileUrl}
          </a>
      </div>
    </div>
  );
}

export default FileUpload;