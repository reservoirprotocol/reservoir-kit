import { paths } from '../types'
import { encodeFunctionData, SimulateContractReturnType } from 'viem'

type CallBody = NonNullable<
  paths['/execute/call/v1']['post']['parameters']['body']['body']
>

export default function prepareCallTransaction(
  request: Awaited<SimulateContractReturnType>['request']
): CallBody['txs'][0] {
  const { abi, functionName, args } = request
  const data = encodeFunctionData({ abi, functionName, args })
  return {
    to: request.address,
    value: request?.value?.toString() ?? '0',
    data: data,
  }
}
