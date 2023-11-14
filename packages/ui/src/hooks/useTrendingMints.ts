import { paths, setParams } from "@reservoir0x/reservoir-sdk";
import { useMemo } from "react";
import { SWRInfiniteConfiguration } from "swr/infinite";
import { useInfiniteApi, useReservoirClient } from "./";

type TrendingMintsResponse =
  paths["/collections/trending-mints/v1"]["get"]["responses"]["200"]["schema"];

type TrendingMintsQuery =
  paths["/collections/trending-mints/v1"]["get"]["parameters"]["query"];

export default function (
  options?: TrendingMintsQuery | false,
  swrOptions: SWRInfiniteConfiguration = {},
  chainId?: number
) {
  const client = useReservoirClient();
  const chain =
    chainId !== undefined
      ? client?.chains.find((chain) => chain.id === chainId)
      : client?.currentChain();

  const response = useInfiniteApi<TrendingMintsResponse>(
    (pageIndex, previousPageData) => {
      if (!options) {
        return null;
      }

      const url = new URL(`${chain?.baseApiUrl}/collections/trending-mints/v1`);
      let query: TrendingMintsQuery = { ...options };

      setParams(url, query);
      return [url.href, client?.apiKey, client?.version];
    },
    {
      revalidateOnMount: true,
      revalidateFirstPage: false,
      ...swrOptions,
    }
  );

  const mints = useMemo(
    () => response.data?.flatMap((page) => page.mints || []) ?? [],
    [response.data]
  );

  return {
    ...response,
    data: mints,
  };
}
