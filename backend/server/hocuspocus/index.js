const { Server } = require("@hocuspocus/server");
const { SQLite } = require("@hocuspocus/extension-sqlite");
const path = require("path");

const server = new Server({
  port: 1234,
  timeout: 30000,
  
  // SQLite extension handles ALL persistence - single source of truth
  extensions: [
    new SQLite({
      database: path.join(__dirname, '../../data/collaboration.db'),
    }),
  ],

  onConnect: () => {
    console.log('📡 [Hocuspocus] Client connected');
  },

  onDisconnect: () => {
    console.log('📡 [Hocuspocus] Client disconnected');
  },

  onDestroy: () => {
    console.log('🗑️ [Hocuspocus] Document destroyed');
  },
});

server.listen().then(() => {
  console.log("✅ Hocuspocus server listening on ws://localhost:1234");
  console.log("✅ SQLite persistence - single source of truth for document content");
  console.log("✅ Real-time collaboration ready");
  console.log("💡 PostgreSQL stores metadata only (title, status, etc.)");
});

