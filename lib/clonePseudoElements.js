Object.defineProperty(exports, '__esModule', { value: true });
const utils_1 = require('./utils');

function formatCssText(style) {
  const content = style.getPropertyValue('content');
  return `${style.cssText} content: ${content};`;
}
function formatCssProperties(style) {
  return utils_1
    .toArray(style)
    .map(name => {
      const value = style.getPropertyValue(name);
      const priority = style.getPropertyPriority(name);
      return `${name}: ${value}${priority ? ' !important' : ''};`;
    })
    .join(' ');
}
function getPseudoElementStyle(className, pseudo, style) {
  const selector = `.${className}:${pseudo}`;
  const cssText = style.cssText
    ? formatCssText(style)
    : formatCssProperties(style);
  return document.createTextNode(`${selector}{${cssText}}`);
}
function clonePseudoElement(nativeNode, clonedNode, pseudo) {
  const style = window.getComputedStyle(nativeNode, pseudo);
  const content = style.getPropertyValue('content');
  if (content === '' || content === 'none') {
    return;
  }
  const className = utils_1.uuid();
  const styleElement = document.createElement('style');
  styleElement.appendChild(getPseudoElementStyle(className, pseudo, style));
  clonedNode.className = `${clonedNode.className} ${className}`;
  clonedNode.appendChild(styleElement);
}
function clonePseudoElements(nativeNode, clonedNode) {
  [':before', ':after'].forEach(pseudo =>
    clonePseudoElement(nativeNode, clonedNode, pseudo),
  );
}
exports.default = clonePseudoElements;
