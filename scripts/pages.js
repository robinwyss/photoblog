const fse = require('fs-extra')
const ejs = require('ejs')
const path = require('path')
const images = require('./images')()
const { hashElement } = require('folder-hash')

/**
 *
 * 
 * @param {string} templatePath
 * @param {string} distPath 
 * @param {[int]} imgSizes: array of sizes for which the pictures exists
 */
module.exports = function (templatePath, distPath, imageOptions, tempData) {

	function updateHash(name, hash) {
		tempData[name] = hash
		var data = JSON.stringify(tempData)
		fse.writeFileSync('.temp.json', data, { encoding: 'utf8', flag: 'w' })
	}

	/**
	 * @param {object} page
	 * 
	 * @returns {boolean} true if it needs to be generated, false if it already exists and hasn't changed
	 */
	function initFolder(destPath, page) {
		return hashElement(page.sourcePath).then(result => {
			var previousHash = tempData[page.name]
			updateHash(page.name, result.hash)
			if (result.hash === previousHash) {
				if (fse.existsSync(destPath)) {
					return false
				} else {
					fse.mkdirs(destPath)
					return true
				}
			} else {
				fse.emptyDirSync(destPath)
				return true
			}
		})
	}

	/**
	 * Generates a page
	 * 
	 * @param {object} page
	 */
	function generatePicturePage(page) {
		const destPath = path.join(distPath, page.documentName)
		initFolder(destPath, page).then(needsToBeGenerated => {
			if (needsToBeGenerated) {
				console.info(`resize images ${page.name}`)
				return images.copyAndResizeImages(page.sourcePath, destPath, imageOptions.sizes)
					.then(pictures => {
						// sort pictures by name
						pictures = pictures.sort((a, b) => {
							const aName = a.name.toUpperCase()
							const bName = b.name.toUpperCase()
							if (aName < bName) return -1
							if (aName > bName) return 1
							return 0
						})
						console.info('generating HTML files')
						return fse.readFile(templatePath + '/pageTemplate.ejs', 'utf-8')
							.then(templateContent => {
								const content = ejs.render(templateContent, { pictures, page, imageOptions })
								const htmlFileName = `${distPath}/${page.documentName}.html`
								console.info(`generating HTML file: ${htmlFileName}`)
								fse.writeFile(htmlFileName, content)
							})
					})
			} else {
				console.info(`images from ${page.name} have not changed and won't be regenerated`)
				return Promise.resolve()
			}
		})
	}

	/**
	 * Generates the index page.
	 * 
	 * @param {object[]} pages 
	 */
	function generateIndex(pages, title) {
		return fse.readFile(templatePath + '/indexTemplate.ejs', 'utf-8')
			.then(templateContent => {
				const content = ejs.render(templateContent, { pages, title })
				console.info('generating index file')
				return fse.ensureDir(`${distPath}/`).then(() => {
					return fse.writeFile(`${distPath}/index.html`, content)
					.then(fse.copyFile(`${templatePath}/styles.css`, `${distPath}/styles.css`))
					.then(fse.copyFile(`${templatePath}/app.js`, `${distPath}/app.js`))
					.then(fse.copyFile(`${templatePath}/favicon.ico`, `${distPath}/favicon.ico`))
				})
			})
	}

	return {
		generatePicturePage,
		generateIndex
	}
}