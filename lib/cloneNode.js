const __importDefault =
  (this && this.__importDefault) ||
  function(mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
const utils_1 = require('./utils');
const clonePseudoElements_1 = __importDefault(require('./clonePseudoElements'));

function cloneSingleNode(nativeNode) {
  if (nativeNode instanceof HTMLCanvasElement) {
    return utils_1.createImage(nativeNode.toDataURL());
  }
  if (nativeNode.tagName && nativeNode.tagName.toLowerCase() === 'svg') {
    return Promise.resolve(nativeNode)
      .then(svg => utils_1.svgToDataURL(svg))
      .then(utils_1.createImage);
  }
  return Promise.resolve(nativeNode.cloneNode(false));
}
function cloneChildren(nativeNode, clonedNode, filter) {
  const children = utils_1.toArray(nativeNode.childNodes);
  if (children.length === 0) {
    return Promise.resolve(clonedNode);
  }
  // clone children in order
  return children
    .reduce(
      (done, child) =>
        done.then(() => cloneNode(child, filter)).then(clonedChild => {
          if (clonedChild) {
            clonedNode.appendChild(clonedChild);
          }
        }),
      Promise.resolve(),
    )
    .then(() => clonedNode);
}
function cloneCssStyle(nativeNode, clonedNode) {
  const source = window.getComputedStyle(nativeNode);
  const target = clonedNode.style;
  if (source.cssText) {
    target.cssText = source.cssText;
  } else {
    utils_1.toArray(source).forEach(name => {
      target.setProperty(
        name,
        source.getPropertyValue(name),
        source.getPropertyPriority(name),
      );
    });
  }
}
function cloneInputValue(nativeNode, clonedNode) {
  if (nativeNode instanceof HTMLTextAreaElement) {
    clonedNode.innerHTML = nativeNode.value;
  }
  if (nativeNode instanceof HTMLInputElement) {
    clonedNode.setAttribute('value', nativeNode.value);
  }
}
function decorate(nativeNode, clonedNode) {
  if (!(clonedNode instanceof Element)) {
    return clonedNode;
  }
  return Promise.resolve()
    .then(() => cloneCssStyle(nativeNode, clonedNode))
    .then(() => clonePseudoElements_1.default(nativeNode, clonedNode))
    .then(() => cloneInputValue(nativeNode, clonedNode))
    .then(() => clonedNode);
}
function cloneNode(domNode, filter, isRoot) {
  if (!isRoot && filter && !filter(domNode)) {
    return Promise.resolve(null);
  }
  return Promise.resolve(domNode)
    .then(cloneSingleNode)
    .then(clonedNode => cloneChildren(domNode, clonedNode, filter))
    .then(clonedNode => decorate(domNode, clonedNode));
}
exports.default = cloneNode;
