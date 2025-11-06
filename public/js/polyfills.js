import 'core-js/stable';
import 'regenerator-runtime/runtime';

if (typeof Promise === 'undefined') {
  require('es6-promise').polyfill();
}

if (typeof window.fetch === 'undefined') {
  require('whatwg-fetch');
}