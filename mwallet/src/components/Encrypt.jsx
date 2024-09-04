// import { useState, useRef } from "react";
// import Files from "./Files";
// import axios from "axios";
// // import lit protocol sdk
// import * as LitJsSdk from "@lit-protocol/lit-node-client";

// export default function Encrypt() {
//   const [file, setFile] = useState(null);
//   const [cid, setCid] = useState("");
//   const [uploading, setUploading] = useState(false);
//   // add a new state for the cid to decrypt
//   const [decryptionCid, setDecryptionCid] = useState("");

//   const inputFile = useRef(null);

//   const uploadFile = async (fileToUpload) => {
//     try {
//       setUploading(true);
//       // Start by creating a new LitNodeClient
//       const litNodeClient = new LitJsSdk.LitNodeClient({
//         litNetwork: 'cayenne',
//       });
//       await litNodeClient.connect();
//       const authSig = await LitJsSdk.checkAndSignAuthMessage({
//         chain: 'ethereum',
//       });
//       // Setup access control conditions
//       const accs = [
//         {
//           contractAddress: '',
//           standardContractType: '',
//           chain: 'ethereum',
//           method: 'eth_getBalance',
//           parameters: [':userAddress', 'latest'],
//           returnValueTest: {
//             comparator: '>=',
//             value: '0',
//           },
//         },
//       ];
//       // Encrypt the file and zip it up with metadata
//       const encryptedZip = await LitJsSdk.encryptFileAndZipWithMetadata({
//         accessControlConditions: accs,
//         authSig,
//         chain: 'ethereum',
//         file: fileToUpload,
//         litNodeClient: litNodeClient,
//         readme: "Use IPFS CID of this file to decrypt it",
//       });

//       // Turn it into a file accepted by the Pinata API
//       const encryptedBlob = new Blob([encryptedZip], { type: 'text/plain' });
//       const encryptedFile = new File([encryptedBlob], fileToUpload.name);

//       // Upload the file by passing it to our /api/files endpoint
//       const formData = new FormData();
//       formData.append("file", encryptedFile, encryptedFile.name);

//       const res = await fetch(`http://localhost:6000/upload`, {
//         method: 'POST',
//         body: formData,
//       });

//       if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

//       const result = await res.json();
//       console.log(result);
//       const ipfsHash = result.data; // Adjust if your API returns the hash differently
//       setCid(ipfsHash);
//     } catch (e) {
//       console.error(e);
//       alert("Trouble uploading file");
//     } finally {
//       setUploading(false);
//     }
//   };

//   // Function to decrypt the file that takes in a CID and then downloads the decrypted file
//   const decryptFile = async (fileToDecrypt) => {
//     try {
//       // Fetch the file from IPFS using the CID and Gateway URL, then turn it into a blob
//       const fileRes = await fetch(`${process.env.NEXT_PUBLIC_GATEWAY_URL}/ipfs/${fileToDecrypt}?filename=encrypted.zip`);
//       if (!fileRes.ok) throw new Error(`HTTP error! status: ${fileRes.status}`);
      
//       const file = await fileRes.blob();
//       // Recreate the litNodeClient and the authSig
//       const litNodeClient = new LitJsSdk.LitNodeClient({
//         litNetwork: 'cayenne',
//       });
//       await litNodeClient.connect();
//       const authSig = await LitJsSdk.checkAndSignAuthMessage({
//         chain: 'ethereum',
//       });
//       // Extract the file and metadata from the zip
//       const { decryptedFile, metadata } = await LitJsSdk.decryptZipFileWithMetadata({
//         file: file,
//         litNodeClient: litNodeClient,
//         authSig: authSig,
//       });
//       // Download the decrypted file
//       const blob = new Blob([decryptedFile], { type: 'application/octet-stream' });
//       const downloadLink = document.createElement('a');
//       downloadLink.href = URL.createObjectURL(blob);
//       downloadLink.download = metadata.name; // Set desired filename and extension
//       downloadLink.click();
//     } catch (error) {
//       alert("Trouble decrypting file");
//       console.error(error);
//     }
//   };

//   const handleChange = (e) => {
//     setFile(e.target.files[0]);
//     uploadFile(e.target.files[0]);
//   };

//   return (
//     <main className="w-full min-h-screen m-auto flex flex-col justify-center items-center">
//       <div className="w-full h-full m-auto bg-heroimg bg-cover bg-center flex flex-col justify-center items-center">
//         <input
//           type="file"
//           id="file"
//           ref={inputFile}
//           onChange={handleChange}
//           style={{ display: "none" }}
//         />
//         <div>
//           <button
//             disabled={uploading}
//             onClick={() => inputFile.current.click()}
//             className="w-[150px] bg-secondary text-light rounded-3xl py-2 px-4 hover:bg-accent hover:text-light transition-all duration-300 ease-in-out"
//           >
//             {uploading ? "Uploading..." : "Upload"}
//           </button>
//         </div>
//         {cid && <Files cid={cid} />}
//         <input
//           type="text"
//           onChange={(e) => setDecryptionCid(e.target.value)}
//           className="px-4 py-2 border-2 border-secondary rounded-3xl text-lg"
//           placeholder="Enter CID to decrypt"
//         />
//         <button
//           onClick={() => decryptFile(decryptionCid)}
//           className="mr-10 w-[150px] bg-light text-secondary border-2 border-secondary rounded-3xl py-2 px-4 hover:bg-secondary hover:text-light transition-all duration-300 ease-in-out"
//         >
//           Decrypt
//         </button>
//       </div>
//     </main>
//   );
// }
