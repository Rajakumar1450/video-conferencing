import * as uiUtiles from "./uiUtiles.js";
// import { DOM } from "./uiUtiles.js";
import * as constants from "./constant.js";
import * as ws from "./ws.js";

//global peer connection variable
let pc;

let dataChannel;

//since we are fetching the iceServers dynamically from the metered sever we don't need to manually set the ice servers array
// const webRTCConfiguration = {
//   iceServers: [
//     //Stun Server
//     {
//       urls: "stun:stun.relay.metered.ca:80",
//     },
//     {
//       urls: "turn:global.relay.metered.ca:80",
//       username: "93388eb4f6cfe37e41a441a1",
//       credential: "79VIn6FmgafJoIDE",
//     },
//     {
//       urls: "turn:global.relay.metered.ca:80?transport=tcp",
//       username: "93388eb4f6cfe37e41a441a1",
//       credential: "79VIn6FmgafJoIDE",
//     },
//     {
//       urls: "turn:global.relay.metered.ca:443",
//       username: "93388eb4f6cfe37e41a441a1",
//       credential: "79VIn6FmgafJoIDE",
//     },
//     {
//       urls: "turns:global.relay.metered.ca:443?transport=tcp",
//       username: "93388eb4f6cfe37e41a441a1",
//       credential: "79VIn6FmgafJoIDE",
//     },
//   ],
// };
// let iceCandidates = [];
let iceCandidatesRecievedBuffer = [];
// starting the webRTCConnection
export const startWebRTCProcess = async () => {
  let offer;
  await createPCObject();
  //we need to collect the video and audion tracks when the a pc object is created itself for offeror and offeree both
  await uiUtiles.startVideoCall();
  //create a new data channel for the offeror
  createDataChannel(true);
  // then  create a offer on the peerconnection object
  offer = await pc.createOffer();
  // setting the local description of offer on the peerconnection object
  await pc.setLocalDescription(offer);
  //sendig the offer on the web socket sever
  ws.sendOffer(offer);
};

const createPCObject = async () => {
  //fetching all the stun and turn server from the metered api
  const response = await fetch(
    "https://raja.metered.live/api/v1/turn/credentials?apiKey=817d3bf932a266874ad9ffb88c83d713cb4a",
  );

  // Saving the response in the iceServers array
  const iceServersArray = await response.json();

  pc = new RTCPeerConnection({
    iceServers: iceServersArray,
  });
  //listening for state changes
  //if connection state is at have-local-offer then answer has not recieved yet
  pc.addEventListener("connectionstatechange", () => {
    // console.log(pc.connectionState);
    if (pc.connectionState === "connected") {
      alert("You have Created a connection between You and other peer");

      //update ui for messaging
      uiUtiles.updateUiAfterSuccessfulConnection();
    }
  });
  pc.addEventListener("signalingstatechange", () => {});
  pc.addEventListener("icecandidate", (e) => {
    if (e.candidate) {
      // console.log("ICE candidates :", e.candidate);
      // iceCandidates.push(e.candidate);
      //no need to add the ice candidates to the array we can send the each ice candidate one by one
      ws.sendSingleIceCandidate(e.candidate);
    }
  });

  pc.ontrack = (event) => {
    try {
      const remoteStream = event.streams[0];

      uiUtiles.addRemoteVideo(remoteStream);
    } catch (error) {
      console.log("Error While adding tracks of the remote user");
    }
  };
};

const createDataChannel = (isOfferor) => {
  //creating a new data channel
  if (isOfferor) {
    // mimicing that the dataChannel is going to be udp, so setting ordered false and maxReTransmission is 0 means don't need to Re-transfer the data if there is packet loss
    const dataChannelOption = {
      ordered: false,
      maxReTransmits: 0,
    };
    dataChannel = pc.createDataChannel("screte-chat-room", dataChannelOption);
    //add event listener
    registerDataChannelEventListener();
  } else {
    //if the else statement is executing we need to deal with offerree
    //the reciever needs to register a datachannel listener
    //this will fire once a valid rtc connection has been established
    pc.ondatachannel = (e) => {
      // console.log("The event Listener :", e);
      //registering the user on the data channel
      dataChannel = e.channel;
      registerDataChannelEventListener();
    };
  }
};

const registerDataChannelEventListener = () => {
  dataChannel.addEventListener("message", (e) => {
    // console.log("message has been recieved from data channel");
    const messageData = JSON.parse(e.data);
    if (messageData.type === "TYPING_STATUS") {
      uiUtiles.showTypingIndicator(messageData.isTyping);
    } else {
      uiUtiles.incomingMessageUI(messageData.messageText);
    }
  });
  dataChannel.addEventListener("close", (e) => {
    uiUtiles.LogToCustomConsole("Connection is Closed", constants.colors.red);
    // console.log("Data Channel Has been closed");
  });
  dataChannel.addEventListener("open", (e) => {
    console.log(
      "data channel has been open you are now able to send/recieve the message over your data channel",
    );
  });
};
//handling the offer sent by the peer 1 and recieved from the ws Server
export const handleOffer = async (data) => {
  let answer;
  //create peerConnection object for the offeree
  await createPCObject();
  await uiUtiles.startVideoCall();
  //we don't have to create a new data channel because a data channel is already created by the offeror so we need to listen for the events on that data channel...
  //this executes the else statement which specifies that it is offeree request and it need to listen for the events on the data channel
  createDataChannel(false);
  //set remote description with the offer that peer1 sent

  //now setting the remote description of the offeree with the offeror's offer it recieves the offer and set to it's local description and then create and send answer
  await pc.setRemoteDescription(data.offer);
  //creating the answer
  answer = await pc.createAnswer();
  // sentting the local Description of the offeree with the answer
  await pc.setLocalDescription(answer);
  //sending the answer to the websoket connection
  ws.sendAnswer(answer);
  //now sending the ice candidates
  // ws.sendIceCandidates(iceCandidates);
};

// handling the recievng answer

export const handleAnswer = async (data) => {
  // as soon as the answer from the other peer has been recieved then this peer has to send back their ice candidates and set the remote description and add their ice candidate to the
  // ws.sendIceCandidates(iceCandidates);
  //since the ice candidates hasn't set their remote description... if this peer send the ice candidate, it can't add it's ice candidate to it's pc object so we keep that in the temporary buffer
  await pc.setRemoteDescription(data.answer); //setting the remote description

  iceCandidatesRecievedBuffer.forEach(async (candidate) => {
    //setting the ice candidate to it's pc object from the  temp buffer
    await pc.addIceCandidate(new RTCIceCandidate(candidate));
  });
  // now clear the buffer
  iceCandidatesRecievedBuffer = [];
};

export const handleIceCandidates = async (data) => {
  //we can't push the ice candidates untill the remote description is null for a user
  const candidate = data.iceCandidate;
  if (!pc) {
    if (candidate) {
      iceCandidatesRecievedBuffer.push(candidate);
    }
    return;
  }
  if (pc.remoteDescription && pc.remoteDescription.type) {
    //recieving the single ice candidate
    try {
      //add the single icecandidate to the pc object
      await pc.addIceCandidate(new RTCIceCandidate(candidate));
      // data.iceCandidates.forEach((candidate) => {
      //   pc.addIceCandidate(candidate); //this returns a promise but when we are using forEach method do not need to put await keyword
      // });
    } catch (error) {
      console.log(
        "an Error Occured while Adding the ice candidates in the Pc Object",
        error,
      );
    }
  }
  //if The remoteDescription is not set yet then you need to push the ice Candidates into a temporary buffer so that after setting the remote Description you can finally add the ice Candidates
  else {
    if (candidate) {
      iceCandidatesRecievedBuffer.push(candidate);
    }
  }
};
//as soon as the ice candidates has been shared from the both peers and both peers has been set their ice candidates on the pc object then the the connection state change to the "connected" and then message can be sent through that data channel
export const sendMessageOnDataChannel = (message) => {
  if (dataChannel) {
    const messageObj = {
      type: "CHAT_MESSAGE",
      messageText: message,
    };
    dataChannel.send(JSON.stringify(messageObj));
  }
};
//sending the typing status on the data channel
export const sendTypingStatus = (isTyping) => {
  if (dataChannel && dataChannel.readyState === "open") {
    const data = {
      type: "TYPING_STATUS",
      isTyping,
    };
    dataChannel.send(JSON.stringify(data));
  }
};

export const closeConnection = () => {
  //close data channel if they exist
  if (dataChannel) {
    dataChannel.close();
    dataChannel = null;
  }
  //closing peerConneection is it exist
  if (pc) {
    pc.close();
    pc = null;
    dataChannel = null;
  }
  uiUtiles.stopLocalStream();
  console.log("a close event is fired on your data channel");
};
//adding tracks on peerconnection objecct
export const addTracksOnPc = (track, stream) => {
  pc.addTrack(track, stream);
};
