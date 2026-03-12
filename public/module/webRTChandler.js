import * as uiUtiles from "./uiUtiles.js";
// import { DOM } from "./uiUtiles.js";
import * as constants from "./constant.js";
import * as ws from "./ws.js";

//global peer connection variable
let pc;

let dataChannel;

const webRTCConfiguration = {
  iceServers: [
    //Stun Server
    {
      urls: [
        "stun:stun.1.google.com:19302",
        "stun:stun.2.google.com:19302",
        "stun:stun.3.google.com:19302",
        "stun:stun.4.google.com:19302",
      ],
    },
    //Turn server
    {
      urls: ["turn:free.expressturn.com:3478"],
      username: "000000002088690679",
      credential: "E1WSmgKx6GW1m3mOqx0Uj1Rz7Jk=",
    },
  ],
};
let iceCandidates = [];
let iceCandidatesRecievedBuffer = [];
// starting the webRTCConnection
export const startWebRTCProcess = async () => {
  let offer;
  createPCObject();
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

const createPCObject = () => {
  pc = new RTCPeerConnection(webRTCConfiguration);
  //listening for state changes
  //if connection state is at have-local-offer then answer has not recieved yet
  pc.addEventListener("connectionstatechange", () => {
    // console.log(pc.connectionState);
    if (pc.connectionState === "connected") {
      alert("You have Created a connection between You and other peer");
      // uiUtiles.LogToCustomConsole(
      //   `connection State Changes to :${pc.connectionState}`,
      //   null,
      //   true,
      //   constants.colors.orange,
      // );
      //update ui for messaging
      uiUtiles.updateUiAfterSuccessfulConnection();
    }
  });
  pc.addEventListener("signalingstatechange", () => {
    // uiUtiles.LogToCustomConsole(
    //   `signaling state is changed to :${pc.signalingState} `,
    //   null,
    //   true,
    //   constants.colors.orange,
    // );
  });
  pc.addEventListener("icecandidate", (e) => {
    if (e.candidate) {
      // console.log("ICE candidates :", e.candidate);
      iceCandidates.push(e.candidate);
    }
    // uiUtiles.LogToCustomConsole(
    //   `Your ICE CanditateS: ${iceCandidates}`,
    //   null,
    //   true,
    //   constants.colors.blue,
    // );
  });
  // uiUtiles.LogToCustomConsole(
  //   "You have successfully creted a pc object ",
  //   constants.colors.green,
  // );
  // console.log("pc created");
  pc.ontrack = (event) => {
    try {
      const remoteStream = event.streams[0];
      console.log("remote video is adding");
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
    // uiUtiles.LogToCustomConsole("You Have SuccessFully Created A DataChannel");
  } else {
    //if the else statement is executing we need to deal with offerree
    //the reciever needs to register a datachannel listener
    //this will fire once a valid rtc connection has been established
    pc.ondatachannel = (e) => {
      // console.log("The event Listener :", e);
      //registering the user on the data channel
      dataChannel = e.channel;
      registerDataChannelEventListener();
      // uiUtiles.LogToCustomConsole(
      //   "You Have SuccessFully register On A DataChannel",
      // );
    };
  }
};

const registerDataChannelEventListener = () => {
  dataChannel.addEventListener("message", (e) => {
    console.log("message has been recieved from data channel");
    const message = e.data;
    uiUtiles.incomingMessageUI(message);
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
  // uiUtiles.LogToCustomConsole("offer is recieved", constants.colors.green);
  //show the learning process buttons
  //uiUtiles.showOffereeButtons();
  //create peerConnection object for the offeree
  createPCObject();
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
  ws.sendIceCandidates(iceCandidates);
};

// handling the recievng answer

export const handleAnswer = async (data) => {
  // as soon as the answer from the other peer has been recieved then this peer has to send back their ice candidates and set the remote description and add their ice candidate to the
  ws.sendIceCandidates(iceCandidates);
  //since the ice candidates hasn't set their remote description... if this peer send the ice candidate, it can't add it's ice candidate to it's pc object so we keep that in the temporary buffer
  await pc.setRemoteDescription(data.answer); //setting the remote description

  iceCandidatesRecievedBuffer.forEach((candidate) => {
    //setting the ice candidate to it's pc object from the  temp buffer
    pc.addIceCandidate(candidate);
    // uiUtiles.LogToCustomConsole(
    //   "ice Candidates are added...",
    //   constants.colors.blue,
    // );
  });
  // now clear the buffer
  iceCandidatesRecievedBuffer = [];
};

export const handleIceCandidates = (data) => {
  //we can't push the ice candidates untill the remote description is null for a user
  if (pc.remoteDescription) {
    try {
      data.iceCandidates.forEach((candidate) => {
        pc.addIceCandidate(candidate); //this returns a promise but when we are using forEach method do not need to put await keyword
        uiUtiles.LogToCustomConsole(
          "Ice Candidates Are Added to the Pc Object ",
          constants.colors.blue,
        );
      });
    } catch (error) {
      console.log(
        "an Error Occured while Adding the ice candidates in the Pc Object",
        error,
      );
    }
  }
  //if The remoteDescription is not set yet then you need to push the ice Candidates into a temporary buffer so that after setting the remote Description you can finally add the ice Candidates
  else {
    data.iceCandidates.forEach((candidate) => {
      iceCandidatesRecievedBuffer.push(candidate);
      uiUtiles.LogToCustomConsole(
        "Ice Candidates are pushed to the temporary buffer",
      );
    });
  }
};
//as soon as the ice candidates has been shared from the both peers and both peers has been set their ice candidates on the pc object then the the connection state change to the "connected" and then message can be sent through that data channel
export const sendMessageOnDataChannel = (message) => {
  dataChannel.send(message);
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
  console.log("a close event is fired on your data channel");
};
//adding tracks on peerconnection objecct
export const addTracksOnPc = (track, stream) => {
  pc.addTrack(track, stream);
};
