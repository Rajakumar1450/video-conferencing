// keep all states of the user
let state = {
  userId: null,
  userWebSocketConnection: null,
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

export const getState = ()=>{

}