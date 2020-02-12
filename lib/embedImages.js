const __importDefault =
  (this && this.__importDefault) ||
  function(mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
const utils_1 = require('./utils');
const getBlobFromURL_1 = __importDefault(require('./getBlobFromURL'));
const embedResources_1 = __importDefault(require('./embedResources'));

function embedBackground(clonedNode, options) {
  const background = clonedNode.style.getPropertyValue('background');
  if (!background) {
    return Promise.resolve(clonedNode);
  }
  return Promise.resolve(background)
    .then(cssString => embedResources_1.default(cssString, null, options))
    .then(cssString => {
      clonedNode.style.setProperty(
        'background',
        cssString,
        clonedNode.style.getPropertyPriority('background'),
      );
      return clonedNode;
    });
}
function embedImageNode(clonedNode, options) {
  if (
    !(clonedNode instanceof HTMLImageElement) ||
    utils_1.isDataUrl(clonedNode.src)
  ) {
    return Promise.resolve(clonedNode);
  }
  return Promise.resolve(clonedNode.src)
    .then(url => getBlobFromURL_1.default(url, options))
    .then(data => utils_1.toDataURL(data, utils_1.getMimeType(clonedNode.src)))
    .then(
      dataURL =>
        new Promise((resolve, reject) => {
          clonedNode.onload = resolve;
          clonedNode.onerror = reject;
          clonedNode.src = dataURL;
        }),
    )
    .then(() => clonedNode, () => clonedNode);
}
function embedChildren(clonedNode, options) {
  const children = utils_1.toArray(clonedNode.childNodes);
  const deferreds = children.map(child => embedImages(child, options));
  return Promise.all(deferreds).then(() => clonedNode);
}
function embedImages(clonedNode, options) {
  if (!(clonedNode instanceof Element)) {
    return Promise.resolve(clonedNode);
  }
  return Promise.resolve(clonedNode)
    .then(node => embedBackground(node, options))
    .then(node => embedImageNode(node, options))
    .then(node => embedChildren(node, options));
}
exports.default = embedImages;
