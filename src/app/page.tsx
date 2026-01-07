// Root page - middleware handles redirect to /login or /dashboard based on auth state
// This page should never actually render since middleware redirects first
export default function Home() {
  return null;
}
