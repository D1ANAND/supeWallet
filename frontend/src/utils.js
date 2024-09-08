import { LitNodeClient } from "@lit-protocol/lit-node-client";
import { LitContracts } from "@lit-protocol/contracts-sdk";
import { ethers, Wallet } from "ethers";
import { AuthMethodScope, LitNetwork } from "@lit-protocol/constants";
import {
    LitActionResource,
    LitPKPResource,
    createSiweMessageWithRecaps,
    generateAuthSig,
} from "@lit-protocol/auth-helpers";
import { LitAbility } from "@lit-protocol/types";
import { ipfsHelpers } from "ipfs-helpers";
import { litActionA, litActionB } from "./actions";
import bs58 from "bs58";
import { PKPEthersWallet } from "@lit-protocol/pkp-ethers";

import { Contract, JsonRpcProvider, BigNumber, formatEther, parseEther } from 'ethers';



const privateKey1 = process.env.REACT_APP_PRIVATE_KEY_1;
const privateKey2 = process.env.REACT_APP_PRIVATE_KEY_2;

const litNodeClient = new LitNodeClient({
    alertWhenUnauthorized: false,
    litNetwork: LitNetwork.DatilDev,
    debug: true,
});

let newlyMintedPKP = {};

export async function mintPKPUsingEthWallet() {
    console.log("minting started..");
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const ethersSigner = provider.getSigner();

    const litContracts = new LitContracts({
        signer: ethersSigner,
        network: LitNetwork.DatilDev,
        debug: false,
    });

    await litContracts.connect();

    const mintedPkp = await litContracts.pkpNftContractUtils.write.mint();

    console.log("Minted PKP to your wallet: ", mintedPkp.pkp);

    newlyMintedPKP = mintedPkp.pkp;

    const ipfsCID_A = await uploadLitActionToIPFS(litActionA);

    const addAuthMethodAReceipt = await litContracts.addPermittedAction({
        pkpTokenId: mintedPkp.pkp.tokenId,
        ipfsId: ipfsCID_A,
        authMethodScopes: [AuthMethodScope.SignAnything],
    });

    const bytesCID_A = await stringToBytes(ipfsCID_A);

    let isPermittedA =
        await litContracts.pkpPermissionsContract.read.isPermittedAction(
            mintedPkp.tokenId,
            bytesCID_A
        );

    console.log("Auth method A added: ", isPermittedA);
    

    return mintedPkp.pkp;
}


export async function transferPKPToItself() {
    console.log("transfer started..");
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const ethersSignerA = provider.getSigner();
    const address = await provider.send("eth_requestAccounts", []);

    const litContracts = new LitContracts({
        signer: ethersSignerA,
        network: LitNetwork.DatilDev,
        debug: false,
    });

    await litContracts.connect();

    const transferPkpOwnershipReceipt =
        await litContracts.pkpNftContract.write.transferFrom(
            address[0],
            newlyMintedPKP.ethAddress,
            newlyMintedPKP.tokenId,
            {
                gasLimit: 125_000,
            }
        );

    await transferPkpOwnershipReceipt.wait();

    console.log("Transferred PKP ownership to itself: ", transferPkpOwnershipReceipt);
}


export async function fundPKP(value){
    console.log("funding started..");
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const ethersSigner = provider.getSigner();

    const fundPkpTxReceipt = await ethersSigner.sendTransaction({
        to: newlyMintedPKP.ethAddress,
        value: ethers.utils.parseEther("0.00003"),
    });

    await fundPkpTxReceipt.wait();

    const balance = await ethersSigner.provider.getBalance(
        newlyMintedPKP.ethAddress,
        "latest"
    );
    console.log(`Got balance: ${ethers.utils.formatEther(balance)} ether`);
}

export async function addAnotherAuthToPKP() {
    console.log("auth add started..");

    const pkpSessionSigsA = await sigA();

    const pkpEthersWalletA = new PKPEthersWallet({
        litNodeClient,
        pkpPubKey: newlyMintedPKP.publicKey,
        controllerSessionSigs: pkpSessionSigsA,
    });

    await pkpEthersWalletA.init();

    console.log(pkpEthersWalletA);

    const litContractsPkpSignerA = new LitContracts({
        signer: pkpEthersWalletA,
        network: LitNetwork.DatilDev,
        debug: false,
    });

    await litContractsPkpSignerA.connect();

    console.log("contracts client connected");

    const ipfsCID_B = await uploadLitActionToIPFS(litActionB);
    const bytesCID_B = await stringToBytes(ipfsCID_B);

    const addAuthMethodBReceipt =
        await litContractsPkpSignerA.pkpPermissionsContract.write.addPermittedAction(
            newlyMintedPKP.tokenId,
            bytesCID_B,
            [AuthMethodScope.SignAnything],
            {
                gasPrice: await pkpEthersWalletA.provider.getGasPrice(),
                gasLimit: 550_000,
            }
        );

    await addAuthMethodBReceipt.wait();

    const isPermittedB =
        await litContractsPkpSignerA.pkpPermissionsContract.read.isPermittedAction(
            newlyMintedPKP.tokenId,
            bytesCID_B
        );

    console.log("Auth method B added: ", isPermittedB);
}

export async function RemoveInitialAuthMethod() {
    console.log("auth remove started..");

    const pkpSessionSigsB = await sigB();
    console.log("moving to next step")

    const pkpEthersWalletB = new PKPEthersWallet({
        litNodeClient,
        pkpPubKey: newlyMintedPKP.publicKey,
        controllerSessionSigs: pkpSessionSigsB,
    });

    await pkpEthersWalletB.init();

    console.log(pkpEthersWalletB);

    const litContractsPkpSignerB = new LitContracts({
        signer: pkpEthersWalletB,
        network: LitNetwork.DatilDev,
        debug: false,
    });

    await litContractsPkpSignerB.connect();

    console.log("contracts client connected");

    const ipfsCID_A = await uploadLitActionToIPFS(litActionA);
    const bytesCID_A = await stringToBytes(ipfsCID_A);

    const removeAuthMethodAReceipt =
        await litContractsPkpSignerB.pkpPermissionsContract.write.removePermittedAction(
            newlyMintedPKP.tokenId,
            bytesCID_A,
            {
                gasPrice: await pkpEthersWalletB.provider.getGasPrice(),
                gasLimit: 100_000,
            }
        );

    await removeAuthMethodAReceipt.wait();

    let isPermittedA =
        await litContractsPkpSignerB.pkpPermissionsContract.read.isPermittedAction(
            newlyMintedPKP.tokenId,
            bytesCID_A
        );

    console.log("isPermittedA: ", isPermittedA);
}

export async function pkpSignTx() {
    console.log("pkp sign started..");


    const pkpSessionSig = await sigA();

    const pkpEthersWallet = new PKPEthersWallet({
        litNodeClient,
        pkpPubKey: newlyMintedPKP.publicKey,
        controllerSessionSigs: pkpSessionSig,
    });

    await pkpEthersWallet.init();

    console.log(pkpEthersWallet);

    const transactionObject = {
        to: "0xe8FA5C28CA55B1DFBb6BCDBAcE5A6F22F487d662",
        value: ethers.BigNumber.from("10"),
        gasPrice: await pkpEthersWallet.provider.getGasPrice(),
        gasLimit: ethers.BigNumber.from("2100000"),
        data: "0x",
        // nonce: ethers.BigNumber.from("1"),
    };

    const tx = await pkpEthersWallet.sendTransaction(transactionObject);

    const receipt = await tx.wait();

    console.log(receipt);
}


export async function sigA() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const ethersSignerA = provider.getSigner();

    await litNodeClient.connect();

    const pkpSessionSigsA = await litNodeClient.getLitActionSessionSigs({
        pkpPublicKey: newlyMintedPKP.publicKey,
        resourceAbilityRequests: [
            {
                resource: new LitPKPResource("*"),
                ability: LitAbility.PKPSigning,
            },
            {
                resource: new LitActionResource("*"),
                ability: LitAbility.LitActionExecution,
            },
        ],
        litActionCode: Buffer.from(litActionA).toString("base64"),
        jsParams: {
            authSig: JSON.stringify(
                await generateAuthSig({
                    signer: ethersSignerA,
                    // @ts-ignore
                    toSign: await createSiweMessageWithRecaps({
                        uri: "http://localhost",
                        expiration: new Date(
                            Date.now() + 1000 * 60 * 60 * 24
                        ).toISOString(), // 24 hours
                        walletAddress: await ethersSignerA.getAddress(),
                        nonce: await litNodeClient.getLatestBlockhash(),
                        litNodeClient,
                    }),
                })
            ),
        },
    });

    console.log("sessionSigs: ", pkpSessionSigsA);
    return pkpSessionSigsA;
}

export async function sigB() {
    const anotherAuthWallet = await getAnotherWallet();

    await litNodeClient.connect();

    const pkpSessionSigsB = await litNodeClient.getLitActionSessionSigs({
        pkpPublicKey: newlyMintedPKP.publicKey,
        resourceAbilityRequests: [
            {
                resource: new LitPKPResource("*"),
                ability: LitAbility.PKPSigning,
            },
            {
                resource: new LitActionResource("*"),
                ability: LitAbility.LitActionExecution,
            },
        ],
        litActionCode: Buffer.from(litActionB).toString("base64"),
        jsParams: {
            authSig: JSON.stringify(
                await generateAuthSig({
                    signer: anotherAuthWallet,
                    // @ts-ignore
                    toSign: await createSiweMessageWithRecaps({
                        uri: "http://localhost",
                        expiration: new Date(
                            Date.now() + 1000 * 60 * 60 * 24
                        ).toISOString(), // 24 hours
                        walletAddress: anotherAuthWallet.address,
                        nonce: await litNodeClient.getLatestBlockhash(),
                        litNodeClient,
                    }),
                })
            ),
        },
    });

    console.log("sessionSigs: ", pkpSessionSigsB);
    return pkpSessionSigsB;
}



async function uploadLitActionToIPFS(litActionCode) {
    const ipfsHash = await ipfsHelpers.stringToCidV0(litActionCode);

    console.log("ipfsHash: ", ipfsHash);

    return ipfsHash;
}

async function stringToBytes(_string) {
    const LIT_ACTION_IPFS_CID_BYTES = `0x${Buffer.from(
        bs58.decode(_string)
    ).toString("hex")}`;

    return LIT_ACTION_IPFS_CID_BYTES;
}

async function getAnotherWallet() {
    const provider = new ethers.providers.JsonRpcProvider(
        `https://yellowstone-rpc.litprotocol.com/`
    );

    const wallet = new Wallet(privateKey2, provider);
    

    return wallet;
}

export async function seeAuthMethods() {
    console.log("started..");

    const litContracts = new LitContracts({
        network: LitNetwork.DatilDev,
    });

    await litContracts.connect();

    const authMethods =
        await litContracts.pkpPermissionsContract.read.getPermittedAuthMethods(
            newlyMintedPKP.tokenId
        );

    console.log(authMethods);
}



