import * as state from "./state.js";
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

// learning purposes
const offerorButtonsContainer = document.getElementById(
  "offeror_process_buttons",
);
const offerorCreatePcButton = document.getElementById("create_pc");
const offerorAddDataTypeButton = document.getElementById("add_data_type");
const offerorCreateOfferButton = document.getElementById("create_offer");
const offerorUpdateLocalDescriptionButton = document.getElementById(
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
const offereeUpdateRemoteDescriptionButton = document.getElementById(
  "offeree_update_remote_description",
);
const offereeCreateAnswerButton = document.getElementById(
  "offeree_create_answer",
);
const offereeUpdateLocalDescriptionButton = document.getElementById(
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
  messagesContainer.innerHTML = "pls wait ... connecting via WebRTC";
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
