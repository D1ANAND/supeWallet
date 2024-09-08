const Ethereum = {
    hex: '0x1',
    name: 'Ethereum',
    rpcUrl: 'https://eth.drpc.org/',
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

const ChronicleLitProtocolTestnet = {  
    hex: '0x2ac49',
    name: 'Chronicle - Lit Protocol Testnet',
    rpcUrl: 'https://175188.rpc.thirdweb.com/${THIRDWEB_API_KEY}',  
    ticker: "tstLIT"
};

const Sepolia = {
    hex:'0xaa36a7',
    name:'Ethereum Sepolia',
    rpcUrl: 'https://rpc.sepolia.org/',
    ticker:"ETH"
};

const BNBChain = {
    hex: '0x61',
    name: 'BNB Chain',
    rpcUrl: 'https://bsc-dataseed.binance.org/',
    ticker: "tBNB"
};

const Avalanche = {
    hex: '0xa869',
    name: 'Avalanche Fuji Testnet',
    rpcUrl: 'https://avalanche-fuji.blockpi.network/v1/rpc/public	',
    ticker: "AVAX"
};

export const CHAINS_CONFIG = {
    "0x1": Ethereum,
    "0x13881": MumbaiTestnet,
    "0x13882": Amoy,
    "0x2ac49" : ChronicleLitProtocolTestnet,
    "0xaa36a7": Sepolia,
    "0x61": BNBChain,
    "0xa869": Avalanche
};
