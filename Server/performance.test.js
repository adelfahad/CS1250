const autocannon = require('autocannon');
const { app, db } = require('./server.js'); // استيراد db مع app
let server;

beforeAll((done) => {
  server = app.listen(3001, () => {
    console.log('Test server running on http://localhost:3001');
    done();
  });
});

afterAll((done) => {
  if (server) {
    server.close(() => {
      console.log('Server closed.');
      if (db) {
        db.end((err) => {
          if (err) {
            console.error('Error closing the database connection:', err);
          }
          done();
        });
      } else {
        done();
      }
    });
  } else {
    done();
  }
});

test('Performance test for /contact', async () => {
  const result = await autocannon({
    url: 'http://localhost:3001/contact',
    connections: 10, // عدد الاتصالات المتزامنة
    duration: 10, // مدة الاختبار بالثواني
    method: 'POST',
    body: JSON.stringify({
      firstName: 'John',
      lastName: 'Doe',
      email: 'johndoe@example.com',
      mobile: '1234567890',
      message: 'Performance test message',
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  console.log('Performance Test Results:', result);
  expect(result.requests.total).toBeGreaterThan(0); // تحقق من وجود طلبات
}, 20000);