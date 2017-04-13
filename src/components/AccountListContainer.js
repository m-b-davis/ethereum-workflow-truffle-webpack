import React, { Component } from 'react'

import Workflow from 'contracts/Workflow.sol';
import Web3 from 'web3';
import InputModal from 'components/InputModal'

class AccountListContainer extends Component {
  constructor(props) {
    super(props)
    this.state = {
      currentIndex: -1,
      stakeholders: [],
      nonStakeholders: [],
      nicknames: {},
      nicknameModal: {
        isHidden: true,
        account: null,
        onConfirm: null,
        onCancel: null
      }
    }

    this.render = this.render.bind(this);
    this.renderStakeholder = this.renderStakeholder.bind(this);
    this.renderNonStakeholder = this.renderNonStakeholder.bind(this);
    this.handleAddStakeholder = this.handleAddStakeholder.bind(this);
    this.approveStep = this.approveStep.bind(this);
    this.reloadAccounts = this.reloadAccounts.bind(this);
    this.setNickname = this.setNickname.bind(this);
    this.showNicknameModal = this.showNicknameModal.bind(this);
    this.hideModal = this.hideModal.bind(this);

    this.reloadNicknames = this.reloadNicknames.bind(this);
    this.reloadNickname = this.reloadNickname.bind(this);

    this.reloadAccounts();
  }

  componentWillReceiveProps(nextProps){

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

    setInterval(() => {
      this.reloadNicknames();
    }, 5000)
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

  reloadNicknames() {
    this.state.nonStakeholders.map(this.reloadNickname);
    this.state.stakeholders.map(this.reloadNickname);
  }

  reloadNickname(account) {
    var workflow = Workflow.deployed();

    var nicknames = this.state.nicknames;

    workflow.getNickname.call(account).then((value) => {
      console.log(value);
      nicknames[account] = value;
      this.setState({ nicknames: nicknames });
    }).catch((err) => {
      console.error(err);
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
    }).catch((err) => {
      console.error(err);
    });
  }

  hideModal() {
    var defaultModalState = {
      isHidden: true,
      account: null,
      onCancel: null,
      onConfirm: null
    }

    this.setState({nicknameModal: defaultModalState});
  }


  showNicknameModal(account){

    var nicknameModalState = {
      isHidden: false,
      account: account,
      onCancel: this.hideModal,
      onConfirm: ((nickname) => {
        this.hideModal();
        this.setNickname(account, nickname);
      }).bind(this)
    }

    this.setState({nicknameModal: nicknameModalState});
  }

  setNickname(account, nickname) {
    var workflow = Workflow.deployed();
    workflow.setNickname(nickname, {from: account});
  }

  render() {
    var stakeholders = this.state.stakeholders;
    var accounts = this.state.nonStakeholders;

    return (
      <div className="root-container yellow-background">
      <InputModal isHidden={this.state.nicknameModal.isHidden} message="Enter a nickname" onConfirm={this.state.nicknameModal.onConfirm} onCancel={this.state.nicknameModal.onCancel}></InputModal>
        <div className="accounts-container content-container">

            {stakeholders.length > 0 &&
              <div className="accounts-container-inner">
                <div className="title">
                  <h1>Stakeholders</h1>
                </div>
                {stakeholders.map(this.renderStakeholder)}
              </div>
            }

          <div className="accounts-container-inner">
            <div className="title"><h1>Accounts</h1></div>
            {accounts.map(this.renderNonStakeholder)}
          </div>
        </div>
      </div>
    )
  }


  renderStakeholder(account) {
    var approveButton = {
      text: "Approve",
      onClick: (e) => { this.approveStep(account) }
    };

    var buttons = [approveButton];
    return this.renderAccount(account, buttons);
  }

  renderNonStakeholder(account) {
    var addNicknameButton = {
      text: "Set Nickname",
      onClick: (e) => { this.showNicknameModal(account) }
    };

    var stakeholderButton = {
      text: "+ Stakeholder",
      onClick: (e) => { this.handleAddStakeholder(account) }
    };

    var buttons = [stakeholderButton, addNicknameButton];
    return this.renderAccount(account, buttons);
  }

  renderAccount(account, buttons) {
    let nicknames = this.state.nicknames;
    let nickname = account in nicknames ? nicknames[account] : "Anonymous";

    return(
      <div className="address-line" key={ account }>
        <h2>{ nickname }</h2>
        <p>{ account } </p>
        { buttons.map(this.renderButton) }
      </div>
    );
  }

  renderButton(button) {
    return (<button onClick={button.onClick}> {button.text} </button>);
  }
}

export default AccountListContainer
