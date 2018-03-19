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
//
const imgSizes = [720, 1080, 1600]


const fse = require('fs-extra')
const path = require('path')

const { promisify } = require('util')
const globP = promisify(require('glob'))

const moment = require('moment')
const pageGen = require('./pages')(srcPath, distPath, imgSizes)

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
	// page name without spaces to use in urls
	var documentName = foldername.replace(' ', '')
	return { name: foldername, documentName: documentName, sourcePath: pictureFolder, index: pageNumber, date: date }
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



// clear destination folder
fse.emptyDirSync(distPath)

globP('pages/!(*.txt)')
	.then((pictureFolders) => {
		const pages = pictureFolders.map(createPageDefinition)
		var promises = pages.map((page) => {
			return pageGen.generatePicturePage(page, imgSizes)
		})
		return Promise.all(promises).then(() => {
			// sort in reverse order to have the newest post first
			var sortedPages = pages.sort((a, b) => {
				return b.index - a.index
			})
			return pageGen.generateIndex(sortedPages)
		})
	}).catch((error) => {
		console.error(error)
	})