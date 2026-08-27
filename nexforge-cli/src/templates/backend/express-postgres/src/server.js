const express = require('express');
const cors = require('cors');
const { Client } = require('pg');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// const client = new Client({ connectionString: process.env.PG_URI });
// client.connect();

app.get('/', (req, res) => res.send('NexForge Backend API (Postgres) is running!'));

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
