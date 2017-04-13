pragma solidity ^0.4.0;

contract Workflow {

    struct Stakeholder {
        bool approved;
        bool exists; // Set to true by default to say that this address is a stakeholder
    }

    struct WorkflowStep {
        string name;
        uint8 approvals;
        uint8 approvalsRequired;
        mapping(address => Stakeholder) stakeholders;
    }

    struct Nickname {
      string name;
      bool exists;
    }

    uint8 public stakeholderCount;
    int8 public stepIndex;
    int8 public finalStepIndex;

    mapping(int8 => WorkflowStep) workflowSteps;
    address admin;
    bool workflowComplete;

    mapping(address => Nickname) nicknames;

    event ApprovalMade(string stakeholderName);
    event StepChanged(int8 newStepIndex, string newStepName);
    event WorkflowComplete();

    /// Create a new ballot with $(_numProposals) different proposals.
    function Workflow() {
        admin = msg.sender;
        stepIndex = -1;
    }

    /// Modifiers validate inputs to functions such as minimal balance or user auth;
    /// similar to guard clause in other languages
    /// '_' (underscore) often included as last line in body, and indicates
    /// function being called should be placed there
    modifier onlyAdmin { if (msg.sender != admin) throw; _ ; }

    function addWorkflowStep(string name, uint8 approvalsRequired) onlyAdmin() {
        workflowSteps[finalStepIndex] = WorkflowStep(name, 0, approvalsRequired);
        if (finalStepIndex == 0) {
          stepIndex = 0;
          StepChanged(0, name); // If this is the first workflow step to be added, notify that we are now in step 0
        }
        finalStepIndex += 1;
    }

    /// Add a stakeholder for this workflow step
    /// Only the admin can add stakeholders
    function addStakeholder(address stakeholderAddress, int8 workflowStep) onlyAdmin() {
        if(msg.sender != admin) throw;
        stakeholderCount += 1;
        workflowSteps[workflowStep].stakeholders[stakeholderAddress] = Stakeholder({approved: false, exists: true});
    }

    /// Add a stakeholder for this workflow step
    /// Only the admin can add stakeholders
    function addStakeholders(address[] stakeholderAddresses, int8 workflowStep) onlyAdmin() {
        if(msg.sender != admin) throw;

        for (uint counter = 0; counter < stakeholderAddresses.length; counter += 1) {
          var stakeholderAddress = stakeholderAddresses[counter];
          addStakeholder(stakeholderAddress, workflowStep);
        }
    }

    function setNickname(string name) {
      nicknames[msg.sender] = Nickname({name: name, exists: true});
    }

    /// Give a single vote to proposal $(proposal).
    function approve() {
        var currentWorkflowStep = workflowSteps[stepIndex];
        Stakeholder stakeholder = currentWorkflowStep.stakeholders[msg.sender];
        if (!stakeholder.exists) throw;
        if (stakeholder.approved) return;

        stakeholder.approved = true;
        currentWorkflowStep.approvals += 1;

        ApprovalMade(getNickname(msg.sender)); // fire event

        if (currentWorkflowStep.approvals >= currentWorkflowStep.approvalsRequired) {
            if (stepIndex == finalStepIndex) {
                workflowComplete = true;
                WorkflowComplete();
            } else {
                stepIndex += 1;
                StepChanged(stepIndex, workflowSteps[stepIndex].name);
            }
        }
    }

    function getNickname(address senderAddress) constant returns (string name) {
      var nickname = nicknames[senderAddress];
      if(nickname.exists) {
        return nickname.name;
      } else {
        return "Anonymous";
      }
    }

    function getIsStakeholder(address senderAddress) constant returns (bool isStakeholder) {
      return workflowSteps[stepIndex].stakeholders[senderAddress].exists;
    }

    function getCurrentStep() constant returns (int8 stepIndex, string name, uint8 approvals, uint8 approvalsRequired) {
      return getStepAtIndex(stepIndex);
    }

    function getStepAtIndex(int8 index) constant returns (int8 stepIndex, string name, uint8 approvals, uint8 approvalsRequired) {
      var step = workflowSteps[index];
      return (index, step.name, step.approvals, step.approvalsRequired);
    }
}
