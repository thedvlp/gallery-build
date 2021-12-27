#!/usr/bin/env node
const argv = require('minimist')(process.argv.slice(2));
const app = require('../app');

if(argv.h){
    help();
    return;
}

if(!argv.i || !argv.o){
    console.log("Error: Please specify input and output folders");
    help();
    return;
}

function help(){
    console.log("\n GLRY commands \n");
    console.log("\t -i \t input folder path");
    console.log("\t -o \t output folder path");
}


app(argv.i, argv.o);