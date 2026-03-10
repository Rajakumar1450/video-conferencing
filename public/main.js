import * as uiUtiles from "./module/uiUtiles.js";
import * as ws from "./module/ws.js";
import * as ajax from "./module/ajax.js";
import * as state from "./module/state.js";
import * as constant from "./module/constant.js";
const userId = Math.round(Math.random() * 1000000);

uiUtiles.initializeUser(userId);

// initialising a webSocket server

const wsClientConnection = new WebSocket(`/?userId=${userId}`);

ws.registerSocketEvents(wsClientConnection);

// create room

uiUtiles.DOM.createRoomButton.addEventListener("click", () => {
  const inputRoomName = uiUtiles.DOM.inputRoomNameElement.value;
  if (!inputRoomName) {
    uiUtiles.LogToCustomConsole("Enter a Room name ");
    return alert("Enter A Room name first to create ");
  }
  uiUtiles.LogToCustomConsole(
    `Checking if Room ${inputRoomName} is Available... `,
  );
  ajax.createRoom(inputRoomName, userId);
});

uiUtiles.DOM.destroyRoomButton.addEventListener("click", () => {
  const roomName = state.getState().roomName;
  ajax.destroyRoom(roomName);
});

uiUtiles.DOM.joinRoomButton.addEventListener("click", () => {
  const inputRoomName = uiUtiles.DOM.inputRoomNameElement.value;
  if (!inputRoomName) {
    return alert("Enter A Room Name First");
  }
  ws.joinRoom(inputRoomName, userId, wsClientConnection);
});

uiUtiles.DOM.exitButton.addEventListener("click", () => {
  const roomName = state.getState().roomName;
  uiUtiles.exitRoom();
  ws.exitRoom(roomName, userId);
  uiUtiles.LogToCustomConsole("You Left The Room..", constant.colors.red);
});
