var RouteState = require('route-state');
var handleError = require('handle-error-web');
var skeletonFlow = require('./flows/skeleton-flow');
var renderControls = require('./dom/render-controls');
var probable = require('probable');

const minAdjacentColorIndexDist = 2;
const maxColorPickTries = 5;
const minNumberOfColorsBeforeRepeating = 5;

var hillColors = [
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

var routeState = RouteState({
  followRoute,
  windowObject: window
});

(function go() {
  window.onerror = reportTopLevelError;
  routeState.routeFromHash();
})();

function followRoute(routeDict) {
  skeletonFlow({
    skeleton: routeDict.skeleton,
    useExtraParts: routeDict.useExtraParts
  });
  renderControls({ onRoll });
}

function onRoll() {
  routeState.overwriteRouteEntirely({});
}

// Will modify chosenColorIndexes after it has chose a color.
// Assumes that adjacent indexes in hillColors are very similar.
function pickColor(previousIndexes) {
  var lastColorIndex;
  if (previousIndexes.length > 0) {
    lastColorIndex = previousIndexes[previousIndexes.length - 1];
  }
  var colorIndex;
  for (let j = 0; ; ++j) {
    colorIndex = probable.roll(hillColors.length);

    if (j > maxColorPickTries) {
      // Just pick anything even if it might be too close to an existing color.
      console.log('Giving up after picking a new color after', j, 'tries.');
      break;
    }
    if (isNaN(lastColorIndex)) {
      break;
    } else if (
      Math.abs(colorIndex - lastColorIndex) >= minAdjacentColorIndexDist &&
      previousIndexes
        .slice(-1 * minNumberOfColorsBeforeRepeating)
        .indexOf(colorIndex) === -1
    ) {
      // This one is far enough away and has not been chosen before.
      break;
    }
  }
  return colorIndex;
}

function reportTopLevelError(msg, url, lineNo, columnNo, error) {
  handleError(error);
}
