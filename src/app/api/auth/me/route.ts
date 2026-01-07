import { NextResponse } from 'next/server';
import { getSession, deleteSession } from '@/core/session/session';

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { user: null },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { user: { id: session.userId, email: session.email } },
      { status: 200 }
    );
  } catch {
    // Token invalid or expired - clear cookie
    await deleteSession();
    return NextResponse.json(
      { user: null },
      { status: 200 }
    );
  }
}
