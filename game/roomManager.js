const { nanoid } = require('nanoid');
const GameRoom = require('./GameRoom');

const rooms = new Map();

function createRoom(hostId, hostName) {
  let code;
  do { code = nanoid(5).toUpperCase(); } while (rooms.has(code));
  const room = new GameRoom(code, hostId);
  room.addPlayer(hostId, hostName); // addPlayer يحفظ token داخلياً
  rooms.set(code, room);
  return room;
}

function getRoom(code) {
  return rooms.get(code?.toUpperCase());
}

function deleteRoom(code) {
  rooms.delete(code);
}

module.exports = { createRoom, getRoom, deleteRoom, rooms };
