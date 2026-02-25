import { locatorHandler } from './locatorHandler';

describe('locatorHandler', () => {
    it('returns top 3 legal aid centers by default if no clear match', async () => {
        const body = { pincode: '000000', state: 'Unknown' };
        const response = await locatorHandler(body);

        expect(response.success).toBe(true);
        expect(response.data).toHaveLength(3);
        expect(response.error).toBeNull();
    });

    it('filters correctly by state', async () => {
        const body = { state: 'Karnataka' };
        const response = await locatorHandler(body);

        expect(response.success).toBe(true);
        expect(response.data?.length).toBeGreaterThan(0);
        expect(response.data![0].state).toBe('Karnataka');
    });

    it('filters correctly by pincode', async () => {
        const body = { pincode: '110001' };
        const response = await locatorHandler(body);

        expect(response.success).toBe(true);
        expect(response.data).toHaveLength(1);
        expect(response.data![0].pincode).toBe('110001');
    });
});
