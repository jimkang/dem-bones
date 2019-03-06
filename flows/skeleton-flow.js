var request = require('basic-browser-request');
var sb = require('standard-bail')();
var handleError = require('handle-error-web');
var renderSkeleton = require('../dom/render-skeleton');
var Probable = require('probable').createProbable;
var seedrandom = require('seedrandom');
var cloneDeep = require('lodash.clonedeep');
var curry = require('lodash.curry');

const boardWidth = 100;
const boardHeight = 100;

const maxTries = 1000;

var bgColors = [
  '#66b04b',
  '#267129',
  '#7cb420',
  'rgb(255, 0, 154)',
  'rgb(255, 0, 111)',
  'rgb(255, 7, 69)',
  'rgb(255, 69, 16)',
  'rgb(255, 101, 0)',
  'rgb(226, 124, 0)',
  'rgb(191, 143, 0)',
  'rgb(152, 157, 0)',
  'rgb(106, 167, 0)',
  'rgb(24, 174, 0)',
  'rgb(0, 179, 10)',
  'rgb(0, 183, 77)',
  'rgb(0, 185, 124)',
  'rgb(0, 187, 170)',
  'rgb(143, 121, 255)',
  'rgb(213, 92, 255)',
  'rgb(255, 52, 240)',
  'rgb(255, 0, 198'
];

// TODO: Allow repeats of bones
function skeletonFlow({
  skeleton = 'skeleton',
  useExtraParts,
  numberOfSetsToUse = 1,
  partExtension = 'svg',
  minimumNumberOfBones = 1,
  useBlockBG = 'sometimes',
  seed
}) {
  var probable = Probable({ random: seedrandom(seed) });
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
    var renderSpecs = [];
    var tries = 0;
    do {
      renderSpecs.length = 0;
      let openConnectors = [[boardWidth / 2, boardHeight / 2]];
      let singleSkeletonSet = probable.shuffle(body.bones).map(scaleBone);
      // The "deep" properties will only be copied by reference, but
      // that should be OK for now.
      let unusedBones = singleSkeletonSet.slice();
      if (useExtraParts) {
        numberOfSetsToUse += 1;
      }

      for (var i = 1; i < numberOfSetsToUse; ++i) {
        unusedBones = unusedBones.concat(
          probable.sample(
            singleSkeletonSet,
            probable.roll(singleSkeletonSet.length)
          )
        );
      }

      // TODO: Put in a generator so it can yield.
      while (unusedBones.length > 0 && openConnectors.length > 0) {
        let bone = unusedBones.pop();
        let connectors = cloneDeep(bone.connectors);
        let connectorIndex = probable.roll(connectors.length);
        // connectorIndex = 0;
        let connector = connectors[connectorIndex];
        // console.log('connectors', cloneDeep(connectors));
        // console.log('Selected connector', connector);

        let fixPointIndex = probable.roll(openConnectors.length);
        // fixPointIndex = 0;
        let fixPoint = openConnectors[fixPointIndex];

        let rotationAngle = probable.roll(360);
        // rotationAngle = 0;
        let blockBGSuffix = '';
        if (
          useBlockBG === 'always' ||
          (useBlockBG === 'sometimes' && probable.roll(2) === 0)
        ) {
          blockBGSuffix = '-block-bg';
        }

        let spec = {
          imageURL: `static/${bone.id}${blockBGSuffix}.${partExtension}`,
          rotationAngle,
          rotationCenterX: fixPoint[0],
          rotationCenterY: fixPoint[1],
          translateX: fixPoint[0] - connector[0],
          translateY: fixPoint[1] - connector[1],
          width: bone.imageWidth,
          height: bone.imageHeight
        };
        renderSpecs.push(spec);

        if (renderSpecs.length > 1) {
          // If we've just connected a bone to the center starting point,
          // then we can use this connect again.
          connectors.splice(connectorIndex, 1);
        }
        openConnectors.splice(fixPointIndex, 1);
        let newOpenConnectors = connectors.map(
          curry(positionConnectorInContext)(rotationAngle, fixPoint, connector)
        );
        // console.log('newOpenConnectors from', bone.id, ':', newOpenConnectors);
        openConnectors = openConnectors.concat(newOpenConnectors);
        // console.log('openConnectors', openConnectors);
      }
      tries += 1;
      console.log('tries:', tries, 'bone count:', renderSpecs.length);
    } while (tries < maxTries && renderSpecs.length < minimumNumberOfBones);

    var bodyColor = 'white';
    if (probable.roll(4) > 0) {
      if (probable.roll(4) > 0) {
        bodyColor = probable.pickFromArray(bgColors);
      } else {
        bodyColor = '#222';
      }
    }
    renderSkeleton({ specs: renderSpecs, bodyColor });

    function scaleBone(bone) {
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
  var originalAngle;
  if (x !== 0) {
    originalAngle = Math.atan2(y, x);
  } else if (y > 0) {
    originalAngle = Math.PI / 2;
  } else {
    originalAngle = 1.5 * Math.PI;
  }
  var rotatedAngle = originalAngle + rotation;

  var newConnectorEnd = [
    boardAnchor[0] + Math.cos(rotatedAngle) * hypotenuse,
    boardAnchor[1] + Math.sin(rotatedAngle) * hypotenuse
  ];
  //console.log('newConnectorEnd', newConnectorEnd);
  return newConnectorEnd;
}

module.exports = skeletonFlow;
