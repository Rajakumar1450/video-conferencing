//creating a room using fetch API
import * as uiUtiles from "./uiUtiles.js";
import * as constants from "./constant.js";
export const createRoom = async (roomName, userId) => {
  try {
    const Room = await fetch("/create-room", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ roomName, userId }),
    });
    const roomJson = Room.json();
  } catch (error) {
    console.log("An Error has Occured while trying to create the room ", error);
    uiUtiles.LogToCustomConsole(
      "Ther is An Error while creating The Room",
      constants.colors.red,
    );
  }
};
