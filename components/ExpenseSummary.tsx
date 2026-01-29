import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { IndianRupee, PieChart, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExpenseSummaryProps {
    total: number;
    categoryTotals: Record<string, number>;
    className?: string; // For layout flexibility
}

export default function ExpenseSummary({ total, categoryTotals, className }: ExpenseSummaryProps) {
    return (
        <div className={cn("grid grid-cols-1 md:grid-cols-2 gap-6", className)}>

            {/* Total Card */}
            <Card className="border-border/50 bg-gradient-to-br from-card to-card/50 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <IndianRupee className="h-4 w-4" />
                        Total Expenses
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-emerald-400 font-mono flex items-center">
                            <IndianRupee className="h-6 w-6 mr-1" />
                            {total.toFixed(2)}
                        </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 opacity-80">
                        Current view (after filters)
                    </p>
                </CardContent>
            </Card>

            {/* Spending by Category */}
            <Card className="border-border/50 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <PieChart className="h-5 w-5 text-primary" />
                        Spending by Category
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {Object.entries(categoryTotals).length > 0 ? (
                        <div className="max-h-[300px] overflow-y-auto custom-scrollbar pr-2 space-y-4">
                            {Object.entries(categoryTotals)
                                .sort(([, a], [, b]) => b - a)
                                .map(([cat, sum], index) => {
                                    const percentage = (sum / total) * 100;
                                    // Show 1 decimal for small percentages, 0 decimals for large ones
                                    const displayPercentage = percentage >= 1
                                        ? percentage.toFixed(0)
                                        : percentage.toFixed(1);
                                    // Dynamic simple color assignment based on index for variety
                                    // In a real app, use a proper palette or hash function
                                    const barColorClass = [
                                        'bg-primary',
                                        'bg-blue-400',
                                        'bg-indigo-400',
                                        'bg-sky-400',
                                        'bg-cyan-400',
                                        'bg-teal-400'
                                    ][index % 6];

                                    return (
                                        <div key={cat} className="space-y-1.5">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="font-semibold text-foreground/90">{cat}</span>
                                                <span className="font-mono text-muted-foreground">₹{sum.toFixed(2)}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                                    <div
                                                        className={cn("h-full rounded-full transition-all duration-500 ease-out", barColorClass)}
                                                        style={{ width: `${Math.max(percentage, 0.5)}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs font-medium text-muted-foreground w-10 text-right">{displayPercentage}%</span>
                                            </div>
                                        </div>
                                    );
                                })
                            }
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-6 text-center text-muted-foreground opacity-60">
                            <p className="text-sm">No data available for charts.</p>
                        </div>
                    )}
                </CardContent>
            </Card>

        </div>
    );
}
