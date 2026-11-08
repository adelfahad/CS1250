const express = require('express');
const path = require('path');
const mysql = require('mysql');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const bwipjs = require('bwip-js');

const app = express();
const PUBLIC_DIR = path.join(__dirname, '..'); // مجلد المشروع اللي فيه صفحات HTML

app.disable('x-powered-by');
app.use(cors());
app.use(express.json());

// منع الوصول لملفات السيرفر (server.js, package.json, .env) من المتصفح
app.use('/Server', (req, res) => res.sendStatus(404));
app.use(express.static(PUBLIC_DIR, { dotfiles: 'deny' }));

// بيانات قاعدة البيانات تنقرأ من ملف Server/.env (غير مرفوع على GitHub)
try {
    process.loadEnvFile(path.join(__dirname, '.env'));
} catch {
    console.warn('No .env file found in Server/ — copy .env.example to .env and fill it in');
}

const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'riyadhmetro'
});


db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to MySQL database');
});


app.post('/generate-ticket', (req, res) => {
    const { class: ticketClass, price, duration } = req.body;

    
    if (!ticketClass || !price || !duration) {
        console.error('Missing ticket data:', { ticketClass, price, duration });
        return res.status(400).json({ error: 'Missing ticket data' });
    }

    const validClasses = ['First-class', 'Regular'];
    if (!validClasses.includes(ticketClass)) {
        console.error('Invalid class value:', ticketClass);
        return res.status(400).json({ error: 'Invalid class value' });
    }

    const newBarcode = uuidv4();
    const currentDate = new Date();
    const startTime = currentDate.toISOString().slice(0, 19).replace('T', ' '); 
    // "2-hour pass" => 2 ساعات، "3-day pass" => 72 ساعة
    const match = /^(\d+)-(hour|day)/.exec(String(duration));
    if (!match) {
        console.error('Invalid duration value:', duration);
        return res.status(400).json({ error: 'Invalid duration value' });
    }
    const validHours = Number(match[1]) * (match[2] === 'day' ? 24 : 1);
    const endTime = new Date(currentDate.getTime() + validHours * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 19)
        .replace('T', ' ');

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
                console.error('Error generating barcode image:', err);
                return res.status(500).json({ error: 'Failed to generate barcode image' });
            }

            const imageBase64 = png.toString('base64');

            const query = `
                INSERT INTO tickets (ticket_date, hours, class, start_time, end_time, barcode)
                VALUES (NOW(), ?, ?, ?, ?, ?)
            `;
            db.query(query, [validHours, ticketClass, startTime, endTime, newBarcode], (err) => {
                if (err) {
                    console.error('Error inserting ticket into database:', err);
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


app.post('/display-ticket', (req, res) => {
    const { barcodeBase64, price, ticketClass } = req.body;

    // التحقق من البيانات قبل وضعها في الصفحة (حماية من XSS)
    const validClasses = ['First-class', 'Regular'];
    const isBase64 = typeof barcodeBase64 === 'string' && /^[A-Za-z0-9+/]+={0,2}$/.test(barcodeBase64);
    const priceNumber = Number(price);
    if (!isBase64 || !validClasses.includes(ticketClass) || !Number.isFinite(priceNumber) || priceNumber <= 0) {
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
            <p>Class: ${ticketClass}, Price: SAR ${priceNumber}</p>
            <img src="data:image/png;base64,${barcodeBase64}" alt="Barcode">
        </body>
        </html>
    `);
});

app.post('/contact', (req, res) => {
    const { firstName, lastName, email, mobile, message } = req.body;

    const query = 'INSERT INTO contacts (first_name, last_name, email, mobile, message) VALUES (?, ?, ?, ?, ?)';

    if (!firstName || !lastName || !email || !mobile || !message) {
        return res.status(400).send('Missing contact data');
    }

    db.query(query, [firstName, lastName, email, mobile, message], (err) => {
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
