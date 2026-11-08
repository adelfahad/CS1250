# Riyadh Metro – CS1250

A ticket booking website for the Riyadh Metro, built with HTML/CSS/JavaScript on the front end and Node.js (Express) + MySQL on the back end. The site is available in English and Arabic.

## About the project

This project was built for the CS1250 course. It simulates the online experience of a Riyadh Metro rider: creating an account, browsing the metro lines, stations and map, buying a ticket that comes with a unique barcode, and reviewing previous tickets from the profile page. Riders can contact support through a form, and an admin can publish announcements that appear on the home page. All accounts, tickets, messages and announcements are stored in a MySQL database.

### Features

- **Accounts** – sign up, log in and log out. Passwords are hashed with `bcryptjs` and logged-in users are tracked with sessions (`express-session`).
- **Forgot password** – a user can set a new password after confirming their email and registered phone number.
- **Profile page** – shows the logged-in user's personal information from the database.
- **Ticket purchase** – two classes (First-class and Regular), each with four durations, plus a discounted price list for seniors (65+) and students.
- **Unique barcodes** – every ticket gets a UUID that is turned into a Code 128 barcode image on the server (`bwip-js`).
- **My tickets** – a page that lists every ticket the user bought with its start and end time.
- **Lines, stations and map** – information about the metro lines and an interactive map of the stations.
- **Contact / support form** – messages are saved to the database for the support team.
- **Announcements** – an admin logs in on `admin-Announcements.html` and publishes announcements shown on the home page.
- **Arabic version** – every page has an Arabic copy (`*-Ar.html`).

### Ticket options

| Duration | First-class | Regular | First-class (65+ / student) | Regular (65+ / student) |
|---|---|---|---|---|
| 2-hour pass | SAR 10 | SAR 4 | SAR 5 | SAR 2 |
| 3-day pass | SAR 50 | SAR 20 | SAR 25 | SAR 10 |
| 7-day pass | SAR 100 | SAR 40 | SAR 50 | SAR 20 |
| 30-day pass | SAR 350 | SAR 140 | SAR 175 | SAR 70 |

### How buying a ticket works

1. The logged-in rider opens `TicketPage.html` and clicks a ticket card.
2. The page sends the class, price and duration to `POST /generate-ticket`.
3. The server checks that the user is logged in and the data is valid, generates a UUID, draws its barcode, and saves the ticket (user, price, hours, class, start time, end time, barcode) to the `tickets` table. Times are stored in Riyadh time (UTC+3).
4. The server returns the barcode image as Base64, and the page sends it to `POST /display-ticket`.
5. The server responds with a ticket page showing the class, price and barcode.
6. The ticket then appears on the rider's `user-tickets.html` page.

## Pages

| Page | Description |
|---|---|
| `logInSignUp.html` | Sign in / sign up / forgot password (entry point, served at `/`) |
| `HomePage.html` | Home page with the latest announcements |
| `Paths.html` | Interactive metro map |
| `Stations.html` | Metro lines and stations |
| `TicketPage.html` | Choose a ticket and generate its barcode |
| `user-tickets.html` | Tickets bought by the logged-in user |
| `profilePage.html` | User profile |
| `contact.html` | Contact / support form |
| `fareCalculator.html` | Fare calculator |
| `admin-Announcements.html` | Admin login and announcement publishing |

Every page except the fare calculator and the admin page has an Arabic version with the `-Ar` suffix (for example `HomePage-Ar.html`). The Arabic login page is served at `/Ar`.

## Project structure

```
CS1250/
├── *.html / *-Ar.html               # English and Arabic pages
├── *.css                            # page stylesheets
├── map.js, RiyadhMetro.js, ...      # front-end scripts
├── photo/                           # logos and images
├── Server/
│   ├── server.js                    # Express server + API
│   ├── package.json                 # dependencies and npm scripts
│   └── .env.example                 # template for secrets (database, session, admin)
├── delet/                           # unused / old files (safe to remove)
└── .github/workflows/node-ci.yml    # GitHub Actions CI
```

## Server (`Server/`)

### API endpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/signup` | Create an account and log in |
| `POST` | `/login` | Log in |
| `GET` | `/logout` | Log out |
| `POST` | `/reset-password` | Set a new password (email + phone must match) |
| `GET` | `/api/profile` | Logged-in user's profile data |
| `POST` | `/generate-ticket` | Create a ticket with a barcode (login required) |
| `GET` | `/user-tickets` | Logged-in user's tickets (login required) |
| `POST` | `/display-ticket` | Render the ticket page |
| `POST` | `/contact` | Save a contact message |
| `GET` | `/api/announcements` | List announcements |
| `POST` | `/login-admin` | Admin login |
| `POST` | `/announcements` | Publish an announcement (admin only) |

Libraries used: `express`, `express-session`, `mysql`, `bcryptjs`, `cors`, `uuid`, `bwip-js`.

### Database

The server expects a MySQL database named `riyadhmetro` with these tables:

```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    birthdate DATE,
    gender VARCHAR(10) NOT NULL,
    address VARCHAR(255)
);

CREATE TABLE tickets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    ticket_date DATETIME,
    price DECIMAL(8, 2),
    hours INT,
    class VARCHAR(20),
    start_time DATETIME,
    end_time DATETIME,
    barcode VARCHAR(36) UNIQUE,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE contacts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    email VARCHAR(100),
    mobile VARCHAR(20),
    message TEXT
);

CREATE TABLE announcements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    date DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Security

- Secrets (database credentials, session secret, admin login) live in `Server/.env`, which is never committed.
- Passwords are hashed with bcrypt before they are stored.
- Files inside `Server/` (such as `server.js` and `.env`) cannot be opened from the browser.
- Ticket data is validated before it is put into the ticket page, to prevent XSS.

### Continuous integration

On every push to `main` or `AdelFahad` and on every pull request to `main`, GitHub Actions installs the server dependencies and runs `npm test`, which checks `server.js` for syntax errors.

## Getting started

1. Install [Node.js](https://nodejs.org) (version 20.12 or newer) and MySQL.
2. Create a database named `riyadhmetro` with the tables above (see [Database](#database)).
3. Copy `Server/.env.example` to `Server/.env` and fill in your MySQL username and password, a session secret, and the admin username and password.
4. Install the dependencies and start the server:

```bash
cd Server
npm install
npm start
```

5. Open http://localhost:3000 in your browser (or http://localhost:3000/Ar for Arabic).

> The `node_modules` folder is not committed (it is listed in `.gitignore`); `npm install` creates it.

## `delet/` folder

Contains old or experimental files the site no longer uses (test pages, Python barcode scripts, unlinked images and CSS files, and an old root `package.json`). It can be deleted once you've confirmed nothing is needed.
