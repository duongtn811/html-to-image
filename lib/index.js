const __importDefault =
  (this && this.__importDefault) ||
  function(mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
const cloneNode_1 = __importDefault(require('./cloneNode'));
const embedWebFonts_1 = __importDefault(require('./embedWebFonts'));
const embedImages_1 = __importDefault(require('./embedImages'));
const createSvgDataURL_1 = __importDefault(require('./createSvgDataURL'));
const applyStyleWithOptions_1 = __importDefault(
  require('./applyStyleWithOptions'),
);
const utils_1 = require('./utils');

function getImageSize(domNode, options) {
  if (options === void 0) {
    options = {};
  }
  const width = options.width || utils_1.getNodeWidth(domNode);
  const height = options.height || utils_1.getNodeHeight(domNode);
  return { width, height };
}
function toSvgDataURL(domNode, options) {
  if (options === void 0) {
    options = {};
  }
  let _a = getImageSize(domNode, options),
    width = _a.width,
    height = _a.height;
  return cloneNode_1
    .default(domNode, options.filter, true)
    .then(clonedNode => embedWebFonts_1.default(clonedNode, options))
    .then(clonedNode => embedImages_1.default(clonedNode, options))
    .then(clonedNode => applyStyleWithOptions_1.default(clonedNode, options))
    .then(clonedNode => createSvgDataURL_1.default(clonedNode, width, height));
}
exports.toSvgDataURL = toSvgDataURL;
function toCanvas(domNode, options) {
  if (options === void 0) {
    options = {};
  }
  return toSvgDataURL(domNode, options)
    .then(utils_1.createImage)
    .then(utils_1.delay(100))
    .then(image => {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      const ratio = utils_1.getPixelRatio();
      let _a = getImageSize(domNode, options),
        width = _a.width,
        height = _a.height;
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      canvas.style.width = `${width}`;
      canvas.style.height = `${height}`;
      context.scale(ratio, ratio);
      if (options.backgroundColor) {
        context.fillStyle = options.backgroundColor;
        context.fillRect(0, 0, canvas.width, canvas.height);
      }
      context.drawImage(image, 0, 0);
      return canvas;
    });
}
exports.toCanvas = toCanvas;
function toPixelData(domNode, options) {
  if (options === void 0) {
    options = {};
  }
  let _a = getImageSize(domNode, options),
    width = _a.width,
    height = _a.height;
  return toCanvas(domNode, options).then(
    canvas => canvas.getContext('2d').getImageData(0, 0, width, height).data,
  );
}
exports.toPixelData = toPixelData;
function toPng(domNode, options) {
  if (options === void 0) {
    options = {};
  }
  return toCanvas(domNode, options).then(canvas => canvas.toDataURL());
}
exports.toPng = toPng;
function toJpeg(domNode, options) {
  if (options === void 0) {
    options = {};
  }
  return toCanvas(domNode, options).then(canvas =>
    canvas.toDataURL('image/jpeg', options.quality || 1),
  );
}
exports.toJpeg = toJpeg;
function toBlob(domNode, options) {
  if (options === void 0) {
    options = {};
  }
  return toCanvas(domNode, options).then(utils_1.canvasToBlob);
}
exports.toBlob = toBlob;
exports.default = {
  toSvgDataURL,
  toCanvas,
  toPixelData,
  toPng,
  toJpeg,
  toBlob,
};
