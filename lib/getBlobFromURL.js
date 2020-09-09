/* tslint:disable:max-line-length */
Object.defineProperty(exports, '__esModule', {
  value: true,
});
const utils_1 = require('./utils');
// KNOWN ISSUE
// -----------
// Can not handle redirect-url, such as when access 'http://something.com/avatar.png'
// will redirect to 'http://something.com/65fc2ffcc8aea7ba65a1d1feda173540'
const TIMEOUT = 30000;

function getBlobFromURL(url, options) {
  // cache bypass so we dont have CORS issues with cached images
  // ref: https://developer.mozilla.org/en/docs/Web/API/XMLHttpRequest/Using_XMLHttpRequest#Bypassing_the_cache
  if (options.cacheBust) {
    url += (/\?/.test(url) ? '&' : '?') + new Date().getTime(); // tslint:disable-line
  }
  const failed = function(reason) {
    let placeholder = '';
    if (options.imagePlaceholder) {
      const split = options.imagePlaceholder.split(/,/);
      if (split && split[1]) {
        placeholder = split[1];
      }
    }
    let msg = `Failed to fetch resource: ${url}`;
    if (reason) {
      msg = typeof reason === 'string' ? reason : reason.message;
    }
    if (msg) {
      console.error(msg);
    }
    return placeholder;
  };
  const deferred = window.fetch // fetch
    ? window
        .fetch(url, {
          method: 'GET',
          mode: 'no-cors',
          cache: 'no-cache',
          credentials: 'same-origin',
          headers: {
            'Content-Type': 'application/json',
          },
        })
        .then(response => response.blob())
        .then(
          blob =>
            new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onloadend = function() {
                return resolve(reader.result);
              };
              reader.onerror = reject;
              reader.readAsDataURL(blob);
            }),
        )
        .then(utils_1.getDataURLContent)
        .catch(
          () =>
            new Promise((resolve, reject) => {
              reject();
            }),
        ) // xhr
    : new Promise((resolve, reject) => {
        const req = new XMLHttpRequest();
        const timeout = function() {
          reject(
            new Error(
              `Timeout of ${TIMEOUT}ms occured while fetching resource: ${url}`,
            ),
          );
        };
        const done = function() {
          if (req.readyState !== 4) {
            return;
          }
          if (req.status !== 200) {
            reject(
              new Error(
                `Failed to fetch resource: ${url}, status: ${req.status}`,
              ),
            );
            return;
          }
          const encoder = new FileReader();
          encoder.onloadend = function() {
            resolve(utils_1.getDataURLContent(encoder.result));
          };
          encoder.readAsDataURL(req.response);
        };
        req.onreadystatechange = done;
        req.ontimeout = timeout;
        req.responseType = 'blob';
        req.timeout = TIMEOUT;
        req.open('GET', url, true);
        req.send();
      });
  return deferred.catch(failed);
}
exports.default = getBlobFromURL;
