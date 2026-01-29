import { useState, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, PlusCircle, Loader2, IndianRupee } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExpenseFormProps {
    onSubmit: (data: {
        amount: string;
        category: string;
        description: string;
        date: string;
    }) => void | Promise<void>;
    isSubmitting: boolean;
    error: string | null;
}

export default function ExpenseForm({ onSubmit, isSubmitting, error }: ExpenseFormProps) {
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState('');
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    const validateForm = () => {
        const errors: Record<string, string> = {};

        if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
            errors.amount = 'Amount must be a positive number';
        }
        if (!category.trim()) {
            errors.category = 'Category is required';
        }
        if (!date) {
            errors.date = 'Date is required';
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        await onSubmit({
            amount,
            category: category.trim(),
            description: description.trim(),
            date,
        });

        // Clear form on successful submit (only if no error)
        if (!error) {
            setAmount('');
            setCategory('');
            setDescription('');
            setDate('');
            setFieldErrors({});
        }
    };

    return (
        <div className="space-y-4">
            {/* Error Banner */}
            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Amount Field */}
                    <div className="space-y-2">
                        <Label
                            htmlFor="amount"
                            className={cn(
                                "flex items-center gap-1.5",
                                fieldErrors.amount && "text-destructive"
                            )}
                        >
                            <IndianRupee className="h-3.5 w-3.5" />
                            Amount
                        </Label>
                        <Input
                            id="amount"
                            type="number"
                            step="0.01"
                            min="0.01"
                            value={amount}
                            onChange={(e) => {
                                setAmount(e.target.value);
                                if (fieldErrors.amount) {
                                    setFieldErrors({ ...fieldErrors, amount: '' });
                                }
                            }}
                            placeholder="Amount (₹)"
                            className={cn(
                                "bg-muted/40 border-input focus:border-primary focus:ring-primary/30",
                                fieldErrors.amount && "border-destructive focus:border-destructive focus:ring-destructive/30"
                            )}
                            disabled={isSubmitting}
                            required
                        />
                        {fieldErrors.amount && (
                            <p className="text-sm text-destructive">{fieldErrors.amount}</p>
                        )}
                    </div>

                    {/* Category Field */}
                    <div className="space-y-2">
                        <Label
                            htmlFor="category"
                            className={cn(fieldErrors.category && "text-destructive")}
                        >
                            Category
                        </Label>
                        <Input
                            id="category"
                            type="text"
                            value={category}
                            onChange={(e) => {
                                setCategory(e.target.value);
                                if (fieldErrors.category) {
                                    setFieldErrors({ ...fieldErrors, category: '' });
                                }
                            }}
                            placeholder="Category (e.g. Food, Travel)"
                            className={cn(
                                "bg-muted/40 border-input focus:border-primary focus:ring-primary/30",
                                fieldErrors.category && "border-destructive focus:border-destructive focus:ring-destructive/30"
                            )}
                            disabled={isSubmitting}
                            required
                        />
                        {fieldErrors.category && (
                            <p className="text-sm text-destructive">{fieldErrors.category}</p>
                        )}
                    </div>

                    {/* Description Field */}
                    <div className="space-y-2 lg:col-span-2">
                        <Label htmlFor="description">Description (Optional)</Label>
                        <Input
                            id="description"
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Description (optional)"
                            className="bg-muted/40 border-input focus:border-primary focus:ring-primary/30"
                            disabled={isSubmitting}
                        />
                    </div>

                    {/* Date Field */}
                    <div className="space-y-2">
                        <Label
                            htmlFor="date"
                            className={cn(fieldErrors.date && "text-destructive")}
                        >
                            Date
                        </Label>
                        <Input
                            id="date"
                            type="date"
                            value={date}
                            onChange={(e) => {
                                setDate(e.target.value);
                                if (fieldErrors.date) {
                                    setFieldErrors({ ...fieldErrors, date: '' });
                                }
                            }}
                            className={cn(
                                "bg-muted/40 border-input focus:border-primary focus:ring-primary/30",
                                fieldErrors.date && "border-destructive focus:border-destructive focus:ring-destructive/30"
                            )}
                            disabled={isSubmitting}
                            required
                        />
                        {fieldErrors.date && (
                            <p className="text-sm text-destructive">{fieldErrors.date}</p>
                        )}
                    </div>
                </div>

                {/* Submit Button */}
                <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full md:w-auto bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add Expense
                        </>
                    )}
                </Button>
            </form>
        </div>
    );
}
