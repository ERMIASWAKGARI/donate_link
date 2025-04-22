const app = require("./app");
const dotenv = require("dotenv");
const http = require("http");
const { initializeSocket } = require("./utils/socketConfig");
dotenv.config();

const server = http.createServer(app);

initializeSocket(server);
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
