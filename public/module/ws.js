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

const handlemessage = (message) => {
  console.log(message);
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
