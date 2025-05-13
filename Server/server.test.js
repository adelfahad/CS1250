jest.setTimeout(20000);  // زيادة المهلة إلى 20 ثانية

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
  // إغلاق اتصال قاعدة البيانات بعد انتهاء الاختبارات
  if (db) {
    db.end((err) => {
      if (err) console.error('Error closing the database connection:', err);
      // إغلاق الخادم بعد إغلاق الاتصال بقاعدة البيانات
      server.close(() => {
        console.log('Server closed.');
        done();  // التأكد من أن جميع العمليات انتهت
      });
    });
  } else {
    // في حالة عدم وجود db، إغلاق الخادم فقط
    server.close(() => {
      console.log('Server closed.');
      done();  // التأكد من أن جميع العمليات انتهت
    });
  }
});

describe('Test API Endpoints', () => {
  it('should return the contact.html file', async () => {
    const res = await request(app).get('/contact.html');
    expect(res.statusCode).toBe(200);
    expect(res.text).toContain('<title>');  // تحقق من وجود محتوى معين في الصفحة
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
