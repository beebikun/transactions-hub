import Hub from "./contracts/Hub.json";

const options = {
  contracts: [Hub],
  web3: {
    fallback: {
      type: "ws",
      url: "ws://127.0.0.1:7545",
    },
  },
  events: {
    Hub: ['allEvents'],
  },
};


export default options;
