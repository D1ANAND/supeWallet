import { ethers } from "ethers";
import { ToastContainer, toast } from 'react-toastify';

export async function sendTransaction(to, amount) {
  if (!amount || !to) {
    alert("Please fill out all fields and connect your wallet.");
    return;
  }

  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    // Create transaction object
    const tx = {
      to: to, // Use the 'to' parameter passed into the function
      value: ethers.utils.parseEther(amount), // Convert amount to ethers
    };

    // Send transaction
    const transactionResponse = await signer.sendTransaction(tx);
    console.log("Transaction Response:", transactionResponse);

    // Wait for transaction confirmation
    await transactionResponse.wait();
    const notify = () => toast("Transaction Successfull");
   
    notify();
    <ToastContainer />
    alert("Transaction successful!");
  } catch (error) {
    console.error("Transaction error:", error);
    alert("Transaction failed!");
  }
}