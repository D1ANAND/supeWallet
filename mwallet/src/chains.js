const Ethereum = {
    hex: '0x1',
    name: 'Ethereum',
    rpcUrl: '',
    ticker: "ETH"
};

const MumbaiTestnet = {
    hex: '0x13881',
    name: 'Mumbai Testnet',
    rpcUrl: '',
    ticker: "MATIC"
};

const Amoy = {
    hex: '0x13882',
    name: 'Polygon POS',
    rpcUrl: 'https://polygon-rpc.com/',
    ticker: "MATIC"
};

export const CHAINS_CONFIG = {
    "0x1": Ethereum,
    "0x13881": MumbaiTestnet,
    "0x13882": Amoy,
};
