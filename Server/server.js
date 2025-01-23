const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const cors = require('cors'); // استيراد مكتبة CORS
const { v4: uuidv4 } = require('uuid'); // مكتبة لتوليد باركود فريد
const bwipjs = require('bwip-js'); // مكتبة لإنشاء الباركود

const app = express();

// تفعيل CORS لجميع الطلبات
app.use(cors());

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

// مسار لتوليد باركود مباشرة كـ base64 دون حفظ الصورة
app.post('/generate-ticket', (req, res) => {
    const { class: ticketClass, price, duration } = req.body;

    // التحقق من البيانات المدخلة
    if (!ticketClass || !price || !duration) {
        console.error('Missing ticket data:', { ticketClass, price, duration });
        return res.status(400).json({ error: 'Missing ticket data' });
    }

    const validClasses = ['VIP', 'Normal', 'First-class', 'Regular'];
    if (!validClasses.includes(ticketClass)) {
        console.error('Invalid class value:', ticketClass);
        return res.status(400).json({ error: 'Invalid class value' });
    }

    const newBarcode = uuidv4(); // توليد باركود فريد
    const currentDate = new Date(); // وقت الشراء
    const startTime = currentDate.toISOString().slice(0, 19).replace('T', ' '); // تحويل الوقت لصيغة MySQL
    const validHours = parseInt(duration.split('-')[0]); // استخراج عدد الساعات
    const endTime = new Date(currentDate.getTime() + validHours * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 19)
        .replace('T', ' ');

    if (isNaN(validHours)) {
        console.error('Invalid duration value:', duration);
        return res.status(400).json({ error: 'Invalid duration value' });
    }

    bwipjs.toBuffer(
        {
            bcid: 'code128',       // نوع الباركود
            text: newBarcode,      // النص الذي سيتم تحويله إلى باركود
            scale: 3,              // حجم الصورة
            height: 10,            // ارتفاع الباركود
            includetext: true,     // تضمين النص أسفل الباركود
            textxalign: 'center',  // محاذاة النص
        },
        (err, png) => {
            if (err) {
                console.error('Error generating barcode image:', err);
                return res.status(500).json({ error: 'Failed to generate barcode image' });
            }

            // تحويل الصورة إلى Base64
            const imageBase64 = png.toString('base64');

            // حفظ البيانات في قاعدة البيانات
            const query = `
                INSERT INTO tickets (ticket_date, hours, class, start_time, end_time, barcode)
                VALUES (NOW(), ?, ?, ?, ?, ?)
            `;
            db.query(query, [validHours, ticketClass, startTime, endTime, newBarcode], (err, result) => {
                if (err) {
                    console.error('Error inserting ticket into database:', err);
                    return res.status(500).json({ error: 'Failed to save ticket in database' });
                }

                // إرسال الرد مع البيانات
                res.json({
                    message: 'Ticket created successfully!',
                    barcode: newBarcode,
                    imageBase64: imageBase64, // إرسال الصورة كـ Base64
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

    // التحقق من البيانات
    if (!barcodeBase64 || !price || !ticketClass) {
        return res.status(400).send('Invalid data received');
    }

    // إنشاء صفحة HTML مع تضمين البيانات
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

// تشغيل الخادم
app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
