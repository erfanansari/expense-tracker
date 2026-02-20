export async function updateUserProfile(name: string): Promise<{ name: string }> {
  const response = await fetch('/api/user/profile', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
  const json = await response.json();
  if (!response.ok) throw new Error(json.error || 'Failed to update profile');
  return json;
}
