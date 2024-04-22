import { ReservoirChain } from '../actions'
import { chainPaymentTokensMap } from './paymentTokens'

type ReservoirBaseChain = Omit<ReservoirChain, 'active'>

const mainnet = {
  id: 1,
  name: 'Ethereum',
  baseApiUrl: 'https://api.reservoir.tools',
  paymentTokens: chainPaymentTokensMap[1],
  websocketUrl: 'wss://ws.reservoir.tools',
  checkPollingInterval: 2000,
} satisfies ReservoirBaseChain

const optimism = {
  id: 10,
  name: 'Optimism',
  baseApiUrl: 'https://api-optimism.reservoir.tools',
  paymentTokens: chainPaymentTokensMap[10],
  websocketUrl: 'wss://ws-optimism.reservoir.tools',
  checkPollingInterval: 1000,
} satisfies ReservoirBaseChain

const polygon = {
  id: 137,
  name: 'Polygon',
  baseApiUrl: 'https://api-polygon.reservoir.tools',
  paymentTokens: chainPaymentTokensMap[137],
  websocketUrl: 'wss://ws-polygon.reservoir.tools',
  checkPollingInterval: 1000,
} satisfies ReservoirBaseChain

const polygonAmoy = {
  id: 80002,
  name: 'Polygon Amoy',
  baseApiUrl: 'https://api-amoy.reservoir.tools',
  paymentTokens: chainPaymentTokensMap[80002],
  websocketUrl: 'wss://ws-amoy.reservoir.tools',
  checkPollingInterval: 1000,
} satisfies ReservoirBaseChain

const arbitrum = {
  id: 42161,
  name: 'Arbitrum',
  baseApiUrl: 'https://api-arbitrum.reservoir.tools',
  paymentTokens: chainPaymentTokensMap[42161],
  websocketUrl: 'wss://ws-arbitrum.reservoir.tools',
  checkPollingInterval: 1000,
} satisfies ReservoirBaseChain

const arbitrumNova = {
  id: 42170,
  name: 'Arbitrum Nova',
  baseApiUrl: 'https://api-arbitrum-nova.reservoir.tools',
  paymentTokens: chainPaymentTokensMap[42170],
  checkPollingInterval: 1000,
} satisfies ReservoirBaseChain

const avalanche = {
  id: 43114,
  name: 'Avalanche',
  baseApiUrl: 'https://api-avalanche.reservoir.tools',
  paymentTokens: chainPaymentTokensMap[43114],
  checkPollingInterval: 1000,
} satisfies ReservoirBaseChain

const sepolia = {
  id: 11155111,
  name: 'Sepolia',
  baseApiUrl: 'https://api-sepolia.reservoir.tools',
  paymentTokens: chainPaymentTokensMap[11155111],
  websocketUrl: 'wss://ws-sepolia.reservoir.tools',
  checkPollingInterval: 2000,
} satisfies ReservoirBaseChain

const base = {
  id: 8453,
  name: 'Base',
  baseApiUrl: 'https://api-base.reservoir.tools',
  paymentTokens: chainPaymentTokensMap[8453],
  websocketUrl: 'wss://ws-base.reservoir.tools',
  checkPollingInterval: 1000,
} satisfies ReservoirBaseChain

const baseSepolia = {
  id: 84532,
  name: 'Base Sepolia',
  baseApiUrl: 'https://api-base-sepolia.reservoir.tools',
  paymentTokens: chainPaymentTokensMap[84532],
  checkPollingInterval: 1000,
} satisfies ReservoirBaseChain

const scrollTestnet = {
  id: 534353,
  name: 'Scroll Testnet',
  baseApiUrl: 'https://api-scroll-alpha.reservoir.tools',
  paymentTokens: chainPaymentTokensMap[534353],
  checkPollingInterval: 1000,
} satisfies ReservoirBaseChain

const scroll = {
  id: 534352,
  name: 'Scroll',
  baseApiUrl: 'https://api-scroll.reservoir.tools',
  paymentTokens: chainPaymentTokensMap[534352],
  checkPollingInterval: 1000,
} satisfies ReservoirBaseChain

const linea = {
  id: 59144,
  name: 'Linea',
  baseApiUrl: 'https://api-linea.reservoir.tools',
  paymentTokens: chainPaymentTokensMap[59144],
  checkPollingInterval: 1000,
} satisfies ReservoirBaseChain

const bsc = {
  id: 56,
  name: 'BNB Smart Chain',
  baseApiUrl: 'https://api-bsc.reservoir.tools',
  paymentTokens: chainPaymentTokensMap[56],
  websocketUrl: 'wss://ws-bsc.reservoir.tools',
  checkPollingInterval: 1000,
} satisfies ReservoirBaseChain

const opBnb = {
  id: 204,
  name: 'opBNB',
  baseApiUrl: 'https://api-opbnb.reservoir.tools',
  paymentTokens: chainPaymentTokensMap[204],
  checkPollingInterval: 1000,
} satisfies ReservoirBaseChain

const zora = {
  id: 7777777,
  name: 'Zora',
  baseApiUrl: 'https://api-zora.reservoir.tools',
  paymentTokens: chainPaymentTokensMap[7777777],
  checkPollingInterval: 1000,
} satisfies ReservoirBaseChain

const zoraTestnet = {
  id: 999,
  name: 'Zora Testnet',
  baseApiUrl: 'https://api-zora-testnet.reservoir.tools',
  paymentTokens: chainPaymentTokensMap[999],
  checkPollingInterval: 1000,
} satisfies ReservoirBaseChain

const zkSync = {
  id: 324,
  name: 'zkSync',
  baseApiUrl: 'https://api-zksync.reservoir.tools',
  paymentTokens: chainPaymentTokensMap[324],
  checkPollingInterval: 1000,
} satisfies ReservoirBaseChain

const polygonZkEvm = {
  id: 1101,
  name: 'Polygon zkEVM',
  baseApiUrl: 'https://api-polygon-zkevm.reservoir.tools',
  paymentTokens: chainPaymentTokensMap[1101],
  checkPollingInterval: 1000,
} satisfies ReservoirBaseChain

const ancient8 = {
  id: 888888888,
  name: 'Ancient8 Testnet',
  baseApiUrl: 'https://api-ancient8.reservoir.tools',
  paymentTokens: chainPaymentTokensMap[888888888],
  checkPollingInterval: 1000,
} satisfies ReservoirBaseChain

const ancient8Testnet = {
  id: 28122024,
  name: 'Ancient8 Testnet',
  baseApiUrl: 'https://api-ancient8-testnet.reservoir.tools',
  paymentTokens: chainPaymentTokensMap[28122024],
  checkPollingInterval: 1000,
} satisfies ReservoirBaseChain

const frameTestnet = {
  id: 68840142,
  name: 'Frame Testnet',
  baseApiUrl: 'https://api-frame-testnet.reservoir.tools',
  paymentTokens: chainPaymentTokensMap[68840142],
  checkPollingInterval: 1000,
} satisfies ReservoirBaseChain

const blastSepolia = {
  id: 168587773,
  name: 'Blast Sepolia',
  baseApiUrl: 'https://api-blast-sepolia.reservoir.tools',
  paymentTokens: chainPaymentTokensMap[168587773],
  checkPollingInterval: 1000,
}
const apexPop = {
  id: 70700,
  name: 'Apex',
  baseApiUrl: 'https://api-apex.reservoir.tools',
  paymentTokens: chainPaymentTokensMap[70700],
  checkPollingInterval: 1000,
} satisfies ReservoirBaseChain

const apexPopTestnet = {
  id: 70800,
  name: 'Apex Testnet',
  baseApiUrl: 'https://api-apex-testnet.reservoir.tools',
  paymentTokens: chainPaymentTokensMap[70800],
  checkPollingInterval: 1000,
} satisfies ReservoirBaseChain

const blast = {
  id: 81457,
  name: 'Blast',
  baseApiUrl: 'https://api-blast.reservoir.tools',
  paymentTokens: chainPaymentTokensMap[81457],
  checkPollingInterval: 1000,
} satisfies ReservoirBaseChain

const astarZkEVM = {
  id: 3776,
  name: 'Astar zkEVM',
  baseApiUrl: 'https://api-astar-zkevm.reservoir.tools',
  paymentTokens: chainPaymentTokensMap[3776],
  checkPollingInterval: 1000,
} satisfies ReservoirBaseChain

const garnet = {
  id: 17069,
  name: 'Garnet',
  baseApiUrl: 'https://api-garnet.reservoir.tools',
  paymentTokens: chainPaymentTokensMap[17069],
  checkPollingInterval: 1000,
} satisfies ReservoirBaseChain

const redstone = {
  id: 690,
  name: 'Redstone',
  baseApiUrl: 'https://api-redstone.reservoir.tools',
  paymentTokens: chainPaymentTokensMap[690],
  checkPollingInterval: 1000,
} satisfies ReservoirBaseChain

const berachainTestnet = {
  id: 80085,
  name: 'Berachain Testnet',
  baseApiUrl: 'http://api-berachain-testnet.reservoir.tools',
  paymentTokens: chainPaymentTokensMap[80085],
  checkPollingInterval: 1000,
} satisfies ReservoirBaseChain

export const reservoirChains = {
  mainnet,
  polygon,
  polygonAmoy,
  optimism,
  arbitrum,
  arbitrumNova,
  avalanche,
  sepolia,
  base,
  baseSepolia,
  bsc,
  opBnb,
  scrollTestnet,
  scroll,
  linea,
  zora,
  zoraTestnet,
  zkSync,
  polygonZkEvm,
  ancient8,
  ancient8Testnet,
  frameTestnet,
  blastSepolia,
  apexPop,
  apexPopTestnet,
  blast,
  astarZkEVM,
  garnet,
  redstone,
  berachainTestnet,
}
