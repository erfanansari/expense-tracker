import type { z } from 'zod';

export type EndpointMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface EndpointOptions<Data, Response> {
  method?: EndpointMethod;
  /** Keys consumed by a `url` function (e.g. `id`) that must not be sent in the body/search params. */
  omitFromBody?: (keyof Data)[];
  /** Name of the search param that receives React Query's `pageParam` for infinite queries. */
  pageParamName?: string;
  requestDataSchema?: z.ZodType<Data>;
  responseNormalizer?: (response: Response, data?: Data) => Response;
  responseSchema?: z.ZodType<Response>;
  /**
   * 401s from this endpoint are surfaced to the caller (e.g. wrong login password)
   * instead of triggering the global signed-out toast/redirect.
   */
  skipUnauthorizedHandling?: boolean;
  /** Per-endpoint query defaults, spread into setQueryDefaults. */
  staleTime?: number;
  refetchOnWindowFocus?: boolean;
  type?: 'query' | 'mutation';
  url: string | ((data: Data) => string);
}

type QueryKeyGeneratorReturn<Data = void> = Data extends void ? [...string[]] : [...string[], Data];

export interface QueryKeyGenerator<Data = void> {
  (data: Data): QueryKeyGeneratorReturn<Data>;
}

export interface MutationKeyGenerator {
  (): string[];
}
