import { paths, setParams } from "@reservoir0x/reservoir-sdk";
import { useMemo } from "react";
import { SWRInfiniteConfiguration } from "swr/infinite";
import { useInfiniteApi, useReservoirClient } from ".";

type TrendingCollectionsResponse =
  paths["/collections/trending/v1"]["get"]["responses"]["200"]["schema"];

type TrendingCollectionsQuery =
  paths["/collections/trending/v1"]["get"]["parameters"]["query"];

export default function (
  options?: TrendingCollectionsQuery | false,
  swrOptions: SWRInfiniteConfiguration = {},
  chainId?: number
) {
  const client = useReservoirClient();
  const chain =
    chainId !== undefined
      ? client?.chains.find((chain) => chain.id === chainId)
      : client?.currentChain();

  const response = useInfiniteApi<TrendingCollectionsResponse>(
    (pageIndex, previousPageData) => {
      if (!options) {
        return null;
      }

      const url = new URL(`${chain?.baseApiUrl}/tokens/v6`);
      let query: TrendingCollectionsQuery = { ...options };

      if (
        query.normalizeRoyalties === undefined &&
        client?.normalizeRoyalties !== undefined
      ) {
        query.normalizeRoyalties = client.normalizeRoyalties;
      }

      setParams(url, query);
      return [url.href, client?.apiKey, client?.version];
    },
    {
      revalidateOnMount: true,
      revalidateFirstPage: false,
      ...swrOptions,
    }
  );

  const collections = useMemo(
    () => response.data?.flatMap((page) => page.collections || []) ?? [],
    [response.data]
  );

  return {
    ...response,
    data: collections,
  };
}
