import http from "http";
import express from "express";
import { WebSocketServer } from "ws";

const PORT = process.env.PORT || 8080;
const app = express();
app.use(express.static("public"));
const server = http.createServer(app); //it returns a server object

app.get("/", (req, res) => {
  res.sendFile(process.cwd() + "public/index.html"); //cwd : current working directory and cwd is our main folder from ther it has to go to the public folder and look for index.html
});
//
const connections = [
  // contain the objects of all the connected websocket along with the userId which user is connected to which webSocket
];

const wss = new WebSocketServer({ server });
//for every new connection this function is going to be execute
wss.on("connection", (ws, req) => handleConnection(ws, req));

const handleConnection = (ws, req) => {
  const userId = extractUserId(req);
  console.log(`user: ${userId} has connected`);
  //update the connections

  addConnection(ws, userId);

  // registering all three event listeners
  ws.on("message", (data) => handlemessage(data));
  ws.on("close", () => handleDisconnection(userId));
  ws.on("error", () => {
    console.log("A Ws error has occured ");
  });
};
const addConnection = (ws, userId) => {
  connections.push({
    wsConnection: ws,
    userId,
  });
  console.log(`Total Connected users : ${connections.length}`);
};

const extractUserId = (req) => {
  //req.url.split returns a array and in url after ? there will be a userId so we spliting and accesing the 2nd index of the array that is the userId
  const queryParams = new URLSearchParams(req.url.split("?")[1]);

  return Number(queryParams.get("userId"));
};

const handleDisconnection = (userId) => {
  const connectionIndex = connections.findIndex(
    (conn) => conn.userId === userId,
  );
  if (connectionIndex === -1) {
    console.log(`user ${userId} Not Found in the Connections`);
    return;
  }
  connections.splice(connectionIndex, 1); //remove the user if it is disconneted

  console.log(`user : ${userId} is removed from connections`);
  console.log(`Total connected users : ${connections.length}`);
};
const handlemessage = (data) => {
  try {
  } catch (error) {}
};
server.listen(PORT, () => {
  console.log(`server is listing on ${PORT}`);
});
