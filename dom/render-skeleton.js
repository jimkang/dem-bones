var d3 = require('d3-selection');
require('d3-transition');
var bonesRoot = d3.select('.dem-bones');
var board = d3.select('.board');
var accessor = require('accessor')();

// This module assumes: viewBox="0 0 100 100"
// levelSpecs is an array in which each member is a levelSpec.
// A levelSpec is an array containing peak coords (each of which are 2-element arrays).
function renderSkeleton({ rootBone, bodyColor }) {
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

  appendChildrenRecursively({ boneGroup: bonesRoot, node: rootBone });

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
}

module.exports = renderSkeleton;
