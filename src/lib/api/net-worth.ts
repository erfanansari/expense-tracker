import { apiFetch } from './client';

export interface NetWorthHistoryPoint {
  date: string;
  /** Net worth in the pivot currency (IRT). */
  value: number;
}

export interface NetWorthHistoryResponse {
  data: NetWorthHistoryPoint[];
}

export const fetchNetWorthHistory = (from: string, to: string) =>
  apiFetch<NetWorthHistoryResponse>(`/api/net-worth/history?from=${from}&to=${to}`);
