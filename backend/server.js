require('dotenv').config();

const express = require('express');
const http = require('http');
const cors = require('cors');
const authRoutes = require('./src/routers/authRoutes');
const { initSocket } = require('./src/socket');
// Start Hocuspocus collaboration server
require('./server/hocuspocus/index');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/posts', require('./src/routers/postRoutes'));
app.use('/api/uploads', require('./src/routers/uploadRoutes'));
app.use('/api/invites', require('./src/routers/inviteRoutes'));
app.use('/api/ai', require('./src/routers/aiRoutes'));
app.get('/', (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);
initSocket(server);

server.listen(PORT, () => {
  console.log(`Server + Socket running on ${PORT}`);
});
