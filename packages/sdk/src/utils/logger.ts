export enum LogLevel {
  Verbose = 4,
  Info = 3,
  Warn = 2,
  Error = 1,
  None = 0,
}

export const log = (
  params: Parameters<typeof console.log>,
  level: LogLevel,
  currentLevel: LogLevel
) => {
  if (currentLevel >= level) {
    switch (level) {
      case LogLevel.Info:
        console.info(...params)
        break
      case LogLevel.Error:
        console.error(...params)
        break
      case LogLevel.Warn:
        console.warn(...params)
        break
      default:
        console.log(...params)
        break
    }
  }
}
