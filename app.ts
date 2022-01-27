import * as fs from 'fs'
const jsonObj = JSON.parse(fs.readFileSync('file.json', 'utf-8'))
const latestV: number = jsonObj.latestVersion;
const serviceName = "TodoApp";

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

// Store aliases + inputs/outputs to a multidimensonial array for rpc services
const aliases: string[][] = [ [], [], [] ];
for (let i in jsonObj.versions[latestV].nodes) {
    let alias = jsonObj.versions[latestV].nodes[i].type.alias;
    if (alias != undefined){
        // 1st array: aliases names
        aliases[0].push(alias)

        // 2nd array: inputs
        let inputText:string = "";
        for (let j in jsonObj.versions[latestV].nodes[i].type.input) {
            let inputName = jsonObj.versions[latestV].nodes[i].type.input[j].name;
            let inputType = jsonObj.versions[latestV].nodes[i].type.input[j].type;
            let inputRequired = jsonObj.versions[latestV].nodes[i].type.input[j].required == true ? "" : "optional ";
            let protoTag:number = +j+1;
            inputText += "\n\t" + inputRequired + inputType +" "+ inputName + " = " + protoTag + ";" 
        }

        // 3d array: outputs
        
        aliases[1].push(inputText=="" ? "\n" : inputText)
        aliases[2].push("\n\tblablabla")
    }
}
console.log(aliases);
// Create proto file, first line and writeStream
var file = new FileHandle();
file.createFile("output.proto", "syntax = \"proto3\";");
var logStream = fs.createWriteStream('output.proto', {flags: 'a'});


// Write out rpc services
logStream.write("\n\nservice " + serviceName + " {");
for (let i in aliases[0]) {
    let alias = aliases[0][i].charAt(0).toUpperCase() + aliases[0][i].slice(1);
    logStream.write("\n\trpc " + alias + "(" + alias + "Request) returns (" + alias + "Response);");
}
logStream.write("\n}");

// Write out request messages
for (let i in aliases[0]) {
    let alias = aliases[0][i].charAt(0).toUpperCase() + aliases[0][i].slice(1);
    logStream.write("\n\nmessage " + alias + "Request {");
    
    logStream.write(aliases[1][i]);

    logStream.write("\n}");
}

// Write out response messages
for (let i in aliases[0]) {
    let alias = aliases[0][i].charAt(0).toUpperCase() + aliases[0][i].slice(1);
    logStream.write("\n\nmessage " + alias + "Response {");
    
    logStream.write(aliases[2][i]);

    logStream.write("\n}");
}

logStream.end('\n\nthis is the end line');



