import type { QueryFunctionContext } from '@tanstack/react-query';
import { z, ZodError } from 'zod';

import { ApiError, ValidationError } from '@core/errors';

import type { EndpointOptions } from './@types';
import { triggerUnauthorized } from './auth-handler';

interface CallerContext {
  signal?: AbortSignal;
  pageParam?: unknown;
}

class EndpointCaller<Data, Response> {
  private readonly options: EndpointOptions<Data, Response>;

  constructor(options: EndpointOptions<Data, Response>) {
    this.options = options;
  }

  /** Arrays are joined with ',' (e.g. tagIds=1,2,3); null/undefined values are skipped. */
  private static buildSearchParams(data: Record<string, unknown>): string {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(data)) {
      if (value === undefined || value === null) continue;
      if (Array.isArray(value)) {
        if (value.length > 0) params.set(key, value.join(','));
      } else {
        params.set(key, String(value));
      }
    }
    const queryString = params.toString();
    return queryString ? `?${queryString}` : '';
  }

  private async caller(callData?: Data, { signal, pageParam }: CallerContext = {}): Promise<Response> {
    let validationStage: 'requestDataSchema' | 'responseSchema' = 'requestDataSchema';
    const {
      url,
      method = 'POST',
      requestDataSchema,
      requestNormalizer,
      responseSchema,
      responseNormalizer,
      omitFromBody,
      pageParamName,
      skipUnauthorizedHandling = false,
    } = this.options;

    try {
      let finalData = callData;
      if (requestDataSchema && finalData !== undefined) {
        finalData = requestDataSchema.parse(finalData);
      }

      let payload: Record<string, unknown> | undefined;
      if (requestNormalizer) {
        payload = requestNormalizer(finalData as Data);
      } else if (finalData !== undefined) {
        payload = { ...(finalData as Record<string, unknown>) };
      }

      if (payload && omitFromBody) {
        for (const key of omitFromBody) delete payload[key as string];
        if (Object.keys(payload).length === 0) payload = undefined;
      }

      if (pageParamName && pageParam !== undefined && pageParam !== null) {
        payload = { ...payload, [pageParamName]: pageParam };
      }

      let finalUrl = typeof url === 'function' ? url(callData as Data) : url;

      const requestInit: RequestInit = { method, signal };
      if (method === 'GET') {
        if (payload) finalUrl += EndpointCaller.buildSearchParams(payload);
      } else if (payload !== undefined) {
        requestInit.headers = { 'Content-Type': 'application/json' };
        requestInit.body = JSON.stringify(payload);
      }

      const response = await fetch(finalUrl, requestInit);
      const json: unknown = await response.json().catch(() => undefined);

      if (!response.ok) {
        if (response.status === 401 && !skipUnauthorizedHandling) triggerUnauthorized();
        // Our routes return { error }, Better Auth returns { message, code }
        let message = 'Request failed';
        if (json && typeof json === 'object') {
          if ('error' in json && typeof json.error === 'string') message = json.error;
          else if ('message' in json && typeof json.message === 'string') message = json.message;
        }
        throw new ApiError(message, response.status);
      }

      let finalResponse = json as Response;
      if (responseNormalizer) {
        finalResponse = responseNormalizer(finalResponse, callData);
      }

      if (responseSchema) {
        validationStage = 'responseSchema';
        finalResponse = responseSchema.parse(finalResponse);
      }

      return finalResponse;
    } catch (error) {
      if (error instanceof ZodError) {
        throw new ValidationError(`The ${validationStage} is not valid.`, validationStage, [z.prettifyError(error)]);
      }
      throw error;
    }
  }

  callQuery(context: QueryFunctionContext): Promise<Response> {
    const { queryKey, signal } = context;
    let queryData: Data | undefined;

    if (Array.isArray(queryKey) && queryKey.length > 0) {
      const lastQueryKeyValue = queryKey[queryKey.length - 1];
      if (typeof lastQueryKeyValue === 'object' && lastQueryKeyValue !== null) {
        queryData = lastQueryKeyValue as Data;
      }
    }

    return this.caller(queryData, { signal, pageParam: 'pageParam' in context ? context.pageParam : undefined });
  }

  callMutation(mutationData?: Data): Promise<Response> {
    return this.caller(mutationData);
  }
}

export default EndpointCaller;
