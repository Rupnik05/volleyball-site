const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const port = 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Database setup
const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the SQLite database.');
});

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS registrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        team_name TEXT NOT NULL,
        captain_name TEXT NOT NULL,
        captain_email TEXT UNIQUE NOT NULL,
        captain_phone TEXT,
        players_count INTEGER,
        payment_reference TEXT UNIQUE,
        is_paid BOOLEAN DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
});

// Routes
app.post('/register', (req, res) => {
    const { team_name, captain_name, captain_email, captain_phone, players_count } = req.body;

    if (!team_name || !captain_name || !captain_email || !players_count) {
        return res.status(400).json({ error: 'Prosimo, izpolnite vsa obvezna polja.' });
    }

    db.get('SELECT id FROM registrations ORDER BY id DESC LIMIT 1', [], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        let lastId = row ? row.id : 0;
        const payment_reference = `VOL2025-${String(lastId + 1).padStart(3, '0')}`;

        const sql = `INSERT INTO registrations (team_name, captain_name, captain_email, captain_phone, players_count, payment_reference) VALUES (?, ?, ?, ?, ?, ?)`;
        const params = [team_name, captain_name, captain_email, captain_phone, players_count, payment_reference];

        db.run(sql, params, function(err) {
            if (err) {
                if (err.message.includes('UNIQUE constraint failed')) {
                    return res.status(400).json({ error: 'Ekipa s tem e-poštnim naslovom je že prijavljena.' });
                }
                return res.status(500).json({ error: err.message });
            }
            res.json({ 
                message: 'Prijava uspešna!',
                paymentReference: payment_reference
            });
        });
    });
});

app.get('/admin/registrations', (req, res) => {
    const sql = "SELECT * FROM registrations ORDER BY created_at DESC";
    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

app.put('/admin/registrations/:id/pay', (req, res) => {
    const sql = `UPDATE registrations SET is_paid = 1 WHERE id = ?`;
    db.run(sql, [req.params.id], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Plačilo označeno kot prejeto.' });
    });
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin', 'index.html'));
});

app.get('/status', (req, res) => {
    const identifier = req.query.identifier;
    const sql = `SELECT team_name, is_paid FROM registrations WHERE captain_email = ? OR payment_reference = ?`;
    db.get(sql, [identifier, identifier], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (row) {
            res.json(row);
        } else {
            res.status(404).json({ error: 'Prijave s tem emailom ali referenco ne najdem.' });
        }
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
