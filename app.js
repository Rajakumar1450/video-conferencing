import http from "http";
import express from "express";
import { WebSocketServer } from "ws";
import * as constantServer from "./constantServer.js";
const PORT = process.env.PORT || 8080;
const app = express();
app.use(express.json());
app.use(express.static("public"));
const server = http.createServer(app); //it returns a server object
const connections = [
  // contain the objects of all the connected websocket along with the userId which user is connected to which webSocket
];
const rooms = [
  //containing the object with roomName and peer1 and peer2
];
app.get("/", (req, res) => {
  res.sendFile(process.cwd() + "public/index.html"); //cwd : current working directory and cwd is our main folder from ther it has to go to the public folder and look for index.html
});
app.post("/create-room", (req, res) => {
  const { roomName, userId } = req.body;
  const existingRoom = rooms.find((room) => {
    return room.roomName === roomName;
  });
  if (existingRoom) {
    // send a failure message to the client
    const failuremessage = {
      data: {
        type: constantServer.type.ROOM_CHECK.RESPONS_FAILURE,
        failmessage:
          "This Room is already existing Try another name Or JOIN This One",
      },
    };
    res.status(400).json(failuremessage);
  } else {
    // add this room to our rooms array
    rooms.push({
      roomName,
      peer1: userId,
      peer2: null,
    });
    const successMessage = {
      data: {
        type: constantServer.type.ROOM_CHECK.RESPONS_SUCCESS,
        message: "Room is created ",
      },
    };
    res.status(200).json(successMessage);
  }
});
app.post("/destroy-room", (req, res) => {
  const { roomName } = req.body;
  const existingRoomIndex = rooms.findIndex((room) => {
    return room.roomName === roomName;
  });
  if (existingRoomIndex !== -1) {
    rooms.splice(existingRoomIndex, 1);
    const successMessage = {
      data: {
        message: `Room :${roomName} is Destroyed `,
      },
    };
    res.status(200).json(successMessage);
  } else {
    const failuremessage = {
      data: {
        message: `server failed to find the room `,
      },
    };
    res.status(400).json(failuremessage);
  }
});
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
  //remove room while no one is there
  rooms.forEach((room) => {
    const otherUserId = room.peer1 === userId ? room.peer2 : room.peer1;
    const notifymessage = {
      label: constantServer.label.NORMAL_SERVER_PROCESS,
      data: {
        type: constantServer.type.ROOM_EXIT.NOTIFY,
        message: `user :${userId} has left your room:`,
        leftUserId: userId,
      },
    };
    if (otherUserId) {
      sendWebSocketMessage(otherUserId, notifymessage);
    }
    if (room.peer1 === userId) {
      room.peer1 = null;
    }
    if (room.peer2 === userId) {
      room.peer2 = null;
    }
    if (room.peer1 === null && room.peer2 === null) {
      const roomIndex = rooms.findIndex((roomInArray) => {
        return roomInArray.roomName === room.roomName;
      });
      if (roomIndex !== -1) {
        rooms.splice(roomIndex, 1); //remove the room from array
        console.log(`Room : ${room.roomName} is Removed as noOne was there...`);
      }
    }
  });
};
const handlemessage = (data) => {
  try {
    let message = JSON.parse(data);
    switch (message.label) {
      case constantServer.label.NORMAL_SERVER_PROCESS:
        // console.log("=== normal server message ===");
        normalServerProcessing(message.data);
        break;
      case constantServer.label.WEBRTC_SERVER_PROCESS:
        // console.log("=== WebRTC server message ===");
        webRTCServerProcessing(message.data);
        break;
      case "KEEP_ALIVE":
        // console.log("WebSocket server is alive");
        break;
      default:
        console.log("Unknown message label ", message.label);
    }
  } catch (error) {
    console.log("Failed to parse message:", error);
  }
  return;
};
//normal sever Process
const normalServerProcessing = (data) => {
  switch (data.type) {
    case constantServer.type.ROOM_JOIN.REQUEST:
      joinRoomhandler(data);
      break;
    case constantServer.type.ROOM_EXIT.EXIT:
      exitHanlder(data);
      break;
    default:
      console.log("unknown data type..", data.type);
  }
};
//handling joing Room
const joinRoomhandler = (data) => {
  const { roomName, userId } = data;
  let otherUserId = null;

  //check if room exist
  const existingRoom = rooms.find((room) => room.roomName === roomName);
  if (!existingRoom) {
    console.log(`room : ${roomName} does not exist `);
    const failuremessage = {
      label: constantServer.label.NORMAL_SERVER_PROCESS,
      data: {
        type: constantServer.type.ROOM_JOIN.RESPONS_FAILURE,
        message: `Room : ${roomName} doesn't exist Try another Room `,
      },
    };
    //send the failure message
    sendWebSocketMessage(userId, failuremessage);
    return;
  }
  //check whether the room is full
  if (existingRoom.peer1 && existingRoom.peer2) {
    const failuremessage = {
      label: constantServer.label.NORMAL_SERVER_PROCESS,
      data: {
        type: constantServer.type.ROOM_JOIN.RESPONS_FAILURE,
        message: `Room : ${roomName} is already full`,
      },
    };
    sendWebSocketMessage(userId, failuremessage);
    console.log(`room ${roomName} is already Full`);
    return;
  }
  //joining another user to the room

  if (existingRoom.peer1) {
    existingRoom.peer2 = userId;
    otherUserId = existingRoom.peer1;
  } else {
    existingRoom.peer1 = userId;
    otherUserId = existingRoom.peer2;
  }
  const successmessage = {
    label: constantServer.label.NORMAL_SERVER_PROCESS,
    data: {
      type: constantServer.type.ROOM_JOIN.RESPONS_SUCCESS,
      message: `You have Successfully joined the room :${roomName}`,
      creatorId: otherUserId,
      roomName: existingRoom.roomName,
    },
  };
  sendWebSocketMessage(userId, successmessage);
  //sending notification to already present user
  const notifymessage = {
    label: constantServer.label.NORMAL_SERVER_PROCESS,
    data: {
      type: constantServer.type.ROOM_JOIN.NOTIFY,
      message: `user :${userId} has joined your room:${roomName}`,
      joineeId: userId,
    },
  };
  sendWebSocketMessage(otherUserId, notifymessage);
  return;
};

const exitHanlder = (data) => {
  const { roomName, userId } = data;
  let otherUserId = null;
  const existingRoom = rooms.find((room) => room.roomName === roomName);
  if (!existingRoom) {
    console.log(`room : ${roomName} does not exist `);
    return;
  }

  if (existingRoom.peer1 === userId) {
    existingRoom.peer1 = null;
    otherUserId = existingRoom.peer2;
  } else if (existingRoom.peer2 === userId) {
    existingRoom.peer2 = null;
    otherUserId = existingRoom.peer1;
  }
  //clean up room
  if (existingRoom.peer1 === null && existingRoom.peer2 === null) {
    const roomIndex = rooms.findIndex((room) => {
      return room.roomName === roomName;
    });
    if (roomIndex !== -1) {
      rooms.splice(roomIndex, 1); //remove the room from array
      console.log(`Room : ${roomName} is Removed as noOne was there...`);
    }
  }
  //notify the other user
  const notifymessage = {
    label: constantServer.label.NORMAL_SERVER_PROCESS,
    data: {
      type: constantServer.type.ROOM_EXIT.EXIT,
      message: `user :${userId} has left your room:${roomName}`,
      leftUserId: userId,
    },
  };
  sendWebSocketMessage(otherUserId, notifymessage);
  return;
};

//webRTC  process
const webRTCServerProcessing = (data) => {
  switch (data.type) {
    case constantServer.type.WEB_RTC.OFFER:
      signalMessageToOtherUser(data);
      console.log(`offer is sent to user:${data.otherUserId} `);
      break;
    case constantServer.type.WEB_RTC.ANSWER:
      signalMessageToOtherUser(data);
      console.log(`Answer is sent to user:${data.otherUserId} `);
      break;
    case constantServer.type.WEB_RTC.ICE_CANDIDATE:
      signalMessageToOtherUser(data);
      console.log(`iceCandidates is sent to user:${data.otherUserId} `);
      break;
    default:
      console.log("unknown data type..", data.type);
  }
};
//one generic function to send the offer answer and iceCandidates
const signalMessageToOtherUser = (data) => {
  const { otherUserId } = data;
  const message = {
    label: constantServer.label.WEBRTC_SERVER_PROCESS,
    data: data,
  };
  sendWebSocketMessage(otherUserId, message);
};
//sending a message to specifiec user
const sendWebSocketMessage = (userId, message) => {
  const userConnection = connections.find(
    (connObj) => connObj.userId === userId,
  );
  if (userConnection && userConnection.wsConnection) {
    userConnection.wsConnection.send(JSON.stringify(message));
    // console.log(`message sent to user :${userId}`);
  } else {
    console.log(`user : ${userId} Not found `);
  }
};

server.listen(PORT, () => {
  console.log(`server is listing on ${PORT}`);
});
