import * as uiUtiles from "./module/uiUtiles.js";
import * as ws from "./module/ws.js";
import * as ajax from "./module/ajax.js";
import * as state from "./module/state.js";
import * as constant from "./module/constant.js";
import * as webRTCHandler from "./module/webRTChandler.js";

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
  //close the data channel and the peerConnection
  webRTCHandler.closeConnection();
});

uiUtiles.DOM.sendMessageButton.addEventListener("click", () => {
  const message = uiUtiles.DOM.messageInputField.value.trim();
  if (message === "") {
    return;
  }
  //update The Ui for the sending messages in the Interface of the sender user
  uiUtiles.addOutgoingMessageUI(message);
  //now send the message through the data channel that is created between the peers
  webRTCHandler.sendMessageOnDataChannel(message);
  //listen this message on the event on the datachannel when a message event occured on the data channel
  // Message bhejte waqt:

  uiUtiles.stopTyping(); //jaise hi message send ho usi time uske time indicator ko band kar do
});

uiUtiles.DOM.toggleCameraButton.addEventListener("click", () => {
  const isCameraOn = uiUtiles.toggleCamera();

  if (isCameraOn) {
    uiUtiles.DOM.toggleCameraButton.innerText = "Turn Off Camera";
  } else {
    uiUtiles.DOM.toggleCameraButton.innerText = "Turn On Camera";
  }
});

uiUtiles.DOM.toggleAudioButton.addEventListener("click", () => {
  const isAudioOn = uiUtiles.toggleAudio();
  if (isAudioOn) {
    uiUtiles.DOM.toggleAudioButton.innerText = "mute";
  } else {
    uiUtiles.DOM.toggleAudioButton.innerText = "Unmute";
  }
});
//give warning when user refresh the page
window.addEventListener("beforeunload", (event) => {
  //if user in some room then give warning to the user
  const currentRoom = state.getState().roomName;
  if (currentRoom) {
    event.preventDefault();
    event.returnValue = "";
  }
});
