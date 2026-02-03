import request from 'supertest';
import app from '../app';

describe('EMI Endpoints', () => {
    let token: string;
    let createdEMIId: string;

    const testUser = {
        name: 'EMI Tester',
        email: `emi_tester_${Date.now()}@example.com`,
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

    it('should create a new EMI', async () => {
        const res = await request(app)
            .post('/api/v1/emis')
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: 'Car Loan',
                amount: 5000,
                totalAmount: 500000,
                dueDate: 15,
                startDate: new Date().toISOString()
            });

        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('id');
        expect(res.body.name).toEqual('Car Loan');
        createdEMIId = res.body.id;
    });

    it('should fetch all EMIs', async () => {
        const res = await request(app)
            .get('/api/v1/emis')
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBeTruthy();
        const found = res.body.find((e: any) => e.id === createdEMIId);
        expect(found).toBeTruthy();
    });

    it('should update the EMI', async () => {
        const res = await request(app)
            .put(`/api/v1/emis/${createdEMIId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                amount: 5500,
                name: 'Updated Car Loan'
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body.amount).toEqual(5500);
        expect(res.body.name).toEqual('Updated Car Loan');
    });

    it('should delete the EMI', async () => {
        const res = await request(app)
            .delete(`/api/v1/emis/${createdEMIId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toEqual(200);
    });

    it('should confirm EMI is deleted', async () => {
        const res = await request(app)
            .get('/api/v1/emis')
            .set('Authorization', `Bearer ${token}`);

        const found = res.body.find((e: any) => e.id === createdEMIId);
        expect(found).toBeUndefined();
    });
});
