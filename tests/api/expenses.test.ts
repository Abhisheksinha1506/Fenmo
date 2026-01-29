import { createMocks } from 'node-mocks-http';

describe('/api/expenses', () => {
    let handler: any;
    const mockFrom = jest.fn();
    const mockSelect = jest.fn();
    const mockInsert = jest.fn();
    const mockEq = jest.fn();
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

        mockFrom.mockReturnValue({
            select: mockSelect,
            insert: mockInsert
        });

        mockSelect.mockReturnValue({
            eq: mockEq,
            order: mockOrder,
            single: mockSingle // Direct select().single()
        });

        mockEq.mockReturnValue({
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

    it('POST should reject missing idempotency key', async () => {
        const { req, res } = createMocks({
            method: 'POST',
            body: {
                amount: '100',
                category: 'Food',
                date: '2023-01-01',
            },
        });

        await handler(req, res);

        expect(res._getStatusCode()).toBe(400);
        expect(res._getJSONData().error).toMatch(/idempotency key/);
    });

    it('POST should be idempotent (return existing logic)', async () => {
        // Setup existing record found
        mockSingle.mockResolvedValueOnce({ data: { id: 'existing-id' }, error: null });

        const { req, res } = createMocks({
            method: 'POST',
            body: {
                amount: '100',
                category: 'Food',
                date: '2023-01-01',
                idempotencyKey: 'key-123',
            },
        });

        await handler(req, res);

        expect(res._getStatusCode()).toBe(200);
        expect(res._getJSONData().id).toBe('existing-id');
    });

    it('POST should create new expense if valid', async () => {
        // 1. Check existing: Not found
        mockSingle.mockResolvedValueOnce({ data: null, error: null });

        // 2. Insert -> Select -> Single: Return new ID
        mockSingle.mockResolvedValueOnce({ data: { id: 'new-id' }, error: null });

        const { req, res } = createMocks({
            method: 'POST',
            body: {
                amount: '105.50',
                category: 'Food',
                date: '2023-01-01',
                idempotencyKey: 'key-new',
            },
        });

        await handler(req, res);

        expect(res._getStatusCode()).toBe(201);
        expect(res._getJSONData().id).toBe('new-id');
        expect(mockCreateClient).toHaveBeenCalled(); // verified
        expect(mockFrom).toHaveBeenCalledWith('expenses');
        expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({
            amount_paise: 10550
        }));
    });
});
