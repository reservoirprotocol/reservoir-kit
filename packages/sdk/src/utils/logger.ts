export enum LogLevel {
  Verbose = 4,
  Info = 3,
  Warn = 2,
  Error = 1,
  None = 0,
}

export const log = (params: any[], level: LogLevel, currentLevel: LogLevel) => {
  if (currentLevel >= level) {
    const data = params.reduce((params, param, i) => {
      if ((i + 1) % 2) {
        params.push('\n')
      }
      params.push(param)
      return params
    }, [])
    switch (level) {
      case LogLevel.Info:
        console.info(...data)
        break
      case LogLevel.Error:
        console.error(...data)
        break
      case LogLevel.Warn:
        console.warn(...data)
        break
      default:
        console.log(...data)
        break
    }
  }
}
