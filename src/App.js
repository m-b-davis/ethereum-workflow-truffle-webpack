import React, { Component } from 'react'
import './App.css'

import WorkflowContainer from 'components/WorkflowContainer'

class App extends Component {

  constructor(props) {
    super(props);

    console.log(this.state);
  }

  render () {
    return (
      <div className="App">
        <WorkflowContainer web3={this.props.web3} />
      </div>
    )
  }
}

export default App
