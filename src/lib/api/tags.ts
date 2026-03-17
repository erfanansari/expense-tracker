import type { Tag, TagWithUsage } from '@/@types/expense';

import { apiFetch, apiMutate } from './client';

export const fetchTags = () => apiFetch<Tag[]>('/api/tags');

export const fetchTagsWithUsage = () => apiFetch<TagWithUsage[]>('/api/tags?includeUsage=true');

export const createTag = (name: string) => apiMutate<Tag>('/api/tags', 'POST', { name });

export const updateTag = (id: number, name: string) => apiMutate<Tag>(`/api/tags/${id}`, 'PUT', { name });

export const deleteTag = (id: number) =>
  apiMutate<{ success: boolean; usageCount: number }>(`/api/tags/${id}`, 'DELETE');
