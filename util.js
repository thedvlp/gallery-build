const fs = require("fs");
const exec = require('child_process').exec;

function getFileDate(path, fileName) {
    const dateFromFileName = new Date(fileName.substring(0, 16).replace(' ', 'T').replace('.', ':'));
    if (isValidDate(dateFromFileName))
        return dateFromFileName;

    const stats = fs.statSync(path + "/" + fileName);
    return stats.mtime;
}
function isValidDate(d) {
    return d instanceof Date && !isNaN(d);
}

function getExtension(fileName) {
    return fileName.substr(fileName.lastIndexOf(".") + 1).toUpperCase();
}

function isPhoto(fileName) {
    return ["JPG", "JPEG", "PNG", "TIFF", "HEIC"].includes(getExtension(fileName));
}

function isVideo(fileName) {
    return ["M4V", "MOV", "MP4", "3GP"].includes(getExtension(fileName));
}


function execPromise(cmd, progress) {
    return new Promise((resolve, reject) => {
        exec(cmd, (error, stdout, stderr) => {
            if (error) {
                console.error(error);
                reject(error);
            } else {
                progress.increment();
                resolve(stdout ? stdout : stderr);
            }
        });
    });
}

function toChunks(array, chunkSize) {
    return [...Array(Math.ceil(array.length / chunkSize))]
                .map((_, i) => array.slice(i * chunkSize, i * chunkSize + chunkSize));
}

module.exports = { getFileDate, isPhoto, isVideo, execPromise, toChunks }