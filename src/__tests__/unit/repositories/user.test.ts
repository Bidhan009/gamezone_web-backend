import { UserRepository } from "../../../repositories/user.repository";
import { UserModel } from "../../../models/user.model";
import mongoose from "mongoose";

describe('User Repository Unit Tests', () => {
    let userRepository: UserRepository;

    beforeAll(() => {
        userRepository = new UserRepository();
    });

    afterEach(async () => {
        await UserModel.deleteMany({});
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    describe('createUser', () => {
        test('should create a new user', async () => {
            const userData = {
                fullName: 'testuser',
                email: 'test@example.com',
                password: 'Password123!',
            };

            const newUser = await userRepository.createUser(userData);
            expect(newUser).toBeDefined();
            expect(newUser.fullName).toBe(userData.fullName);
            expect(newUser.email).toBe(userData.email);
            expect(newUser.role).toBe('user');
            expect(newUser._id).toBeDefined();
        });

        test('should create a new user with admin role', async () => {
            const userData = {
                fullName: 'adminuser',
                email: 'admin@example.com',
                password: 'Password123!',
                role: 'admin' as const
            };

            const newUser = await userRepository.createUser(userData);
            expect(newUser).toBeDefined();
            expect(newUser.role).toBe('admin');
        });

        test('should create a new user with profile image', async () => {
            const userData = {
                fullName: 'userwithimage',
                email: 'image@example.com',
                password: 'Password123!',
                profileImage: '/uploads/profile.jpg'
            };

            const newUser = await userRepository.createUser(userData);
            expect(newUser).toBeDefined();
            expect(newUser.profileImage).toBe('/uploads/profile.jpg');
        });
    });

    describe('getUserByEmail', () => {
        test('should find user by email', async () => {
            const userData = {
                fullName: 'testuser',
                email: 'test@example.com',
                password: 'Password123!',
            };

            await userRepository.createUser(userData);
            
            const foundUser = await userRepository.getUserByEmail('test@example.com');
            expect(foundUser).toBeDefined();
            expect(foundUser?.email).toBe(userData.email);
            expect(foundUser?.fullName).toBe(userData.fullName);
        });

        test('should find user by email case insensitive', async () => {
            const userData = {
                fullName: 'testuser',
                email: 'Test@Example.COM',
                password: 'Password123!',
            };

            await userRepository.createUser(userData);
            
            const foundUser = await userRepository.getUserByEmail('test@example.com');
            expect(foundUser).toBeDefined();
            expect(foundUser?.email).toBe(userData.email);
        });

        test('should return null for non-existent email', async () => {
            const foundUser = await userRepository.getUserByEmail('nonexistent@example.com');
            expect(foundUser).toBeNull();
        });
    });

    describe('getUserById', () => {
        test('should find user by id', async () => {
            const userData = {
                fullName: 'testuser',
                email: 'test@example.com',
                password: 'Password123!',
            };

            const createdUser = await userRepository.createUser(userData);
            
            const foundUser = await userRepository.getUserById(createdUser._id.toString());
            expect(foundUser).toBeDefined();
            expect(foundUser?._id.toString()).toBe(createdUser._id.toString());
            expect(foundUser?.email).toBe(userData.email);
        });

        test('should return null for non-existent id', async () => {
            const foundUser = await userRepository.getUserById('507f1f77bcf86cd799439011');
            expect(foundUser).toBeNull();
        });
    });

    describe('getAllUsers', () => {
        test('should return empty array when no users exist', async () => {
            const users = await userRepository.getAllUsers();
            expect(users).toEqual([]);
        });

        test('should return all users', async () => {
            const userData1 = {
                fullName: 'user1',
                email: 'user1@example.com',
                password: 'Password123!',
                role: 'user' as const
            };
            const userData2 = {
                fullName: 'user2',
                email: 'user2@example.com',
                password: 'Password123!',
                role: 'admin' as const
            };

            await userRepository.createUser(userData1);
            await userRepository.createUser(userData2);
            
            const users = await userRepository.getAllUsers();
            expect(users).toHaveLength(2);
            expect(users[0].email).toBe(userData1.email);
            expect(users[1].email).toBe(userData2.email);
        });
    });

    describe('updateUser', () => {
        test('should update user successfully', async () => {
            const userData = {
                fullName: 'testuser',
                email: 'test@example.com',
                password: 'Password123!',
            };

            const createdUser = await userRepository.createUser(userData);
            
            const updateData = {
                fullName: 'updateduser',
                role: 'admin' as const
            };

            const updatedUser = await userRepository.updateUser(createdUser._id.toString(), updateData);
            expect(updatedUser).toBeDefined();
            expect(updatedUser?.fullName).toBe(updateData.fullName);
            expect(updatedUser?.role).toBe(updateData.role);
            expect(updatedUser?.email).toBe(userData.email); 
        });

        test('should return null when updating non-existent user', async () => {
            const updateData = {
                fullName: 'updateduser'
            };

            const updatedUser = await userRepository.updateUser('507f1f77bcf86cd799439011', updateData);
            expect(updatedUser).toBeNull();
        });
    });

    describe('deleteUser', () => {
        test('should delete user successfully', async () => {
            const userData = {
                fullName: 'testuser',
                email: 'test@example.com',
                password: 'Password123!',
            };

            const createdUser = await userRepository.createUser(userData);
            
            const deleteResult = await userRepository.deleteUser(createdUser._id.toString());
            expect(deleteResult).toBe(true);

            const foundUser = await userRepository.getUserById(createdUser._id.toString());
            expect(foundUser).toBeNull();
        });

        test('should return false when deleting non-existent user', async () => {
            const deleteResult = await userRepository.deleteUser('507f1f77bcf86cd799439011');
            expect(deleteResult).toBe(false);
        });
    });

    describe('updateOneUser', () => {
        test('should update user using updateOneUser method', async () => {
            const userData = {
                fullName: 'testuser',
                email: 'test@example.com',
                password: 'Password123!',
            };

            const createdUser = await userRepository.createUser(userData);
            
            const updateData = {
                fullName: 'updateduser',
                profileImage: '/uploads/updated.jpg'
            };

            const updatedUser = await userRepository.updateOneUser(createdUser._id.toString(), updateData);
            expect(updatedUser).toBeDefined();
            expect(updatedUser?.fullName).toBe(updateData.fullName);
            expect(updatedUser?.profileImage).toBe(updateData.profileImage);
        });

        test('should return null when updating non-existent user with updateOneUser', async () => {
            const updateData = {
                fullName: 'updateduser'
            };

            const updatedUser = await userRepository.updateOneUser('507f1f77bcf86cd799439011', updateData);
            expect(updatedUser).toBeNull();
        });
    });
});