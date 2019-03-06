var RouteState = require('route-state');
var handleError = require('handle-error-web');
var skeletonFlow = require('./flows/skeleton-flow');
var renderControls = require('./dom/render-controls');

var routeState = RouteState({
  followRoute,
  windowObject: window
});

(function go() {
  window.onerror = reportTopLevelError;
  routeState.routeFromHash();
})();

function followRoute(routeDict) {
  if (!routeDict.seed) {
    routeState.addToRoute({ seed: new Date().toISOString() });
    return;
  }
  skeletonFlow({
    skeleton: routeDict.skeleton,
    useExtraParts: routeDict.useExtraParts,
    partExtension: routeDict.partExtension,
    numberOfSetsToUse: +routeDict.numberOfSetsToUse,
    minimumNumberOfBones: +routeDict.minimumNumberOfBones,
    useBlockBG: routeDict.useBlockBG,
    seed: routeDict.seed
  });
  renderControls({ onRoll, hideControls: routeDict.hideControls });
}

function onRoll() {
  routeState.addToRoute({ seed: '' });
}

function reportTopLevelError(msg, url, lineNo, columnNo, error) {
  handleError(error);
}
