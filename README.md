# Fenmo Expense Tracker

A minimal full-stack personal finance tool built with **Next.js**, **TypeScript**, and **Supabase (PostgreSQL)**.

## Features

- **Add Expense**: Record amount, category, description, and date.
- **View Expenses**: List of all expenses with sorting and filtering.
- **Data Integrity**: Idempotent submissions (prevents duplicates on retries/network issues).
- **Money Handling**: Amounts stored as integers (paise) to avoid floating-point errors.
- **Validation**: Frontend and Backend validation for robustness.
- **Responsive UI**: Simple, clean interface working on desktop and mobile.

## Setup Instructions

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Abhisheksinha1506/Fenmo.git
   cd Fenmo
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment**:
   - Create a project on [Supabase](https://supabase.com).
   - Create a table named `expenses` using the SQL in `sql/schema.sql`.
   - Copy `.env.local.example` to `.env.local` and add your Supabase URL and Logic Key (Anon Key).
     ```bash
     NEXT_PUBLIC_SUPABASE_URL=your_url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
     ```

4. **Run Locally**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

5. **Run Tests**:
   ```bash
   npm test
   ```

## Design Decisions & Trade-offs

- **Framework**: **Next.js (Pages Router)** was chosen for its simplicity in handling both frontend and API routes in a single repository.
- **Persistence**: **Supabase** (PostgreSQL) was selected over SQLite for production-readiness, easy scalability, and remote access, fulfilling the "real-world usage" requirement.
- **Idempotency**: Implemented using a client-generated UUID (`idempotencyKey`) sent with every POST request. The database has a unique constraint on this key to prevent duplicate records even if the client retries (e.g., due to network lag).
- **Money**: all amounts are handled as `BigInt` (paise) in the database to prevent precision loss, and converted to float only for display.

### What I didn't do (Trade-offs)
- **Authentication**: Omitted to keep the scope small and focused on the core "Expense Tracker" logic. Currently, the API is public (or protected only by the anon key).
- **Complex State Management**: Used local React state instead of Redux/Context as the app usage is simple.
- **E2E Testing**: Focused on API unit tests (`jest` + `node-mocks-http`) rather than full browser automation (Playwright) due to time constraints.

### Extras Implemented
- **Validation**: Added checks for negative amounts, valid dates, and required fields.
- **Summary**: Live calculation of total expenses and category breakdown.
- **Unit Tests**: Basic testing for the API endpoint logic.
