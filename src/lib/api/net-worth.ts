import { apiFetch } from './client';

export interface NetWorthHistoryPoint {
  date: string;
  valueUsd: number;
  valueToman: number;
}

export interface NetWorthHistoryResponse {
  data: NetWorthHistoryPoint[];
}

export const fetchNetWorthHistory = (from: string, to: string) =>
  apiFetch<NetWorthHistoryResponse>(`/api/net-worth/history?from=${from}&to=${to}`);
