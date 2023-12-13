import React, { FC, useMemo } from 'react'
import { Box, Flex, Text } from '../../primitives'
import TokenMedia from '../../components/TokenMedia'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faImage } from '@fortawesome/free-solid-svg-icons'
import { useTokens } from '../../hooks'
import { MintModalStepData } from './MintModalRenderer'

type Props = {
  stepData: MintModalStepData | null
  tokenKind: NonNullable<
    NonNullable<NonNullable<ReturnType<typeof useTokens>['data']>['0']>['token']
  >['kind']
}

export const MintImages: FC<Props> = ({ stepData, tokenKind }) => {
  const totalTransfersDataLength = useMemo(() => {
    return (
      stepData?.currentStep?.items?.reduce((total, item) => {
        return total + (item?.transfersData?.length || 0)
      }, 0) ?? 0
    )
  }, [stepData?.currentStep?.items])

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
          overflowX: totalTransfersDataLength > 3 ? 'scroll' : 'auto',
          gap: '$2',
          px: '$5',
          pb: 10,
          position: 'relative',
          justifyContent:
            totalTransfersDataLength > 3 ? 'flex-start' : 'center',
        }}
      >
        {stepData?.currentStep?.items?.map((item, itemIndex) => (
          <React.Fragment key={`item-${itemIndex}`}>
            {item?.transfersData?.map((mint, mintIndex) => {
              if (mint?.token?.tokenId && mint?.token?.contract)
                return (
                  <Flex
                    direction="column"
                    align="center"
                    key={`mint-${mintIndex}`}
                    css={{ gap: '$2' }}
                  >
                    <TokenMedia
                      token={{
                        tokenId: mint?.token?.tokenId,
                        collection: {
                          id: mint?.token?.contract,
                        },
                        kind: tokenKind,
                      }}
                      fallbackMode="simple"
                      style={{ width: 100, height: 100 }}
                      fallback={() => (
                        <Flex
                          css={{
                            borderRadius: 4,
                            objectFit: 'cover',
                            height: 100,
                            width: 100,
                            background: '$neutralBgActive',
                          }}
                          justify="center"
                          align="center"
                        >
                          <FontAwesomeIcon icon={faImage} size="2x" />
                        </Flex>
                      )}
                    />
                    <Text style="subtitle3">#{mint?.token?.tokenId}</Text>
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
