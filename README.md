## Workflow with Truffle & Webpack

This is a simple web interface for my workflow smart contract. I'm not too familiar with react and I only had a couple of days to turn this around so the code is a bit rough for now - hopefully soon to be improved.

Thank you to ConsenSys for the demo truffle & webpack app which I used as a starting point.
https://github.com/ConsenSys/truffle-webpack-demo


Note: Make sure you are running at least `geth 1.4.17-stable-3885907c`, or in some way be running at least `solc ^0.4.0 `

### Running

The Web3 RPC location will be picked up from the `truffle.js` file.

0. Clone this repo
0. `npm install`
0. Make sure `testrpc` is running on its default port. Then:
  - `npm run start` - Starts the development server
  - Load up http://localhost:3000
