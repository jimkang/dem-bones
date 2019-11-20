var request = require('basic-browser-request');
var sb = require('standard-bail')();
var handleError = require('handle-error-web');
var renderSkeleton = require('../dom/render-skeleton');
var Probable = require('probable').createProbable;
var seedrandom = require('seedrandom');
var cloneDeep = require('lodash.clonedeep');
var curry = require('lodash.curry');
var { range } = require('d3-array');

import { Pt, BoneSrc, BoneNode } from '../types';

const boardWidth = 100;
const boardHeight = 100;

const maxTries = 1000;

// TODO: Allow repeats of bones
function skeletonFlow({
  skeleton,
  useExtraParts,
  numberOfSetsToUse = 1,
  partExtension = 'svg',
  minimumNumberOfBones = 1,
  seed,
  still
}) {
  var probable = Probable({ random: seedrandom(seed) });
  var skeletonTable = probable.createTableFromSizes([
    [1, 'skeleton'],
    [18, 'drawn-skeleton'],
    [1, 'block-skeleton']
  ]);
  if (!skeleton) {
    skeleton = skeletonTable.roll();
  }

  request(
    { url: `data/${skeleton}.json`, method: 'GET', json: true },
    sb(arrangeSkeleton, handleError)
  );

  function arrangeSkeleton(res, body) {
    var scaleX = boardWidth / body.canvasWidth;
    var scaleY = boardHeight / body.canvasHeight;
    var scale = scaleX;
    if (scaleY < scale) {
      scale = scaleY;
    }

    var tries = 0;
    var center = [boardWidth / 2, boardHeight / 2];
    let boneCount;
    let rootBone: BoneNode;

    do {
      let singleSkeletonSet: Array<BoneSrc> = probable
        .shuffle(body.bones)
        .map(scaleBoneSrc);
      // The "deep" properties will only be copied by reference, but
      // that should be OK for now.
      let unusedBoneSrcs: Array<BoneSrc> = singleSkeletonSet.slice();
      if (useExtraParts) {
        numberOfSetsToUse += 1;
      }

      for (var i = 1; i < numberOfSetsToUse; ++i) {
        unusedBoneSrcs = unusedBoneSrcs.concat(
          probable.sample(
            singleSkeletonSet,
            probable.roll(singleSkeletonSet.length)
          )
        );
      }

      rootBone = connectNewBoneToParent(unusedBoneSrcs.pop());
      let nodesWithOpenConnectors: Array<BoneNode> = [rootBone];

      // TODO: Put in a generator so it can yield.
      while (unusedBoneSrcs.length > 0 && nodesWithOpenConnectors.length > 0) {
        let parentConnectorIndex = probable.roll(
          nodesWithOpenConnectors.length
        );
        let parentNode: BoneNode =
          nodesWithOpenConnectors[parentConnectorIndex];
        let node: BoneNode = connectNewBoneToParent(
          unusedBoneSrcs.pop(),
          parentNode
        );

        if (parentNode.openConnectors.length < 1) {
          removeItem(nodesWithOpenConnectors, parentConnectorIndex);
        }
        if (node.openConnectors.length > 0) {
          nodesWithOpenConnectors.push(node);
        }

        //if (renderSpecs.length > 1) {
        //  // If we've just connected a bone to the center starting point,
        //  // then we can use this connect again.
        //  connectors.splice(connectorIndex, 1);
        //}
      }
      tries += 1;
      boneCount = countTreeNodes(0, rootBone);
      console.log('tries:', tries, 'bone count:', boneCount);
    } while (tries < maxTries && boneCount < minimumNumberOfBones);

    var bodyColor = probable.pickFromArray(body.bgColors);
    renderSkeleton({ rootBone, bodyColor, animate: !still });

    function scaleBoneSrc(bone) {
      return {
        id: bone.id,
        connectors: bone.connectors.map(scalePoint),
        imageWidth: bone.imageWidth * scale,
        imageHeight: bone.imageHeight * scale
      };
    }

    function scalePoint(point) {
      return [point[0] * scale, point[1] * scale];
    }

    function connectNewBoneToParent(src: BoneSrc, parent?: BoneNode) {
      let connectors = cloneDeep(src.connectors);
      let fixPoint = center;
      let connector;

      if (parent) {
        let connectorIndex = probable.roll(connectors.length);
        connector = connectors[connectorIndex];

        let fixPointIndex = probable.roll(parent.openConnectors.length);
        fixPoint = parent.openConnectors[fixPointIndex];

        removeItem(parent.openConnectors, fixPointIndex);
        removeItem(connectors, connectorIndex);
      }

      const rotationAngle = probable.roll(360);
      const rotationCenterX = fixPoint[0];
      const rotationCenterY = fixPoint[1];

      var newNode: BoneNode = {
        src,
        imageURL: `${body.baseLocation}${src.id}.${partExtension}`,
        rotationAngle,
        msPerFrame: probable.rollDie(20) * 50000,
        rotationPerFrame: -50 + probable.roll(51),
        rotateCount:
          probable.roll(2) === 0 ? 'indefinite' : probable.rollDie(20),
        rotationCenterX,
        rotationCenterY,
        translateX: connector ? fixPoint[0] - connector[0] : center[0],
        translateY: connector ? fixPoint[1] - connector[1] : center[1],
        openConnectors: connectors,
        children: []
      };

      if (parent) {
        parent.children.push(newNode);
      }
      return newNode;
    }
  }
}

function positionConnectorInContext(
  rotationInDegrees,
  boardAnchor,
  connectorAnchor,
  connectorEnd
) {
  var rotation = (rotationInDegrees * Math.PI) / 180;
  var x = connectorEnd[0] - connectorAnchor[0];
  var y = connectorEnd[1] - connectorAnchor[1];
  var hypotenuse = Math.sqrt(x * x + y * y);
  var rotatedAngle = rotation;

  var newConnectorEnd = [
    boardAnchor[0] + Math.cos(rotatedAngle) * hypotenuse,
    boardAnchor[1] + Math.sin(rotatedAngle) * hypotenuse
  ];
  //console.log('newConnectorEnd', newConnectorEnd);
  return newConnectorEnd;
}

function addOpenConnectors(bone: BoneSrc) {
  return bone;
}

function removeItem(array, index) {
  return array.splice(index, 1);
}

function countTreeNodes(sum, node) {
  if (node.children.length > 0) {
    return sum + node.children.reduce(countTreeNodes, sum + 1);
  } else {
    return sum + 1;
  }
}

function mod360(n) {
  return n % 360;
}

function rotationToTransform(x, y, angle) {
  return `rotate(${angle}, ${x}, ${y})
    translate(${x}, ${y})`;
}

module.exports = skeletonFlow;
