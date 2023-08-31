import React, {
  CSSProperties,
  FC,
  ReactElement,
  SyntheticEvent,
  useContext,
  useState,
  useRef,
  LegacyRef,
  VideoHTMLAttributes,
  AudioHTMLAttributes,
  IframeHTMLAttributes,
  useEffect,
  ComponentPropsWithoutRef,
} from 'react'
import { useTokens } from '../../hooks'
import { useModelViewer } from '../../hooks'
import { ThemeContext } from '../../ReservoirKitProvider'
import { Box, Loader } from '../../primitives'
import MediaPlayButton from './MediaPlayButton'
import { useMeasure } from '@react-hookz/web'
import TokenFallback from './TokenFallback'
import { Address, erc721ABI, useContractRead } from 'wagmi'
import { convertTokenUriToImage } from '../../lib/processTokenURI'

type MediaType =
  | 'mp4'
  | 'mp3'
  | 'wav'
  | 'm4a'
  | 'mov'
  | 'gltf'
  | 'glb'
  | 'png'
  | 'jpeg'
  | 'jpg'
  | 'svg'
  | 'gif'
  | 'html'
  | 'other'
  | undefined

export const extractMediaType = (
  token?: RequiredTokenProps
): MediaType | null => {
  let extension: string | null = null
  if (token?.media) {
    const pieces = token.media.split('/')
    const file =
      pieces && pieces[pieces.length - 1] ? pieces[pieces.length - 1] : null
    const matches = file ? file.match('(\\.[^.]+)$') : null
    extension = matches && matches[0] ? matches[0].replace('.', '') : null
  }
  return (extension as MediaType) ? (extension as MediaType) : null
}

type Token = NonNullable<
  NonNullable<ReturnType<typeof useTokens>['data']>['0']
>['token']

type RequiredTokenProps = Pick<
  NonNullable<Token>,
  'image' | 'media' | 'collection' | 'tokenId' | 'imageSmall' | 'imageLarge'
>

type Props = {
  token?: RequiredTokenProps
  staticOnly?: boolean
  imageResolution?: 'small' | 'medium' | 'large'
  style?: CSSProperties
  className?: string
  modelViewerOptions?: any
  videoOptions?: VideoHTMLAttributes<HTMLVideoElement>
  audioOptions?: AudioHTMLAttributes<HTMLAudioElement>
  iframeOptions?: IframeHTMLAttributes<HTMLIFrameElement>
  disableOnChainRendering?: boolean
  chainId?: number
  fallbackMode?: ComponentPropsWithoutRef<typeof TokenFallback>['mode']
  fallback?: (mediaType: MediaType | null) => ReactElement | null
  onError?: (e: Event) => void
  onRefreshToken?: () => void
}

const TokenMedia: FC<Props> = ({
  token,
  staticOnly,
  imageResolution,
  style,
  className,
  modelViewerOptions = {},
  videoOptions = {},
  audioOptions = {},
  iframeOptions = {},
  disableOnChainRendering,
  chainId,
  fallbackMode,
  fallback,
  onError = () => {},
  onRefreshToken = () => {},
}) => {
  const mediaRef = useRef<HTMLAudioElement | HTMLVideoElement>(null)
  const themeContext = useContext(ThemeContext)
  let borderRadius: string = themeContext?.radii?.borderRadius?.value || '0'
  const [error, setError] = useState<SyntheticEvent | Event | null>(null)
  const media = token?.media
  const tokenImage = (() => {
    switch (imageResolution) {
      case 'small':
        return token?.imageSmall
      case 'large':
        return token?.imageLarge
      case 'medium':
      default:
        return token?.image
    }
  })()
  const mediaType = extractMediaType(token)
  const defaultStyle: CSSProperties = {
    width: '150px',
    height: '150px',
    objectFit: 'cover',
    borderRadius,
    position: 'relative',
  }
  const computedStyle = {
    ...defaultStyle,
    ...style,
  }

  useModelViewer(
    !staticOnly && mediaType && (mediaType === 'gltf' || mediaType === 'glb')
      ? true
      : false
  )

  const [measurements, containerRef] = useMeasure<HTMLDivElement>()
  const isContainerLarge = (measurements?.width || 0) >= 360

  const contract = token?.collection?.id?.split(':')[0] as Address

  const [onChainImage, setOnChainImage] = useState('')
  const [onChainImageBroken, setOnChainImageBroken] = useState(false)
  const [isUpdatingOnChainImage, setIsUpdatingOnChainImage] = useState(false)

  const {
    data: tokenURI,
    isLoading: isFetchingTokenURI,
    isError: fetchTokenURIError,
  } = useContractRead(
    !disableOnChainRendering && (error || (!media && !tokenImage))
      ? {
          address: contract,
          abi: erc721ABI,
          functionName: 'tokenURI',
          args: token?.tokenId ? [BigInt(token?.tokenId)] : undefined,
          chainId: chainId,
        }
      : undefined
  )

  useEffect(() => {
    if (tokenURI) {
      setIsUpdatingOnChainImage(true)
      ;(async () => {
        const updatedOnChainImage = await convertTokenUriToImage(tokenURI)
        setOnChainImage(updatedOnChainImage)
      })()
      setIsUpdatingOnChainImage(false)
    }
  }, [tokenURI])

  useEffect(() => {
    if (mediaRef && mediaRef.current) {
      mediaRef.current.load()
    }
  }, [media])

  if (!token && !staticOnly) {
    console.warn('A token object or a media url are required!')
    return null
  }

  if (error || (!media && !tokenImage)) {
    if (
      !disableOnChainRendering &&
      !onChainImageBroken &&
      !fetchTokenURIError
    ) {
      return (
        <>
          {isFetchingTokenURI || isUpdatingOnChainImage ? (
            <Loader style={{ ...computedStyle }} />
          ) : (
            <img
              src={onChainImage}
              style={{ ...computedStyle }}
              alt="Token Image"
              onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                setOnChainImageBroken(true)
              }}
            />
          )}
        </>
      )
    }

    let fallbackElement: ReactElement | null | undefined
    if (fallback) {
      fallbackElement = fallback(mediaType)
    }
    if (!fallbackElement) {
      fallbackElement = (
        <TokenFallback
          style={style}
          className={className}
          token={token}
          mode={fallbackMode}
          onRefreshClicked={onRefreshToken}
        />
      )
    }
    return fallbackElement
  }

  const onErrorCb = (e: SyntheticEvent) => {
    setError(e)
    onError(e.nativeEvent)
  }

  if (staticOnly || !media) {
    return (
      <img
        alt="Token Image"
        src={tokenImage}
        style={{
          ...computedStyle,
          visibility:
            !tokenImage || tokenImage.length === 0 ? 'hidden' : 'visible',
        }}
        className={className}
        onError={onErrorCb}
      />
    )
  }

  // VIDEO
  if (mediaType === 'mp4' || mediaType === 'mov') {
    return (
      <Box className={className} style={computedStyle} ref={containerRef}>
        {!isContainerLarge && <MediaPlayButton mediaRef={mediaRef} />}
        <video
          style={computedStyle}
          className={className}
          poster={tokenImage}
          {...videoOptions}
          controls={isContainerLarge}
          loop
          playsInline
          onError={onErrorCb}
          ref={mediaRef as LegacyRef<HTMLVideoElement>}
        >
          <source src={media} type="video/mp4" />
          Your browser does not support the
          <code>video</code> element.
        </video>
      </Box>
    )
  }

  // AUDIO
  if (mediaType === 'wav' || mediaType === 'mp3' || mediaType === 'm4a') {
    return (
      <Box className={className} style={computedStyle} ref={containerRef}>
        {!isContainerLarge && <MediaPlayButton mediaRef={mediaRef} />}
        <img
          alt="Audio Poster"
          src={tokenImage}
          style={{
            position: 'absolute',
            height: '100%',
            width: '100%',
            visibility:
              !tokenImage || tokenImage.length === 0 ? 'hidden' : 'visible',
            objectFit: 'cover',
          }}
          onError={onErrorCb}
        />
        <audio
          src={media}
          {...audioOptions}
          onError={onErrorCb}
          ref={mediaRef}
          controls={isContainerLarge}
          style={{
            position: 'absolute',
            bottom: 16,
            left: 16,
            width: 'calc(100% - 32px)',
          }}
        >
          Your browser does not support the
          <code>audio</code> element.
        </audio>
      </Box>
    )
  }

  // 3D
  if (mediaType === 'gltf' || mediaType === 'glb') {
    return (
      <model-viewer
        src={media}
        ar
        ar-modes="webxr scene-viewer quick-look"
        poster={tokenImage}
        seamless-poster
        shadow-intensity="1"
        camera-controls
        enable-pan
        {...modelViewerOptions}
        style={computedStyle}
        className={className}
        onError={onErrorCb}
      ></model-viewer>
    )
  }

  //Image
  if (
    mediaType === 'png' ||
    mediaType === 'jpeg' ||
    mediaType === 'jpg' ||
    mediaType === 'gif'
  ) {
    return (
      <img
        alt="Token Image"
        src={media}
        className={className}
        style={{
          ...computedStyle,
          visibility: !media || media.length === 0 ? 'hidden' : 'visible',
        }}
        onError={onErrorCb}
      />
    )
  }

  // HTML
  if (
    mediaType === 'html' ||
    mediaType === null ||
    mediaType === undefined ||
    mediaType === 'other' ||
    mediaType === 'svg'
  ) {
    return (
      <iframe
        style={computedStyle}
        className={className}
        src={media}
        sandbox="allow-scripts"
        frameBorder="0"
        {...iframeOptions}
      ></iframe>
    )
  }

  return (
    <img
      alt="Token Image"
      src={tokenImage}
      style={{
        ...computedStyle,
        visibility:
          !tokenImage || tokenImage.length === 0 ? 'hidden' : 'visible',
      }}
      className={className}
      onError={onErrorCb}
    />
  )
}

export default TokenMedia
