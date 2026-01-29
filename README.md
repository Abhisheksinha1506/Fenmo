# Fenmo - Premium Expense Tracker

A modern, high-performance expense tracker built with **Next.js**, **shadcn/ui**, and **Supabase**. Features a premium dark-themed UI designed for personal finance management.

![Fenmo Dashboard](https://ui.shadcn.com/og.jpg)

## 🚀 Features

-   **Premium Dark UI**: Deep navy theme with emerald accents for a professional fintech look.
-   **Dashboard**: Real-time overview of total expenses and categorical breakdown.
-   **Smart Inputs**: 
    -   Data validation for amounts and dates.
    -   Responsive forms with loading states.
-   **Interactive Data**:
    -   Sortable expense list.
    -   Category filters.
    -   Visual progress bars for spending analysis.
-   **Tech Stack**:
    -   **Frontend**: Next.js (React), Tailwind CSS, shadcn/ui, Lucide Icons.
    -   **Backend**: Next.js API Routes.
    -   **Database**: Supabase (PostgreSQL).

## 🛠️ Getting Started

1.  **Clone the repository**
    ```bash
    git clone https://github.com/Abhisheksinha1506/Fenmo.git
    cd Fenmo
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Environment Setup**
    Create a `.env.local` file with your Supabase credentials:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

4.  **Run Development Server**
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) to view the app.

## 🎨 Design System

-   **Background**: `hsl(220 40% 8%)` (Deep Navy)
-   **Accent**: `hsl(220 90% 60%)` (Electric Blue)
-   **Success**: `hsl(160 80% 45%)` (Emerald Green)
-   **Font**: Inter (Sans) & Geist Mono (Numbers)

## 📦 Components

Built using modular **shadcn/ui** components:
-   `ExpensesTable`: Data grid with skeletons and empty states.
-   `ExpenseSummary`: Visual analytics for spending.
-   `ExpenseForm`: Robust input form with validation.
-   `ThemeToggle`: Dark/Light mode switch.

---

Built by [Abhishek Sinha](https://github.com/Abhisheksinha1506)
