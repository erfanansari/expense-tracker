export interface User {
  id: number;
  email: string;
  password: string;
  created_at: string;
}

export interface Session {
  userId: number;
  email: string;
}

/** Client-visible user shape returned by the auth API. */
export interface AuthUser {
  id: number;
  email: string;
  name: string | null;
  isDemo: boolean;
}
