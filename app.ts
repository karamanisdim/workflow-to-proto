let message: string = 'Hello, World!';
console.log(message);

import * as fs from 'fs'
var jsonObj = JSON.parse(fs.readFileSync('file.json', 'utf-8'))
console.log(jsonObj._id);


