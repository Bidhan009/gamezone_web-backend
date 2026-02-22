import request from 'supertest';
import app from '../../app';
import path from 'path';

describe('Product Image Upload Tests', () => {
    const testProduct = {
        name: 'Test Product',
        price: '29.99',
        category: 'Electronics',
        stock: '10',
        description: 'Test product with image'
    };

    test('should create product with image', async () => {
        const imagePath = path.join(__dirname, '../../test-assets/test-product.jpg');
        
        const response = await request(app)
            .post('/api/products')
            .set('Authorization', 'Bearer your-test-token')
            .field('name', testProduct.name)
            .field('price', testProduct.price)
            .field('category', testProduct.category)
            .field('stock', testProduct.stock)
            .field('description', testProduct.description)
            .attach('productImage', imagePath);

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.data.imageUrl).toBeDefined();
    });
});
