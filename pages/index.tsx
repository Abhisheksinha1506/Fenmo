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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from 'sonner';
import { AlertCircle, Loader2 } from 'lucide-react';

interface Expense {
    id: string;
    amount: string;
    category: string;
    description: string;
    date: string;
}

export default function Home() {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    // Form State
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState('');

    // Filter/Sort State
    const [filterCategory, setFilterCategory] = useState('');
    const [sortDesc, setSortDesc] = useState(true);

    // Derived State
    const [total, setTotal] = useState(0);
    const [categoryTotals, setCategoryTotals] = useState<Record<string, number>>({});

    // UI State
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchExpenses();
    }, [filterCategory, sortDesc]);

    const fetchExpenses = async () => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            if (filterCategory) params.append('category', filterCategory);
            if (sortDesc) params.append('sort', 'date_desc');

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
            setError(err.message || 'Something went wrong');
            toast.error('Failed to load expenses');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Basic frontend validation
        if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
            setError('Amount must be a positive number');
            toast.error('Invalid amount');
            return;
        }
        if (!category.trim()) {
            setError('Category is required');
            return;
        }
        if (!date) {
            setError('Date is required');
            return;
        }

        setSubmitting(true);

        try {
            const idempotencyKey = uuidv4();
            const res = await fetch('/api/expenses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount,
                    category: category.trim(),
                    description: description.trim(),
                    date,
                    idempotencyKey,
                }),
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || 'Failed to add expense');
            }

            // Success
            setAmount('');
            setCategory('');
            setDescription('');
            setDate('');
            toast.success('Expense added successfully');
            await fetchExpenses();
        } catch (err: any) {
            setError(err.message || 'Failed to save expense. Please try again.');
            toast.error(err.message || 'Failed to save expense');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground font-sans p-4 md:p-8">
            <Head>
                <title>Fenmo - Expense Tracker</title>
            </Head>

            <div className="max-w-4xl mx-auto space-y-8">
                <header className="flex justify-between items-center pb-6 border-b border-border">
                    <h1 className="text-3xl font-bold tracking-tight text-primary">Fenmo</h1>
                    <div className="text-right">
                        <p className="text-sm text-muted-foreground">Total Expenses</p>
                        <p className="text-2xl font-bold text-success font-mono">₹{total.toFixed(2)}</p>
                    </div>
                </header>

                {/* Input Form */}
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle>Add New Expense</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="amount">Amount (₹)</Label>
                                    <Input
                                        id="amount"
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        placeholder="0.00"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="category">Category</Label>
                                    <Input
                                        id="category"
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        placeholder="e.g. Food"
                                        required
                                    />
                                </div>
                                <div className="space-y-2 lg:col-span-2">
                                    <Label htmlFor="description">Description (Optional)</Label>
                                    <Input
                                        id="description"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="What was it for?"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="date">Date</Label>
                                    <Input
                                        id="date"
                                        type="date"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <Button type="submit" disabled={submitting} className="w-full md:w-auto">
                                {submitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : 'Add Expense'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {error && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription className="flex flex-col gap-2">
                            <p>{error}</p>
                            <Button variant="outline" size="sm" onClick={fetchExpenses} className="w-fit">
                                Retry
                            </Button>
                        </AlertDescription>
                    </Alert>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main List */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-muted/30 p-4 rounded-lg">
                            <div className="w-full sm:w-auto">
                                <Input
                                    placeholder="Filter by category..."
                                    value={filterCategory}
                                    onChange={(e) => setFilterCategory(e.target.value)}
                                    className="max-w-xs bg-background"
                                />
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="sort"
                                    checked={sortDesc}
                                    onCheckedChange={(checked) => setSortDesc(checked as boolean)}
                                />
                                <Label htmlFor="sort" className="cursor-pointer">Newest first</Label>
                            </div>
                        </div>

                        <div className="rounded-md border border-border bg-card">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[100px]">Amount</TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead className="hidden md:table-cell">Description</TableHead>
                                        <TableHead className="text-right">Date</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        Array.from({ length: 5 }).map((_, i) => (
                                            <TableRow key={i}>
                                                <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                                                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                                <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-32" /></TableCell>
                                                <TableCell className="text-right"><Skeleton className="h-4 w-24 ml-auto" /></TableCell>
                                            </TableRow>
                                        ))
                                    ) : expenses.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="h-24 text-center">
                                                No expenses found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        expenses.map((exp) => (
                                            <TableRow key={exp.id}>
                                                <TableCell className="font-medium font-mono">₹{exp.amount}</TableCell>
                                                <TableCell>
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary-foregroundish ring-1 ring-inset ring-primary/20">
                                                        {exp.category}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="hidden md:table-cell text-muted-foreground">{exp.description || '-'}</TableCell>
                                                <TableCell className="text-right text-muted-foreground font-mono text-xs">{exp.date}</TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>

                    {/* Sidebar Summary */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Spending by Category</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {Object.entries(categoryTotals).length > 0 ? (
                                    <div className="space-y-4">
                                        {Object.entries(categoryTotals)
                                            .sort(([, a], [, b]) => b - a)
                                            .map(([cat, sum]) => (
                                                <div key={cat} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded transition-colors">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-2 h-2 rounded-full bg-primary" />
                                                        <span className="font-medium">{cat}</span>
                                                    </div>
                                                    <span className="font-mono text-sm">₹{sum.toFixed(2)}</span>
                                                </div>
                                            ))
                                        }
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">No data available</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
