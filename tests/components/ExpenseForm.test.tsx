import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ExpenseForm from '@/components/ExpenseForm';

describe('ExpenseForm', () => {
    const mockOnSubmit = jest.fn();

    beforeEach(() => {
        mockOnSubmit.mockClear();
    });

    it('renders all form fields', () => {
        render(<ExpenseForm onSubmit={mockOnSubmit} isSubmitting={false} error={null} />);

        expect(screen.getByLabelText(/amount/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/date/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /add expense/i })).toBeInTheDocument();
    });

    it('shows validation errors for empty required fields', async () => {
        render(<ExpenseForm onSubmit={mockOnSubmit} isSubmitting={false} error={null} />);

        fireEvent.click(screen.getByRole('button', { name: /add expense/i }));

        expect(await screen.findByText(/amount must be a positive number/i)).toBeInTheDocument();
        expect(screen.getByText(/category is required/i)).toBeInTheDocument();
        expect(screen.getByText(/date is required/i)).toBeInTheDocument();
        expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('shows validation error for negative amount', async () => {
        render(<ExpenseForm onSubmit={mockOnSubmit} isSubmitting={false} error={null} />);

        const amountInput = screen.getByLabelText(/amount/i);
        fireEvent.change(amountInput, { target: { value: '-10' } });

        fireEvent.click(screen.getByRole('button', { name: /add expense/i }));

        expect(await screen.findByText(/amount must be a positive number/i)).toBeInTheDocument();
        expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('calls onSubmit with correct data when form is valid', async () => {
        const user = userEvent.setup();
        render(<ExpenseForm onSubmit={mockOnSubmit} isSubmitting={false} error={null} />);

        await user.type(screen.getByLabelText(/amount/i), '150.50');
        await user.type(screen.getByLabelText(/category/i), 'Food');
        await user.type(screen.getByLabelText(/description/i), 'Lunch');

        const dateInput = screen.getByLabelText(/date/i);
        fireEvent.change(dateInput, { target: { value: '2023-10-25' } });

        await user.click(screen.getByRole('button', { name: /add expense/i }));

        expect(mockOnSubmit).toHaveBeenCalledWith({
            amount: '150.5',
            category: 'Food',
            description: 'Lunch',
            date: '2023-10-25',
        });
    });

    it('disables button and inputs when submitting', () => {
        render(<ExpenseForm onSubmit={mockOnSubmit} isSubmitting={true} error={null} />);

        expect(screen.getByLabelText(/amount/i)).toBeDisabled();
        expect(screen.getByLabelText(/category/i)).toBeDisabled();
        expect(screen.getByRole('button', { name: /saving/i })).toBeDisabled();
    });

    it('displays error message when error prop is provided', () => {
        render(<ExpenseForm onSubmit={mockOnSubmit} isSubmitting={false} error="Failed to save" />);

        expect(screen.getByText(/failed to save/i)).toBeInTheDocument();
    });
});
