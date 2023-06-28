import React, { FC, useEffect, useState } from 'react'
import { Address, erc721ABI, useContractReads } from 'wagmi'
import { convertTokenUriToImage } from '../../../lib/processTokenURI'
import { Box, Flex, Img, Text } from '../../../primitives'
import { CollectModalStepData } from '../CollectModalRenderer'

type Props = {
  stepData: CollectModalStepData | null
  contract: Address
}

export const MintImages: FC<Props> = ({ stepData, contract }) => {
  const [tokenImages, setTokenImages] = useState<string[]>([])

  const wagmiContract = {
    address: contract,
    abi: erc721ABI,
    functionName: 'tokenURI',
  }

  const { data: tokenURIs, isError } = useContractReads({
    contracts: stepData?.currentStep?.items?.flatMap((item) =>
      item?.transfersData?.map((mint) => {
        if (mint?.token?.tokenId)
          return {
            ...wagmiContract,
            functionName: 'tokenURI',
            args: [mint?.token?.tokenId],
          }
      })
    ),
  })

  useEffect(() => {
    if (tokenURIs) {
      ;(async () => {
        const updatedTokenImages = await Promise.all(
          tokenURIs.map(async (uri: any) => {
            const convertedToken = await convertTokenUriToImage(
              uri?.result || ''
            )
            return convertedToken
          })
        )
        setTokenImages(updatedTokenImages)
      })()
    }
  }, [tokenURIs])

  if (isError) {
    return null
  }

  return (
    <Flex css={{ width: '100%', overflow: 'hidden', position: 'relative' }}>
      <Box
        css={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          zIndex: 2,
          width: '32px',
          background:
            'linear-gradient(-90deg, rgba(255, 255, 255, 0) 0%, $neutralBgSubtle 50%)',
        }}
      />
      <Flex
        align="center"
        css={{
          width: '100%',
          overflowX: tokenImages.length > 3 ? 'scroll' : 'auto',
          gap: '$2',
          px: '$5',
          pb: 10,
          position: 'relative',
          justifyContent: tokenImages.length > 3 ? 'flex-start' : 'center',
        }}
      >
        {stepData?.currentStep?.items?.map((item, itemIndex) => (
          <React.Fragment key={`item-${itemIndex}`}>
            {item?.transfersData?.map((mint, mintIndex) => {
              const tokenImage = tokenImages[mintIndex]

              return (
                <Flex
                  direction="column"
                  align="center"
                  key={`mint-${mintIndex}`}
                  css={{ gap: '$2' }}
                >
                  <Img
                    src={tokenImage}
                    css={{
                      borderRadius: 4,
                      objectFit: 'cover',
                      height: 100,
                      width: 100,
                    }}
                  />
                  <Text style="subtitle2">#{mint?.token?.tokenId}</Text>
                </Flex>
              )
            })}
          </React.Fragment>
        ))}
      </Flex>
      <Box
        css={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          right: 0,
          zIndex: 2,
          width: '32px',
          background:
            'linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, $neutralBgSubtle 50%)',
        }}
      />
    </Flex>
  )
}
