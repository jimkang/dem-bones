var d3 = require('d3-selection');
require('d3-transition');
var bonesRoot = d3.select('.dem-bones');
var board = d3.select('.board');
var accessor = require('accessor');
var Timer = require('d3-timer').timer;
var curry = require('lodash.curry');

var timer;

// This module assumes: viewBox="0 0 100 100"
// levelSpecs is an array in which each member is a levelSpec.
// A levelSpec is an array containing peak coords (each of which are 2-element arrays).
function renderSkeleton({ rootBone, bodyColor, animate }) {
  if (timer) {
    timer.stop();
  }

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

  var { boneGroup, node } = appendBone({
    boneGroup: bonesRoot,
    node: rootBone
  });
  appendChildrenRecursively({ boneGroup, node });

  if (animate) {
    timer = Timer(updateTransforms);
  }

  function appendChildrenRecursively({ boneGroup, node }) {
    var nextGroupNodePairs = node.children.map(callAppendBone);
    nextGroupNodePairs.forEach(appendChildrenRecursively);

    function callAppendBone(childNode) {
      return appendBone({ boneGroup, node: childNode });
    }
  }

  function appendBone({ boneGroup, node }) {
    var newBoneGroup;
    if (boneGroup) {
      newBoneGroup = boneGroup.append('g');
    } else {
      newBoneGroup = bonesRoot.append('g');
    }
    newBoneGroup.datum(node);
    newBoneGroup
      .classed('bone', true)
      .attr('transform', getTransform)
      .append('image')
      .attr('xlink:href', accessor('imageURL'))
      .attr('width', accessor({ path: 'src/imageWidth' }))
      .attr('height', accessor({ path: 'src/imageHeight' }));

    return { boneGroup: newBoneGroup, node };
  }

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

  function updateTransforms(elapsed) {
    var bones = d3.selectAll('.bone');
    bones.each(curry(updateRotation)(elapsed));
    bones.attr('transform', getTransform);
  }

  function updateRotation(elapsed, boneNode) {
    const framesElapsed = elapsed / boneNode.msPerFrame;
    const rotationDelta = framesElapsed * boneNode.rotationPerFrame;
    console.log('rotationDelta', rotationDelta);
    boneNode.rotationAngle = (boneNode.rotationAngle + rotationDelta) % 360;
  }

  /*
  Stop-motion style
  function getTransformForTicks(ticks, boneNode) {
    var elapsed = ticks - boneNode.lastUpdateTick;
    if (elapsed > boneNode.msPerFrame) {
      boneNode.frameIndex += 1;
      if (boneNode.frameIndex >= boneNode.transformValues.length) {
        boneNode.frameIndex = 0;
      }
      boneNode.lastUpdateTick = ticks;
    }
    return boneNode.transformValues[boneNode.frameIndex];
  }
  */
}

module.exports = renderSkeleton;
