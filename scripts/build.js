const fse = require('fs-extra')
var fs = require('fs');
const path = require('path')
const sharp = require('sharp');
const { promisify } = require('util')
const globP = promisify(require('glob'))
const ejs = require('ejs')

/*
 * Settings 
 */
const srcPath = './src'
const distPath = './public'

/**
 * generates multiple sizes for an image
 * 
 * @param {string} source: path to image
 * @param {string} destFolder: folder to save the images to
 * @param {[int]} sizes: int array, containing widths to which the image should be resized. 
 */
function resizeAndCopy(source, destFolder, sizes) {
    const picData = path.parse(source)
    const data = {}
    sizes.forEach((size) => {
        const fileName = picData.name + '_' + size + picData.ext
        const destPicturePath = path.join(destFolder, fileName)
        sharp(source)
            .resize(size)
            .toFile(destPicturePath).then(() => {
                data[size] = fileName
            }).catch((error) => {
                console.log(error)
            })
    })
    return data
}

/**
 * Copies all pictures from the pictureFolder to the destination and generates 
 * different sizes
 * 
 * @param {string} pictureFolder 
 * @param {string} destPath 
 */
function copyImages(pictureFolder, destPath) {
    const result = []
    globP(pictureFolder + '/*.jpg')
        .then(pictures => {
            pictures.forEach(picture => {
                var data = resizeAndCopy(picture, destPath, [10, 720, 1080, 1600]);
                result.push(data)
            })
        })
    return result;
}

/**
 * Creates a page defintion (object containing name and path) from a path.
 * @param {string } pictureFolder 
 * @returns  an object containing the name and the path. e.g. {name: California, sourcePath: pictures/01_California} 
 */
function createPageDefinition(pictureFolder, index) {
    const folderNameRegex = /^(\d)+_(.*)/g
    const folderData = path.parse(pictureFolder)
    var foldername = folderData.name;
    console.log('input '+ foldername)
    var match = folderNameRegex.exec(foldername);
    console.log(JSON.stringify(match))
    if (match && match.length === 3) {
        index = parseInt(match[1])
        foldername = match[2];
    } else {
        // if the index is not read from the folder name, we add 1 otherwise it would be 0 based
        index += 1
    }
    console.log(JSON.stringify({ name: foldername, sourcePath: pictureFolder, index: index }))
    return { name: foldername, sourcePath: pictureFolder, index: index }

}

/**
 * Generates a page
 * 
 * @param {object} page 
 */
function generatePicturePage(page) {
    const destPath = path.join(distPath, page.name)
    // create destination directory
    fse.mkdirs(destPath)
    console.info(`resize images ${page.name}`)
    const result = copyImages(page.sourcePath, destPath)
    console.info('generating HTML files')
    fse.readFile('./src/pageTemplate.ejs', 'utf-8')
        .then(templateContent => {
            const content = ejs.render(templateContent, { pictures: result, name: page.name })
            const htmlFileName = `${distPath}/${page.name}.html`
            console.info(`generating HTML file: ${htmlFileName}`)
            fse.writeFile(htmlFileName, content)
        }).catch((error) => {
            console.error(error);
        })
}

/**
 * Generates the index page.
 * 
 * @param {object[]} pages 
 */
function generateIndex(pages) {
    fse.readFile('./src/indexTemplate.ejs', 'utf-8')
        .then(templateContent => {
            const content = ejs.render(templateContent, { pages: pages })
            console.info('generating index file')
            fse.writeFile(`${distPath}/index.html`, content)
        }).catch((error) => {
            console.error(error);
        })
}

// clear destination folder
fse.emptyDirSync(distPath)

globP('pages/*')
    .then((pictureFolders) => {
        const pages = pictureFolders.map(createPageDefinition)
        pages.forEach((page) => {
            generatePicturePage(page)
        })
        // sort in reverse order to have the newest post first
        var sortedPages = pages.sort((a,b) => {
            return b.index - a.index;
        })
        generateIndex(sortedPages);
    }).catch((error) => {
        console.error(error);
    });