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
  skeletonFlow({
    skeleton: routeDict.skeleton,
    useExtraParts: routeDict.useExtraParts,
    partExtension: routeDict.partExtension
  });
  renderControls({ onRoll, hideControls: routeDict.hideControls });
}

function onRoll() {
  routeState.overwriteRouteEntirely({});
}

function reportTopLevelError(msg, url, lineNo, columnNo, error) {
  handleError(error);
}
