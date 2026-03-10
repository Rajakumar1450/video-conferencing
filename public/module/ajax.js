//creating a room using fetch API
import * as uiUtiles from "./uiUtiles.js";
import * as constants from "./constant.js";
import * as state from "./state.js";

export function createRoom(roomName, userId) {
  fetch("/create-room", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ roomName, userId }),
  })
    .then((response) => response.json())
    .then((resObj) => {
      if (resObj.data.type === constants.type.ROOM_CHECK.RESPONS_SUCCESS) {
        state.setRoomName(roomName);
        uiUtiles.LogToCustomConsole(
          resObj.data.message,
          constants.colors.green,
        );
        uiUtiles.LogToCustomConsole("Waiting for other peer");
        uiUtiles.creatorProceedToRoom();
      }
      if (resObj.data.type === constants.type.ROOM_CHECK.RESPONS_FAILURE) {
        uiUtiles.LogToCustomConsole(
          resObj.data.failmessage,
          constants.colors.red,
        );
      }
    })
    .catch((err) => {
      console.log("an error ocurred trying to create a room: ", err);
      uiUtiles.LogToCustomConsole(
        "Some sort of error happened trying to create a room. Sorry",
        constants.colors.red,
      );
    });
}

export const destroyRoom = async (roomName) => {
  try {
    const response = await fetch("/destroy-room", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ roomName }),
    });

    const resObj = await response.json();
    if (response.ok) {
      state.setRoomName(null);
      uiUtiles.LogToCustomConsole(resObj.data.message, constants.colors.green);
      uiUtiles.exitRoom();
    } else {
      uiUtiles.LogToCustomConsole(resObj.data.message, constants.colors.red);
    }
  } catch (error) {
    console.log("an error ocurred trying to create a room: ", err);
    uiUtiles.LogToCustomConsole(
      "Some sort of error happened trying to destroying the room. Sorry",
      constants.colors.red,
    );
  }
};
