Object.defineProperty(exports, '__esModule', { value: true });
const WOFF = 'application/font-woff';
const JPEG = 'image/jpeg';
const mimes = {
  woff: WOFF,
  woff2: WOFF,
  ttf: 'application/font-truetype',
  eot: 'application/vnd.ms-fontobject',
  png: 'image/png',
  jpg: JPEG,
  jpeg: JPEG,
  gif: 'image/gif',
  tiff: 'image/tiff',
  svg: 'image/svg+xml',
};
exports.uuid = (function uuid() {
  // generate uuid for className of pseudo elements.
  // We should not use GUIDs, otherwise pseudo elements sometimes cannot be captured.
  let counter = 0;
  // ref: http://stackoverflow.com/a/6248722/2519373
  const randomFourChars = function() {
    return `0000${((Math.random() * Math.pow(36, 4)) << 0).toString(36)}`.slice(
      -4,
    );
  };
  return function() {
    counter += 1;
    return `u${randomFourChars()}${counter}`;
  };
})();
function parseExtension(url) {
  const match = /\.([^./]*?)$/g.exec(url);
  if (match) return match[1];
  return '';
}
exports.parseExtension = parseExtension;
function getMimeType(url) {
  const ext = parseExtension(url).toLowerCase();
  return mimes[ext] || '';
}
exports.getMimeType = getMimeType;
function delay(ms) {
  return function(args) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(args);
      }, ms);
    });
  };
}
exports.delay = delay;
function createImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = function() {
      resolve(image);
    };
    image.onerror = reject;
    image.crossOrigin = 'anonymous';
    image.src = url;
  });
}
exports.createImage = createImage;
function isDataUrl(url) {
  return url.search(/^(data:)/) !== -1;
}
exports.isDataUrl = isDataUrl;
function toDataURL(content, mimeType) {
  return `data:${mimeType};base64,${content}`;
}
exports.toDataURL = toDataURL;
function getDataURLContent(dataURL) {
  return dataURL.split(/,/)[1];
}
exports.getDataURLContent = getDataURLContent;
function toBlob(canvas) {
  return new Promise(resolve => {
    const binaryString = window.atob(canvas.toDataURL().split(',')[1]);
    const len = binaryString.length;
    const binaryArray = new Uint8Array(len);
    for (let i = 0; i < len; i += 1) {
      binaryArray[i] = binaryString.charCodeAt(i);
    }
    resolve(
      new Blob([binaryArray], {
        type: 'image/png',
      }),
    );
  });
}
function canvasToBlob(canvas) {
  if (canvas.toBlob) {
    return new Promise(resolve => {
      canvas.toBlob(resolve);
    });
  }
  return toBlob(canvas);
}
exports.canvasToBlob = canvasToBlob;
function toArray(arrayLike) {
  const arr = [];
  for (let i = 0, l = arrayLike.length; i < l; i += 1) {
    arr.push(arrayLike[i]);
  }
  return arr;
}
exports.toArray = toArray;
function px(node, styleProperty) {
  const value = window.getComputedStyle(node).getPropertyValue(styleProperty);
  return parseFloat(value.replace('px', ''));
}
function getNodeWidth(node) {
  const leftBorder = px(node, 'border-left-width');
  const rightBorder = px(node, 'border-right-width');
  return node.scrollWidth + leftBorder + rightBorder;
}
exports.getNodeWidth = getNodeWidth;
function getNodeHeight(node) {
  const topBorder = px(node, 'border-top-width');
  const bottomBorder = px(node, 'border-bottom-width');
  return node.scrollHeight + topBorder + bottomBorder;
}
exports.getNodeHeight = getNodeHeight;
function getPixelRatio() {
  return window.devicePixelRatio || 1;
}
exports.getPixelRatio = getPixelRatio;
function svgToDataURL(svg) {
  return Promise.resolve()
    .then(() => new XMLSerializer().serializeToString(svg))
    .then(encodeURIComponent)
    .then(html => `data:image/svg+xml;charset=utf-8,${html}`);
}
exports.svgToDataURL = svgToDataURL;
function getBlobFromImageURL(url) {
  return createImage(url).then(image => {
    let width = image.width,
      height = image.height;
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const ratio = getPixelRatio();
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    canvas.style.width = `${width}`;
    canvas.style.height = `${height}`;
    context.scale(ratio, ratio);
    context.drawImage(image, 0, 0);
    const dataURL = canvas.toDataURL(getMimeType(url));
    return getDataURLContent(dataURL);
  });
}
exports.getBlobFromImageURL = getBlobFromImageURL;
