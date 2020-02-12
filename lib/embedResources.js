const __importDefault =
  (this && this.__importDefault) ||
  function(mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
const getBlobFromURL_1 = __importDefault(require('./getBlobFromURL'));
const utils_1 = require('./utils');

const URL_REGEX = /url\((['"]?)([^'"]+?)\1\)/g;
function resolveUrl(url, baseUrl) {
  // url is absolute already
  if (url.match(/^[a-z]+:\/\//i)) {
    return url;
  }
  // url is absolute already, without protocol
  if (url.match(/^\/\//)) {
    return window.location.protocol + url;
  }
  // dataURI, mailto:, tel:, etc.
  if (url.match(/^[a-z]+:/i)) {
    return url;
  }
  const doc = document.implementation.createHTMLDocument();
  const base = doc.createElement('base');
  const a = doc.createElement('a');
  doc.head.appendChild(base);
  doc.body.appendChild(a);
  if (baseUrl) {
    base.href = baseUrl;
  }
  a.href = url;
  return a.href;
}
function escape(url) {
  return url.replace(/([.*+?^${}()|\[\]\/\\])/g, '\\$1');
}
function urlToRegex(url) {
  return new RegExp(`(url\\(['"]?)(${escape(url)})(['"]?\\))`, 'g');
}
function parseURLs(str) {
  const result = [];
  str.replace(URL_REGEX, (raw, quotation, url) => {
    result.push(url);
    return raw;
  });
  return result.filter(url => !utils_1.isDataUrl(url));
}
function embed(cssString, resourceURL, baseURL, options) {
  const resolvedURL = baseURL ? resolveUrl(resourceURL, baseURL) : resourceURL;
  return Promise.resolve(resolvedURL)
    .then(url => getBlobFromURL_1.default(url, options))
    .then(data => utils_1.toDataURL(data, utils_1.getMimeType(resourceURL)))
    .then(dataURL =>
      cssString.replace(urlToRegex(resourceURL), `$1${dataURL}$3`),
    )
    .then(content => content, () => resolvedURL);
}
function shouldEmbed(string) {
  return string.search(URL_REGEX) !== -1;
}
exports.shouldEmbed = shouldEmbed;
function embedResources(cssString, baseUrl, options) {
  if (!shouldEmbed(cssString)) {
    return Promise.resolve(cssString);
  }
  return Promise.resolve(cssString)
    .then(parseURLs)
    .then(urls =>
      urls.reduce(
        (done, url) => done.then(ret => embed(ret, url, baseUrl, options)),
        Promise.resolve(cssString),
      ),
    );
}
exports.default = embedResources;
