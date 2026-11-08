# Riyadh Metro – CS1250

A ticket booking website for the Riyadh Metro, built with HTML/CSS on the front end and Node.js (Express) + MySQL on the back end.

## About the project

This project was built for the CS1250 course. It simulates the online ticketing experience of the Riyadh Metro: a rider can browse the site, pick a ticket class and duration, and instantly receive a digital ticket with a unique barcode that could be scanned at the station gates. Riders can also reach customer support through a contact form, and every ticket and message is stored in a MySQL database.

### Features

- **Ticket purchase** – two ticket classes (First-class and Regular), each with four durations.
- **Unique barcodes** – every ticket gets a UUID that is turned into a Code 128 barcode image on the server.
- **Ticket validity** – the server records each ticket's start and end time so its validity can be checked later.
- **Contact / support form** – messages are saved to the database for the support team.
- **Sign in / sign up page** – allows users to create a new account and log in to it.
- **profile page** -  allows users to view their personal information.

### Ticket options

| Duration | First-class | Regular |
|---|---|---|
| 2-hour pass | SAR 10 | SAR 4 |
| 3-day pass | SAR 50 | SAR 20 |
| 7-day pass | SAR 100 | SAR 40 |
| 30-day pass | SAR 350 | SAR 140 |

### How buying a ticket works

1. The rider opens `TicketPage.html` and clicks a ticket card.
2. The page sends the class, price and duration to `POST /generate-ticket`.
3. The server validates the data, generates a UUID, draws its barcode with `bwip-js`, and saves the ticket (class, hours, start time, end time, barcode) to the `tickets` table.
4. The server returns the barcode image as Base64, and the page sends it to `POST /display-ticket`.
5. The server responds with a ticket page showing the class, price and barcode, which replaces the current page.

### Project structure

```
CS1250/
├── index.html, HomePage.html, ...   # front-end pages
├── style*.css                       # one stylesheet per page
├── photo/                           # logos and images
├── Server/
│   ├── server.js                    # Express server + API
│   ├── package.json                 # dependencies and npm scripts
│   └── .env.example                 # template for database credentials
└── .github/workflows/               # GitHub Actions CI
```

## Pages

| Page | Description |
|---|---|
| `index.html` | Landing page (entry point) |
| `logInSignUp.html` | Sign in / sign up |
| `HomePage.html` | Home page after signing in |
| `TicketPage.html` | Choose a ticket and generate its barcode |
| `profilePage.html` | User profile |
| `contact.html` | Contact / support form |

Stylesheets: `style.css`, `styleLogIn.css`, `styleHomePage.css`, `styleProfilePage.css`, `styleContact.css`.
Images live in the `photo/` folder, plus `riyadhMetro.jpeg` (page background).

## Server (`Server/`)

API endpoints:

- `POST /generate-ticket` – creates a new ticket with a unique barcode (UUID + bwip-js) and saves it to the `tickets` table.
- `POST /display-ticket` – renders a ticket page with the barcode image.
- `POST /contact` – saves a contact message to the `contacts` table.

Libraries used: `express`, `mysql`, `cors`, `uuid`, `bwip-js`.

### Database

The server expects a MySQL database named `riyadhmetro` with these tables:

```sql
CREATE TABLE tickets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ticket_date DATETIME,
    hours INT,
    class VARCHAR(20),
    start_time DATETIME,
    end_time DATETIME,
    barcode VARCHAR(36) UNIQUE
);

CREATE TABLE contacts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    email VARCHAR(100),
    mobile VARCHAR(20),
    message TEXT
);
```

### Continuous integration

On every push and pull request to `main`, GitHub Actions installs the server dependencies and runs `npm test`, which checks `server.js` for syntax errors.

## Getting started

1. Install [Node.js](https://nodejs.org) and MySQL.
2. Create a database named `riyadhmetro` with the `tickets` and `contacts` tables (see [Database](#database)).
3. Copy `Server/.env.example` to `Server/.env` and fill in your MySQL username and password.
4. Install the dependencies and start the server:

```bash
cd Server
npm install
npm start
```

5. Open http://localhost:3000 in your browser.