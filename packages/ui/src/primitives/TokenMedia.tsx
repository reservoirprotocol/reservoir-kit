import '../types/parcel.d.ts'
import React, {
  CSSProperties,
  FC,
  HTMLAttributes,
  ReactElement,
  SyntheticEvent,
  useState,
} from 'react'
import { useTokens } from '../hooks'

import { useModelViewer } from '../hooks'

const extractMediaType = (url?: string) => {
  let extension: string | null = null
  if (url) {
    const matches = url.match('(\\.[^.]+)$')
    extension = matches ? matches[0].replace('.', '') : null
  }
  return extension
}

type Token = NonNullable<
  NonNullable<ReturnType<typeof useTokens>['data']>['0']
>['token']

type Props = {
  token?: Token
  preview?: boolean
  style?: CSSProperties
  className?: string
  modelViewerOptions?: any
  videoOptions?: HTMLAttributes<HTMLVideoElement>
  audioOptions?: HTMLAttributes<HTMLAudioElement>
  iframeOptions?: HTMLAttributes<HTMLIFrameElement>
  fallback?: ReactElement
  onError?: (e: Event) => void
}

const TokenMedia: FC<Props> = ({
  preview,
  token,
  style,
  className,
  modelViewerOptions = {},
  videoOptions = {},
  audioOptions = {},
  iframeOptions = {},
  fallback,
  onError = () => {},
}) => {
  const [error, setError] = useState<SyntheticEvent | Event | null>(null)
  const media = token?.media
  const tokenPreview = token?.image
  const mediaType = extractMediaType(media)
  useModelViewer(
    !preview && mediaType && (mediaType === 'gltf' || mediaType === 'glb')
      ? true
      : false
  )

  if (!token && !preview) {
    console.warn('A token object or a media url are required!')
    return null
  }

  if (fallback && (error || (!media && !tokenPreview))) {
    return fallback
  }

  const onErrorCb = (e: SyntheticEvent) => {
    setError(e)
    onError(e.nativeEvent)
  }

  if (preview || !media) {
    return (
      <img
        alt="Token Image"
        src={tokenPreview}
        style={{
          ...style,
          visibility:
            !tokenPreview || tokenPreview.length === 0 ? 'hidden' : 'visible',
        }}
        className={className}
        onError={onErrorCb}
      />
    )
  }

  // VIDEO
  if (mediaType === 'mp4') {
    return (
      <video
        style={style}
        className={className}
        poster={tokenPreview}
        controls
        autoPlay
        loop
        playsInline
        muted
        {...videoOptions}
        onError={onErrorCb}
      >
        <source src={media} type="video/mp4" />
        Your browser does not support the
        <code>video</code> element.
      </video>
    )
  }

  // AUDIO
  if (mediaType === 'wav' || mediaType === 'mp3') {
    return (
      <audio
        style={style}
        className={className}
        controls
        src={media}
        {...audioOptions}
        onError={onErrorCb}
      >
        Your browser does not support the
        <code>audio</code> element.
      </audio>
    )
  }

  // 3D
  if (mediaType === 'gltf' || mediaType === 'glb') {
    return (
      <model-viewer
        src={media}
        ar
        ar-modes="webxr scene-viewer quick-look"
        poster={tokenPreview}
        seamless-poster
        shadow-intensity="1"
        camera-controls
        enable-pan
        {...modelViewerOptions}
        style={style}
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
          ...style,
          visibility: !media || media.length === 0 ? 'hidden' : 'visible',
        }}
        onError={onErrorCb}
      />
    )
  }

  // HTML
  if (
    mediaType === 'html' ||
    mediaType === undefined ||
    mediaType === 'other'
  ) {
    return (
      <iframe
        style={style}
        className={className}
        src={media}
        sandbox="allow-scripts"
        {...iframeOptions}
      ></iframe>
    )
  }

  return (
    <img
      alt="Token Image"
      src={tokenPreview}
      style={{
        ...style,
        visibility:
          !tokenPreview || tokenPreview.length === 0 ? 'hidden' : 'visible',
      }}
      className={className}
      onError={onErrorCb}
    />
  )
}

export default TokenMedia
