require('dotenv').config();

const express = require('express');
const cors = require('cors');
const authRoutes = require('./src/routers/authRoutes');


const app = express();
app.use(cors());
app.use(express.json());


app.use('/api/auth', authRoutes);
app.use('/api/posts', require('./src/routers/posts'));

app.get('/', (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
