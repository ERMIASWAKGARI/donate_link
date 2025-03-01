const app = require("./app");
const dotenv = require("dotenv");
const http = require('http')
const {initializeSocket}=require('./utils/socketConfig')
const server = http.createServer(app)
dotenv.config();
initializeSocket(server);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
