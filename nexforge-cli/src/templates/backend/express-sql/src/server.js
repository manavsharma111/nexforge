const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// const pool = mysql.createPool(process.env.MYSQL_URI);

app.get('/', (req, res) => res.send('NexForge Backend API (MySQL) is running!'));

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
