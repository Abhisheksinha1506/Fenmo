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

## 🧠 Key Design Decisions

1.  **Supabase & PostgreSQL**: Chosen for the "real-world" persistence requirement. It provides instant APIs, robust type safety with TypeScript generation, and massive scalability compared to local JSON files.
2.  **Idempotency Strategy**: Implemented using a dedicated `idempotency_keys` table rather than just in-memory checks. This ensures that even if the server restarts or scales horizontally, duplicate requests from efficient retries are handled correctly.
3.  **Money Handling**: All monetary values are stored as **integers (paise)** in the database. This avoids the classic floating-point precision errors (e.g., `0.1 + 0.2 !== 0.3`) common in financial applications.
4.  **Component Architecture**: Used **shadcn/ui** (based on Radix Primitives) to ensure accessibility (a11y) and keyboard navigation work out of the box, fulfilling the "production-quality" requirement.

## ⚖️ Trade-offs & Time Constraints

-   **Filtering**: Implemented client-side filtering for simplicity given the expected small dataset for this assignment. For a production app with millions of rows, this would be moved to the backend (filtering at the SQL level).
-   **Error Handling**: Used toast notifications (Sonner) for errors instead of complex error boundaries or modal dialogs. This provides good UX without high implementation cost.
-   **Validation**: Basic validation logic (positive amounts, required dates) is duplicated slightly between frontend and backend. In a larger system, I would share Zod schemas between both.
-   **State Management**: Used React local state (`useState`) instead of a global store (Redux/Zustand) or server state library (TanStack Query) to keep dependencies minimal for this scope.

## 🚫 Intentionally Excluded

-   **Edit/Delete Operations**: Focused strictly on the "Create" and "Read" parts of CRUD as per the assignment's core requirements.
-   **Authentication**: The app assumes a single-user environment to keep the evaluation focused on data handling and UI, rather than login flows.
-   **Advanced Analytics**: While a summary is provided, complex charts/graphs were omitted to prioritize functional correctness and core code quality.
-   **Mobile App**: The web UI is fully responsive, but no native mobile wrapper was built.

---

Built by [Abhishek Sinha](https://github.com/Abhisheksinha1506)
