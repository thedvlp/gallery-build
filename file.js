const { isVideo } = require('./util');
const path = require("path")

class File {

    constructor(path, name, date){
        this.path = path;
        this.name = name;
        this.date = date;
    }

    getLocation() {
        return path.join(this.date.getFullYear().toString(), (this.date.getMonth() + 1).toString())
    }

    getPath(outputPath) {
        return path.join(outputPath, 'media', this.getLocation());
    }

    getNewName() {
        return this.name.substring(0, this.name.lastIndexOf(".")) + this.getExtension();
    }

    getFullPath(outputPath) {
        return path.join(this.getPath(outputPath),this.getNewName());
    }

    getThumbPath(outputPath) {
        const fullPath = this.getFullPath(outputPath);
        return fullPath.replace(path.extname(fullPath), ".jpg").replace("media/", "thumb/");
    }

    getExtension(){
        return isVideo(this.name) ? ".MP4" : ".JPG";
    }

    getBaseName(){
        const ext = path.extname(this.name);
        return path.basename(this.name, ext);
    }
}

class FileRes{
    constructor(file, ext, date){
        this.f = file;
        this.e = ext;
        this.d = date;
    }

    static fromFile(file) {
        return new FileRes(file.getLocation()+'/'+file.getBaseName(), file.getExtension(), file.date);
    }
}

module.exports = { File, FileRes };