import request from 'supertest';
import app from '../app';

describe('Auth Endpoints', () => {
    const testUser = {
        name: 'Test User',
        email: `test_${Date.now()}@example.com`,
        password: 'password123'
    };

    it('should register a new user', async () => {
        const res = await request(app)
            .post('/auth/signup')
            .send(testUser);

        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('token');
        expect(res.body.user).toHaveProperty('email', testUser.email);
    });

    it('should not register a duplicate user', async () => {
        const res = await request(app)
            .post('/auth/signup')
            .send(testUser);

        expect(res.statusCode).toEqual(400); // Or whatever status code your controller returns for duplicate
    });

    it('should login the registered user', async () => {
        const res = await request(app)
            .post('/auth/login')
            .send({
                email: testUser.email,
                password: testUser.password
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('token');
    });

    it('should not login with wrong password', async () => {
        const res = await request(app)
            .post('/auth/login')
            .send({
                email: testUser.email,
                password: 'wrongpassword'
            });

        expect(res.statusCode).toEqual(401);
    });
});
