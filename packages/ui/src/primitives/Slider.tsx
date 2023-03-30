import React, { ComponentPropsWithoutRef } from 'react'
import { styled } from '../../stitches.config'
import * as SliderPrimitive from '@radix-ui/react-slider'

const SliderRoot = styled(SliderPrimitive.Root, {
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  userSelect: 'none',
  touchAction: 'none',
  width: 200,
  height: 20,
})

const SliderTrack = styled(SliderPrimitive.Track, {
  backgroundColor: '$neutralBorder',
  position: 'relative',
  flexGrow: 1,
  borderRadius: '9999px',
  height: 8,
})

const SliderRange = styled(SliderPrimitive.Range, {
  position: 'absolute',
  backgroundColor: '$accentSolid',
  borderRadius: '9999px',
  height: '100%',
})

const SliderThumb = styled(SliderPrimitive.Thumb, {
  display: 'block',
  cursor: 'pointer',
  width: 20,
  height: 20,
  backgroundColor: '$accentSolid',
  borderRadius: 10,
  border: '1px solid $neutralLine',
  '&:hover': { backgroundColor: '$accentSolidHover' },
  '&:focus': { outline: 'none', boxShadow: `0 0 0 5px $neutralBgSubtle` },
})

const Slider = (props?: ComponentPropsWithoutRef<typeof SliderRoot>) => (
  <SliderRoot {...props}>
    <SliderTrack>
      <SliderRange />
    </SliderTrack>
    <SliderThumb />
  </SliderRoot>
)

export default Slider
