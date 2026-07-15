let io;

const setIO = (socketIO) => {
  io = socketIO;
};

const getIO = () => {
  return io;
};

export { setIO, getIO };