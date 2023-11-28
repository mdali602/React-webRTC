const { Server } = require("socket.io");

const io = new Server(8000, {
  cors: true,
});

const emailToSocketIdMap = new Map();
const socketidToEmailMap = new Map();

io.on("connection", (socket) => {
  console.log(`Socket Connected`, socket.id);
  socket.on("room:join", (data) => {
    console.log("room:join", data);
    const { email, room } = data;
    emailToSocketIdMap.set(email, socket.id);
    socketidToEmailMap.set(socket.id, email);
    io.to(room).emit("user:joined", { email, id: socket.id });
    socket.join(room);
    io.to(socket.id).emit("room:join", data);
  });

  socket.on("user:call", ({ to, offer }) => {
    console.log("user:call", { to, offer, from: socket.id });
    io.to(to).emit("incomming:call", { from: socket.id, offer });
  });
  //

  socket.on("user:sceenShare", ({ to, offer }) => {
    console.log("user:sceenShare", { to, offer, from: socket.id });
    io.to(to).emit("incomming:screenShare", { from: socket.id, offer });
  });
  socket.on("call:accepted", ({ to, ans }) => {
    console.log("call:acceted", { to, ans });
    io.to(to).emit("call:accepted", { from: socket.id, ans });
  });
  socket.on("screenSare:accepted", ({ to, ans }) => {
    console.log("screenSare:acceted", { to, ans });
    io.to(to).emit("screenSare:accepted", { from: socket.id, ans });
  });

  socket.on("peer:nego:needed", ({ to, offer }) => {
    console.log("peer:nego:needed", { to, offer });
    io.to(to).emit("peer:nego:needed", { from: socket.id, offer });
  });

  socket.on("peer:nego:done", ({ to, ans }) => {
    console.log("peer:nego:done", { to, ans });
    io.to(to).emit("peer:nego:final", { from: socket.id, ans });
  });
});
