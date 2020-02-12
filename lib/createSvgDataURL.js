Object.defineProperty(exports, '__esModule', { value: true });
const utils_1 = require('./utils');

function createSvgDataURL(clonedNode, width, height) {
  const xmlns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(xmlns, 'svg');
  const foreignObject = document.createElementNS(xmlns, 'foreignObject');
  svg.setAttributeNS('', 'width', `${width}`);
  svg.setAttributeNS('', 'height', `${height}`);
  foreignObject.setAttributeNS('', 'width', '100%');
  foreignObject.setAttributeNS('', 'height', '100%');
  foreignObject.setAttributeNS('', 'x', '0');
  foreignObject.setAttributeNS('', 'y', '0');
  foreignObject.setAttributeNS('', 'externalResourcesRequired', 'true');
  svg.appendChild(foreignObject);
  foreignObject.appendChild(clonedNode);
  return utils_1.svgToDataURL(svg);
}
exports.default = createSvgDataURL;
