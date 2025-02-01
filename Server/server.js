const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const bwipjs = require('bwip-js');
const bcrypt = require('bcryptjs');
const cookieParser = require('cookie-parser');
const session = require('express-session');

const app = express();
app.use(cookieParser());
app.use(session({
    key: 'user_sid',
    secret: 'somerandonstuffs',
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: 30 * 24 * 60 * 60 * 1000
    }
}));

const allowedOrigins = ['http://localhost:3000', 'http://example.com'];
app.use(cors({ origin: allowedOrigins }));

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../../CS1250')));

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Root@1234',
    database: 'riyadhmetro'
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

app.post('/signup', async (req, res) => {
    const { name, email, password, phone, birthdate, gender, address } = req.body;

    if (!name || !email || !password || !phone || !gender) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const checkEmailQuery = 'SELECT * FROM users WHERE email = ?';
        db.query(checkEmailQuery, [email], async (err, results) => {
            if (err) {
                console.error('Error checking email:', err);
                return res.status(500).send('Error checking email.');
            }

            if (results.length > 0) {
                return res.status(400).json({ error: 'Email is already registered.' });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const query = 'INSERT INTO users (name, email, password, phone, birthdate, gender, address) VALUES (?, ?, ?, ?, ?, ?, ?)';
            
            db.query(query, [name, email, hashedPassword, phone, birthdate || null, gender, address || null], (err, result) => {
                if (err) {
                    console.log('Error inserting data into database:', err);
                    return res.status(500).send('Error registering user.');
                }
                console.log('User registered successfully');

                req.session.user = {
                    id: result.insertId,
                    name: name,
                    email: email
                };
                res.redirect('/profilePage.html');
            });
        });
    } catch (err) {
        console.log('Error hashing password:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;

    const query = 'SELECT * FROM users WHERE email = ?';
    db.query(query, [email], (err, result) => {
        if (err) {
            console.error('Error fetching user:', err);
            return res.status(500).send('Error during login.');
        }

        if (result.length > 0) {
            const user = result[0];

            bcrypt.compare(password, user.password, (err, isMatch) => {
                if (err) {
                    return res.status(500).send('Error during login.');
                }

                if (isMatch) {
                    req.session.user = { id: user.id, email: user.email };
                    return res.redirect('/profilePage.html');
                } else {
                    return res.status(401).send('Invalid credentials.');
                }
            });
        } else {
            return res.status(401).send('Invalid credentials.');
        }
    });
});

app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.log('Error destroying session:', err);
        }
        res.redirect('/logInSignUp.html');
    });
});
app.post('/generate-ticket', async (req, res) => {
    try {
        const { class: ticketClass, price, duration } = req.body;

        if (!ticketClass || !price || !duration) {
            return res.status(400).json({ error: 'Missing ticket data' });
        }

        if (!req.session.user || !req.session.user.id) {
            return res.status(401).json({ error: 'User not logged in' });
        }

        const userId = req.session.user.id;

        // التحقق من الفئة
        const validClasses = ['VIP', 'Normal', 'First-class', 'Regular'];
        if (!validClasses.includes(ticketClass)) {
            return res.status(400).json({ error: 'Invalid class value' });
        }

        const newBarcode = uuidv4();
        const riyadhOffset = 3 * 60 * 60 * 1000; // توقيت الرياض
        const currentDate = new Date();
        const startTime = new Date(currentDate.getTime() + riyadhOffset)
        .toISOString()
        .slice(0, 19)
        .replace('T', ' ');

        // استخراج عدد الساعات من المدة
        let validHours;
        let validDays;
        if (duration.includes('day')) {
            validDays = parseInt(duration.split('-')[0]);
            validHours = validDays * 24; // تحويل الأيام إلى ساعات
        } else if (duration.includes('hour')) {
            validHours = parseInt(duration.split('-')[0]); // استخراج الساعات مباشرة
        } else {
            return res.status(400).json({ error: 'Invalid duration format. Use "X-day pass" or "X-hour pass".' });
        }

        if (isNaN(validHours) || validHours <= 0) {
            return res.status(400).json({ error: 'Invalid duration value' });
        }

        // حساب وقت انتهاء التذكرة
        const endTime = new Date(currentDate.getTime() + (validHours * 60 * 60 * 1000) + riyadhOffset)
        .toISOString()
        .slice(0, 19)
        .replace('T', ' ');

        // إنشاء صورة الباركود
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

                // إدخال البيانات إلى قاعدة البيانات
                const query =
                    'INSERT INTO tickets (user_id, ticket_date, price, hours, class, start_time, end_time, barcode) ' +
                    'VALUES (?, NOW(), ?, ?, ?, ?, ?, ?)';

                db.query(query, [userId, price, validHours, ticketClass, startTime, endTime, newBarcode], (err, result) => {
                    if (err) {
                        console.error('❌ Database error:', err);
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
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/fareCalculator.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../../CS1250', 'fareCalculator.html'));
});


app.get('/user-tickets', (req, res) => {
    const user_id = req.session.user.id;

    const query = 'SELECT * FROM tickets WHERE user_id = ? ORDER BY ticket_date DESC';
    
    db.query(query, [user_id], (err, results) => {
        if (err) {
            console.error('❌ Database error:', err);
            return res.status(500).json({ error: 'Failed to fetch tickets' });
        }

        console.log('📌 Tickets from database:', results);
        res.json(results);  
    });
});

app.post('/display-ticket', (req, res) => {
    const { barcodeBase64, price, ticketClass } = req.body;

    if (!barcodeBase64 || !price || !ticketClass) {
        return res.status(400).send('Invalid data received');
    }

    res.send(`
<!DOCTYPE html>
<html lang="en">
  <head>
    <title>Riyadh metro</title>
    <link href="photo/Riyadh_metro_logo" rel="icon">
    <link href="https://www.riyadhbus.sa/o/rcrc-theme/images/favicon.ico" rel="icon">
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Frontend Mentor | QR Code Component</title>
    <link rel="stylesheet" href="styleBarcodeR.css" />
  </head>
  <body>
    <div class="banner">
        <div class="navbar">
            <img src="photo/Riyadh_metro_logo.png" class="logo">
            <ul>
                <li><a href="#">Map</a></li>
                <li><a href="TicketPage.html">Tickets</a></li>
                <li><a href="#">announcement</a></li>
                <li><a href="profilePage.html">Profile</a></li>
                <li><a href="contact.html">support</a></li>

            </ul>
        </div>
    <main class="container">
      <div class="card">
        <h1>Your Ticket</h1>
        <p>Class: ${ticketClass}, Price: SAR ${price}</p>
        <img src="data:image/png;base64,${barcodeBase64}" alt="Barcode">
      </div>
    </main>
  </body>
</html>
    `);
});

app.post('/reset-password', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        console.log('Error: Missing email or password');
        return res.status(400).json({ message: 'Please provide both email and password' });
    }

    try {
        const checkUserQuery = 'SELECT * FROM users WHERE email = ?';
        db.query(checkUserQuery, [email], async (err, results) => {
            if (err) {
                console.error('Error checking user:', err);
                return res.status(500).json({ message: 'Error checking user' });
            }

            if (results.length === 0) {
                console.log(`No user found with email: ${email}`);
                return res.status(404).json({ message: 'Email not found' });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const updateQuery = 'UPDATE users SET password = ? WHERE email = ?';
            db.query(updateQuery, [hashedPassword, email], (err, result) => {
                if (err) {
                    console.error('Error updating password:', err);
                    return res.status(500).json({ message: 'Failed to update password' });
                }

                console.log('Password updated successfully');
                res.json({ message: 'Password updated successfully' });
            });
        });
    } catch (error) {
        console.error('Error during password reset:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});



app.get('/contact.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../../CS1250', 'contact.html'));
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../CS1250', 'logInSignUp.html'));
});


app.get('/about.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../../CS1250', 'about.html'));
});

app.get('Stations.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../../CS1250', 'Stations.html'));
});

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
app.get('/profile', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
  
    // افترض أننا نستخدم البريد الإلكتروني لاسترجاع البيانات
    const email = req.session.user.email;
  
    // استعلام لجلب البيانات من قاعدة البيانات
    const query = 'SELECT name, phone, birthdate, gender, email, address FROM users WHERE email = ?';
    db.query(query, [email], (err, result) => {
      if (err) {
        console.log('Error fetching user data:', err);
        return res.status(500).send('Error fetching user data.');
      }
        // التأكد من أن البيانات موجودة
    if (result.length > 0) {
        const user = result[0];
    } else {
        res.status(404).send('User not found.');
      }
    });
    });
    app.get('/api/profile', (req, res) => {
        if (!req.session.user) {
            return res.status(401).send({ error: 'User not logged in' });
        }
    
        const email = req.session.user.email;
    
        const query = 'SELECT name, phone, birthdate, gender, email, address FROM users WHERE email = ?';
        db.query(query, [email], (err, result) => {
            if (err) {
                console.log('Error fetching user data:', err);
                return res.status(500).send({ error: 'Error fetching user data' });
            }
    
            if (result.length > 0) {
                const user = result[0];
                res.json(user);
            } else {
                res.status(404).send({ error: 'User not found' });
            }
        });
    });
    app.get('/api/announcements', (req, res) => {
        const sql = 'SELECT * FROM announcements ORDER BY date DESC';
        db.query(sql, (err, results) => {
          if(err) {
            return res.status(500).json({ error: err.message });
          }
          res.json(results);
        });
      });
      app.post('/login-admin', async (req, res) => {
        const { username, password } = req.body;
        
        // Hardcoded credentials (in real app, use database lookup)
        if (username === 'admin' && password === 'Ss@1234') {
            req.session.authenticated = true;
            res.json({ success: true });
        } else {
            res.status(401).json({ success: false });
        }
    });
    
    app.post('/announcements', (req, res) => {
        if (!req.session.authenticated) {
            return res.status(401).json({ success: false });
        }

        const { title, description } = req.body;

        if (!title || !description) {
            return res.status(400).json({ success: false, message: 'Missing title or description' });
        }

        const query = 'INSERT INTO announcements (title, description) VALUES (?, ?)';
        db.query(query, [title, description], (err, result) => {
            if (err) {
                console.error('Error inserting announcement:', err);
                return res.status(500).json({ success: false, error: err.message });
            }

            res.json({ success: true, id: result.insertId });
        });
    });
    
    // عربي
    app.get('/contact-Ar.html', (req, res) => {
        res.sendFile(path.join(__dirname, '../../CS1250', 'contact-Ar.html'));
    });
    
    app.get('/Ar', (req, res) => {
        res.sendFile(path.join(__dirname, '../../CS1250', 'logInSignUp-Ar.html'));
    });
    
    app.get('Stations-Ar.html', (req, res) => {
        res.sendFile(path.join(__dirname, '../../CS1250', 'Stations-Ar.html'));
    });
    
    
// تشغيل الخادم
app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
