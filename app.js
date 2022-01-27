"use strict";
exports.__esModule = true;
var message = 'Hello, World!';
console.log(message);
var fs = require("fs");
var jsonObj = JSON.parse(fs.readFileSync('file.json', 'utf-8'));
console.log(jsonObj._id);
var latestV = jsonObj.latestVersion;
console.log(latestV);

