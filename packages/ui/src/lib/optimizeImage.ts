const optimizeImage = (
  imageHref: string | undefined,
  // innerWidth: any,
  // obj: { sm: number; md: number; lg: number; xl: number; '2xl': number }
  width: number
) => {
  if (!imageHref) return ''

  // const w =
  //   innerWidth < 639
  //     ? obj.sm
  //     : innerWidth < 767
  //     ? obj.md
  //     : innerWidth < 1023
  //     ? obj.lg
  //     : innerWidth < 1279
  //     ? obj.xl
  //     : obj['2xl']

  let url = new URL(imageHref)
  // Optimize google images
  if (url.host === 'lh3.googleusercontent.com') {
    if (imageHref.includes('=s') || imageHref.includes('=w')) {
      let newImage = imageHref.split('=')
      return `${newImage[0]}=w${width}`
    }
    return `${imageHref}=w${width}`
  }
  return imageHref
}
export default optimizeImage
