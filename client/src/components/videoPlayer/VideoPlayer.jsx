import { useEffect, useRef } from "react";

function VideoPlayer({ stream }) {
  const videoRef = useRef(null);
  useEffect(() => {
    if (videoRef.current) videoRef.current.srcObject = stream;
  }, [stream]);
  return (
    <div style={{ width: 200 }}>
      <video ref={videoRef} autoPlay muted style={{ width: "inherit" }} />
    </div>
  );
}

export default VideoPlayer;
