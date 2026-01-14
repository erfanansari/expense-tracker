import { NextResponse } from 'next/server';

import type { Income, UpdateIncomeInput } from '@/@types/income';
import { INCOME_TYPES } from '@/constants/income';
import { db } from '@/core/database/client';
import { getCurrentUser } from '@/core/session/session';

// GET /api/incomes/[id] - Get a single income entry
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    if (!id || isNaN(Number(id))) {
      return NextResponse.json({ error: 'Invalid income ID' }, { status: 400 });
    }

    const result = await db.execute({
      sql: 'SELECT * FROM incomes WHERE id = ? AND userId = ?',
      args: [Number(id), user.userId],
    });

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Income not found' }, { status: 404 });
    }

    const row = result.rows[0];
    const income: Income = {
      id: row.id as number,
      userId: row.userId as number,
      amountUsd: row.amountUsd as number,
      amountToman: row.amountToman as number,
      exchangeRateUsed: row.exchangeRateUsed as number,
      month: row.month as number,
      year: row.year as number,
      incomeType: row.incomeType as Income['incomeType'],
      source: row.source as string | null,
      notes: row.notes as string | null,
      createdAt: row.createdAt as string,
      updatedAt: row.updatedAt as string,
    };

    return NextResponse.json(income);
  } catch (error) {
    console.error('[Incomes] Failed to fetch:', error);
    return NextResponse.json({ error: 'Failed to fetch income' }, { status: 500 });
  }
}

// PUT /api/incomes/[id] - Update an income entry
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    if (!id || isNaN(Number(id))) {
      return NextResponse.json({ error: 'Invalid income ID' }, { status: 400 });
    }

    // Check if income belongs to user
    const existing = await db.execute({
      sql: 'SELECT id FROM incomes WHERE id = ? AND userId = ?',
      args: [Number(id), user.userId],
    });

    if (existing.rows.length === 0) {
      return NextResponse.json({ error: 'Income not found' }, { status: 404 });
    }

    const body: UpdateIncomeInput = await request.json();

    // Build dynamic update query based on provided fields
    const updates: string[] = [];
    const args: (string | number | null)[] = [];

    if (body.amountUsd !== undefined) {
      updates.push('amountUsd = ?');
      args.push(body.amountUsd);
    }
    if (body.amountToman !== undefined) {
      updates.push('amountToman = ?');
      args.push(body.amountToman);
    }
    if (body.exchangeRateUsed !== undefined) {
      updates.push('exchangeRateUsed = ?');
      args.push(body.exchangeRateUsed);
    }
    if (body.month !== undefined) {
      if (body.month < 1 || body.month > 12) {
        return NextResponse.json({ error: 'Month must be between 1 and 12' }, { status: 400 });
      }
      updates.push('month = ?');
      args.push(body.month);
    }
    if (body.year !== undefined) {
      updates.push('year = ?');
      args.push(body.year);
    }
    if (body.incomeType !== undefined) {
      const validTypes = INCOME_TYPES.map((t) => t.value);
      if (!validTypes.includes(body.incomeType)) {
        return NextResponse.json({ error: 'Invalid income type' }, { status: 400 });
      }
      updates.push('incomeType = ?');
      args.push(body.incomeType);
    }
    if (body.source !== undefined) {
      updates.push('source = ?');
      args.push(body.source || null);
    }
    if (body.notes !== undefined) {
      updates.push('notes = ?');
      args.push(body.notes || null);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    updates.push('updatedAt = CURRENT_TIMESTAMP');
    args.push(Number(id), user.userId);

    await db.execute({
      sql: `UPDATE incomes SET ${updates.join(', ')} WHERE id = ? AND userId = ?`,
      args,
    });

    return NextResponse.json({ message: 'Income updated successfully' });
  } catch (error) {
    console.error('[Incomes] Failed to update:', error);
    return NextResponse.json({ error: 'Failed to update income' }, { status: 500 });
  }
}

// DELETE /api/incomes/[id] - Delete an income entry
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    if (!id || isNaN(Number(id))) {
      return NextResponse.json({ error: 'Invalid income ID' }, { status: 400 });
    }

    const result = await db.execute({
      sql: 'DELETE FROM incomes WHERE id = ? AND userId = ?',
      args: [Number(id), user.userId],
    });

    if (result.rowsAffected === 0) {
      return NextResponse.json({ error: 'Income not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Income deleted successfully' });
  } catch (error) {
    console.error('[Incomes] Failed to delete:', error);
    return NextResponse.json({ error: 'Failed to delete income' }, { status: 500 });
  }
}
