import { reservoirChains } from "packages/sdk/dist";
import { erc1155ABI } from "packages/ui/src/constants/abis";
import { Abi, Address, ContractFunctionConfig, GetValue, SimulateContractParameters } from "viem";
import { mainnet } from "viem/chains";

export type PrepareCustomRequestParameters<
  TAbi extends Abi | readonly unknown[] = Abi,
  TFunctionName extends string = any,
  TPrice = string,
  TArgs = any
> = ContractFunctionConfig<TAbi, TFunctionName> &
  GetValue<
    TAbi,
    TFunctionName
  >  & {
    price: TPrice
    args: TArgs
  }

export function prepareCustomRequest<
const TAbi extends Abi | readonly unknown[],
TFunctionName extends string,
TPrice extends string,
TArgs extends any
>(args: PrepareCustomRequestParameters<
  TAbi,
  TFunctionName,
  TPrice,
  TArgs
>): SimulateContractParameters<TAbi> {
  const chain = mainnet
  const {abi, address, functionName, price, args: functionArgs} = args
  return {
    abi,
    address,
    account: "" as Address,
    functionName,
    value: BigInt(price),
    args: functionArgs,
    chain,
    dataSuffix: "0x",
  } as SimulateContractParameters<TAbi>
}
// ;
//   price: "1700000000000000",
//   address: "0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2",
//   abi: erc1155ABI,
//   functionName: "safeBatchTransferFrom",
//   args: ["0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2", "0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2", [BigInt(10)], [BigInt(10)], "0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2"]
// })