const fs = require("fs")
const path = require("path")
const { getFileDate, isPhoto, isVideo, execPromise, toChunks } = require('./util');
const { Progress, SimpleProgress } = require("./progress-bar");
const { File, FileRes } = require("./file");

const batchSize = 3;

function main(inputPath, outputPath) {
  if (!fs.existsSync(outputPath)) {
    console.error("Output path does not exist");
    return;
  }
  if (!fs.existsSync(inputPath)) {
    console.error("Input path does not exist");
    return;
  }
  console.time("Time");
  const scanProgress = new SimpleProgress("Scanning files... ");

  const scannedFiles = scan(inputPath, scanProgress);
  scanProgress.stop();

  const existingData = getExistingData(outputPath);
  const filesToAdd = compareAndGetDelta(scannedFiles, existingData);
  
  if(filesToAdd.length !== scannedFiles.length)
    console.log('Files to add: '+filesToAdd.length);

  createFolders(filesToAdd, outputPath);

  storeFiles(filesToAdd, outputPath).then(() => {

    storeThumbs(filesToAdd, outputPath).then(() => {

      generateJson(filesToAdd, existingData, outputPath).then(() => {
        console.log('Finished.');
        console.timeEnd('Time');
        console.log('You can view the gallery throw: '+path.join(outputPath, 'index.html'));
      });
      
    });

  });

  copyHTML(outputPath);
}

function scan(dirPath, progress, result) {
  const files = fs.readdirSync(dirPath)

  result = result || []

  files.forEach((fileName) => {
      if (fs.statSync(dirPath + "/" + fileName).isDirectory()) {
        result = scan(dirPath + "/" + fileName, progress, result);
      } else {
        if (!fileName.startsWith('.') && (isPhoto(fileName) || isVideo(fileName))) {
          result.push(new File(dirPath, fileName, getFileDate(dirPath, fileName)));
          progress.increment();
        }
      }
    });
  return result;
}

function createFolders(filesToAdd, outputPath) {
  const mediaDirs = [...new Set(filesToAdd.map(file => file.getPath(outputPath)))];
  const thumbDirs = mediaDirs.map(dir => dir.replace('media/', 'thumb/'));
  mediaDirs.concat(thumbDirs).forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
}

function commandToStoreFile(file, outputPath, filesProgress) {
  if (isVideo(file.name)) {
    const cmd = `ffmpeg -i '${file.path}/${file.name}' -vf scale=-2:1080 '${file.getFullPath(outputPath)}'`;
    return execPromise(cmd, filesProgress);
  }

  const cmd = `convert '${file.path}/${file.name}' -strip -auto-orient -resize 1200x1200^ -quality 85 '${file.getFullPath(outputPath)}'`;
  return execPromise(cmd, filesProgress);
}

async function storeFiles(filesToAdd, outputPath) {
  const filesProgress = new Progress("Storing Files... ", filesToAdd.length);
  const chunks = toChunks(filesToAdd, batchSize);
  for(i in chunks) {
    await Promise.allSettled(chunks[i].map(file => commandToStoreFile(file, outputPath, filesProgress)));
  }
}

function commandToStoreThumb(file, outputPath, thumbsProgress) {
  if (isVideo(file.name)) {
    const cmd = `ffmpeg -y -i '${file.getFullPath(outputPath)}' -ss 00:00:01.000 -vframes 1 -s 270x270 '${file.getThumbPath(outputPath)}'`;
    return execPromise(cmd, thumbsProgress);
  }

  const cmd = `convert '${file.getFullPath(outputPath)}' -strip -auto-orient -resize 270x270^ -gravity center -crop 270x270+0+0 -quality 80 '${file.getThumbPath(outputPath)}'`;
  return execPromise(cmd, thumbsProgress);
}

async function storeThumbs(filesToAdd, outputPath) {
  const thumbsProgress = new Progress("Creating thumbs... ", filesToAdd.length);
  const chunks = toChunks(filesToAdd, batchSize);
  for(i in chunks) {
    await Promise.allSettled(chunks[i].map(file => commandToStoreThumb(file, outputPath, thumbsProgress)));
  }
}

function generateJson(filesToAdd, existingData, outputPath){
  return new Promise((resolve, reject) => {
      console.log('Generating JSON...');
      const data = filesToAdd.map(file => FileRes.fromFile(file))
                             .concat(existingData)
                             .sort(sortCompare);
      const jsString = "const photos=" + JSON.stringify(data);                       
      fs.writeFile(path.join(outputPath, 'data.js'), jsString, (err) => {
        if (err) reject(err);
        resolve();
      });
    });
}

function sortCompare(fileRes1, fileRes2){
  if (new Date(fileRes1.d) > new Date(fileRes2.d))
    return -1;
  if (new Date(fileRes1.d) < new Date(fileRes2.d))
    return 1;  
  return 0;
}

function getExistingData(outputPath){
  try {
    const data = fs.readFileSync(path.join(outputPath, 'data.js'), 'utf8');
    return JSON.parse(data.replace("const photos=",""));
  } catch(err) {
    return [];
  }
}

function compareAndGetDelta(scannedFiles, existingData){
  if(existingData.length === 0)
    return scannedFiles;
  const existingFilesSet = new Set(existingData.map(data => data.f));
  return scannedFiles.filter(file => !existingFilesSet.has(FileRes.fromFile(file).f));
}

function copyHTML(outputPath){
  fs.copyFile(path.join(__dirname, 'template/index.html'), path.join(outputPath, 'index.html'), (err) => {
    if (err) throw err;
  });
  fs.copyFile(path.join(__dirname, 'template/style.css'), path.join(outputPath, 'style.css'), (err) => {
    if (err) throw err;
  });
  fs.copyFile(path.join(__dirname, 'template/script.js'), path.join(outputPath, 'script.js'), (err) => {
    if (err) throw err;
  });
}


module.exports = main;
