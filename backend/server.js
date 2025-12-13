require('dotenv').config();

const express = require('express');
const cors = require('cors');
const authRoutes = require('./src/routers/authRoutes');


const app = express();
app.use(cors());
app.use(express.json());


app.use('/api/auth', authRoutes);
app.use('/api/posts', require('./src/routers/postRoutes'));
app.use('/api/uploads', require('./src/routers/uploadRoutes'));
app.use('/api/invites', require('./src/routers/inviteRoutes'));

app.get('/', (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
