import { CSS } from '../../../stitches.config'

const SCROLLBAR_SIZE = 10

const root: CSS = {
  height: 322,
  borderRadius: 4,
  overflow: 'hidden',
  boxShadow: `0 2px 10px $blackA7`,
}

const viewport: CSS = {
  backgroundColor: '$gray1',
  width: '100%',
  height: '100%',
  borderRadius: 'inherit',
}

const scrollbar: CSS = {
  display: 'flex',
  // ensures no selection
  userSelect: 'none',
  // disable browser handling of all panning and zooming gestures on touch devices
  touchAction: 'none',
  padding: 2,
  background: '$blackA6',
  transition: 'background 160ms ease-out',
  '&:hover': { background: '$blackA8' },
  '&[data-orientation="vertical"]': { width: SCROLLBAR_SIZE },
  '&[data-orientation="horizontal"]': {
    flexDirection: 'column',
    height: SCROLLBAR_SIZE,
  },
}

const thumb: CSS = {
  flex: 1,
  background: '$mauve10',
  borderRadius: SCROLLBAR_SIZE,
  // increase target size for touch devices https://www.w3.org/WAI/WCAG21/Understanding/target-size.html
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '100%',
    height: '100%',
    minWidth: 44,
    minHeight: 44,
  },
}

const corner: CSS = {
  background: '$blackA8',
}

export { corner, root, scrollbar, thumb, viewport }
