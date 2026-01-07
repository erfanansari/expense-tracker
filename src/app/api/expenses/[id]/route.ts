import { NextResponse } from 'next/server';
import { db } from '@/core/database/client';
import { getCurrentUser } from '@/core/session/session';
import { type CreateExpenseInput } from '@/@types/expense';

// PUT /api/expenses/[id] - Update an expense
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get current user
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Validate ID
    if (!id || isNaN(Number(id))) {
      return NextResponse.json(
        { error: 'Invalid expense ID' },
        { status: 400 }
      );
    }

    // Check if expense belongs to user
    const existing = await db.execute({
      sql: 'SELECT id FROM expenses WHERE id = ? AND user_id = ?',
      args: [Number(id), user.userId]
    });

    if (existing.rows.length === 0) {
      return NextResponse.json(
        { error: 'Expense not found' },
        { status: 404 }
      );
    }

    const body = await request.json() as CreateExpenseInput;

    // Validate required fields
    if (!body.date || !body.category || !body.description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Update the expense
    await db.execute({
      sql: `UPDATE expenses
            SET date = ?, category = ?, description = ?, price_toman = ?, price_usd = ?
            WHERE id = ? AND user_id = ?`,
      args: [
        body.date,
        body.category,
        body.description,
        body.price_toman,
        body.price_usd,
        Number(id),
        user.userId
      ]
    });

    // Update tags - delete existing and insert new ones
    await db.execute({
      sql: 'DELETE FROM expense_tags WHERE expense_id = ?',
      args: [Number(id)]
    });

    if (body.tagIds && body.tagIds.length > 0) {
      for (const tagId of body.tagIds) {
        await db.execute({
          sql: 'INSERT INTO expense_tags (expense_id, tag_id) VALUES (?, ?)',
          args: [Number(id), tagId]
        });
      }
    }

    return NextResponse.json(
      { message: 'Expense updated successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Failed to update expense:', error);
    return NextResponse.json(
      { error: 'Failed to update expense' },
      { status: 500 }
    );
  }
}

// DELETE /api/expenses/[id] - Delete an expense
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get current user
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Validate ID
    if (!id || isNaN(Number(id))) {
      return NextResponse.json(
        { error: 'Invalid expense ID' },
        { status: 400 }
      );
    }

    // Delete the expense (only if it belongs to user)
    const result = await db.execute({
      sql: 'DELETE FROM expenses WHERE id = ? AND user_id = ?',
      args: [Number(id), user.userId]
    });

    if (result.rowsAffected === 0) {
      return NextResponse.json(
        { error: 'Expense not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Expense deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Failed to delete expense:', error);
    return NextResponse.json(
      { error: 'Failed to delete expense' },
      { status: 500 }
    );
  }
}
