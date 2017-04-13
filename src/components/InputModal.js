import React, { Component } from 'react'
import 'components/InputModal.css'

class InputModal extends Component {
  render() {
    let { isHidden, message, onConfirm, onCancel } = this.props

    return (
      <div className="confirm-modal">
        { !isHidden &&
          <div>
            <div className="modal-backdrop"></div>
            <div className="confirm-modal-content">
              <span className="confirm-modal-message">{message}</span>
              <input className="confirm-modal-input" type="text" ref={(_ref) => this.confirmInput = _ref}/>
              <button className="btn" onClick={() => this.getTextAndConfirm()}>OK</button>
              <button className="btn" onClick={() => onCancel()}>Cancel</button>
            </div>
          </div>
        }
      </div>
    )
  }

  getTextAndConfirm() {
    let text = this.confirmInput.value
    this.props.onConfirm(text)
  }
}

export default InputModal
