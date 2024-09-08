import axios from 'axios';

const API_URL = 'http://localhost:3000'; 
export let tokenId;
const serialNumber ="1";

export const uploadFile = async (file) => {
  console.log(file);
  const formData = new FormData();
  formData.append('file', file);
  try {
    const response = await axios.post(`${API_URL}/upload`, formData);
    tokenId = response.data.tokenId
    console.log(tokenId)
    console.log("tokenId",response.data.tokenId);
    return response; 
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
};

export const transferNft = async (tokenId, serialNumber) => {
  console.log(`Transferring NFT with tokenId: ${tokenId}, serialNumber: ${serialNumber}`);

  try {
    const response = await axios.post(`${API_URL}/transfer`, { tokenId, serialNumber });
    console.log(response);
    return response.data;
  } catch (error) {
    console.error('Transfer error:', error.response || error);  
    throw error;  
  }
};

