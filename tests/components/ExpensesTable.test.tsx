import React from 'react';
import { render, screen } from '@testing-library/react';
import ExpensesTable from '@/components/ExpensesTable';

describe('ExpensesTable', () => {
    const mockExpenses = [
        {
            id: '1',
            amount: '100.00',
            category: 'Food',
            description: 'Lunch',
            date: '2023-10-25',
        },
        {
            id: '2',
            amount: '500.00',
            category: 'Travel',
            description: 'Taxi',
            date: '2023-10-26',
        },
    ];

    it('renders loading skeletons when loading is true', () => {
        const { container } = render(<ExpensesTable expenses={[]} loading={true} />);

        // Check for skeleton elements (typically rely on implementation details or class names, 
        // but here we can check if table body has rows and no "No expenses" text)
        const rows = screen.getAllByRole('row');
        // Header + 5 skeleton rows = 6 rows
        expect(rows.length).toBeGreaterThan(1);
        expect(screen.queryByText(/no expenses found/i)).not.toBeInTheDocument();
    });

    it('renders empty state when no expenses and not loading', () => {
        render(<ExpensesTable expenses={[]} loading={false} />);

        expect(screen.getByText(/no expenses found/i)).toBeInTheDocument();
    });

    it('renders expense list correctly', () => {
        render(<ExpensesTable expenses={mockExpenses} loading={false} />);

        expect(screen.getByText('₹100.00')).toBeInTheDocument();
        expect(screen.getByText('Food')).toBeInTheDocument();
        expect(screen.getByText('Lunch')).toBeInTheDocument();

        expect(screen.getByText('₹500.00')).toBeInTheDocument();
        expect(screen.getByText('Travel')).toBeInTheDocument();
        expect(screen.getByText('Taxi')).toBeInTheDocument();
    });

    it('formats dates correctly', () => {
        render(<ExpensesTable expenses={mockExpenses} loading={false} />);

        // Depending on locale, might check for "Oct 25, 2023" or similar.
        // Since we used en-IN in the component:
        expect(screen.getByText(/25 Oct 2023/i)).toBeInTheDocument();
        expect(screen.getByText(/26 Oct 2023/i)).toBeInTheDocument();
    });
});
