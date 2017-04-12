## Workflow with Truffle & Webpack

This is a simple web interface for my workflow smart contract. I'm not too familiar with react and I only had a couple of days to turn this around so the code is a bit rough for now - hopefully soon to be improved.

Thank you to ConsenSys for the demo truffle & webpack app which I used as a starting point.
https://github.com/ConsenSys/truffle-webpack-demo


Note: Make sure you are running at least `geth 1.4.17-stable-3885907c`, or in some way be running at least `solc ^0.4.0 `

### Prerequisites
 - Node.js
 - Geth
 - Truffle: `npm install -g truffle`
 - Testrpc: `npm install -g ethereumjs-testrpc`

### Running

The Web3 RPC location will be picked up from the `truffle.js` file.

- Clone this repo
- `npm install` in the root directory
- Make sure `testrpc` is running on its default port. Then:
  - `npm run start` - Starts the development server
  - Load up http://localhost:3000

### How to use
- Use the form in the center of the page to add steps to the workflow
- Click the '+ Stakeholder' button to add the account as a stakeholder for this step in the workflow
- Click approve to approve the current workflow step
- Once enough approvals have been made for the current workflow step, the contract will move to it's next state
- To reset the contract, restart testrpc

### Screenshot
