const express = require('express');
const path = require('path');
const mysql = require('mysql');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const bwipjs = require('bwip-js');
const bcrypt = require('bcryptjs');
const session = require('express-session');

// load .env
try {
    process.loadEnvFile(path.join(__dirname, '.env'));
} catch {
    console.warn('No .env file found in Server/ — copy .env.example to .env and fill it in');
}

// config
const PUBLIC_DIR = path.join(__dirname, '..');
const PORT = Number(process.env.PORT) || 3000;
const VALID_CLASSES = ['First-class', 'Regular'];

const app = express();
app.disable('x-powered-by');

// session
app.use(session({
    name: 'user_sid',
    secret: process.env.SESSION_SECRET || uuidv4(),
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60 * 1000
    }
}));

// middleware
app.use(cors({ origin: [`http://localhost:${PORT}`], credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// block server files
app.use('/Server', (req, res) => res.sendStatus(404));
app.use('/delet', (req, res) => res.sendStatus(404));
app.use(express.static(PUBLIC_DIR, { dotfiles: 'deny' }));

// database
const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'riyadhmetro'
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err.code || err.message);
        return;
    }
    console.log('Connected to MySQL database');
});

// escape html
function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// riyadh time
function toRiyadhSql(date) {
    const riyadhOffset = 3 * 60 * 60 * 1000;
    return new Date(date.getTime() + riyadhOffset).toISOString().slice(0, 19).replace('T', ' ');
}

// require login
function requireLogin(req, res, next) {
    if (!req.session.user || !req.session.user.id) {
        return res.status(401).json({ error: 'User not logged in' });
    }
    next();
}

// require admin
function requireAdmin(req, res, next) {
    if (!req.session.authenticated) {
        return res.status(401).json({ success: false });
    }
    next();
}

// home page
app.get('/', (req, res) => {
    res.sendFile(path.join(PUBLIC_DIR, 'logInSignUp.html'));
});

// arabic home page
app.get('/Ar', (req, res) => {
    res.sendFile(path.join(PUBLIC_DIR, 'logInSignUp-Ar.html'));
});

// account - sign up
app.post('/signup', (req, res) => {
    const { name, email, password, phone, birthdate, gender, address } = req.body;

    if (!name || !email || !password || !phone || !gender) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    db.query('SELECT id FROM users WHERE email = ?', [email], async (err, results) => {
        if (err) {
            console.error('Error checking email:', err);
            return res.status(500).json({ error: 'Error checking email.' });
        }

        if (results.length > 0) {
            return res.status(400).json({ error: 'Email is already registered.' });
        }

        try {
            const hashedPassword = await bcrypt.hash(password, 10);
            const query = 'INSERT INTO users (name, email, password, phone, birthdate, gender, address) VALUES (?, ?, ?, ?, ?, ?, ?)';

            db.query(query, [name, email, hashedPassword, phone, birthdate || null, gender, address || null], (err, result) => {
                if (err) {
                    console.error('Error inserting user:', err);
                    return res.status(500).json({ error: 'Error registering user.' });
                }

                req.session.user = { id: result.insertId, name, email };
                res.redirect('/profilePage.html');
            });
        } catch (error) {
            console.error('Error hashing password:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });
});

// account - log in
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).send('Please provide email and password.');
    }

    db.query('SELECT * FROM users WHERE email = ?', [email], (err, result) => {
        if (err) {
            console.error('Error fetching user:', err);
            return res.status(500).send('Error during login.');
        }

        if (result.length === 0) {
            return res.status(401).send('Invalid credentials.');
        }

        const user = result[0];
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) {
                return res.status(500).send('Error during login.');
            }
            if (!isMatch) {
                return res.status(401).send('Invalid credentials.');
            }

            req.session.user = { id: user.id, email: user.email };
            res.redirect('/profilePage.html');
        });
    });
});

// account - log out
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
        }
        res.clearCookie('user_sid');
        res.redirect('/logInSignUp.html');
    });
});

// account - reset password
app.post('/reset-password', (req, res) => {
    const { email, phone, password } = req.body;

    if (!email || !phone || !password) {
        return res.status(400).json({ message: 'Please provide email, phone number and new password' });
    }

    db.query('SELECT id FROM users WHERE email = ? AND phone = ?', [email, phone], async (err, results) => {
        if (err) {
            console.error('Error checking user:', err);
            return res.status(500).json({ message: 'Error checking user' });
        }

        if (results.length === 0) {
            return res.status(400).json({ message: 'Email and phone number do not match' });
        }

        try {
            const hashedPassword = await bcrypt.hash(password, 10);
            db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, results[0].id], (err) => {
                if (err) {
                    console.error('Error updating password:', err);
                    return res.status(500).json({ message: 'Failed to update password' });
                }
                res.json({ message: 'Password updated successfully' });
            });
        } catch (error) {
            console.error('Error during password reset:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    });
});

// profile
app.get('/api/profile', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: 'User not logged in' });
    }

    const query = 'SELECT name, phone, birthdate, gender, email, address FROM users WHERE id = ?';
    db.query(query, [req.session.user.id], (err, result) => {
        if (err) {
            console.error('Error fetching user data:', err);
            return res.status(500).json({ error: 'Error fetching user data' });
        }
        if (result.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(result[0]);
    });
});

// ticket - create
app.post('/generate-ticket', requireLogin, (req, res) => {
    const { class: ticketClass, price, duration } = req.body;

    if (!ticketClass || !price || !duration) {
        return res.status(400).json({ error: 'Missing ticket data' });
    }
    if (!VALID_CLASSES.includes(ticketClass)) {
        return res.status(400).json({ error: 'Invalid class value' });
    }

    const priceNumber = Number(price);
    if (!Number.isFinite(priceNumber) || priceNumber <= 0) {
        return res.status(400).json({ error: 'Invalid price value' });
    }

    const match = /^(\d+)-(hour|day)/.exec(String(duration));
    if (!match) {
        return res.status(400).json({ error: 'Invalid duration format. Use "X-day pass" or "X-hour pass".' });
    }
    const validHours = Number(match[1]) * (match[2] === 'day' ? 24 : 1);

    const newBarcode = uuidv4();
    const now = new Date();
    const startTime = toRiyadhSql(now);
    const endTime = toRiyadhSql(new Date(now.getTime() + validHours * 60 * 60 * 1000));

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

            const query =
                'INSERT INTO tickets (user_id, ticket_date, price, hours, class, start_time, end_time, barcode) ' +
                'VALUES (?, NOW(), ?, ?, ?, ?, ?, ?)';

            db.query(query, [req.session.user.id, priceNumber, validHours, ticketClass, startTime, endTime, newBarcode], (err) => {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({ error: 'Failed to save ticket in database' });
                }

                res.json({
                    message: 'Ticket created successfully!',
                    barcode: newBarcode,
                    imageBase64: png.toString('base64'),
                    startTime,
                    endTime,
                });
            });
        }
    );
});

// ticket - user tickets
app.get('/user-tickets', requireLogin, (req, res) => {
    const query = 'SELECT * FROM tickets WHERE user_id = ? ORDER BY ticket_date DESC';
    db.query(query, [req.session.user.id], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Failed to fetch tickets' });
        }
        res.json(results);
    });
});

// ticket - display
app.post('/display-ticket', (req, res) => {
    const { barcodeBase64, price, ticketClass } = req.body;

    const isBase64 = typeof barcodeBase64 === 'string' && /^[A-Za-z0-9+/]+={0,2}$/.test(barcodeBase64);
    const priceNumber = Number(price);
    if (!isBase64 || !VALID_CLASSES.includes(ticketClass) || !Number.isFinite(priceNumber) || priceNumber <= 0) {
        return res.status(400).send('Invalid data received');
    }

    res.send(`
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Riyadh metro</title>
    <link href="https://www.riyadhbus.sa/o/rcrc-theme/images/favicon.ico" rel="icon">
    <link rel="stylesheet" href="styleBarcodeR.css" />
  </head>
  <body>
    <div class="banner">
        <div class="navbar">
            <img src="photo/Riyadh_metro_logo.png" class="logo">
            <ul>
                <li><a href="HomePage.html">home</a></li>
                <li><a href="Paths.html">Map</a></li>
                <li><a href="Stations.html">lines</a></li>
                <li><a href="TicketPage.html">tickets</a></li>
                <li><a href="contact.html">support</a></li>
                <li><a href="profilePage.html">profile</a></li>
            </ul>
        </div>
    <main class="container">
      <div class="card">
        <h1>Your Ticket</h1>
        <p>Class: ${escapeHtml(ticketClass)}, Price: SAR ${priceNumber}</p>
        <img src="data:image/png;base64,${barcodeBase64}" alt="Barcode">
      </div>
    </main>
  </body>
</html>
    `);
});

// contact
app.post('/contact', (req, res) => {
    const { firstName, lastName, email, mobile, message } = req.body;

    if (!firstName || !lastName || !email || !mobile || !message) {
        return res.status(400).send('Missing contact data');
    }

    const query = 'INSERT INTO contacts (first_name, last_name, email, mobile, message) VALUES (?, ?, ?, ?, ?)';
    db.query(query, [firstName, lastName, email, mobile, message], (err) => {
        if (err) {
            console.error('Error inserting data:', err);
            return res.status(500).send('Error saving message');
        }
        res.json({ message: 'Message received successfully!' });
    });
});

// announcements - list
app.get('/api/announcements', (req, res) => {
    db.query('SELECT * FROM announcements ORDER BY date DESC', (err, results) => {
        if (err) {
            console.error('Error fetching announcements:', err);
            return res.status(500).json({ error: 'Failed to fetch announcements' });
        }
        res.json(results);
    });
});

// admin - log in
app.post('/login-admin', (req, res) => {
    const { username, password } = req.body;
    const adminUser = process.env.ADMIN_USERNAME;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (adminUser && adminPassword && username === adminUser && password === adminPassword) {
        req.session.authenticated = true;
        return res.json({ success: true });
    }
    res.status(401).json({ success: false });
});

// announcements - add
app.post('/announcements', requireAdmin, (req, res) => {
    const { title, description } = req.body;

    if (!title || !description) {
        return res.status(400).json({ success: false, message: 'Missing title or description' });
    }

    db.query('INSERT INTO announcements (title, description) VALUES (?, ?)', [title, description], (err, result) => {
        if (err) {
            console.error('Error inserting announcement:', err);
            return res.status(500).json({ success: false, message: 'Failed to save announcement' });
        }
        res.json({ success: true, id: result.insertId });
    });
});

// start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
