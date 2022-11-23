import React, { FC, ComponentPropsWithoutRef } from 'react'
import { Button, Flex, Text } from '../../primitives'
import TokenMedia from './index'
import { defaultHeaders } from '../../lib/swr'
import { useReservoirClient } from '../../hooks'
import { paths } from '@reservoir0x/reservoir-kit-client'

type TokenFallbackProps = {
  token: ComponentPropsWithoutRef<typeof TokenMedia>['token']
  onRefreshClicked: () => void
}

const TokenFallback: FC<TokenFallbackProps> = ({ token, onRefreshClicked }) => {
  const client = useReservoirClient()

  return (
    <Flex
      justify="center"
      align="center"
      direction="column"
      css={{ gap: '$2' }}
    >
      {token?.collection?.image && (
        <img
          style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8 }}
          src={token?.collection?.image}
        />
      )}
      <Text style="body3" css={{ textAlign: 'center' }}>
        We don't have the content <br /> for this NFT yet
      </Text>
      <Button
        color="secondary"
        onClick={() => {
          onRefreshClicked()
          const url = `${client?.apiBase}/tokens/refresh/v1`
          const body: paths['/tokens/refresh/v1']['post']['parameters']['body']['body'] =
            {
              token: `${token?.collection?.id}:${token?.tokenId}`,
            }
          const headers = {
            ...defaultHeaders(client?.apiKey, client?.version),
            'Content-Type': 'application/json',
          }
          fetch(url, {
            headers,
            method: 'POST',
            body: JSON.stringify(body),
          })
            .then((res) => res.json())
            .catch((e) => {
              throw e
            })
        }}
      >
        Refresh
      </Button>
    </Flex>
  )
}

export default TokenFallback
