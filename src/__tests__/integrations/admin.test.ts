import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../app';
import { UserModel } from '../../models/user.model';
import bcryptjs from 'bcryptjs';
import { MONGODB_URI } from '../../config';

// Test database connection function
async function connectDatabaseTest() {
    try {
        await mongoose.connect(MONGODB_URI + "_test");
        console.log("Connected to MongoDB Test Database");
    } catch (error) {
        console.error("Database Error:", error);
        process.exit(1);
    }
}

describe('Admin Integration Tests', () => {
    let adminToken: string;
    let userToken: string;
    let testUser: any;
    let adminUser: any;

    beforeAll(async () => {
        // Connect to test database
        await connectDatabaseTest();

        // Create admin user directly in database
        const hashedPassword = await bcryptjs.hash('Password123!', 10);
        adminUser = await UserModel.create({
            fullName: 'adminuser',
            email: 'admin@example.com',
            password: hashedPassword,
            role: 'admin'
        });

        // Create regular user through registration
        const userResponse = await request(app)
            .post('/api/auth/register')
            .send({
                fullName: 'regularuser',
                email: 'user@example.com',
                password: 'Password123!',
                confirmPassword: 'Password123!'
            });
        testUser = userResponse.body.data;

        // Login as admin
        const adminLogin = await request(app)
            .post('/api/auth/login')
            .send({ email: adminUser.email, password: 'Password123!' });
        adminToken = adminLogin.body.token;

        // Login as regular user
        const userLogin = await request(app)
            .post('/api/auth/login')
            .send({ email: testUser.email, password: 'Password123!' });
        userToken = userLogin.body.token;

        // Wait a bit to ensure users are saved
        await new Promise(resolve => setTimeout(resolve, 100));
    });

    afterAll(async () => {
        // Clean up test data
        await UserModel.deleteMany({
            $or: [
                { email: adminUser.email },
                { email: testUser.email }
            ]
        });
        
        // Close database connection
        await mongoose.connection.close();
    });

    describe('POST /api/admin/users/', () => {
        test('should create user as admin', async () => {
            const newUser = {
                fullName: 'newuser',
                email: `newuser${Date.now()}@example.com`, // Unique email
                password: 'Password123!',
                confirmPassword: 'Password123!'
            };

            const response = await request(app)
                .post('/api/admin/users/')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(newUser);

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('success', true);
            expect(response.body.data).toHaveProperty('fullName', newUser.fullName);
            expect(response.body.data).toHaveProperty('email', newUser.email);
        });

        test('should not create user without admin token', async () => {
            const newUser = {
                fullName: 'newuser2',
                email: 'newuser2@example.com',
                password: 'Password123!',
                confirmPassword: 'Password123!'
            };

            const response = await request(app)
                .post('/api/admin/users/')
                .set('Authorization', `Bearer ${userToken}`)
                .send(newUser);

            expect(response.status).toBe(403);
            expect(response.body).toHaveProperty('success', false);
        });

        test('should not create user without token', async () => {
            const newUser = {
                fullName: 'newuser3',
                email: 'newuser3@example.com',
                password: 'Password123!',
                confirmPassword: 'Password123!'
            };

            const response = await request(app)
                .post('/api/admin/users/')
                .send(newUser);

            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('success', false);
        });

        test('should not create user with invalid email', async () => {
            const newUser = {
                fullName: 'newuser4',
                email: 'invalid-email',
                password: 'Password123!',
                confirmPassword: 'Password123!'
            };

            const response = await request(app)
                .post('/api/admin/users/')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(newUser);

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('success', false);
        });

        test('should not create user with mismatched passwords', async () => {
            const newUser = {
                fullName: 'newuser5',
                email: 'newuser5@example.com',
                password: 'Password123!',
                confirmPassword: 'DifferentPassword!'
            };

            const response = await request(app)
                .post('/api/admin/users/')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(newUser);

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('success', false);
        });
    });

    describe('GET /api/admin/users/', () => {
        test('should get all users as admin', async () => {
            const response = await request(app)
                .get('/api/admin/users/')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('success', true);
            expect(response.body).toHaveProperty('data');
            expect(Array.isArray(response.body.data)).toBe(true);
        });

        test('should not get all users without admin token', async () => {
            const response = await request(app)
                .get('/api/admin/users/')
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.status).toBe(403);
            expect(response.body).toHaveProperty('success', false);
        });

        test('should not get all users without token', async () => {
            const response = await request(app)
                .get('/api/admin/users/');

            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('success', false);
        });
    });

    describe('GET /api/admin/users/:id', () => {
        test('should get user by id as admin', async () => {
            const response = await request(app)
                .get(`/api/admin/users/${testUser._id}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('success', true);
            expect(response.body.data).toHaveProperty('_id', testUser._id);
        });

        test('should not get user by id without admin token', async () => {
            const response = await request(app)
                .get(`/api/admin/users/${testUser._id}`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.status).toBe(403);
            expect(response.body).toHaveProperty('success', false);
        });

        test('should return 404 for non-existent user', async () => {
            const fakeId = '507f1f77bcf86cd799439011';
            const response = await request(app)
                .get(`/api/admin/users/${fakeId}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('success', false);
        });
    });

    describe('PUT /api/admin/users/:id', () => {
        test('should update user as admin', async () => {
            const updateData = {
                fullName: 'updateduser',
                email: `updated${Date.now()}@example.com` // Unique email
            };

            const response = await request(app)
                .put(`/api/admin/users/${testUser._id}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send(updateData);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('success', true);
            expect(response.body).toHaveProperty('message', 'User Updated');
            expect(response.body.data).toHaveProperty('fullName', updateData.fullName);
            expect(response.body.data).toHaveProperty('email', updateData.email);
        });

        test('should not update user without admin token', async () => {
            const updateData = {
                fullName: 'hackeruser'
            };

            const response = await request(app)
                .put(`/api/admin/users/${testUser._id}`)
                .set('Authorization', `Bearer ${userToken}`)
                .send(updateData);

            expect(response.status).toBe(403);
            expect(response.body).toHaveProperty('success', false);
        });

        test('should not update user with invalid email', async () => {
            const updateData = {
                email: 'invalid-email'
            };

            const response = await request(app)
                .put(`/api/admin/users/${testUser._id}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send(updateData);

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('success', false);
        });
    });

    describe('DELETE /api/admin/users/:id', () => {
        test('should delete user as admin', async () => {
            // Create a user specifically for deletion test
            const deleteTestResponse = await request(app)
                .post('/api/admin/users/')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    fullName: 'deletetestuser',
                    email: `delete${Date.now()}@example.com`, // Unique email
                    password: 'Password123!',
                    confirmPassword: 'Password123!'
                });
            const userToDelete = deleteTestResponse.body.data;

            const response = await request(app)
                .delete(`/api/admin/users/${userToDelete._id}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('success', true);
            expect(response.body).toHaveProperty('message', 'User Deleted');
        });

        test('should not delete user without admin token', async () => {
            const response = await request(app)
                .delete(`/api/admin/users/${testUser._id}`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.status).toBe(403);
            expect(response.body).toHaveProperty('success', false);
        });

        test('should return 404 when deleting non-existent user', async () => {
            const fakeId = '507f1f77bcf86cd799439011';
            const response = await request(app)
                .delete(`/api/admin/users/${fakeId}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('success', false);
        });
    });

    describe('File Upload Tests', () => {
        test('should create user with profile image as admin', async () => {
            const newUser = {
                fullName: 'userwithimage',
                email: `imageuser${Date.now()}@example.com`,
                password: 'Password123!',
                confirmPassword: 'Password123!'
            };

            const response = await request(app)
                .post('/api/admin/users/')
                .set('Authorization', `Bearer ${adminToken}`)
                .attach('profileImage', Buffer.from('fake image data'), 'test.jpg')
                .field(newUser);

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('success', true);
            expect(response.body.data).toHaveProperty('profileImage');
        });
    });
});