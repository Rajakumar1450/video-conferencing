import * as state from "./state.js";
import * as uiUtiles from "./uiUtiles.js";
import * as constants from "./constant.js";
export const registerSocketEvents = (wsClientConnection) => {
  //update our user State with this client ws connection
  state.setwsConnection(wsClientConnection);

  wsClientConnection.onopen = () => {
    //display a message to the custom console display in frontend to the user
    uiUtiles.LogToCustomConsole("You Have connected With Our server ");
    // we can customize our message color or we can control for hightlight the message or not

    wsClientConnection.onmessage = handlemessage;
    wsClientConnection.onclose = handleClose;
    wsClientConnection.onerror = handleError;
  };
};

const handleClose = () => {
  uiUtiles.LogToCustomConsole(
    "You have Disconnected from our server",
    null,
    true,
    constants.colors.red,
  );
};
const handleError = () => {
  uiUtiles.LogToCustomConsole(
    "An error Occured",
    null,
    true,
    constants.colors.red,
  );
};
//outgoing message to the websocket server
//joining room outgoing message
export const joinRoom = (roomName, userId) => {
  const message = {
    label: constants.label.NORMAL_SERVER_PROCESS,
    data: {
      type: constants.type.ROOM_JOIN.REQUEST,
      roomName,
      userId,
    },
  };
  state.getState().userWebSocketConnection.send(JSON.stringify(message));
};
//exiting Room message to Websocket
export const exitRoom = (roomName, userId) => {
  const message = {
    label: constants.label.NORMAL_SERVER_PROCESS,
    data: {
      type: constants.type.ROOM_EXIT.EXIT,
      roomName,
      userId,
    },
  };
  state.getState().userWebSocketConnection.send(JSON.stringify(message));
};
//HANDLING INCOMING MESSAGE FROM WEBSOCKET SERVER
const handlemessage = (incomingMessageObj) => {
  const message = JSON.parse(incomingMessageObj.data);
  switch (message.label) {
    case constants.label.NORMAL_SERVER_PROCESS:
      normalServerProcessing(message.data);
      break;
    default:
      console.log("unknown Message Lable ", message.label);
  }
};

const normalServerProcessing = (data) => {
  switch (data.type) {
    //room join success
    case constants.type.ROOM_JOIN.RESPONS_SUCCESS:
      handleSuccessJoin(data);
      break;
    //room join failure
    case constants.type.ROOM_JOIN.RESPONS_FAILURE:
      uiUtiles.LogToCustomConsole(data.message, constants.colors.red);
      break;
    //handle join notification
    case constants.type.ROOM_JOIN.NOTIFY:
      handleJoinNotify(data);
      break;
    //handle room exit logic
    case constants.type.ROOM_EXIT.EXIT:
      handleExitNotify(data);
    case constants.type.ROOM_EXIT.NOTIFY:
      handleExitNotify(data);
    default:
      console.log("unknown data type ", data.type);
  }
};

const handleSuccessJoin = (data) => {
  state.setOtheUserId(data.creatorId);
  state.setRoomName(data.roomName);
  uiUtiles.LogToCustomConsole(data.message, constants.colors.green);
  uiUtiles.joineeProceedToRoom();
};

const handleJoinNotify = (data) => {
  alert(`user : ${data.joineeId} has joined the Room`);
  state.setOtheUserId(data.joineeId);
  uiUtiles.LogToCustomConsole(data.message, constants.colors.green);
  uiUtiles.updateCreatorRoom();
};
const handleExitNotify = (data) => {
  uiUtiles.LogToCustomConsole(data.message, constants.colors.red);
  uiUtiles.updateUiForRemaningUser(data);
};
