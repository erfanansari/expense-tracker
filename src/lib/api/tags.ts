import type { Tag, TagWithUsage } from '@/@types/expense';

export async function fetchTags(): Promise<Tag[]> {
  const response = await fetch('/api/tags');
  if (!response.ok) throw new Error('Failed to load tags');
  return response.json();
}

export async function fetchTagsWithUsage(): Promise<TagWithUsage[]> {
  const response = await fetch('/api/tags?includeUsage=true');
  if (!response.ok) throw new Error('Failed to load tags');
  return response.json();
}

export async function createTag(name: string): Promise<Tag> {
  const response = await fetch('/api/tags', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
  const json = await response.json();
  if (!response.ok) throw new Error(json.error || 'Failed to create tag');
  return json;
}

export async function updateTag(id: number, name: string): Promise<Tag> {
  const response = await fetch(`/api/tags/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
  const json = await response.json();
  if (!response.ok) throw new Error(json.error || 'Failed to update tag');
  return json;
}

export async function deleteTag(id: number): Promise<{ success: boolean; usageCount: number }> {
  const response = await fetch(`/api/tags/${id}`, { method: 'DELETE' });
  const json = await response.json();
  if (!response.ok) throw new Error(json.error || 'Failed to delete tag');
  return json;
}
