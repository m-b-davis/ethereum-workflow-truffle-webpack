import React, { Component } from 'react'

import Workflow from 'contracts/Workflow.sol';
import Web3 from 'web3';

class AccountListContainer extends Component {
  constructor(props) {
    super(props)
    this.state = {
      currentIndex: -1,
      stakeholders: [],
      nonStakeholders: []
    }



    this.render = this.render.bind(this);
    this.renderStakeholder = this.renderStakeholder.bind(this);
    this.renderNonStakeholder = this.renderNonStakeholder.bind(this);
    this.handleAddStakeholder = this.handleAddStakeholder.bind(this);
    this.approveStep = this.approveStep.bind(this);
    this.reloadAccounts = this.reloadAccounts.bind(this);

    this.reloadAccounts();
  }

  componentWillReceiveProps(nextProps){
    console.log("PROPS")
    console.log(this.props);
    console.log("NEXTPROPS")
    console.log(nextProps);

    if (typeof(this.props.currentWorkflowStep) === 'undefined' ||
        typeof(nextProps.currentWorkflowStep) === 'undefined') {
      return;
    }

    if (this.props.currentWorkflowStep.index !== nextProps.currentWorkflowStep.index) {
      this.reloadAccounts();
    }
  }

  componentWillMount(){
    Workflow.setProvider(this.props.web3.currentProvider);
  }

  reloadAccounts() {
    this.props.web3.eth.getAccounts((err, accounts) => {
      if (err != null) {
        window.alert('There was an error fetching your accounts.')
        console.error(err)
        return
      }

      if (accounts.length === 0) {
        window.alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.")
        return
      }

      this.setState({
        nonStakeholders: accounts,
        stakeholders: []
      });
    });
  }

  handleAddStakeholder(account) {
    console.log("Adding stakeholder...");

    var nonStakeholders = this.state.nonStakeholders;

    var accountIndex = nonStakeholders.indexOf(account);

    if (accountIndex > -1) {
      nonStakeholders.splice(accountIndex, 1);
    }

    var stakeholders = this.state.stakeholders;
    stakeholders.push(account);

    this.setState({
      stakeholders: stakeholders,
      nonStakeholders: nonStakeholders
    });

    var workflow = Workflow.deployed();
    console.log(this.props.currentWorkflowStep)
    var currentIndex = this.props.currentWorkflowStep.index;

    workflow.addStakeholder(account, currentIndex, {from: this.props.adminAccount });
  }

  approvalMade(account, log) {
    console.log("Approval made!")
    console.log(account)
    console.log(log)
  }

  approveStep(account) {
    console.log("Approving step...");

    var workflow = Workflow.deployed();
    var currentIndex = this.props.currentWorkflowStep.index;

    var approveEventListener = (result) => {

      var eventNames = {
        approvalMade: "ApprovalMade",
        stepChanged: "StepChanged",
        workflowComplete: "WorkflowComplete"
      }

      for (var i = 0; i < result.logs.length; i++) {
        var log = result.logs[i];
        console.log(log.event);

        if (log.event === eventNames.approvalMade) {
          this.approvalMade(account, log);
        }

        if (log.event === eventNames.stepChanged) {
          console.log("Step changed!");
        }

        if (log.event === eventNames.workflowComplete) {
          console.log("Workflow complete!");
        }
      }
    }

    workflow.approve({ from: account }).then(function(result){
      console.log("approve result:")
      console.log(result);
    })
  }

  render() {
    var stakeholders = this.state.stakeholders;
    var accounts = this.state.nonStakeholders;

    return (
      <div className="root-container yellow-background">
        <div className="accounts-container content-container">

            {stakeholders.length > 0 &&
              <div className="accounts-container-stakeholders">
                <div className="title">
                  <h1>Stakeholders</h1>
                </div>
                {stakeholders.map(this.renderStakeholder)}
              </div>
            }

          <div className="accounts-container-nonstakeholders">
            <div className="title"><h1>Accounts</h1></div>
            {accounts.map(this.renderNonStakeholder)}
          </div>
        </div>
      </div>
    )
  }

  renderAccount(account, buttonText, callback) {
    return(
      <div className="address-line" key={ account }>
        <p> Address: {account} </p>
        <button onClick={callback}> {buttonText} </button>
      </div>
    );
  }

  renderStakeholder(account) {
    return this.renderAccount(account, "Approve", (e) => {
      this.approveStep(account)
    });
  }

  renderNonStakeholder(account) {
    return this.renderAccount(account, "+ Stakeholder", (e) => {
      this.handleAddStakeholder(account)
    });
  }
}

export default AccountListContainer
