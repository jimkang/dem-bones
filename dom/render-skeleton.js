var d3 = require('d3-selection');
require('d3-transition');
var bonesRoot = d3.select('.dem-bones');
var board = d3.select('.board');
var accessor = require('accessor')();

// This module assumes: viewBox="0 0 100 100"
// levelSpecs is an array in which each member is a levelSpec.
// A levelSpec is an array containing peak coords (each of which are 2-element arrays).
function renderSkeleton({ specs, bodyColor }) {
  document.body.style.backgroundColor = bodyColor;

  var width = +window.innerWidth;
  var height = +window.innerHeight;

  if (height < width) {
    // Keep things at least as tall as they are wide.
    height = width;
  }

  board.attr('width', width);
  board.attr('height', height);

  bonesRoot.selectAll('*').remove();

  var bones = bonesRoot.selectAll('.bone').data(specs, accessor('imageURL'));
  var newBones = bones
    .enter()
    .append('g')
    .classed('bone', true)
    .attr('transform', getTransform);

  newBones
    .append('image')
    .attr('xlink:href', accessor('imageURL'))
    .attr('width', accessor('width'))
    .attr('height', accessor('height'));

  function getTransform({
    rotationAngle,
    rotationCenterX,
    rotationCenterY,
    translateX,
    translateY
  }) {
    return `rotate(${rotationAngle}, ${rotationCenterX}, ${rotationCenterY})
      translate(${translateX}, ${translateY})`;
  }

  // function scaleToViewBox(coordsScaledTo100) {
  // return [
  // coordsScaledTo100[0] / 100 * width,
  // coordsScaledTo100[1] / 100 * height
  // ];
  // }
}

module.exports = renderSkeleton;
