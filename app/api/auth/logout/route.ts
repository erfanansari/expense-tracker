import { NextResponse } from 'next/server';

const TOKEN_COOKIE_NAME = 'auth_token';

export async function POST() {
  try {
    // Build cookie string to delete the cookie (Max-Age=0)
    const cookieParts = [
      `${TOKEN_COOKIE_NAME}=`,
      `Path=/`,
      `Max-Age=0`,
      `HttpOnly`,
      `SameSite=Lax`,
    ];
    const cookieString = cookieParts.join('; ');

    return new NextResponse(
      JSON.stringify({ message: 'Logged out successfully' }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Set-Cookie': cookieString,
        },
      }
    );
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
