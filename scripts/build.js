const fse = require('fs-extra')
const path = require('path')
const sharp = require('sharp')
const { promisify } = require('util')
const globP = promisify(require('glob'))
const ejs = require('ejs')
const moment = require('moment')
/*
 * Settings 
 */
const srcPath = './src'
const distPath = './public'
// matches against a folder that starts with a number
// e.g. 01_Roadtrip
const folderNumberedRegex = /^(\d)+[_-\s]?(.+)$/
// matches against a folder that starts with a data, the day is optional
// e.g 20180218_Roadtrip or 201802_Roadtrip
// can also be separated by - or _ e.g. 2018_02_18_Roadtrip or 2018-02-18-Roadtrip 
const folderWithDateRegex = /^^(\d{4})[_-\s]?(\d{2})[_-\s]?(\d{2})?[_-\s]?(.+)$/
/**
 * generates multiple sizes for an image
 * 
 * @param {string} source: path to image
 * @param {string} destFolder: folder to save the images to
 * @param {[int]} sizes: int array, containing widths to which the image should be resized. 
 */
function resizeAndCopy(source, destFolder, sizes) {
	const picData = path.parse(source)
	return sizes.reduce((promise, size) => {
		const fileName = picData.name + '_' + size + picData.ext
		const destPicturePath = path.join(destFolder, fileName)
		return promise.then(result => {
			return sharp(source)
				.resize(size)
				.toFile(destPicturePath).then(() => {
					result[size] = fileName
					return result
				}).catch((error) => {
					console.error(error)
				})
		})
	}, Promise.resolve({}))
}

/**
 * Copies all pictures from the pictureFolder to the destination and generates 
 * different sizes
 * 
 * @param {string} pictureFolder 
 * @param {string} destPath 
 */
function copyImages(pictureFolder, destPath) {
	return globP(pictureFolder + '/*.jpg')
		.then(pictures => {
			const result = pictures.map(picture => {
				const data = resizeAndCopy(picture, destPath, [20, 720, 1080, 1600])
				return data
			})
			return Promise.all(result)
		})
}

/**
 * Creates a page defintion (object containing name and path) from a path.
 * @param {string } pictureFolder 
 * @returns  an object containing the name and the path. e.g. {name: California, sourcePath: pictures/01_California} 
 */
function createPageDefinition(pictureFolder, index) {
	// increment index to have it start at 1 instead of 0
	var pageNumber = index + 1
	const folderData = path.parse(pictureFolder)
	var foldername = folderData.name
	var date
	// try to get the date from the folder
	var match = folderWithDateRegex.exec(foldername)
	if (match) {
		date = formatDate(match[1], match[2], match[3])
		foldername = match[4]
	} else {
		// try to match numbered folders
		match = folderNumberedRegex.exec(foldername)
		if (match) {
			foldername = match[2]
			// use the number from the folder as page number
			pageNumber = parseInt(match[1])
		}
	}
	return { name: foldername, sourcePath: pictureFolder, index: pageNumber, date: date }
}

/**
 * formats the date, the day is optional.
 * e.g. 
 *      2018, 10 => October 2018
 *      2018, 10, 18 => October 18, 2018
 * 
 * @param {string} year 
 * @param {string} month 
 * @param [{string} day] 
 */
function formatDate(year, month, day) {
	if (day) {
		return moment(`${year}-${month}-${day}`).format('MMMM DD, YYYY')
	} else {
		return moment(`${year}-${month}`).format('MMMM YYYY')
	}
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
	return copyImages(page.sourcePath, destPath).then(result => {
		console.info('generating HTML files')
		return fse.readFile('./src/pageTemplate.ejs', 'utf-8')
			.then(templateContent => {
				const content = ejs.render(templateContent, { pictures: result, page: page })
				const htmlFileName = `${distPath}/${page.name}.html`
				console.info(`generating HTML file: ${htmlFileName}`)
				fse.writeFile(htmlFileName, content)
			})
	}).catch((error) => {
		console.error(error)
	})

}

/**
 * Generates the index page.
 * 
 * @param {object[]} pages 
 */
function generateIndex(pages) {
	return fse.readFile('./src/indexTemplate.ejs', 'utf-8')
		.then(templateContent => {
			const content = ejs.render(templateContent, { pages: pages })
			console.info('generating index file')
			return fse.writeFile(`${distPath}/index.html`, content)
				.then(fse.copyFile(`${srcPath}/styles.css`, `${distPath}/styles.css`))
				.then(fse.copyFile(`${srcPath}/app.js`, `${distPath}/app.js`))
		})
}

// clear destination folder
fse.emptyDirSync(distPath)

globP('pages/!(*.txt)')
	.then((pictureFolders) => {
		const pages = pictureFolders.map(createPageDefinition)
		var promises = pages.map((page) => {
			return generatePicturePage(page)
		})
		return Promise.all(promises).then(() => {
			// sort in reverse order to have the newest post first
			var sortedPages = pages.sort((a, b) => {
				return b.index - a.index
			})
			return generateIndex(sortedPages)
		})
	}).catch((error) => {
		console.error(error)
	})