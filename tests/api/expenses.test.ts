import { createMocks } from 'node-mocks-http';

describe('/api/expenses', () => {
    let handler: any;
    const mockFrom = jest.fn();
    const mockSelect = jest.fn();
    const mockInsert = jest.fn();
    const mockEq = jest.fn();
    const mockIlike = jest.fn();
    const mockSingle = jest.fn();
    const mockOrder = jest.fn();
    const mockCreateClient = jest.fn();

    beforeEach(async () => {
        jest.resetModules(); // Clear cache
        jest.clearAllMocks(); // Clear mock usage data

        // Set environment variables
        process.env.SUPABASE_URL = 'http://test-url';
        process.env.SUPABASE_ANON_KEY = 'test-key';

        // Configure Mocks
        mockCreateClient.mockReturnValue({
            from: mockFrom
        });

        // Default chain behavior
        mockFrom.mockReturnValue({
            select: mockSelect,
            insert: mockInsert
        });

        mockSelect.mockReturnValue({
            eq: mockEq,
            ilike: mockIlike,
            order: mockOrder,
            single: mockSingle
        });

        mockEq.mockReturnValue({
            single: mockSingle,
            order: mockOrder
        });

        mockIlike.mockReturnValue({
            single: mockSingle,
            order: mockOrder
        });

        mockInsert.mockReturnValue({
            select: mockSelect
        });

        // Default Returns
        mockSingle.mockResolvedValue({ data: null, error: null });
        mockOrder.mockResolvedValue({ data: [], error: null });

        // Dynamic Mock
        jest.doMock('@supabase/supabase-js', () => ({
            createClient: mockCreateClient
        }));

        // Import Handler
        handler = (await import('../../pages/api/expenses')).default;
    });

    afterEach(() => {
        delete process.env.SUPABASE_URL;
        delete process.env.SUPABASE_ANON_KEY;
    });

    describe('POST Validation', () => {
        it('should reject missing idempotency key', async () => {
            const { req, res } = createMocks({
                method: 'POST',
                body: { amount: '100', category: 'Food', date: '2023-01-01' },
            });
            await handler(req, res);
            expect(res._getStatusCode()).toBe(400);
            expect(res._getJSONData().error).toMatch(/idempotency-key/i);
        });

        it('should reject negative amounts', async () => {
            const { req, res } = createMocks({
                method: 'POST',
                headers: { 'idempotency-key': 'key-1' },
                body: { amount: '-50', category: 'Food', date: '2023-01-01' },
            });
            await handler(req, res);
            expect(res._getStatusCode()).toBe(400);
            expect(res._getJSONData().error).toMatch(/positive number/i);
        });

        it('should reject missing category', async () => {
            const { req, res } = createMocks({
                method: 'POST',
                headers: { 'idempotency-key': 'key-2' },
                body: { amount: '50', category: '', date: '2023-01-01' },
            });
            await handler(req, res);
            expect(res._getStatusCode()).toBe(400);
            expect(res._getJSONData().error).toMatch(/category is required/i);
        });
    });

    describe('POST Creation', () => {
        it('should create new expense with correct integer amount', async () => {
            // 1. Check existing key -> null
            mockSingle.mockResolvedValueOnce({ data: null, error: null });

            // 2. Insert -> Select -> Single -> Return new data
            mockSingle.mockResolvedValueOnce({
                data: { id: 'new-id', amount_paise: 10550, category: 'Food', date: '2023-01-01' },
                error: null
            });

            const { req, res } = createMocks({
                method: 'POST',
                headers: { 'idempotency-key': 'key-new' },
                body: { amount: '105.50', category: 'Food', date: '2023-01-01' },
            });

            await handler(req, res);

            expect(res._getStatusCode()).toBe(201);
            expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({
                amount_paise: 10550 // 105.50 * 100
            }));
        });

        it('should enforce idempotency', async () => {
            // Existing key found
            mockSingle.mockResolvedValueOnce({ data: { expense_id: 'existing-id' }, error: null });

            // Fetch existing expense
            mockSingle.mockResolvedValueOnce({
                data: { id: 'existing-id', amount_paise: 5000, category: 'Food' },
                error: null
            });

            const { req, res } = createMocks({
                method: 'POST',
                headers: { 'idempotency-key': 'key-old' },
                body: { amount: '50', category: 'Food', date: '2023-01-01' },
            });

            await handler(req, res);

            expect(res._getStatusCode()).toBe(200);
            expect(mockInsert).not.toHaveBeenCalled(); // No new insert
            expect(res._getJSONData().id).toBe('existing-id');
        });
    });

    describe('GET Fetching', () => {
        it('should fetch all expenses by default', async () => {
            mockOrder.mockResolvedValue({
                data: [{ id: '1', amount_paise: 1000, category: 'Food' }],
                error: null
            });

            const { req, res } = createMocks({ method: 'GET' });
            await handler(req, res);

            expect(res._getStatusCode()).toBe(200);
            expect(res._getJSONData()).toHaveLength(1);
            expect(res._getJSONData()[0].amount).toBe('10.00'); // Formatted back
        });

        it('should filter by category using partial match', async () => {
            const { req, res } = createMocks({
                method: 'GET',
                query: { category: 'foo' } // lowercase search
            });

            await handler(req, res);

            expect(mockIlike).toHaveBeenCalledWith('category', '%foo%');
        });

        it('should filter by category', async () => {
            const { req, res } = createMocks({
                method: 'GET',
                query: { category: 'Travel' }
            });

            await handler(req, res);

            expect(mockIlike).toHaveBeenCalledWith('category', '%Travel%');
        });

        it('should sort by date_desc', async () => {
            const { req, res } = createMocks({
                method: 'GET',
                query: { sort: 'date_desc' }
            });

            await handler(req, res);

            expect(mockOrder).toHaveBeenCalledWith('date', { ascending: false });
        });
    });
});
