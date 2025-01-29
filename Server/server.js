const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const bwipjs = require('bwip-js');
const bcrypt = require('bcryptjs'); // لتشفير كلمة المرور

const app = express();

// تفعيل CORS بشكل دقيق
const allowedOrigins = ['http://localhost:3000', 'http://example.com']; // استبدل بالمصادر المسموح بها
app.use(cors({ origin: allowedOrigins }));

// إعداد body-parser لتحليل JSON
app.use(bodyParser.json());

// إعداد مجلد الملفات الثابتة
app.use(express.static(path.join(__dirname, '../../CS1250')));

// إعداد الاتصال بقاعدة البيانات
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Root@1234', // تغيير كلمة المرور حسب إعداداتك
    database: 'riyadhmetro'
});

// الاتصال بقاعدة البيانات
db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

// مسار التسجيل مع تشفير كلمة المرور
app.post('/signup', async (req, res) => {
    const { name, email, password, phone, birthdate, gender, address } = req.body;

    // التحقق من البيانات المدخلة
    if (!name || !email || !password || !phone || !gender) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        // تشفير كلمة المرور
        const hashedPassword = await bcrypt.hash(password, 10);

        const query = 'INSERT INTO users (name, email, password, phone, birthdate, gender, address) VALUES (?, ?, ?, ?, ?, ?, ?)';
        
        db.query(query, [name, email, hashedPassword, phone, birthdate || null, gender, address || null], (err, result) => {
            if (err) {
                console.log('Error inserting data into database:', err);
                return res.status(500).send('Error registering user.');
            }
            console.log('User registered successfully');
            res.redirect('/');  // إعادة توجيه المستخدم بعد التسجيل
        });
    } catch (err) {
        console.log('Error hashing password:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// مسار لتوليد باركود وتخزين التذكرة
app.post('/generate-ticket', (req, res) => {
    const { class: ticketClass, price, duration } = req.body;

    // التحقق من البيانات المدخلة
    if (!ticketClass || !price || !duration) {
        return res.status(400).json({ error: 'Missing ticket data' });
    }

    const validClasses = ['VIP', 'Normal', 'First-class', 'Regular'];
    if (!validClasses.includes(ticketClass)) {
        return res.status(400).json({ error: 'Invalid class value' });
    }

    const newBarcode = uuidv4();
    const currentDate = new Date();
    const startTime = currentDate.toISOString().slice(0, 19).replace('T', ' ');

    const validHours = parseInt(duration.split('-')[0]);
    if (isNaN(validHours)) {
        return res.status(400).json({ error: 'Invalid duration value' });
    }

    const endTime = new Date(currentDate.getTime() + validHours * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ');

    bwipjs.toBuffer(
        {
            bcid: 'code128',
            text: newBarcode,
            scale: 3,
            height: 10,
            includetext: true,
            textxalign: 'center',
        },
        (err, png) => {
            if (err) {
                return res.status(500).json({ error: 'Failed to generate barcode image' });
            }

            const imageBase64 = png.toString('base64');

            const query = 'INSERT INTO tickets (ticket_date, hours, class, start_time, end_time, barcode) VALUES (NOW(), ?, ?, ?, ?, ?)';
            db.query(query, [validHours, ticketClass, startTime, endTime, newBarcode], (err, result) => {
                if (err) {
                    return res.status(500).json({ error: 'Failed to save ticket in database' });
                }

                res.json({
                    message: 'Ticket created successfully!',
                    barcode: newBarcode,
                    imageBase64: imageBase64,
                    startTime: startTime,
                    endTime: endTime,
                });
            });
        }
    );
});

// مسار عرض التذكرة
app.post('/display-ticket', (req, res) => {
    const { barcodeBase64, price, ticketClass } = req.body;

    if (!barcodeBase64 || !price || !ticketClass) {
        return res.status(400).send('Invalid data received');
    }

    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Your Ticket</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 0;
                    padding: 20px;
                    text-align: center;
                }
                img {
                    margin-top: 20px;
                }
            </style>
        </head>
        <body>
            <h1>Your Ticket</h1>
            <p>Class: ${ticketClass}, Price: SAR ${price}</p>
            <img src="data:image/png;base64,${barcodeBase64}" alt="Barcode">
        </body>
        </html>
    `);
});

// المسار لصفحة اتصل بنا
app.get('/contact.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../../CS1250', 'contact.html'));
});

// المسار للصفحة الرئيسية
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../CS1250', 'index.html'));
});

// المسار لصفحة عن الموقع
app.get('/about.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../../CS1250', 'about.html'));
});

// معالجة البيانات المرسلة من نموذج الاتصال
app.post('/contact', (req, res) => {
    const { firstName, lastName, email, mobile, message } = req.body;

    const query = 'INSERT INTO contacts (first_name, last_name, email, mobile, message) VALUES (?, ?, ?, ?, ?)';
    db.query(query, [firstName, lastName, email, mobile, message], (err, result) => {
        if (err) {
            console.error('Error inserting data:', err);
            return res.status(500).send('Error saving message');
        }
        res.json({ message: 'Message received successfully!' });
    });
});

// تشغيل الخادم
app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
