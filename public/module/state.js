// keep all states of the user
let state = {
  userId: null,
  userWebSocketConnection: null,
  roomName: null,
  otherUserId: null,
};

// a generic setter fucntion for setting user Idx

const setState = (newState) => {
  state = {
    ...state,
    ...newState,
  };
};

export const setUserId = (userId) => {
  setState({ userId });
};

export const setwsConnection = (wsconnetion) => {
  setState({ userWebSocketConnection: wsconnetion });
};
export const setRoomName = (roomName) => {
  setState({ roomName });
};
export const getState = () => {
  return state;
};

export const setOtheUserId = (otherUserId) => {
  setState({ otherUserId });
};

export const resetState = () => {
  setState({
    roomName: null,
    otherUserId: null,
  });
};
