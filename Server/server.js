const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const cors = require('cors'); // استيراد مكتبة CORS

const app = express();

// تفعيل CORS لجميع الطلبات
app.use(cors());

// إعداد body-parser لتحليل البيانات JSON في الطلبات
app.use(bodyParser.json());

// إعداد مجلد الملفات  (مثل HTML و CSS و صور)
app.use(express.static(path.join(__dirname, '../../CS1250')));

// إعداد الاتصال بقاعدة البيانات
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Root@1234', // كلمة السر
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

// المسار لصفحة اتصل بنا
app.get('/contact.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../../CS1250', 'contact.html'));  // إرسال contact.html
});

// المسار للصفحة الرئيسية
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../CS1250', 'index.html'));  // إرسال index.html
});

// المسار لصفحة عن الموقع
app.get('/about.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../../CS1250', 'about.html'));  // إرسال about.html
});

// المسار لمعالجة البيانات المرسلة من نموذج الاتصال (حفظ البيانات في قاعدة البيانات)
app.post('/contact', (req, res) => {
    const { firstName, lastName, email, mobile, message } = req.body;

    const query = 'INSERT INTO contacts (first_name, last_name, email, mobile, message) VALUES (?, ?, ?, ?, ?)';  // تعديل اسم الجدول هنا

    db.query(query, [firstName, lastName, email, mobile, message], (err, result) => {
        if (err) {
            console.error('Error inserting data:', err);
            return res.status(500).send('Error saving message');
        }
        res.json({ message: 'Message received successfully!' });
    });
});

// تشغيل الخادم على المنفذ 3000
app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
