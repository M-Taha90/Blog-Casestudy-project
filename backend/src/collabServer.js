const { Server } = require("@hocuspocus/server");

// In Hocuspocus v3, use 'new Server()' instead of 'Server.configure()'
const server = new Server({
  port: 1234,
  timeout: 30000,
  // Optional: Add authentication
  // async onAuthenticate(data) {
  //   // Verify JWT token or other auth logic
  //   return { user: { id: data.token } };
  // },
});

server.listen().then(() => {
  console.log("Hocuspocus collaboration server running on port 1234");
});
