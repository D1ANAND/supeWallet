import React, { useState } from 'react';
import { transferNft } from '../services/api';

function TransferNft() {
  const [tokenId, setTokenId] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [status, setStatus] = useState('');

  const handleTransfer = async () => {
    if (!tokenId || !serialNumber) {
      alert('Please enter both Token ID and Serial Number.');
      return;
    }
    setStatus('Transferring NFT...');
    try {
      await transferNft(tokenId, serialNumber);
      setStatus('NFT transferred successfully!');
    } catch (error) {
      setStatus('An error occurred during the transfer.');
    }
  };

  return (
    <div>
      <h1>Transfer NFT</h1>
      <div>
        <label>Token ID:</label>
        <input
          type="text"
          value={tokenId}
          onChange={(e) => setTokenId(e.target.value)}
          placeholder="Enter Token ID"
        />
      </div>
      <div>
        <label>Serial Number:</label>
        <input
          type="text"
          value={serialNumber}
          onChange={(e) => setSerialNumber(e.target.value)}
          placeholder="Enter Serial Number"
        />
      </div>
      <button onClick={handleTransfer}>Transfer NFT</button>
      <div>{status}</div>
    </div>
  );
}

export default TransferNft;
