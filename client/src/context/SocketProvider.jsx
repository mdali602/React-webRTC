import React, { createContext, useMemo, useContext, useState } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

export const useSocket = () => {
  const socket = useContext(SocketContext);
  return socket;
};

export const SocketProvider = (props) => {
  const socket = useMemo(() => io("http://192.168.29.119:8000"), []);
  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [myStream, setMyStream] = useState();
  const [remoteStream, setRemoteStream] = useState();

  return (
    <SocketContext.Provider
      value={{
        socket,
        remoteSocketId,
        myStream,
        remoteStream,
        setRemoteSocketId,
        setMyStream,
        setRemoteStream,
      }}
    >
      {props.children}
    </SocketContext.Provider>
  );
};
