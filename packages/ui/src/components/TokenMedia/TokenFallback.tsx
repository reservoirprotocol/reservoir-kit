import React, {
  FC,
  ComponentPropsWithoutRef,
  CSSProperties,
  useEffect,
  useState,
} from 'react'
import { Button, Flex, Text } from '../../primitives'
import TokenMedia from './index'
import { defaultHeaders } from '../../lib/swr'
import { useReservoirClient } from '../../hooks'
import { paths } from '@reservoir0x/reservoir-sdk'
import { Address, erc721ABI, useContractRead } from 'wagmi'
import { convertTokenUriToImage } from '../../lib/processTokenURI'

type TokenFallbackProps = {
  style?: CSSProperties
  className?: string
  token: ComponentPropsWithoutRef<typeof TokenMedia>['token']
  enableOnChainImageFallback?: boolean
  chainId?: number
  onRefreshClicked: () => void
}

const TokenFallback: FC<TokenFallbackProps> = ({
  style,
  className,
  token,
  enableOnChainImageFallback,
  chainId,
  onRefreshClicked,
}) => {
  const client = useReservoirClient()
  const reservoirChain = chainId
    ? client?.chains.find((chain) => chain.id === chainId)
    : client?.currentChain()

  const contract = token?.collection?.id?.split(':')[0] as Address

  const [onChainImage, setOnChainImage] = useState('')
  const [onChainImageBroken, setOnChainImageBroken] = useState(false)

  const { data: tokenURI, isError } = useContractRead(
    enableOnChainImageFallback
      ? {
          address: contract,
          abi: erc721ABI,
          functionName: 'tokenURI',
          args: token?.tokenId ? [BigInt(token?.tokenId)] : undefined,
        }
      : undefined
  )

  useEffect(() => {
    if (tokenURI) {
      ;(async () => {
        const updatedOnChainImage = await convertTokenUriToImage(tokenURI)
        setOnChainImage(updatedOnChainImage)
      })()
    }
  }, [tokenURI])

  return (
    <Flex
      justify="center"
      align="center"
      direction="column"
      css={{ gap: '$2', aspectRatio: '1/1', p: '$2', ...style }}
      className={className}
    >
      {enableOnChainImageFallback &&
      onChainImage &&
      !isError &&
      !onChainImageBroken ? (
        <img
          src={onChainImage}
          style={{
            width: '150px',
            height: '150px',
            objectFit: 'cover',
            ...style,
          }}
          onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
            setOnChainImageBroken(true)
          }}
        />
      ) : (
        <>
          {token?.collection?.image && (
            <img
              style={{
                width: 64,
                height: 64,
                objectFit: 'cover',
                borderRadius: 8,
              }}
              src={token?.collection?.image}
            />
          )}
          <Text style="body2" css={{ textAlign: 'center' }}>
            No Content Available
          </Text>
          <Button
            color="secondary"
            onClick={(e) => {
              e.preventDefault()
              if (!reservoirChain) {
                throw 'ReservoirClient missing chain configuration'
              }
              onRefreshClicked()
              const url = `${reservoirChain?.baseApiUrl}/tokens/refresh/v1`
              const body: paths['/tokens/refresh/v1']['post']['parameters']['body']['body'] =
                {
                  token: `${token?.collection?.id}:${token?.tokenId}`,
                }
              const headers = {
                ...defaultHeaders(reservoirChain?.apiKey, client?.version),
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
        </>
      )}
    </Flex>
  )
}

export default TokenFallback
