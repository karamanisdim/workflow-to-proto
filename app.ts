let message: string = 'Hello, World!';
console.log(message);

import * as fs from 'fs'
const jsonObj = JSON.parse(fs.readFileSync('file.json', 'utf-8'))
console.log(jsonObj._id);
const latestV: Number = jsonObj.latestVersion;
console.log(latestV);

class FileHandle {
    private fs = require('fs');
    constructor() { }

    createFile(fileName: string, input: string) {
        this.fs.writeFile(fileName, input, function (err: any) {
            if (err) {
                return console.error(err);
            }
            console.log("File created!");
        });
    }

    showFile(fileName: string) {
        this.fs.readFile(fileName, function (err: any, data: string) {
            if (err) {
                return console.error(err);
            }
            console.log("Asynchronous read: " + data.toString());
        });
    }

    writeFile(fileName: string, input: string) {
        this.fs.writeFile(fileName, input,  {'flag':'a'},  function(err: any) {
            if (err) {
                return console.error(err);
            }
        });
    }
}

// WriteStream used to append logs to file when file is ready
// use {flags: 'a'} to append and {flags: 'w'} to erase and write a new file
var logStream = fs.createWriteStream('test.proto', {flags: 'a'});
logStream.write('\nInitial line...');
logStream.write('\nInitial line...2');
logStream.write('\nInitial line...3');
logStream.end('\nthis is the end line');


// writeFile used to append logs to file instantly
var file = new FileHandle();
file.createFile("test.proto", "syntax = \"proto3\";");
file.writeFile("test.proto", "\nblablabla");
file.showFile("test.proto");
