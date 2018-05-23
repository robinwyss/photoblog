/*
 * Settings 
 */
const srcPath = './src'
const distPath = './public'

const title = 'KIRO'
//
const imageOptions = {
	sizes: [720, 1080, 1600],
	showTitle: false
}


const fse = require('fs-extra')
const path = require('path')

const { promisify } = require('util')
const globP = promisify(require('glob'))

const pageGen = require('./pages')(srcPath, distPath, imageOptions)
const util = require('./util')()

/**
 * Creates a page defintion (object containing name and path) from a path.
 * @param {string } pictureFolder 
 * @returns  an object containing the name and the path. e.g. {name: California, sourcePath: pictures/01_California} 
 */
function createPageDefinition(pictureFolder, index) {
	const folderData = path.parse(pictureFolder)
	var foldername = folderData.name

	var pageInfo = util.extractInfoFromFolderName(foldername, index)

	// page name without spaces to use in urls
	var documentName = foldername.replace(' ', '')
	return { name: pageInfo.foldername, documentName: documentName, sourcePath: pictureFolder, index: pageInfo.pageNumber, date: pageInfo.date }
}


// clear destination folder
fse.emptyDirSync(distPath)

globP('pages/!(*.txt)')
	.then((pictureFolders) => {
		const pages = pictureFolders.map(createPageDefinition)
		var promises = pages.map((page) => {
			return pageGen.generatePicturePage(page)
		})
		return Promise.all(promises).then(() => {
			// sort in reverse order to have the newest post first
			var sortedPages = pages.sort((a, b) => {
				return b.index - a.index
			})
			return pageGen.generateIndex(sortedPages, title)
		})
	}).catch((error) => {
		console.error(error)
	})