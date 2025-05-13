const request = require('supertest');  // استيراد supertest بشكل صحيح
const { app, db } = require('./server.js');  // استيراد db مع app

let server;

beforeAll((done) => {
  server = app.listen(3001, () => {  // استخدام منفذ مختلف إذا كان 3000 قيد الاستخدام
    console.log('Test server running on http://localhost:3001');
    done();  // تأكد من إنهاء العملية قبل بدء الاختبارات
  });
});

afterAll((done) => {
  if (db) {
    db.end((err) => {
      if (err) console.error('Error closing DB connection:', err);
      server.close(done);  // إيقاف الخادم بعد إغلاق قاعدة البيانات
    });
  } else {
    server.close(done);  // إغلاق الخادم إذا لم يكن db موجودًا
  }
});

describe('Test API Endpoints', () => {
  it('should return the contact.html file', async () => {
    const res = await request(app).get('/contact.html');
    expect(res.statusCode).toBe(200);
    expect(res.text).toContain('<title>'); // تحقق من وجود محتوى معين
  });

  it('should save contact data', async () => {
    const response = await request(app).post('/contact').send({
      firstName: 'John',
      lastName: 'Doe',
      email: 'johndoe@example.com',
      mobile: '1234567890',
      message: 'Test message',
    });
    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe('Message received successfully!');
  });
});
