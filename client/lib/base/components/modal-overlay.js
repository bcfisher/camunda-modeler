'use strict';

var inherits = require('inherits');

var BaseComponent = require('base/component');

var isMac = require('util/is-mac'),
    ensureOpts = require('util/ensure-opts');


function hasClass(node, cls) {
  if (!node.classList) {
    return;
  }

  return node.classList.contains(cls);
}

function ModalOverlay(options) {
  ensureOpts([ 'events', 'isActive', 'content', 'bpmnDeployUrl', 'persistBpmnDeployUrl' ], options);

  BaseComponent.call(this, options);

  var events = options.events;

  if (!(this instanceof ModalOverlay)) {
    return new ModalOverlay(options);
  }

  var bpmnDeployUrl = options.bpmnDeployUrl;

  this.getContent = function(content) {
    this._content = availableContent[content];

    if (!this._content) {
      return;
    }

    return this._content;
  };

  this.closeOverlay = function(event) {
    var target = event.target;

    if (!this._content || !hasClass(target, 'dialog-overlay') && !hasClass(target, 'hide-dialog')) {
      return;
    }

    this._content = null;

    events.emit('dialog-overlay:toggle', false);
  };

  this.updateBpmnDeployUrl = function(e) {
    bpmnDeployUrl = e.target.value;
  };

  this.submitDeployConfigForm = function(e) {
    e.preventDefault();
    options.persistBpmnDeployUrl(bpmnDeployUrl);
  };

  var modifierKey = 'Control';

  if (isMac()) {
    modifierKey = 'Command';
  }

  var DEPLOY_CONFIG_OVERLAY = (
    <div className="deploy-configuration">
      <h2>BPMN Deployment Configuration</h2>
      <form className="deploy-configuration-form" onSubmit={this.compose(this.submitDeployConfigForm)}>
        <div className="formRow" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label
            htmlFor="deploy-url"
            style={ { marginRight: '10px', flex: 'none', fontWeight: 'bolder', fontSize: '12px' }}>
            API URL
          </label>
          <input
            id='deploy-url'
            type='text'
            value={bpmnDeployUrl}
            onChange={this.compose(this.updateBpmnDeployUrl)}
            style={ {  padding: '4px', flex: '1 1 auto', fontSize: '12px' }}/>
          <button type="submit" style={{ marginLeft: '10px'  }}>
            Save
          </button>
          <button
            type="button"
            className='hide-dialog'
            style={{ marginLeft: '5px' }} onClick={ this.compose(this.closeOverlay) }>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );

  var SHORTCUTS_OVERLAY = (
    <div className="keyboard-shortcuts">
      <h2>Keyboard Shortcuts</h2>
      <p>
        The following special shortcuts can be used on opened diagrams.
      </p>
      <table>
        <tbody>
        <tr>
          <td>Add Line Feed (in text box)</td>
          <td className="binding"><code>Shift + Enter</code></td>
        </tr>
        <tr>
          <td>Scrolling (Vertical)</td>
          <td className="binding">{ modifierKey } + Mouse Wheel</td>
        </tr>
        <tr>
          <td>Scrolling (Horizontal)</td>
          <td className="binding">{ modifierKey } + Shift + Mouse Wheel</td>
        </tr>
        <tr>
          <td>Add element to selection</td>
          <td className="binding">{ modifierKey } + Mouse Click</td>
        </tr>
        <tr>
          <td>Select multiple elements (Lasso Tool)</td>
          <td className="binding">{ modifierKey } + Mouse Drag</td>
        </tr>
        </tbody>
      </table>
      <p>
        Find additional shortcuts on individual items in the application menu.
      </p>
    </div>
  );

  var availableContent = {
    shortcuts: SHORTCUTS_OVERLAY,
    engineConfig: DEPLOY_CONFIG_OVERLAY
  };

  this.render = function() {

    var classes = 'dialog-overlay',
        content = this.getContent(options.content);

    if (options.isActive) {
      classes += ' active';
    }

    if (content) {
      classes += ' content';
    }

    var html = (
      <div className={ classes } onClick={ this.compose(this.closeOverlay) }>
        <div className="overlay-container">
          { content }
        </div>
      </div>
    );

    return html;
  };
}

inherits(ModalOverlay, BaseComponent);

module.exports = ModalOverlay;
