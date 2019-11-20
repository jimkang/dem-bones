var RouteState = require('route-state');
var handleError = require('handle-error-web');
var skeletonFlow = require('./flows/skeleton-flow');
var renderControls = require('./dom/render-controls');

var routeState = RouteState({
  followRoute,
  windowObject: window,
  propsToCoerceToBool: ['hideControls', 'still']
});

(function go() {
  window.onerror = reportTopLevelError;
  routeState.routeFromHash();
})();

function followRoute({
  seed,
  skeleton,
  useExtraParts,
  partExtension,
  numberOfSetsToUse,
  minimumNumberOfBones,
  still,
  hideControls,
  maxBonesPerSet
}) {
  if (!seed) {
    routeState.addToRoute({ seed: new Date().toISOString() });
    return;
  }
  skeletonFlow({
    skeleton,
    useExtraParts,
    partExtension,
    numberOfSetsToUse: +numberOfSetsToUse,
    minimumNumberOfBones: +minimumNumberOfBones,
    seed,
    still,
    maxBonesPerSet
  });
  renderControls({ onRoll, onToggleMove, hideControls, still });

  function onToggleMove() {
    routeState.addToRoute({ still: !still });
  }
}

function onRoll() {
  routeState.addToRoute({ seed: '' });
}

function reportTopLevelError(msg, url, lineNo, columnNo, error) {
  handleError(error);
}
