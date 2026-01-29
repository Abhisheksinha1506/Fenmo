import { createClient } from '@supabase/supabase-js';
import type { NextApiRequest, NextApiResponse } from 'next';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl!, supabaseKey!);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    // 1. Extract idempotency key from header
    const idempotencyKey = req.headers['idempotency-key'] as string;
    const { amount, category, description, date } = req.body;

    // Validation
    if (!idempotencyKey) return res.status(400).json({ error: 'Missing Idempotency-Key header' });

    // Parse amount to paise (integers)
    const amountFloat = parseFloat(amount);
    if (isNaN(amountFloat) || amountFloat <= 0) {
      return res.status(400).json({ error: 'Amount must be a positive number' });
    }
    const amountPaise = Math.round(amountFloat * 100);

    if (!category || typeof category !== 'string' || !category.trim()) {
      return res.status(400).json({ error: 'Category is required' });
    }

    if (!date || isNaN(new Date(date).getTime())) {
      return res.status(400).json({ error: 'Valid date is required' });
    }

    if (description && description.length > 500) {
      return res.status(400).json({ error: 'Description too long (max 500 characters)' });
    }

    try {
      // 2. Check if this key was already processed
      const { data: existingKey } = await supabase
        .from('idempotency_keys')
        .select('expense_id')
        .eq('key', idempotencyKey)
        .single();

      if (existingKey) {
        // Key exists - return the original expense
        const { data: existingExpense, error: fetchError } = await supabase
          .from('expenses')
          .select('*')
          .eq('id', existingKey.expense_id)
          .single();

        if (fetchError) throw fetchError;

        // Transform amount back to rupees string for consistency
        const expenseFormatted = {
          ...existingExpense,
          amount: (existingExpense.amount_paise / 100).toFixed(2)
        };

        return res.status(200).json(expenseFormatted);
      }

      // 3. New request - create expense
      const { data: newExpense, error: insertError } = await supabase.from('expenses').insert({
        amount_paise: amountPaise,
        category: category.trim(),
        description: description ? description.trim() : null,
        date,
      }).select('id, amount_paise, category, description, date, created_at').single();

      if (insertError) throw insertError;

      // 4. Save idempotency key
      const { error: keyError } = await supabase
        .from('idempotency_keys')
        .insert({
          key: idempotencyKey,
          expense_id: newExpense.id
        });

      if (keyError) {
        // In a real system, we might want to rollback the expense creation here
        console.error('Failed to save idempotency key:', keyError);
        // For now, we proceed as the expense was created
      }

      // Transform response
      const responseData = {
        ...newExpense,
        amount: (newExpense.amount_paise / 100).toFixed(2)
      };

      return res.status(201).json(responseData);
    } catch (error: any) {
      console.error('Error creating expense:', error);
      return res.status(500).json({ error: error.message || 'Failed to create expense' });
    }
  } else if (req.method === 'GET') {
    const { category, sort } = req.query;

    let query = supabase.from('expenses').select('*');

    if (category && typeof category === 'string' && category.trim()) {
      // Use ilike for case-insensitive partial match
      query = query.ilike('category', `%${category.trim()}%`);
    }

    if (sort === 'date_desc') {
      query = query.order('date', { ascending: false });
    } else {
      // Default sort by created_at desc if not otherwise specified
      query = query.order('created_at', { ascending: false });
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching expenses:', error);
      return res.status(500).json({ error: 'Failed to fetch expenses' });
    }

    // Transform amount back to rupees string
    const expenses = data.map((exp: any) => ({
      ...exp,
      amount: (exp.amount_paise / 100).toFixed(2)
    }));

    return res.status(200).json(expenses);
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
