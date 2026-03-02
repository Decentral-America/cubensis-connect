export const assetIds: {
  custom: Record<string, string>;
  mainnet: Record<string, string>;
  stagenet: Record<string, string>;
  testnet: Record<string, string>;
} = {
  mainnet: {
    DCC: 'DCC',
    BTC: '25iPQ8zKBRR5q1UKUksCijiyb18EGupggjus6muEbuvK',
    CRC: 'G9TVbwiiUZd5WxFxoY7Tb6ZPjGGLfynJK4a3aoC59cMo',
    DGFTHR: 'CCcUGv8eoyoF96c8HHbnbGsPdumr7jPpoRS6orPeg6Wb',
  },
  testnet: {
    DCC: 'DCC',
    BTC: 'iHTVbu8ArLhtdtJ8BQhyaomgVogSfXT45RtwNFiK4We',
    DGFTHR: '13mWHq1h58WRTiRNBqDRD63gsV8Hq4joxYQzH3iRdHiR',
  },
  stagenet: {
    DCC: 'DCC',
  },
  custom: {
    DCC: 'DCC',
  },
};

export const swappableAssetIds = {
  mainnet: [
    'WAVES',
    'BAG',
    'BTC',
    'CRV',
    'EAST',
    'EGG',
    'ENNO',
    'ERGO',
    'ETH',
    'EURN',
    'FL',
    'LTC',
    'NSBT',
    'PUZZLE',
    'RACE',
    'SCONEX',
    'SIGN',
    'SWOP',
    'TN',
    'USD',
    'USDAP',
    'USDC',
    'USDCLP',
    'USDLP',
    'USDT',
    'VIRES',
    'WCT',
    'WEST',
    'WX',
    'XMR',
  ].map((assetName) => assetIds.mainnet[assetName]),
};

const logosByName = {
  BTC: require('./logos/BTC.svg'),
  CRC: require('./logos/CRC.svg'),
  DCC: require('./logos/DCC.svg'),
  DGFTHR: require('./logos/DGFTHR.svg'),
};

export const assetLogosByNetwork: Partial<{
  [network: string]: Partial<{
    [assetId: string]: string;
  }>;
}> = Object.fromEntries(
  Object.entries(assetIds).map(([network, nameToIdMap]) => [
    network,
    Object.fromEntries(Object.entries(nameToIdMap).map(([name, id]) => [id, logosByName[name]])),
  ]),
);
