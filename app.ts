let message: string = 'Hello, World!';
console.log(message);

import * as fs from 'fs'
const jsonObj = JSON.parse(fs.readFileSync('file.json', 'utf-8'))
console.log(jsonObj._id);
const latestV: Number = jsonObj.latestVersion;
console.log(latestV);

class MyClass {

    private fs = require('fs');

    constructor() { }

    createFile(fileName: string, input: string) {

        this.fs.writeFile(fileName, input,  function(err: any) {
            if (err) {
                return console.error(err);
            }
            console.log("File created!");
        });
    }

    showFile() {

        this.fs.readFile('file.txt', function (err: any, data: { toString: () => string; }) {
            if (err) {
                return console.error(err);
            }
            console.log("Asynchronous read: " + data.toString());
        });
    }
}

// Usage
var obj = new MyClass();
obj.createFile("test.proto", "syntax = \"proto3\";");
obj.showFile();


