const __importStar =
  (this && this.__importStar) ||
  function(mod) {
    if (mod && mod.__esModule) return mod;
    const result = {};
    if (mod != null)
      for (const k in mod)
        if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result.default = mod;
    return result;
  };
Object.defineProperty(exports, '__esModule', { value: true });
const utils_1 = require('./utils');
const embedResources_1 = __importStar(require('./embedResources'));

function parseCSS(source) {
  if (source === undefined) {
    return [];
  }
  let cssText = source;
  const css = [];
  const cssKeyframeRegex = '((@.*?keyframes [\\s\\S]*?){([\\s\\S]*?}\\s*?)})';
  const combinedCSSRegex =
    '((\\s*?(?:\\/\\*[\\s\\S]*?\\*\\/)?\\s*?@media[\\s\\S]' +
    '*?){([\\s\\S]*?)}\\s*?})|(([\\s\\S]*?){([\\s\\S]*?)})'; // to match css & media queries together
  const cssCommentsRegex = new RegExp('(\\/\\*[\\s\\S]*?\\*\\/)', 'gi');
  // strip out comments
  cssText = cssText.replace(cssCommentsRegex, '');
  const keyframesRegex = new RegExp(cssKeyframeRegex, 'gi');
  let arr;
  while (true) {
    arr = keyframesRegex.exec(cssText);
    if (arr === null) {
      break;
    }
    css.push(arr[0]);
  }
  cssText = cssText.replace(keyframesRegex, '');
  // unified regex
  const unified = new RegExp(combinedCSSRegex, 'gi');
  while (true) {
    arr = unified.exec(cssText);
    if (arr === null) {
      break;
    }
    css.push(arr[0]);
  }
  return css;
}
function fetchCSS(url, sheet) {
  return fetch(url).then(
    res => ({
      url,
      cssText: res.text(),
    }),
    e => {
      console.log('ERROR FETCHING CSS: ', e.toString());
    },
  );
}
function embedFonts(data) {
  return data.cssText.then(resolved => {
    let cssText = resolved;
    const fontLocations = cssText.match(/url\([^)]+\)/g) || [];
    const fontLoadedPromises = fontLocations.map(location => {
      let url = location.replace(/url\(([^]+)\)/g, '$1');
      if (!url.startsWith('https://')) {
        const source = data.url;
        url = new URL(url, source).href;
      }
      return new Promise((resolve, reject) => {
        fetch(url)
          .then(res => res.blob())
          .then(blob => {
            const reader = new FileReader();
            reader.addEventListener('load', res => {
              // Side Effect
              cssText = cssText.replace(location, `url(${reader.result})`);
              resolve([location, reader.result]);
            });
            reader.readAsDataURL(blob);
          })
          .catch(reject);
      });
    });
    return Promise.all(fontLoadedPromises).then(() => cssText);
  });
}
function getCssRules(styleSheets) {
  const ret = [];
  const promises = [];
  // First loop inlines imports
  styleSheets.forEach(sheet => {
    if ('cssRules' in sheet) {
      try {
        utils_1.toArray(sheet.cssRules).forEach(item => {
          if (item.type === CSSRule.IMPORT_RULE) {
            promises.push(
              fetchCSS(item.href, sheet)
                .then(embedFonts)
                .then(cssText => {
                  const parsed = parseCSS(cssText);
                  parsed.forEach(rule => {
                    sheet.insertRule(rule, sheet.cssRules.length);
                  });
                })
                .catch(e => {
                  console.log('Error loading remote css', e.toString());
                }),
            );
          }
        });
      } catch (e) {
        const inline_1 =
          styleSheets.find(a => a.href === null) || document.styleSheets[0];
        if (sheet.href != null) {
          promises.push(
            fetchCSS(sheet.href, inline_1)
              .then(embedFonts)
              .then(cssText => {
                const parsed = parseCSS(cssText);
                parsed.forEach(rule => {
                  inline_1.insertRule(rule, sheet.cssRules.length);
                });
              })
              .catch(e => {
                console.log('Error loading remote stylesheet', e.toString());
              }),
          );
        }
        console.log('Error inlining remote css file', e.toString());
      }
    }
  });
  return Promise.all(promises).then(() => {
    // Second loop parses rules
    styleSheets.forEach(sheet => {
      if ('cssRules' in sheet) {
        try {
          utils_1.toArray(sheet.cssRules).forEach(item => {
            ret.push(item);
          });
        } catch (e) {
          console.log(
            `Error while reading CSS rules from ${sheet.href}`,
            e.toString(),
          );
        }
      }
    });
    return ret;
  });
}
function getWebFontRules(cssRules) {
  return cssRules
    .filter(rule => rule.type === CSSRule.FONT_FACE_RULE)
    .filter(rule =>
      embedResources_1.shouldEmbed(rule.style.getPropertyValue('src')),
    );
}
function parseWebFontRules(clonedNode) {
  return new Promise((resolve, reject) => {
    if (!clonedNode.ownerDocument) {
      reject(new Error('Provided element is not within a Document'));
    }
    resolve(utils_1.toArray(clonedNode.ownerDocument.styleSheets));
  })
    .then(getCssRules)
    .then(getWebFontRules);
}
exports.parseWebFontRules = parseWebFontRules;
function embedWebFonts(clonedNode, options) {
  return parseWebFontRules(clonedNode)
    .then(rules =>
      Promise.all(
        rules.map(rule => {
          const baseUrl = rule.parentStyleSheet
            ? rule.parentStyleSheet.href
            : null;
          return embedResources_1.default(rule.cssText, baseUrl, options);
        }),
      ),
    )
    .then(cssStrings => cssStrings.join('\n'))
    .then(cssString => {
      const styleNode = document.createElement('style');
      const sytleContent = document.createTextNode(cssString);
      styleNode.appendChild(sytleContent);
      if (clonedNode.firstChild) {
        clonedNode.insertBefore(styleNode, clonedNode.firstChild);
      } else {
        clonedNode.appendChild(styleNode);
      }
      return clonedNode;
    });
}
exports.default = embedWebFonts;
