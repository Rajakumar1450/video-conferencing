import * as state from "./state.js";
import * as uiUtiles from "./uiUtiles.js";
import * as constants from "./constant.js";
import * as webRTChandler from "./webRTChandler.js";
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
//exiting Room outgoing message to Websocket
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
//outgoing send Offer
export const sendOffer = (offer) => {
  const message = {
    label: constants.label.WEBRTC_SERVER_PROCESS,
    data: {
      type: constants.type.WEB_RTC.OFFER,
      offer,
      otherUserId: state.getState().otherUserId,
    },
  };
  state.getState().userWebSocketConnection.send(JSON.stringify(message));
};
//out going send asnwer
export const sendAnswer = (answer) => {
  const message = {
    label: constants.label.WEBRTC_SERVER_PROCESS,
    data: {
      type: constants.type.WEB_RTC.ANSWER,
      answer,
      otherUserId: state.getState().otherUserId,
    },
  };
  state.getState().userWebSocketConnection.send(JSON.stringify(message));
};
// outgoing ice candidates
export const sendIceCandidates = (iceCandidates) => {
  const message = {
    label: constants.label.WEBRTC_SERVER_PROCESS,
    data: {
      type: constants.type.WEB_RTC.ICE_CANDIDATE,
      iceCandidates,
      otherUserId: state.getState().otherUserId,
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
    case constants.label.WEBRTC_SERVER_PROCESS:
      webRTCServerProcessing(message.data);
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
  // start webrtcProcess
  webRTChandler.startWebRTCProcess();
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
  //if a user exit the room the peerconnection also must be closed by the other user
  webRTChandler.closeConnection();
};

// handling incoming messages for the webRTC server processes

const webRTCServerProcessing = (data) => {
  switch (data.type) {
    case constants.type.WEB_RTC.OFFER:
      webRTChandler.handleOffer(data);
      break;
    case constants.type.WEB_RTC.ANSWER:
      webRTChandler.handleAnswer(data);
      break;
    case constants.type.WEB_RTC.ICE_CANDIDATE:
      webRTChandler.handleIceCandidates(data);
      break;
    default:
      console.log("Unknown Data Type", data.type);
  }
};
