var d3 = require('d3-selection');
var rollButton = d3.select('#roll-dem-bones-button');

function renderControls({ onRoll, hideControls }) {
  rollButton.classed('hidden', hideControls === 'yes');
  rollButton.on('click.roll', null);
  rollButton.on('click.roll', onRoll);
}

module.exports = renderControls;
