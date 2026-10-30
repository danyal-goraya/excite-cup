const express = require('express');
const { Pool } = require('pg');
const app = express();
app.use(express.json());

const pool = new Pool({
  host: process.env.DB_HOST || 'db',
  user: process.env.DB_USER || 'eventuser',
  password: process.env.DB_PASS || 'eventpass',
  database: process.env.DB_NAME || 'eventdb',
  port: 5432
});

async function init() {
  for (let i = 0; i < 20; i++) {
    try {
      await pool.query(`CREATE TABLE IF NOT EXISTS events (
        id SERIAL PRIMARY KEY, name TEXT, category TEXT, venue TEXT, event_date TEXT)`);
      await pool.query(`CREATE TABLE IF NOT EXISTS registrations (
        id SERIAL PRIMARY KEY, event_id INT, name TEXT, email TEXT, team TEXT,
        created_at TIMESTAMP DEFAULT NOW())`);
      const c = await pool.query('SELECT COUNT(*) FROM events');
      if (parseInt(c.rows[0].count) === 0) {
        await pool.query(`INSERT INTO events (name,category,venue,event_date) VALUES
          ('Football Championship','Sports','Main Ground','12 Nov 2026'),
          ('Cricket Tournament','Sports','Cricket Field','13 Nov 2026'),
          ('Hackathon 24h','Tech','CS Lab','14 Nov 2026'),
          ('Gaming Arena (Valorant)','Esports','Auditorium','15 Nov 2026'),
          ('Debate Competition','Literary','Seminar Hall','16 Nov 2026'),
          ('Singing Night','Cultural','Open Stage','17 Nov 2026')`);
      }
      console.log('Database ready');
      return;
    } catch (e) {
      console.log('Waiting for database...', e.message);
      await new Promise(r => setTimeout(r, 2000));
    }
  }
}

app.get('/api/events', async (req, res) => {
  const r = await pool.query('SELECT * FROM events ORDER BY id');
  res.json(r.rows);
});
app.get('/api/registrations', async (req, res) => {
  const r = await pool.query(`SELECT r.id, r.name, r.team, e.name AS event
    FROM registrations r JOIN events e ON e.id = r.event_id ORDER BY r.id DESC LIMIT 20`);
  res.json(r.rows);
});
app.post('/api/register', async (req, res) => {
  const { event_id, name, email, team } = req.body;
  if (!event_id || !name || !email) return res.status(400).json({ error: 'Missing fields' });
  const r = await pool.query(
    'INSERT INTO registrations (event_id,name,email,team) VALUES ($1,$2,$3,$4) RETURNING *',
    [event_id, name, email, team || '-']);
  res.status(201).json(r.rows[0]);
});

init().then(() => app.listen(3000, () => console.log('API on 3000')));
