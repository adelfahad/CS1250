const request = require('supertest');
const app = require('../server.js'); // استيراد التطبيق

describe('Test API Endpoints', () => {
    it('should return the contact.html file', async () => {
        const res = await request(app).get('/contact.html');
        expect(res.statusCode).toBe(200);
        expect(res.text).toContain('<title>'); // تحقق من وجود محتوى معين
    });

    it('should save contact data', async () => {
        const res = await request(app)
            .post('/contact')
            .send({
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
                mobile: '1234567890',
                message: 'Hello!',
            });
        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe('Message received successfully!');
    });
});
