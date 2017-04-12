import React, { Component } from 'react'

import Workflow from 'contracts/Workflow.sol';
import AccountListContainer from 'components/AccountListContainer'
import Web3 from 'web3';

class WorkflowContainer extends Component {
  constructor(props) {
    super(props)

    this.state = {
      accounts: [],
      workflowSteps: [],
      maxStepIndex: -1,
      currentIndex: -1,
      newStep: {
        stepName: "Enter a name",
        approvalsRequired: 3
      }
    };

    this.handleReloadCurrentState = this.handleReloadCurrentState.bind(this);
    this.addTestWorkflowStep = this.addTestWorkflowStep.bind(this);
    this.renderWorkflowStep = this.renderWorkflowStep.bind(this);
    this.loadWorkflow = this.loadWorkflow.bind(this);
    this.loadMaxStepIndex = this.loadMaxStepIndex.bind(this);
    this.loadAccounts = this.loadAccounts.bind(this);
    this.loadWorkflowStepAtIndex = this.loadWorkflowStepAtIndex.bind(this);
    this.getCurrentWorkflowStep = this.getCurrentWorkflowStep.bind(this);
    this.loadCurrentStepIndex = this.loadCurrentStepIndex.bind(this);
    this.handleSubmitAddStep = this.handleSubmitAddStep.bind(this);
    this.handleFormChange = this.handleFormChange.bind(this);
    this.renderEmptyWorkflow = this.renderEmptyWorkflow.bind(this);
    this.renderWorkflow = this.renderWorkflow.bind(this);

    this.loadAccounts().then(() => {
      console.log(Workflow.deployed());
      return this.loadCurrentStepIndex();
    }).then(() => {
        this.loadWorkflow();
        this.handleReloadCurrentState();
    });
  }

  getCurrentWorkflowStep() {
    console.log("getCurrentWorkflowStep");
    console.log(this.state.currentIndex);
    if(this.state.currentIndex > -1){
      return this.state.workflowSteps[this.state.currentIndex];
    }
    return {};
  }

  loadAccounts() {
    return new Promise((resolve, reject) => {
      this.props.web3.eth.getAccounts((err, accs) => {
        if (err != null) {
          window.alert('There was an error fetching your accounts.')
          console.error(err)
          reject(err);
          return;
        }

        if (accs.length === 0) {
          window.alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.")
          reject();
          return;
        }

        this.setState({accounts: accs});
        resolve();
      });
    });
  }

  componentWillMount(){
    Workflow.setProvider(this.props.web3.currentProvider);
  }

  loadWorkflow() {
    this.loadMaxStepIndex().then((result) => {
      var maxStepIndex = result.maxStepIndex;
      for (var index = 0; index < maxStepIndex; index += 1) {
        this.loadWorkflowStepAtIndex(index); // load workflow steps from index 0 -> max index
      }
    });
  }

  loadMaxStepIndex() {
    return new Promise((resolve, reject) => {
      Workflow.deployed().finalStepIndex.call({from: this.state.accounts[0]}).then((value) => {
        var maxStepIndex = value.toNumber()
        this.setState({maxStepIndex: maxStepIndex}, () => {
          resolve({ maxStepIndex: maxStepIndex })
        });
      }).catch((err) => {
        console.log(err);
        reject(err);
      });
    });
  }

  loadCurrentStepIndex() {
    var workflow = Workflow.deployed();
    return new Promise((resolve, reject) => {
      workflow.stepIndex.call().then((value) => {
        console.log("Got index: " + value.toNumber());
        this.setState({currentIndex: value.toNumber()}, () => {
          resolve();
        });
      });
    }).catch((err) => {
      console.log(err);
      reject(err);
    });
  }

  loadWorkflowStepAtIndex(index) {
    var workflow = Workflow.deployed();

    workflow.getStepAtIndex.call(index, {from: this.state.accounts[0]}).then((value) => {

      // returns (int8 stepIndex, string name, uint8 approvals, uint8 approvalsRequired)
      var workflowStep = {
        index: value[0].toNumber(),
        name: value[1],
        approvals: value[2].toNumber(),
        approvalsRequired: value[3].toNumber()
      }

      var workflowSteps = this.state.workflowSteps;
      workflowSteps[index] = workflowStep;

      this.setState({ workflowSteps: workflowSteps })
    }).catch(function(e) {
      console.log(e);
    });;
  }

  componentDidMount() {
    setInterval(() => {
      this.handleReloadCurrentState()
    }, 5000)
  }

  addTestWorkflowStep() {
    if (this.state.accounts.length === 0) {
      console.log("No account to add a workflow step from, returning");
      return;
    }

    console.log("add test workflow step");
    var workflowSteps = [
      {name: "Bid ready", approvalsRequired: 3},
      {name: "Project phase 1 complete", approvalsRequired: 2},
      {name: "Project complete", approvalsRequired: 3}
    ];

    var firstState = workflowSteps[0];
    var workflow = Workflow.deployed();

    workflow.addWorkflowStep(firstState.name, firstState.approvalsRequired, {from: this.state.accounts[0], gas: 200000}).then((result) => {
      console.log("Workflow state added:");
      console.log(result);
    });
  }

  addWorkflowStep(name, approvalsRequired) {
    if (this.state.accounts.length === 0) {
      console.log("No account to add a workflow step from, returning");
      return;
    }

    var workflow = Workflow.deployed();

    workflow.addWorkflowStep(name, approvalsRequired, {from: this.state.accounts[0], gas: 200000}).then((result) => {
      console.log("Workflow state added:");
      console.log(result);
    });
  }

  handleReloadCurrentState() {
    console.log("Refreshing...");
    this.loadCurrentStepIndex().then(() => {
      this.loadWorkflow();
    });
  }

  handleSubmitAddStep(event) {
    event.preventDefault();

    const name = this.state.newStep.stepName;
    const approvalsRequired = this.state.newStep.approvalsRequired;

    console.log(name);
    console.log(approvalsRequired);
    if(name.length < 0) {
      alert("Please give the new step a name!");
      return;
    }

    this.addWorkflowStep(name, approvalsRequired);
  }

  handleFormChange(event) {
    //event.preventDefault();

    const target = event.target;
    const value = target.value;
    const name = target.name;
    console.log(name);

    var newStep = this.state.newStep;
    newStep[name] = value

    this.setState({
      newStep : newStep
    });
  }

  /*
  workflowStep = {
    index: value[0]
    name: value[1],
    approvals: value[2],
    approvalsRequired: value[3]
  }*/

  renderWorkflow() {

    var projectCompleteStep = {
      index: this.state.maxStepIndex,
      name: "Workflow Complete",
      approvals: 0,
      approvalsRequired: 0
    }

    return (
      <div>
        {this.state.workflowSteps.map(this.renderWorkflowStep)}
        {this.renderWorkflowStep(projectCompleteStep)}
      </div>
    )
  }

  render() {

    var currentWorkflowStep = this.getCurrentWorkflowStep();

    var workflowEmpty = this.state.workflowSteps === 'undefined' || this.state.workflowSteps.length === 0;

    return (
      <div className="root-container">
        <div className="workflow-step-container blue-background">
          <div className="add-workflow-step-container content-container ">
            <div className="title">
              <h1> Workflow </h1>
              <h2> Powered by Ethereum </h2>
            </div>
            {workflowEmpty? this.renderEmptyWorkflow() : this.renderWorkflow()}
          </div>
        </div>
        {this.renderAddStepContainer()}
        <AccountListContainer web3={this.props.web3} currentWorkflowStep={currentWorkflowStep} adminAccount={this.state.accounts[0]}/>
      </div>
    )
  }



  renderEmptyWorkflow() {
    return(
      <p> {"The workflow is currently empty. Add some steps using the form below."} </p>
    )
  }

  renderAddStepContainer() {
    console.log(this.state.newStep)
    return (
      <div className="root-container yellow-background">
        <div className="add-workflow-step-container content-container">
        <div className="title"> <h2> Add new workflow step: </h2> </div>
          <form className="add-workflow-step" onSubmit={this.handleSubmitAddStep}>
            <label> Name: </label>
            <input type="text" name="stepName" value={this.state.newStep.stepName} onChange={this.handleFormChange}/>
            <label> Approvals: </label>
            <input type="number" name="approvalsRequired" value={this.state.newStep.approvalsRequired} onChange={this.handleFormChange}/>
            <input type="submit" value="Add Step" />
          </form>
        </div>
      </div>
    )
  }

  renderWorkflowStep(step) {
    var isCurrentStep = step.index == this.state.currentIndex;
    var isFinalStep = step.index == this.state.maxStepIndex;
    return (
      <div className={"workflow-step" + (isCurrentStep ? " current-workflow-step" : "")} key={ step.index }>
        <h1>{!isFinalStep && <span className='step-counter'>{ step.index + 1}</span>}{ step.name }</h1>
        <p> </p>
        {step.approvalsRequired > 0 ?
          <p>Approvals: { step.approvals } / { step.approvalsRequired } </p> :
          <p>{"The workflow has reached it's final state."}</p>
        }
      </div>
    )
  }
}

export default WorkflowContainer
