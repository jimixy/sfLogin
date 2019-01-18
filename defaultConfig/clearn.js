
const path = require('path');
if (typeof localStorage === "undefined" || localStorage === null) {
  var LocalStorage = require('node-localstorage').LocalStorage;
  const scratch = path.resolve(__dirname, './scratch');
  localStorage = new LocalStorage(scratch);
}

localStorage.clear();
