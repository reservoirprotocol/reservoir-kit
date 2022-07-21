const debounce = (func: any, timeout = 300) => {
  let timer: NodeJS.Timeout | null
  return (...args: any) => {
    clearTimeout(timer as NodeJS.Timeout)
    timer = setTimeout(() => {
      func.apply(this, args)
    }, timeout)
  }
}
export default debounce
