const express = require('express');
const cors = require('cors');
const client = require('./client.js');
const app = express();
const morgan = require('morgan');
const ensureAuth = require('./auth/ensure-auth');
const createAuthRoutes = require('./auth/create-auth-routes');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev')); // http logging

const authRoutes = createAuthRoutes();

// setup authentication routes to give user an auth token
// creates a /auth/signin and a /auth/signup POST route. 
// each requires a POST body with a .email and a .password
app.use('/auth', authRoutes);

// everything that starts with "/api" below here requires an auth token!
app.use('/api', ensureAuth);

// and now every request that has a token in the Authorization header will have a `req.userId` property for us to see who's talking
app.get('/api/test', (req, res) => {
  res.json({
    message: `in this proctected route, we get the user's id like so: ${req.userId}`
  });
});



app.get('/theorems', async(req, res) => {
  try {
    const data = await client.query(`
      SELECT theorems.id, theorems.name, theorems.difficulty, theorems.veracity, fields.name as field
        FROM theorems
        JOIN fields
        on fields.id = theorems.field_id
    `);
    
    res.json(data.rows);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

app.get('/fields', async(req, res) => {
  try {
    const data = await client.query(`
      SELECT * from fields
    `);

    res.json(data.rows);

  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/theorems/:id', async(req, res) => {
  try {
    const theoremId = req.params.id;

    const data = await client.query(`
      SELECT * from theorems
      WHERE theorems.id=$1
    `, [theoremId]);
    
    res.json(data.rows[0]);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

app.post('/theorems', async(req, res) => {
  try {
    const newName = req.body.name;
    const newDifficulty = req.body.difficulty;
    const newVeracity = req.body.veracity;
    const newField = req.body.field;
    const newOwnerId = req.body.owner_id;

    const data = await client.query(`
      INSERT INTO theorems (name, difficulty, veracity, field, owner_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, 
    [newName, newDifficulty, newVeracity, newField, newOwnerId]
    );

    res.json(data.rows[0]);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

app.put('/theorems/:id', async(req, res) => {
  try {
    const newName = req.body.name;
    const newDifficulty = req.body.difficulty;
    const newVeracity = req.body.veracity;
    const newField = req.body.field;
    const newOwnerId = req.body.owner_id;

    const data = await client.query(`
      UPDATE theorems
      SET name = $1,
      difficulty = $2,
      veracity = $3,
      field = $4,
      owner_id = $5
      WHERE theorems.id = $6
      RETURNING *
    `, [newName, newDifficulty, newVeracity, newField, newOwnerId, req.params.id]
    );

    res.json(data.rows[0]);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete('/theorems/:id', async(req, res) => {
  try {
    const theoremId = req.params.id;

    const data = await client.query(`
      DELETE from Theorems
      WHERE theorems.id = $1
      RETURNING *
    `, [theoremId]);

    res.json(data.rows[0]);

  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

app.use(require('./middleware/error'));

module.exports = app;
