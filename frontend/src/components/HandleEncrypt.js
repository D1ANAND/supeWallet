
// export const handleEncrypt = async (fileToEncrypt) => {
//   try {
//     setProcessing(true);

//     // Connect to Lit Protocol
//     const client = new LitNodeClient({
//       litNetwork: 'cayenne',
//       debug: false
//     });
//     await client.connect();
//     console.log('Connected to Lit Network', client);

//     // Authenticate with Lit Protocol
//     const authSig = await LitJsSdk.checkAndSignAuthMessage({ chain: 'ethereum' });
//     console.log('Auth Signature:', authSig);

//     // Define Access Control Conditions (Customize as needed)
//     const accs = [
//       {
//         contractAddress: '',
//         standardContractType: '',
//         chain: 'ethereum',
//         method: 'eth_getBalance',
//         parameters: [':userAddress', 'latest'],
//         returnValueTest: {
//           comparator: '>=',
//           value: '0',
//         },
//       },
//     ];

//     // Encrypt the file
//     const encryptedZip = await LitJsSdk.encryptFileAndZipWithMetadata({
//       accessControlConditions: accs,
//       authSig,
//       chain: 'ethereum',
//       file: fileToEncrypt,
//       litNodeClient: client,
//       readme: "Use IPFS CID of this file to decrypt it"
//     });

//     const encryptedBlob = new Blob([encryptedZip], { type: 'application/zip' });
//     const encryptedFile = new File([encryptedBlob], `${fileToEncrypt.name}.encrypted.zip`);
//     console.log("Encrypted file:", encryptedFile);

//     // Upload to IPFS via Pinata
//     const formData = new FormData();
//     formData.append('file', encryptedFile);

//     const metadata = JSON.stringify({
//       name: encryptedFile.name,
//     });
//     formData.append('pinataMetadata', metadata);

//     const res = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
//       maxBodyLength: 'Infinity',
//       headers: {
//         'Content-Type': 'multipart/form-data',
//         pinata_api_key: process.env.REACT_APP_PINATA_API_KEY,
//         pinata_secret_api_key: process.env.REACT_APP_PINATA_SECRET_API_KEY,
//       },
//     });

//     const ipfsHash = res.data.IpfsHash;
//     const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
//     setCid(ipfsHash);
//     setFileUrl(ipfsUrl);
//     setEncrypted(true);
//     console.log('Encrypted File uploaded to IPFS via Pinata:', ipfsUrl);

//     setProcessing(false);
//     alert(`File encrypted and uploaded successfully! CID: ${ipfsHash}`);

//   } catch (error) {
//     console.error('Error during encryption and upload:', error);
//     setProcessing(false);
//     alert("Error during encryption and upload: " + error.message);
//   }
// };
