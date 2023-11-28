import React, { useEffect, useCallback, useState } from "react";
// import ReactPlayer from "react-player";
import peer from "../service/peer";
import { useSocket } from "../context/SocketProvider";
import VideoPlayer from "../components/videoPlayer/VideoPlayer";

const RoomPage = () => {
  const {
    socket,
    remoteSocketId,
    myStream,
    remoteStream,
    setRemoteSocketId,
    setMyStream,
    setRemoteStream,
  } = useSocket();

  // const [isSharingScreen, setIsSharingScreen] = useState(false);
  let isSharingScreen = false;

  const handleCallUser = useCallback(async () => {
    console.log("handleCallUser: ");
    // const stream = await navigator.mediaDevices.getUserMedia({
    //   audio: true,
    //   video: true,
    // });
    const offer = await peer.getOffer();
    socket.emit("user:call", { to: remoteSocketId, offer });
    // setMyStream(stream);
    // }, [remoteSocketId, setMyStream, socket]);
  }, [remoteSocketId, socket]);

  const handleUserJoined = useCallback(
    async ({ email, id }) => {
      console.log(
        `handleUserJoined: Email ${email} joined room remoteSocketId${id} socketId: ${socket.id}`
      );
      setRemoteSocketId(id);
      // handleCallUser();
      const offer = await peer.getOffer();
      socket.emit("user:call", { to: id, offer });
      // setTimeout(handleCallUser, 2000);
    },
    [setRemoteSocketId, socket]
  );

  const handleIncommingCall = useCallback(
    async ({ from, offer }) => {
      console.log("handleIncommingCall: ", { from, offer });
      setRemoteSocketId(from);
      // const stream = await navigator.mediaDevices.getUserMedia({
      //   audio: true,
      //   video: true,
      // });
      // setMyStream(stream);
      console.log(`Incoming Call`, from, offer);
      const ans = await peer.getAnswer(offer);
      socket.emit("call:accepted", { to: from, ans });
    },
    [setRemoteSocketId, socket]
  );

  const handleIncommingScreenSare = useCallback(
    async ({ from, offer }) => {
      console.log("handleIncommingScreenSare: ", { from, offer });
      // setRemoteSocketId(from);
      const stream = await navigator.mediaDevices.getDisplayMedia({});
      // setMyStream(stream);
      console.log(`Incoming ScreenSare`, from, offer);
      const ans = await peer.getAnswer(offer);
      socket.emit("screenSare:accepted", { to: from, ans });
    },
    [socket]
  );

  const sendStreams = useCallback(() => {
    console.log("TCL -> sendStreams -> sendStreams:");
    for (const track of myStream.getTracks()) {
      peer.peer.addTrack(track, myStream);
    }
  }, [myStream]);

  const handleCallAccepted = useCallback(
    ({ from, ans }) => {
      console.log("TCL -> RoomPage -> handleCallAccepted:", { from, ans });
      peer.setLocalDescription(ans);
      console.log("Call Accepted!");
      sendStreams();
    },
    [sendStreams]
  );

  const handleNegoNeeded = useCallback(async () => {
    console.log("TCL -> handleNegoNeeded -> handleNegoNeeded:");
    const offer = await peer.getOffer();
    socket.emit("peer:nego:needed", { offer, to: remoteSocketId });
  }, [remoteSocketId, socket]);

  const handleNegoNeedIncomming = useCallback(
    async ({ from, offer }) => {
      console.log("TCL -> RoomPage -> handleNegoNeedIncomming:", {
        from,
        offer,
      });
      const ans = await peer.getAnswer(offer);
      socket.emit("peer:nego:done", { to: from, ans });
    },
    [socket]
  );

  const handleNegoNeedFinal = useCallback(async ({ ans }) => {
    console.log("TCL -> handleNegoNeedFinal -> handleNegoNeedFinal:", { ans });
    await peer.setLocalDescription(ans);
  }, []);

  /* const shareScreen = async () => {
    try {
      if (!isSharingScreen) {
        console.log("displayMedia");
        const stream = await navigator.mediaDevices.getDisplayMedia({});
        setMyStream(stream);
        setIsSharingScreen(true);
      } else {
        console.log("userMedia");
        // Stop screen sharing
        const newStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: true,
        });
        setMyStream(newStream);
        setIsSharingScreen(false);
      }
    } catch (error) {
      console.error("Error sharing screen:", error);
    }
  }; */

  useEffect(() => {
    peer.peer.addEventListener("negotiationneeded", handleNegoNeeded);
    return () => {
      peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
    };
  }, [handleNegoNeeded]);

  useEffect(() => {
    peer.peer.addEventListener("track", async (ev) => {
      const remoteStream = ev.streams;
      console.log("GOT TRACKS!!", remoteStream);
      setRemoteStream(remoteStream[0]);
    });
  }, [setRemoteStream]);

  useEffect(() => {
    socket.on("user:joined", handleUserJoined);
    socket.on("incomming:call", handleIncommingCall);
    socket.on("incomming:screenShare", handleIncommingScreenSare);
    socket.on("call:accepted", handleCallAccepted);
    socket.on("peer:nego:needed", handleNegoNeedIncomming);
    socket.on("peer:nego:final", handleNegoNeedFinal);

    return () => {
      socket.off("user:joined", handleUserJoined);
      socket.off("incomming:call", handleIncommingCall);
      socket.off("incomming:screenShare", handleIncommingScreenSare);
      socket.off("call:accepted", handleCallAccepted);
      socket.off("peer:nego:needed", handleNegoNeedIncomming);
      socket.off("peer:nego:final", handleNegoNeedFinal);
    };
  }, [
    socket,
    handleUserJoined,
    handleIncommingCall,
    handleIncommingScreenSare,
    handleCallAccepted,
    handleNegoNeedIncomming,
    handleNegoNeedFinal,
  ]);

  const loadStream = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    setMyStream(stream);
  }, [setMyStream]);

  const shareScreen = async () => {
    isSharingScreen = !isSharingScreen;
    // loadStream();
    const stream = await navigator.mediaDevices.getDisplayMedia({});
    setMyStream(stream);
    // const offer = await peer.getOffer();
    // socket.emit("user:sceenShare", { to: remoteSocketId, offer });
    // sendStreams();
  };

  useEffect(() => {
    loadStream();
  }, [loadStream]);

  return (
    <div>
      <h1>Room Page</h1>
      <h4>{remoteSocketId ? "Connected" : "No one in room"}</h4>
      {myStream && <button onClick={sendStreams}>Send Stream</button>}
      {remoteSocketId && <button onClick={handleCallUser}>CALL</button>}
      {/* <button onClick={shareScreen}>Share Screen</button> */}
      <button onClick={shareScreen} disabled={isSharingScreen}>
        {isSharingScreen ? "Stop Sharing" : "Share Screen"}
      </button>
      {myStream && (
        <>
          <h1>My Stream</h1>
          {/* <ReactPlayer
            playing
            muted
            height="100px"
            width="200px"
            url={myStream}
          /> */}
          <VideoPlayer stream={myStream} />
        </>
      )}
      {remoteStream && (
        <>
          <h1>Remote Stream</h1>
          {/* <ReactPlayer
            playing
            muted
            height="100px"
            width="200px"
            url={remoteStream}
          /> */}
          <VideoPlayer stream={remoteStream} />
        </>
      )}
    </div>
  );
};

export default RoomPage;
