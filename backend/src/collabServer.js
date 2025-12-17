const { Server } = require("@hocuspocus/server");
const prisma = require("./lib/prisma");

const server = new Server({
  port: 1234,
  timeout: 30000,

  async onAuthenticate({ token, documentName }) {

    return {
      user: {
        id: token || 'anonymous',
      },
    };
  },

  async onLoadDocument({ documentName, document }) {
  },

  async onStoreDocument({ documentName, document }) {
  },
});

server.listen().then(() => {
  console.log("Hocuspocus collaboration server running on ws://localhost:1234");
});
