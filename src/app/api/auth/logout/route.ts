import { NextResponse } from 'next/server';

import { deleteSession } from '@core/session/session';

export async function POST() {
  try {
    await deleteSession();

    return NextResponse.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
