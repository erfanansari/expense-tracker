import { apiMutate } from './client';

export const updateUserProfile = (name: string) => apiMutate<{ name: string }>('/api/user/profile', 'PUT', { name });
