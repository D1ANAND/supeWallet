import axios from 'axios';

const API_URL = 'http://localhost:3000'; // Ensure this matches your backend URL
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
    return response; // Return the full response object
  } catch (error) {
    console.error('Upload error:', error);
    throw error; // Rethrow error for proper handling
  }
};

export const transferNft = async (tokenId, serialNumber) => {
  console.log(`Transferring NFT with tokenId: ${tokenId}, serialNumber: ${serialNumber}`);

  try {
    const response = await axios.post(`${API_URL}/transfer`, { tokenId, serialNumber });
    console.log(response);
    return response.data;
  } catch (error) {
    console.error('Transfer error:', error.response || error);  // Log detailed error
    throw error;  // Rethrow to handle in the UI
  }
};

