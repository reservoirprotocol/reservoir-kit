import { paths, setParams } from '@reservoir0x/reservoir-sdk'
import { SWRInfiniteConfiguration } from 'swr/infinite'
import { useInfiniteApi, useReservoirClient } from './'

type TokenActivityQuery =
  paths['/tokens/{token}/activity/v4']['get']['parameters']
type TokenActivityResponse =
  paths['/tokens/{token}/activity/v4']['get']['responses']['200']['schema']

export default function (options: TokenActivityQuery | false): void {
  const client = useReservoirClient()
}
