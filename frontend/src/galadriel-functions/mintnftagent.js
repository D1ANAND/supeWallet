const { Contract, ethers, Wallet } = require("ethers");
const ABI = require("../ABI/abis/OpenAiSimpleLLM.json");
// const readline = require('readline');

export async function main(userInput) {
  const rpcUrl = process.env.REACT_APP_RPC_URL;
  const privateKey = process.env.REACT_APP_PRIVATE_KEY;
  const contractAddress = process.env.REACT_APP_SENDINTENT_CONTRACT_ADDRESS;

  if (!rpcUrl || !privateKey || !contractAddress) {
    throw new Error("Missing environment variables");
  }

  const provider =  new ethers.providers.JsonRpcProvider(rpcUrl);
  const wallet =  new ethers.Wallet(privateKey, provider);
  const contract =  new ethers.Contract(contractAddress, ABI, wallet);

  // Use the user input
  const message = userInput;

  // Call the sendMessage function
  const transactionResponse = await contract.sendMessage(message);
  const receipt = await transactionResponse.wait();
  console.log(`Message sent, tx hash: ${receipt.transactionHash}`);
  console.log(`Chat started with message: "${message}"`);

  // Read the LLM response on-chain
  while (true) {
    const response = await contract.response();
    if (response) {
      console.log("Response from contract:", response);
      return response;  // Return the GPT response
    }
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
}

// function getUserInput() {
//   return new Promise((resolve) => {
//     const input = window.prompt("Message ChatGPT:");
//     resolve(input);
//   });
// }

// main()
//   .then(() => console.log("Done"))