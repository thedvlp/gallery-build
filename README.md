# gallery-build
Converts your folder with photos and videos to html gallery.

`gallery-build` will never edit your original files. It is doing only readonly operation on the folder with original files and stores to the path which you define as output. 

`gallery-build` is super lightweight and fast gallery builder node package. It is used as command-line tool to generate web accessible gallery. Later the html file with other files can be copied to any server (home, remote, raspberry) or just used locally by opening `index.html` file.

## Installation

**npm**

```$ npm install -g gallery-build```

## Quick start

To generate gallery run `gallery-build` command by specifying input folder and output folder. 

```$ gallery-build -i /path/to/photos_videos -o /path/to/output```

- `-i` is the path of folder where your photo and videos stored.
- `-o` is the path where `gallery-build` will store generated gallery files (.html file, thumbs, web resized media)

**That's it** Now go to the output path and open `index.html` to view your gallery.

## Requirements

`gallery-build` requires the following dependencies:
- [Node.js](http://nodejs.org/): `brew install node`
- [ImageMagick](https://imagemagick.org/) to process photos: `brew install imagemagick`)
- [FFmpeg](http://www.ffmpeg.org/) to process videos: `brew install ffmpeg`
