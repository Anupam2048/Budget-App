import request from 'supertest';
import app from '../app';

describe('Expense Endpoints', () => {
    let token: string;
    let createdExpenseId: string;

    const testUser = {
        name: 'Expense Tester',
        email: `expense_tester_${Date.now()}@example.com`,
        password: 'password123'
    };

    beforeAll(async () => {
        // Register user to get token
        await request(app).post('/auth/signup').send(testUser);
        const res = await request(app).post('/auth/login').send({
            email: testUser.email,
            password: testUser.password
        });
        token = res.body.token;
    });

    it('should create a new expense', async () => {
        const res = await request(app)
            .post('/api/v1/transactions/expenses')
            .set('Authorization', `Bearer ${token}`)
            .send({
                amount: 100,
                type: 'EXPENSE',
                category: 'Food',
                notes: 'Lunch',
                date: new Date().toISOString()
            });

        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('id');
        expect(res.body.amount).toEqual(100);
        createdExpenseId = res.body.id;
    });

    it('should fetch all transactions including the new expense', async () => {
        const res = await request(app)
            .get('/api/v1/transactions/expenses')
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('expenses');
        expect(Array.isArray(res.body.expenses)).toBeTruthy();
        const found = res.body.expenses.find((t: any) => t.id === createdExpenseId);
        expect(found).toBeTruthy();
    });

    it('should update the expense', async () => {
        const res = await request(app)
            .put(`/api/v1/transactions/expenses/${createdExpenseId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                amount: 150,
                notes: 'Big Lunch'
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body.amount).toEqual(150);
        expect(res.body.notes).toEqual('Big Lunch');
    });

    it('should delete the expense', async () => {
        const res = await request(app)
            .delete(`/api/v1/transactions/expenses/${createdExpenseId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toEqual(200);
    });

    it('should confirm expense is deleted', async () => {
        const res = await request(app)
            .get('/api/v1/transactions/expenses')
            .set('Authorization', `Bearer ${token}`);

        const found = res.body.expenses.find((t: any) => t.id === createdExpenseId);
        expect(found).toBeUndefined();
    });
});
