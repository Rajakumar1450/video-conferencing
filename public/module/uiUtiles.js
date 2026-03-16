import * as state from "./state.js";
import * as constant from "./constant.js";
import * as webRTCHandler from "./webRTChandler.js";
const user_session_id_element = document.getElementById("session_id_display");
const infoModalButton = document.getElementById("info_modal_button");
const infoModalContainer = document.getElementById(
  "info_modal_content_container",
);
const closeModalButton = document.getElementById("close");
const inputRoomNameElement = document.getElementById("input_room_channel_name");
const createRoomButton = document.getElementById("create_room_button");
const landingPageContainer = document.getElementById("landing_page_container");
const joinRoomButton = document.getElementById("join_button");
const roomNameHeadingTag = document.getElementById("room_name_heading_tag");
const roomInterface = document.getElementById("room_interface");
const messagesContainer = document.getElementById("messages");
const messageInputField = document.getElementById("message_input_field");
const messageInputContainer = document.getElementById("message_input");
const sendMessageButton = document.getElementById("send_message_button");
const destroyRoomButton = document.getElementById("destroy_button");
const exitButton = document.getElementById("exit_button");
const consoleDisplay = document.getElementById("console_display");
const localVideoContainer = document.getElementById("local-video-container");
const localVideoElement = document.getElementById("local-video");
const remoteVideoContainer = document.getElementById("remote-video-container");
const remoteVideoElement = document.getElementById("remote-video");
const typingStatusContainer = document.getElementById("typing-status");
const typingIndicatorSpan = document.getElementById("typing-indicator");
const controllButton = document.getElementById("control-buttons");
const toggleCameraButton = document.getElementById("toggleCamera");
const toggleAudioButton = document.getElementById("toggleAudioButton");
// learning purposes
const offerorButtonsContainer = document.getElementById(
  "offeror_process_buttons",
);
const offerorCreatePcButton = document.getElementById("create_pc");
const offerorAddDataTypeButton = document.getElementById("add_data_type");
const offerorCreateOfferButton = document.getElementById("create_offer");
const offerorSetLocalDescriptionButton = document.getElementById(
  "update_local_description",
);
const offerorSendOfferButton = document.getElementById("send_offer");
const offerorSetRemoteDescriptionButton = document.getElementById(
  "set_remote_description",
);
const offerorIceButton = document.getElementById("ice_offeror");

const offereeButtonsContainer = document.getElementById(
  "offeree_process_buttons",
);
const offereeCreatePcButton = document.getElementById("offeree_create_pc");
const offereeAddDataTypeButton = document.getElementById(
  "offeree_add_data_type",
);
const offereeSetRemoteDescriptionButton = document.getElementById(
  "offeree_update_remote_description",
);
const offereeCreateAnswerButton = document.getElementById(
  "offeree_create_answer",
);
const offereeSetLocalDescriptionButton = document.getElementById(
  "offeree_update_local_description",
);
const offereeSendAnswerButton = document.getElementById("offeree_send_answer");
const offereeIceButton = document.getElementById("ice_offeree");

export function initializeUser(userId) {
  user_session_id_element.innerHTML = `your session id is : ${userId}`;
  state.setUserId(userId);
  setupModelEvents();
}

const setupModelEvents = () => {
  infoModalButton.onclick = openModel;
  closeModalButton.onclick = closeModel;

  window.onclick = function (event) {
    if (event.target === infoModalContainer) {
      closeModel();
    }
  };
};
export const DOM = {
  createRoomButton,
  inputRoomNameElement,
  destroyRoomButton,
  joinRoomButton,
  exitButton,
  sendMessageButton,
  messageInputField,
  toggleCameraButton,
  toggleAudioButton,
};
inputRoomNameElement.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    createRoomButton.click();
  }
});
const openModel = () => {
  infoModalContainer.classList.add("show");
  infoModalContainer.classList.remove("hide");
};

const closeModel = () => {
  infoModalContainer.classList.add("hide");
  infoModalContainer.classList.remove("show");
};

export const creatorProceedToRoom = () => {
  landingPageContainer.style.display = "none";
  roomInterface.classList.remove("hide");
  exitButton.classList.add("hide");
  roomNameHeadingTag.textContent = `you are in the room : ${state.getState().roomName}  `;
};
export const exitRoom = () => {
  inputRoomNameElement.value = "";
  landingPageContainer.style.display = "block";
  roomInterface.classList.add("hide");
  //  reset the states
  state.resetState();
};
export const joineeProceedToRoom = () => {
  landingPageContainer.style.display = "none";
  roomInterface.classList.remove("hide");
  destroyRoomButton.classList.add("hide");
  roomNameHeadingTag.textContent = `you are in the room : ${state.getState().roomName}  `;
  //show the process button
  // offerorButtonsContainer.classList.remove("hide");
  // offerorButtonsContainer.classList.add("show");
};
export const updateCreatorRoom = () => {
  destroyRoomButton.classList.add("hide");
  exitButton.classList.remove("hide");
};
export const updateUiForRemaningUser = (data) => {
  alert(`user:${data.leftUserId} has left your Room`);
  state.setOtheUserId(null);
  messagesContainer.innerHTML = "Waiting for other user";
};
export const updateUIButton = (button, message) => {
  button.classList.remove("process_pending");
  button.classList.add("process_complete");
  button.setAttribute("disabled", true);
  LogToCustomConsole(message);
};
export const showOffereeButtons = () => {
  offereeButtonsContainer.classList.remove("hide");
  offereeButtonsContainer.classList.add("show");
};
// displaying message to the custom console in the frontend
export const LogToCustomConsole = (
  message,
  color = "#FFFFFF",
  highlight = false,
  highlightColor = "#FFFF83",
) => {
  const messageElement = document.createElement("div");
  messageElement.classList.add("console-message");
  messageElement.textContent = message;
  messageElement.style.color = color;
  if (highlight) {
    messageElement.style.backgroundColor = highlightColor;
    messageElement.style.fontWeight = "bold";
    messageElement.style.padding = "5px";
    messageElement.style.borderRadius = "3px";
    messageElement.style.transition = "background-color 0.5s ease";
  }
  consoleDisplay.appendChild(messageElement);
  consoleDisplay.scrollTop = consoleDisplay.scrollHeight;
};

export const updateUiAfterSuccessfulConnection = () => {
  typingStatusContainer.classList.remove("hide");
  typingStatusContainer.classList.add("show");
  // show the message input container
  messageInputContainer.classList.remove("hide");
  messageInputContainer.classList.add("show");

  controllButton.classList.remove("hide");
  controllButton.classList.add("show");

  //hide the learning buttons
  // offerorButtonsContainer.classList.remove("show");
  // offerorButtonsContainer.classList.add("hide");

  // offereeButtonsContainer.classList.remove("show");
  // offereeButtonsContainer.classList.add("hide");

  messageInputField.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      sendMessageButton.click();
    }
  });
  messageInputField.scrollTop = messageInputField.scrollHeight;
};

export const addOutgoingMessageUI = (message) => {
  const userTag = "YOU";
  const formatedMessage = `${userTag}:${message}`;
  const messageElement = document.createElement("div");
  messageElement.style.color = constant.colors.sendMessageColor;
  messageElement.textContent = formatedMessage;
  messagesContainer.appendChild(messageElement);
  messageInputField.value = "";
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
};

export const incomingMessageUI = (message) => {
  const senderId = state.getState().otherUserId;
  const formatedMessage = `${senderId}:${message}`;
  const messageElement = document.createElement("div");
  messageElement.style.color = constant.colors.reciveMessageColor;
  messageElement.textContent = formatedMessage;
  messagesContainer.appendChild(messageElement);
  messagesContainer.scrollTop = messageElement.scrollHeight;
};

export const startVideoCall = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    localVideoElement.srcObject = stream;
    stream.getTracks().forEach((track) => {
      webRTCHandler.addTracksOnPc(track, stream);
    });
  } catch (error) {
    console.log("Error occured while collecting streams ", error);
  }
};

export const addRemoteVideo = (remoteStream) => {
  remoteVideoElement.srcObject = remoteStream;
};

export const stopLocalStream = () => {
  const stream = localVideoElement.srcObject;
  if (stream) {
    stream.getTracks().forEach((track) => track.stop());
  }
};

//cheking user is typing or not
let isTyping = false;
messageInputField.addEventListener("input", () => {
  const currentText = messageInputField.value.trim();
  //if there is some text in the input filed or abhi tak typing false hi hai so bhej do true
  if (currentText.length > 0 && !isTyping) {
    webRTCHandler.sendTypingStatus(true);
    isTyping = true;
  }
  //means user pahle type kar rha tha ab nhi kar rha hai message me koii input nhi hai
  else if (currentText.length === 0 && isTyping) {
    webRTCHandler.sendTypingStatus(false);
    isTyping = false;
  }
});

export const showTypingIndicator = (isTyping) => {
  if (isTyping) {
    typingIndicatorSpan.style.display = "block";
    typingIndicatorSpan.innerText = "Other peer is typing...";
  } else {
    typingIndicatorSpan.style.display = "none";
  }
};
//when a user send the message forcefully send the false for typing status and set the typing status to false
export const stopTyping = () => {
  webRTCHandler.sendTypingStatus(false);
  isTyping = false;
};

export const toggleCamera = () => {
  const stream = localVideoElement.srcObject;
  if (stream) {
    const videoTrack = stream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      return videoTrack.enabled;
    }
  }
  return false;
};

export const toggleAudio = () => {
  const stream = localVideoElement.srcObject;
  if (stream) {
    const audioTrack = stream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      return audioTrack.enabled;
    }
  }
  return false;
};
