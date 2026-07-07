import type { EndpointOptions, MutationKeyGenerator, QueryKeyGenerator } from './@types';
import EndpointCaller from './endpoint-caller';
import getQueryClient from './get-query-client';

export class Client {
  private static getEndpointKeyStringEntries(key: unknown[]) {
    return key.filter((keyPart) => typeof keyPart === 'string');
  }

  registerEndpoint<Data, Response = void>(
    keyGenerator: QueryKeyGenerator<Data> | MutationKeyGenerator,
    options: EndpointOptions<Data, Response>
  ): void {
    const generalKey = keyGenerator(null as unknown as Data);
    const queryClient = getQueryClient();
    const endpointKeyStringEntries = Client.getEndpointKeyStringEntries(generalKey);
    const endpointCaller = new EndpointCaller<Data, Response>(options);

    if (options.type === 'mutation') {
      queryClient.setMutationDefaults(endpointKeyStringEntries, {
        mutationFn: (variables?: Data) => {
          return endpointCaller.callMutation(variables);
        },
      });
    } else {
      queryClient.setQueryDefaults(endpointKeyStringEntries, {
        queryFn: (queryContext) => {
          return endpointCaller.callQuery(queryContext);
        },
        ...(options.staleTime !== undefined && { staleTime: options.staleTime }),
        ...(options.refetchOnWindowFocus !== undefined && {
          refetchOnWindowFocus: options.refetchOnWindowFocus,
        }),
      });
    }
  }
}

const client = new Client();
export default client;
