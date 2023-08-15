// @ts-ignore TypeScript compilation error due to nothing being exported
type ReservoirWebsocketEventType = 'subscribe' | 'unsubscribe'
type ReservoirWebsocketEvent =
  | 'ask.created'
  | 'ask.updated'
  | 'bid.created'
  | 'bid.updated'
  | 'sale.created'
  | 'sale.updated'
  | 'sale.deleted'
  | 'transfer.created'
  | 'transfer.updated'
  | 'transfer.deleted'
  | 'token.created'
  | 'token.updated'
  | 'collection.created'
  | 'collection.updated'
type ReservoirWebsocketEventFilters =
  | 'contract'
  | 'source'
  | 'maker'
  | 'taker'
  | 'from'
  | 'to'
  | 'id'
type ReservoirWebsocketMessage = {
  type: ReservoirWebsocketEventType
  event: ReservoirWebsocketEvent
  filters?: Partial<Record<ReservoirWebsocketEventFilters, string>>
  changed?: string
}

//Event Payload
type ReservoirWebsocketTokenChanged =
  | 'name'
  | 'description'
  | 'image'
  | 'media'
  | 'collection.id'
  | 'market.floorAsk.id'
  | 'market.floorAsk.price.gross.amount'
  | 'token.rarity'
  | 'token.rarityRanky'
  | 'token.isFlagged'
  | 'token.lastFlagUpdate'
  | 'token.lastFlagChange'
  | 'market.floorAskNormalized.id'
  | 'market.floorAskNormalized.price.gross.amount'
  | 'token.supply'
  | 'token.remainingSupply'

type Nullable<T> = T extends object
  ? { [K in keyof T]: T[K] extends object ? Nullable<T[K]> : T[K] | null }
  : T | null

export interface WebSocketCreatePayloads {
  token: Nullable<{
    contract: string
    tokenId: string
    name: string
    description: string
    media: string
    kind: string
    isFlagged: boolean
    lastFlagUpdate: number
    lastFlagChange: number
    rarity: number
    rarityRank: number
    collection: {
      id: string
      name: string
      slug: string
    }
    market: {
      floorAsk: {
        id: string
        price: {
          currency: {
            contract: string
            name: string
            symbol: string
            decimals: number
          }
          amount: { raw: string; decimal: number; usd: number; native: number }
        }
      }
      floorAskNormalized: {
        id: string
        price: {
          currency: {
            contract: string
            name: string
            symbol: string
            decimals: number
          }
          amount: { raw: string; decimal: number; usd: number; native: number }
        }
      }
    }
  }>
  ask: Nullable<{
    id: string
    kind: string
    side: string
    status: string
    tokenSetId: string
    tokenSetSchemaHash: string
    nonce: number
    contract: string
    maker: string
    taker: string
    price: {
      currency: {
        contract: string
        name: string
        symbol: string
        decimals: number
      }
      amount: { raw: string; decimal: number; usd: number; native: number }
      netAmount: { raw: string; decimal: number; usd: number; native: number }
    }
    validFrom: number
    validUntil: number
    quantityFilled: number
    quantityRemaining: number
    criteria: {
      kind: string
      data: {
        token: {
          tokenId: string
          name: string
          image: string
        }
        collection: {
          id: string
          name: string
          image: string
        }
      }
    }
    source: {
      id: string
      domain: string
      name: string
      icon: string
      url: string
    }
    feeBps: number
    feeBreakdown: any[]
    expiration: number
  }>
}

export interface WebSocketUpdatePaylods {
  token: Nullable<{
    contract: string
    tokenId: string
    name: string
    description: string
    media: string
    kind: string
    isFlagged: boolean
    lastFlagUpdate: number
    lastFlagChange: number
    rarity: number
    rarityRank: number
    collection: {
      id: string
      name: string
      slug: string
    }
    market: {
      floorAsk: {
        id: string
        price: {
          currency: {
            contract: string
            name: string
            symbol: string
            decimals: number
          }
          amount: { raw: string; decimal: number; usd: number; native: number }
        }
      }
      floorAskNormalized: {
        id: string
        price: {
          currency: {
            contract: string
            name: string
            symbol: string
            decimals: number
          }
          amount: { raw: string; decimal: number; usd: number; native: number }
        }
      }
    }
  }>
}

export interface WebSocketCreatePayload<
  T extends keyof WebSocketCreatePayloads
> {
  published_at: number
  type: 'event'
  status: 'success' | 'error'
  event: string
  tags: {
    [key: string]: string
  }
  data: WebSocketCreatePayloads[T]
  changed: ReservoirWebsocketTokenChanged[]
  offset?: string
}
