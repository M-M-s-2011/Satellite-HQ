/* eslint-disable handle-callback-err */
import React from "react";
import io from "socket.io-client";

const socket = io(window.location.origin);
let creator = true;
let userStream;
let videoChatRoom = document.getElementById("video-chat-room");
let userVideo = document.getElementById("user-video");
let peerVideo = document.getElementById("peer-video");
let leaveRoomButton = document.getElementById("leave-room-button");
let roomName;
const iceServers = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};
let rtcPeerConnection = null;

export default class ChatLobby extends React.Component {
  constructor() {
    super();
    this.state = {
      roomName: "",
      style: { display: "flex" },
    };
    this.handleJoin = this.handleJoin.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleLeaveRoom = this.handleLeaveRoom.bind(this);
    this.onCreated = this.onCreated.bind(this);
    this.onJoined = this.onJoined.bind(this);
    this.onFull = this.onFull.bind(this);
    this.onReady = this.onReady.bind(this);
    this.onCandidate = this.onCandidate.bind(this);
    this.onOffer = this.onOffer.bind(this);
    this.onAnswer = this.onAnswer.bind(this);
    this.onIceCandidate = this.onIceCandidate.bind(this);
    this.onTrack = this.onTrack.bind(this);
  }

  componentDidMount() {
    socket.on("created", this.onCreated);
    socket.on("joined", this.onJoined);
    socket.on("full", this.onFull);
    socket.on("ready", this.onReady);
    socket.on("candidate", this.onCandidate);
    socket.on("offer", this.onOffer);
    socket.on("answer", this.onAnswer);

    leaveRoomButton.addEventListener("click", this.handleLeaveRoom);
  }

  render() {
    return (
      <div id="video-chat-lobby" style={this.state.style}>
        <input
          id="roomName"
          name="roomName"
          type="text"
          value={this.state.roomName}
          onChange={this.handleChange}
          placeholder="Room Name"
        />
        <button type="button" id="join" onClick={this.handleJoin}>
          Join
        </button>
      </div>
    );
  }

  onCreated() {
    console.log("callback from socket.on created");
    // check;
    creator = true;
    navigator.mediaDevices
      .getUserMedia({
        audio: true,
        video: { width: 200, height: 200 },
      })
      .then(function (stream) {
        userStream = stream;
        videoChatRoom.style = "display:flex";
        userVideo.srcObject = stream;
        userVideo.onloadedmetadata = function () {
          userVideo.play();
        };
      })
      .catch(function (err) {
        console.log(err);
        alert("Couldn't access media");
      });
    this.setState({ style: { display: "none" } });
  }
  onJoined() {
    creator = false;
    console.log("callback from onJoined");
    roomName = this.state.roomName;
    navigator.mediaDevices
      .getUserMedia({
        audio: true,
        video: { width: 200, height: 200 },
      })
      .then(function (stream) {
        videoChatRoom.style = "display:flex";
        userStream = stream;
        userVideo.srcObject = stream;
        userVideo.onloadedmetadata = function (e) {
          userVideo.play();
        };
        socket.emit("ready", roomName);
      })
      .catch(function (err) {
        alert("Couldn't access media");
      });
    this.setState({ style: { display: "none" } });
  }

  onReady() {
    console.log("callback from socket.on ready");
    roomName = this.state.roomName;
    if (creator) {
      rtcPeerConnection = new RTCPeerConnection(iceServers);
      rtcPeerConnection.onicecandidate = this.onIceCandidate;
      rtcPeerConnection.ontrack = this.onTrack;
      rtcPeerConnection.addTrack(userStream.getTracks()[0], userStream);
      rtcPeerConnection.addTrack(userStream.getTracks()[1], userStream);
      rtcPeerConnection.createOffer(
        function (offer) {
          console.log("Creating offer");
          rtcPeerConnection.setLocalDescription(offer);
          socket.emit("offer", offer, roomName);
        },
        function (error) {
          console.log(error);
        }
      );
    }
  }

  onFull() {
    alert("Room is full; can't join");
  }

  onCandidate(candidate) {
    console.log("callback from socket.on candidate");
    const icecandidate = new RTCIceCandidate(candidate);
    rtcPeerConnection.addIceCandidate(icecandidate);
  }

  onOffer(offer) {
    console.log("callback from socket.on offer");
    roomName = this.state.roomName;
    if (!creator) {
      rtcPeerConnection = new RTCPeerConnection(iceServers);
      rtcPeerConnection.onicecandidate = this.onIceCandidate;
      rtcPeerConnection.ontrack = this.onTrack;
      rtcPeerConnection.addTrack(userStream.getTracks()[0], userStream);
      rtcPeerConnection.addTrack(userStream.getTracks()[1], userStream);
      rtcPeerConnection.setRemoteDescription(offer);
      rtcPeerConnection.createAnswer(
        function (answer) {
          console.log("creating answer");
          rtcPeerConnection.setLocalDescription(answer);
          socket.emit("answer", answer, roomName);
        },
        function (error) {
          console.log(error);
        }
      );
    }
  }

  onAnswer(answer) {
    console.log("callback from socket.on answer");
    rtcPeerConnection.setRemoteDescription(answer);
  }

  onIceCandidate(event) {
    if (event.candidate) {
      console.log("Inside onIceCandidate");
      socket.emit("candidate", event.candidate, this.state.roomName);
    }
  }

  onLeave() {
    creator = true;
    if (rtcPeerConnection) {
      rtcPeerConnection.ontrack = null;
      rtcPeerConnection.onicecandidate = null;
      rtcPeerConnection.close();
      rtcPeerConnection = null;
    }
    if (peerVideo.srcObject) {
      peerVideo.srcObject.getTracks()[0].stop();
      peerVideo.srcObject.getTracks()[1].stop();
    }
  }

  onTrack(event) {
    console.log("inside onTrack");
    peerVideo.srcObject = event.streams[0];
    peerVideo.onloadedmetadata = function (e) {
      peerVideo.play();
    };
  }

  handleJoin() {
    if (!this.state.roomName) {
      alert("Please enter a room name");
    } else {
      socket.emit("join", this.state.roomName);
    }
  }

  handleChange(event) {
    this.setState({ [event.target.name]: event.target.value });
  }
  handleLeaveRoom() {
    socket.emit("leave", roomName);
    if (userVideo.srcObject) {
      userVideo.srcObject.getTracks()[0].stop();
      userVideo.srcObject.getTracks()[1].stop();
    }
    if (peerVideo.srcObject) {
      peerVideo.srcObject.getTracks()[0].stop();
      peerVideo.srcObject.getTracks()[1].stop();
    }
    if (rtcPeerConnection) {
      rtcPeerConnection.ontrack = null;
      rtcPeerConnection.onicecandidate = null;
      rtcPeerConnection.close();
      rtcPeerConnection = null;
    }
    videoChatRoom.style = "display:none";
    this.setState({ style: { display: "flex" } });
  }
}
