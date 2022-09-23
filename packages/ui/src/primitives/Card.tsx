import { styled } from '../../stitches.config'

const Card = styled('div', {
  backgroundColor: '$contentBackground',
  borderRadius: '$space$2',
  $$shadowColor: '$colors$gray7',
  boxShadow: 'box-shadow: 0px 2px 16px $$shadowColor',
  border: '1px solid $borderColor',
  width: '100%',
  padding: '12px 16px',
})

export default Card
