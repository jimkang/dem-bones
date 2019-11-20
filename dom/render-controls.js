var d3 = require('d3-selection');
var rollButton = d3.select('#roll-dem-bones-button');
var toggleMoveButton = d3.select('#toggle-move-button');

function renderControls({ onRoll, onToggleMove, hideControls, still }) {
  rollButton.classed('hidden', hideControls);
  toggleMoveButton.classed('hidden', hideControls);

  rollButton.on('click.roll', null);
  rollButton.on('click.roll', onRoll);

  toggleMoveButton.text(still ? 'Start moving' : 'Stop moving');
  toggleMoveButton.on('click.toggleMove', null);
  toggleMoveButton.on('click.toggleMove', onToggleMove);
}

module.exports = renderControls;
