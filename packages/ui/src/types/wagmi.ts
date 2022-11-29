import { useBalance } from 'wagmi'

export type UseBalanceToken = NonNullable<
  Parameters<typeof useBalance>['0']
>['token']
