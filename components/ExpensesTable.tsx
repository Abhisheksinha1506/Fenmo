import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { IndianRupee, Layers } from 'lucide-react';
import { cn } from '@/lib/utils'; // Assumed from shadcn/ui

interface Expense {
    id: string;
    amount: string;
    category: string;
    description?: string;
    date: string;
}

interface ExpensesTableProps {
    expenses: Expense[];
    loading: boolean;
    onRetry?: () => void;
    className?: string; // Optional for added flexibility
}

export default function ExpensesTable({
    expenses,
    loading,
    onRetry,
    className,
}: ExpensesTableProps) {
    if (loading) {
        return (
            <div className={cn("rounded-md border border-border bg-card", className)}>
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                            <TableHead className="w-[120px] text-xs uppercase text-muted-foreground">Amount</TableHead>
                            <TableHead className="text-xs uppercase text-muted-foreground">Category</TableHead>
                            <TableHead className="hidden md:table-cell text-xs uppercase text-muted-foreground">Description</TableHead>
                            <TableHead className="text-right text-xs uppercase text-muted-foreground">Date</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {Array.from({ length: 5 }).map((_, i) => (
                            <TableRow key={i} className="border-border">
                                <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-40" /></TableCell>
                                <TableCell className="text-right"><Skeleton className="h-5 w-20 ml-auto" /></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        );
    }

    if (expenses.length === 0) {
        return (
            <div className={cn("rounded-md border border-border bg-card p-12 text-center", className)}>
                <div className="flex flex-col items-center justify-center space-y-3 text-muted-foreground">
                    <div className="rounded-full bg-muted/50 p-3">
                        <Layers className="h-6 w-6 opacity-50" />
                    </div>
                    <p>No expenses found.</p>
                    {onRetry && (
                        <Button variant="link" onClick={onRetry} className="text-primary h-auto p-0">
                            Refresh
                        </Button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className={cn("rounded-md border border-border bg-card", className)}>
            <Table>
                <TableHeader className="bg-muted/50">
                    <TableRow className="border-border hover:bg-muted/50">
                        <TableHead className="w-[120px] text-xs font-semibold uppercase tracking-wider text-muted-foreground">Amount</TableHead>
                        <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Category</TableHead>
                        <TableHead className="hidden md:table-cell text-xs font-semibold uppercase tracking-wider text-muted-foreground">Description</TableHead>
                        <TableHead className="text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Date</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {expenses.map((exp) => (
                        <TableRow
                            key={exp.id}
                            className="border-border transition-colors hover:bg-muted/60"
                        >
                            <TableCell className="font-mono font-bold text-emerald-500 whitespace-nowrap">
                                ₹{exp.amount}
                            </TableCell>
                            <TableCell>
                                <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary ring-1 ring-inset ring-primary/20">
                                    {exp.category}
                                </span>
                            </TableCell>
                            <TableCell className="hidden max-w-[200px] truncate text-muted-foreground md:table-cell">
                                {exp.description || '-'}
                            </TableCell>
                            <TableCell className="whitespace-nowrap text-right font-mono text-xs text-muted-foreground">
                                {new Date(exp.date).toLocaleDateString('en-IN', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                })}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
