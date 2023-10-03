import { ReservoirChain } from '../actions'
import { chainPaymentTokensMap } from './paymentTokens';

type ReservoirBaseChain = Omit<ReservoirChain, 'active'>;

const mainnet = {
  id: 1,
  baseApiUrl: 'https://api.reservoir.tools',
  paymentTokens: chainPaymentTokensMap[1]
} satisfies ReservoirBaseChain

const goerli = {
  id: 5,
  baseApiUrl: 'https://api-goerli.reservoir.tools',
  paymentTokens: chainPaymentTokensMap[5]
} satisfies ReservoirBaseChain

const optimism = {
  id: 10,
  baseApiUrl: 'https://api-optimism.reservoir.tools',
  paymentTokens: chainPaymentTokensMap[10]
} satisfies ReservoirBaseChain

const polygon = {
  id: 137,
  baseApiUrl: 'https://api-polygon.reservoir.tools',
  paymentTokens: chainPaymentTokensMap[137]
} satisfies ReservoirBaseChain

const mumbai = {
  id: 80001,
  baseApiUrl: 'https://api-mumbai.reservoir.tools',
  paymentTokens: chainPaymentTokensMap[80001]
} satisfies ReservoirBaseChain

const arbitrum = {
  id: 42161,
  baseApiUrl: 'https://api-arbitrum.reservoir.tools',
  paymentTokens: chainPaymentTokensMap[42161]
} satisfies ReservoirBaseChain

const arbitrumNova = {
  id: 42170,
  baseApiUrl: 'https://api-arbitrum-nova.reservoir.tools',
  paymentTokens: chainPaymentTokensMap[42170]
} satisfies ReservoirBaseChain

const avalanche = {
  id: 43114,
  baseApiUrl: 'https://api-avalanche.reservoir.tools',
  paymentTokens: chainPaymentTokensMap[43114]
} satisfies ReservoirBaseChain

const sepolia = {
  id: 11155111,
  baseApiUrl: 'https://api-sepolia.reservoir.tools',
  paymentTokens: chainPaymentTokensMap[11155111]
} satisfies ReservoirBaseChain

const base = {
  id: 8453,
  baseApiUrl: 'https://api-base.reservoir.tools',
  paymentTokens: chainPaymentTokensMap[8453]
} satisfies ReservoirBaseChain

const baseGoerli = {
  id: 84531,
  baseApiUrl: 'https://api-base-goerli.reservoir.tools',
  paymentTokens: chainPaymentTokensMap[84531]
} satisfies ReservoirBaseChain

const scrollTestnet = {
  id: 534353,
  baseApiUrl: 'https://api-scroll-alpha.reservoir.tools',
  paymentTokens: chainPaymentTokensMap[534353]
} satisfies ReservoirBaseChain

const linea = {
  id: 59144,
  baseApiUrl: 'https://api-linea.reservoir.tools',
  paymentTokens: chainPaymentTokensMap[59144]
} satisfies ReservoirBaseChain

const bsc = {
  id: 56,
  baseApiUrl: 'https://api-bsc.reservoir.tools',
  paymentTokens: chainPaymentTokensMap[56]
} satisfies ReservoirBaseChain

const zora = {
  id: 7777777,
  baseApiUrl: 'https://api-zora.reservoir.tools',
  paymentTokens: chainPaymentTokensMap[7777777]
} satisfies ReservoirBaseChain

const zoraTestnet = {
  id: 999,
  baseApiUrl: 'https://api-zora-testnet.reservoir.tools',
  paymentTokens: chainPaymentTokensMap[999]
} satisfies ReservoirBaseChain

const zkSync = {
  id: 324,
  baseApiUrl: 'https://api-zksync.reservoir.tools',
  paymentTokens: chainPaymentTokensMap[324]
} satisfies ReservoirBaseChain

const polygonZkEvm = {
  id: 1101,
  baseApiUrl: 'https://api-polygon-zkevm.reservoir.tools',
  paymentTokens: chainPaymentTokensMap[1101]
} satisfies ReservoirBaseChain

const ancient8Testnet = {
  id: 2863311531,
  baseApiUrl: 'https://api-ancient8-testnet.reservoir.tools',
  paymentTokens: chainPaymentTokensMap[2863311531]

} satisfies ReservoirBaseChain

export const reservoirChains = { mainnet, goerli, polygon, mumbai, optimism, arbitrum, arbitrumNova, avalanche, sepolia, base, baseGoerli, bsc, scrollTestnet, linea, zora, zoraTestnet, zkSync, polygonZkEvm, ancient8Testnet }
