import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Head from 'next/head';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
    Search,
    ArrowDownUp,
    IndianRupee,
    PieChart,
    Wallet,
    PlusCircle,
    Calendar,
    Clock
} from 'lucide-react';
import ExpenseForm from '@/components/ExpenseForm';
import ExpensesTable from '@/components/ExpensesTable';
import ExpenseSummary from '@/components/ExpenseSummary';
import ThemeToggle from '@/components/ThemeToggle';

interface Expense {
    id: string;
    amount: string;
    category: string;
    description: string;
    date: string;
}

export default function Home() {
    const [expenses, setExpenses] = useState<Expense[]>([]);

    // Filter/Sort State
    const [filterCategory, setFilterCategory] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    // sortMode: 'date' (Expense Date) | 'created' (Date Added/Newest First)
    const [sortMode, setSortMode] = useState<'date' | 'created'>('date');

    // Derived State
    const [total, setTotal] = useState(0);
    const [categoryTotals, setCategoryTotals] = useState<Record<string, number>>({});

    // UI State
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Debounce filter
    useEffect(() => {
        const timer = setTimeout(() => {
            setFilterCategory(searchTerm);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Fetch when filter (debounced) or sort changes
    useEffect(() => {
        fetchExpenses();
    }, [filterCategory, sortMode]);

    const fetchExpenses = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filterCategory) params.append('category', filterCategory);
            // ... rest of fetchExpenses
            if (sortMode === 'date') {
                params.append('sort', 'date_desc');
            } else {
                params.append('sort', 'created_desc'); // API defaults to created_desc if no sort param or distinct param
            }

            const res = await fetch(`/api/expenses?${params}`);
            if (!res.ok) throw new Error('Failed to fetch expenses');

            const data = await res.json();
            setExpenses(data);

            const sum = data.reduce((acc: number, exp: any) => acc + parseFloat(exp.amount), 0);
            setTotal(sum);

            const catTotals = data.reduce((acc: Record<string, number>, exp: any) => {
                const amt = parseFloat(exp.amount);
                acc[exp.category] = (acc[exp.category] || 0) + amt;
                return acc;
            }, {});
            setCategoryTotals(catTotals);
        } catch (err: any) {
            toast.error('Failed to load expenses');
        } finally {
            setLoading(false);
        }
    };

    const handleAddExpense = async (data: { amount: string; category: string; description: string; date: string }) => {
        setSubmitting(true);
        try {
            const idempotencyKey = uuidv4();
            const res = await fetch('/api/expenses', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Idempotency-Key': idempotencyKey
                },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || 'Failed to add expense');
            }

            toast.success('Expense added successfully');
            await fetchExpenses();
            await fetchExpenses();
        } catch (err: any) {
            console.error('Add expense error:', err);
            let msg = err.message || 'Failed to save expense';
            if (msg.includes('Failed to fetch') || msg.includes('NetworkError')) {
                msg = 'Network error. Please check your internet connection.';
            }
            toast.error(msg);
            throw err; // Re-throw to let form handle error state if needed
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Head>
                <title>Fenmo - Expense Tracker</title>
            </Head>

            <div className="max-w-6xl mx-auto px-4 py-8 md:px-6 md:py-12">
                {/* Header */}
                <div className="mb-8 space-y-2">
                    <h1 className="text-4xl font-bold tracking-tight flex items-center gap-3">
                        <Wallet className="h-10 w-10 text-primary" />
                        Expense Tracker
                    </h1>
                    <div className="flex items-center gap-4">
                        <p className="text-muted-foreground">Track and manage your personal expenses</p>
                        <div className="ml-auto">
                            <ThemeToggle />
                        </div>
                    </div>
                </div>

                {/* Add Expense Form */}
                <Card className="mb-8 border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <PlusCircle className="h-5 w-5" />
                            Add New Expense
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ExpenseForm
                            onSubmit={handleAddExpense}
                            isSubmitting={submitting}
                            error={null} // Error handling is mostly via toast now, but we could pass state if needed
                        />
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Expenses Section */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Filters */}
                        <Card className="border-border/50">
                            <CardContent className="pt-6">
                                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                                    <div className="relative flex-1 w-full sm:w-auto">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Filter by category..."
                                            value={searchTerm}
                                            onChange={(e) => {
                                                setSearchTerm(e.target.value);
                                                setLoading(true); // Show skeleton immediately while typing/debouncing
                                            }}
                                            className="pl-9 bg-muted/40 border-input"
                                        />
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-muted-foreground font-medium flex items-center gap-1">
                                                <ArrowDownUp className="h-3.5 w-3.5" />
                                                Sort by:
                                            </span>
                                            <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-lg">
                                                <button
                                                    onClick={() => setSortMode('created')}
                                                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${sortMode === 'created' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                                                >
                                                    Date Added
                                                </button>
                                                <button
                                                    onClick={() => setSortMode('date')}
                                                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${sortMode === 'date' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                                                >
                                                    Expense Date
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Expenses Table */}
                        <Card className="border-border/50">
                            <CardHeader>
                                <CardTitle>Recent Expenses</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="h-[400px] overflow-y-auto custom-scrollbar pr-2">
                                    <ExpensesTable
                                        expenses={expenses}
                                        loading={loading}
                                        onRetry={fetchExpenses}
                                        className="border-0"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar - Summary (Right Column) */}
                    <div className="space-y-6">
                        <ExpenseSummary
                            total={total}
                            categoryTotals={categoryTotals}
                            className="grid-cols-1 md:grid-cols-1" // Force vertical stack in sidebar
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
