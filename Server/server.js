const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid'); // استيراد مكتبة UUID لتوليد أكواد فريدة

const app = express();

// تفعيل CORS
app.use(cors());

// إعداد body-parser لتحليل JSON
app.use(bodyParser.json());

// إعداد مجلد الملفات الثابتة
app.use(express.static(path.join(__dirname, 'public')));

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

// توليد وتحديث الباركود
app.post('/generate-barcode', (req, res) => {
    const { ticketId } = req.body; // الحصول على رقم التذكرة من الطلب
    const newBarcode = uuidv4(); // توليد باركود فريد

    // تحديث الباركود في قاعدة البيانات
    const query = 'UPDATE tickets SET barcode = ? WHERE id = ?';
    db.query(query, [newBarcode, ticketId], (err, result) => {
        if (err) {
            console.error('Error updating barcode:', err);
            return res.status(500).json({ error: 'Failed to update barcode' });
        }
        res.json({ barcode: newBarcode });
    });
});

// استرجاع بيانات التذاكر
app.get('/tickets', (req, res) => {
    const query = 'SELECT * FROM tickets';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching tickets:', err);
            return res.status(500).json({ error: 'Failed to fetch tickets' });
        }
        res.json(results);
    });
});

// حفظ رسالة من نموذج الاتصال
app.post('/contact', (req, res) => {
    const { firstName, lastName, email, mobile, message } = req.body;
    const query = 'INSERT INTO contacts (first_name, last_name, email, mobile, message) VALUES (?, ?, ?, ?, ?)';
    db.query(query, [firstName, lastName, email, mobile, message], (err, result) => {
        if (err) {
            console.error('Error saving contact message:', err);
            return res.status(500).json({ error: 'Failed to save message' });
        }
        res.json({ message: 'Message received successfully!' });
    });
});

// تشغيل الخادم
app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
