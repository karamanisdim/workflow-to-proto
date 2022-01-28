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
// -------------------  CREATE MODEL  ------------------- //

// Store aliases + inputs/outputs to a multidimensonial array for rpc services
const aliases: string[][] = [ [], [], [], [] ]; // aliases | ids | inputs | outputs
const pathsIds: string[][] = [ [], [] ]; // end ID | start ID 

function findPaths() {
    // Reverse find path from end node to start node 
    // For every end node
    for (let x in pathsIds[0] ){
        let toID = pathsIds[0][x]; 
        let fromID= "";

        // Find its root node
        for (let i in jsonObj.versions[latestV].edges) {
            for (let k in jsonObj.versions[latestV].edges[i].to) {
                
                if ( jsonObj.versions[latestV].edges[i].to[k].nodeId == toID ) {
                    fromID = jsonObj.versions[latestV].edges[i].from;

                    for (let j in jsonObj.versions[latestV].edges) {
                        for (let k in jsonObj.versions[latestV].edges[j].to) {
                            if ( jsonObj.versions[latestV].edges[j].to[k].nodeId == fromID ) {
                                fromID =  jsonObj.versions[latestV].edges[j].from;
                                pathsIds[1].push(fromID);
                            }
                        }
                    }
                }
            }
        }

        // Find outputs assigned to root node
        for (let y in aliases[1]){
            if (aliases[1][y] == fromID){
                
                for (let i in jsonObj.versions[latestV].nodes) {
                    let outputText:string = "";
                    if(jsonObj.versions[latestV].nodes[i].id == toID){

                        for (let j in jsonObj.versions[latestV].nodes[i].type.output) {
                            let ouputName = jsonObj.versions[latestV].nodes[i].type.output[j].name;
                            let outputType = jsonObj.versions[latestV].nodes[i].type.output[j].type;
                            let protoTag:number = +j+1;
                            outputText += "\n\t"  + outputType +" "+ ouputName + " = " + protoTag + ";" 
                        }
                        aliases[3].push(outputText=="" ? "\n" : outputText)
                    }
                }
            }
        }
    }   
}

function getNodesInfo() {
    for (let i in jsonObj.versions[latestV].nodes) {

        let alias = jsonObj.versions[latestV].nodes[i].type.alias;
        let id = jsonObj.versions[latestV].nodes[i].id;
        if (alias != undefined){
            // 1st array: aliases names
            // 2nd array: ids
            aliases[0].push(alias)
            aliases[1].push(id)
            // 3nd array: inputs
            let inputText:string = "";
            for (let j in jsonObj.versions[latestV].nodes[i].type.input) {
                let inputName = jsonObj.versions[latestV].nodes[i].type.input[j].name;
                let inputType = jsonObj.versions[latestV].nodes[i].type.input[j].type;
                let inputRequired = jsonObj.versions[latestV].nodes[i].type.input[j].required == true ? "" : "optional ";
                let protoTag:number = +j+1;
                inputText += "\n\t" + inputRequired + inputType +" "+ inputName + " = " + protoTag + ";" 
            }
            aliases[2].push(inputText=="" ? "\n" : inputText)

            // 4th array: outputs
            // aliases[3].push("\n\tblablabla")
        }



        // get all end nodes ids
        if (jsonObj.versions[latestV].nodes[i].name == "end") {
            pathsIds[0].push(jsonObj.versions[latestV].nodes[i].id);
        }
    }
}



getNodesInfo();
findPaths();



console.log("\n\n-------------- ALIASES\n",aliases);
console.log("\n\n-------------- START NODES IDS \n",pathsIds[1]);
console.log("\n\n-------------- END NODES IDS \n",pathsIds[0]);



// -------------------  WRITE OUT PROTO FILE  ------------------- //

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
    
    logStream.write(aliases[3][i]);

    logStream.write("\n}");
}

// Write out response messages
for (let i in aliases[0]) {
    let alias = aliases[0][i].charAt(0).toUpperCase() + aliases[0][i].slice(1);
    logStream.write("\n\nmessage " + alias + "Response {");
    
    logStream.write(aliases[3][i]);

    logStream.write("\n}");
}

logStream.end('\n');



