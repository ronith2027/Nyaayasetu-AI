import { api } from './api';

describe('Frontend API Mock', () => {
    it('returns formatted draft for complaint endpoint', async () => {
        const body = {
            complainant: { name: 'John Doe' },
            oppositeParty: { name: 'Acme Corp' },
            facts: 'The product was defective',
        };
        const response = await api.post<any>('/complaint', body);

        expect(response.success).toBe(true);
        expect(response.data.draftId).toBeDefined();
        expect(response.data.formattedDraft).toContain('John Doe');
        expect(response.data.formattedDraft).toContain('Acme Corp');
        expect(response.data.formattedDraft).toContain('The product was defective');
    });

    it('filters schemes based on income', async () => {
        const lowIncomeBody = { annualIncome: 200000 };
        const lowIncomeResponse = await api.post<any[]>('/schemes', lowIncomeBody);

        expect(lowIncomeResponse.success).toBe(true);
        expect(lowIncomeResponse.data?.length).toBe(2);

        const highIncomeBody = { annualIncome: 600000 };
        const highIncomeResponse = await api.post<any[]>('/schemes', highIncomeBody);

        expect(highIncomeResponse.success).toBe(true);
        expect(highIncomeResponse.data?.length).toBe(0);
    });

    it('handles unknown endpoints gracefully', async () => {
        const response = await api.post<any>('/unknown-endpoint', {});

        expect(response.success).toBe(true);
        expect(response.error).toBe('Endpoint not specifically mocked.');
    });
});
