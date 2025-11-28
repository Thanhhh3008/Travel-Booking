// module.exports = (io, pool) => {
//   let users = []; // { socketId, MaNguoiDung }
//   let messages = []; // lưu tạm tin nhắn

//   io.on("connection", socket => {
//     console.log("Connected", socket.id);

//     socket.on("userConnect", data => {
//       if(!users.find(u => u.MaNguoiDung === data.MaNguoiDung)){
//         users.push({ socketId: socket.id, MaNguoiDung: data.MaNguoiDung });
//       }
//       io.emit("updateUserList", users); // admin nhận user online
//     });

//     socket.on("userSend", data => {
//       messages.push({ ...data, GuiBoi: "user" });
//       io.emit("userMessage", data); // admin nhận
//     });

//     socket.on("adminSend", data => {
//       messages.push(data);
//       const userSocket = users.find(u => u.MaNguoiDung === data.MaNguoiDung);
//       if(userSocket) io.to(userSocket.socketId).emit("newMessage", data); // user nhận
//     });

//     socket.on("loadHistory", data => {
//       const history = messages.filter(m => m.MaNguoiDung === data.MaNguoiDung);
//       socket.emit("chatHistory", history);
//     });

//     socket.on("disconnect", () => {
//       users = users.filter(u => u.socketId !== socket.id);
//       io.emit("updateUserList", users);
//     });
//   });
// };
