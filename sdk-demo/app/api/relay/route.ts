import { GelatoRelay, SignatureData } from '@gelatonetwork/relay-sdk'

import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { signatureData }: { signatureData: SignatureData } =
    await request.json()
  const { struct, signature } = signatureData
  const relay = new GelatoRelay()
  const relayResponse = await relay.sponsoredCallERC2771WithSignature(
    struct,
    signature,
    process.env.GELATO_API_KEY!
  )
  return NextResponse.json(relayResponse)
}
