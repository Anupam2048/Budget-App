import request from 'supertest';
import app from '../app';

describe('Subscription Endpoints', () => {
    let token: string;
    let createdSubId: string;

    const testUser = {
        name: 'Sub Tester',
        email: `sub_tester_${Date.now()}@example.com`,
        password: 'password123'
    };

    beforeAll(async () => {
        await request(app).post('/auth/signup').send(testUser);
        const res = await request(app).post('/auth/login').send({
            email: testUser.email,
            password: testUser.password
        });
        token = res.body.token;
    });

    it('should create a new subscription', async () => {
        const res = await request(app)
            .post('/api/v1/subscriptions')
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: 'Netflix',
                amount: 199,
                billingCycle: 'MONTHLY',
                nextBillingDate: new Date().toISOString()
            });

        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('id');
        expect(res.body.name).toEqual('Netflix');
        createdSubId = res.body.id;
    });

    it('should fetch all subscriptions', async () => {
        const res = await request(app)
            .get('/api/v1/subscriptions')
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBeTruthy();
        const found = res.body.find((s: any) => s.id === createdSubId);
        expect(found).toBeTruthy();
    });

    it('should update the subscription', async () => {
        const res = await request(app)
            .put(`/api/v1/subscriptions/${createdSubId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                amount: 299,
                name: 'Netflix Premium'
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body.amount).toEqual(299);
        expect(res.body.name).toEqual('Netflix Premium');
    });

    it('should delete the subscription', async () => {
        const res = await request(app)
            .delete(`/api/v1/subscriptions/${createdSubId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toEqual(200);
    });

    it('should confirm subscription is deleted', async () => {
        const res = await request(app)
            .get('/api/v1/subscriptions')
            .set('Authorization', `Bearer ${token}`);

        const found = res.body.find((s: any) => s.id === createdSubId);
        expect(found).toBeUndefined();
    });
});
