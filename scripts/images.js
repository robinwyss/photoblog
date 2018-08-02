const sharp = require('sharp')
const { promisify } = require('util')
const globP = promisify(require('glob'))
const path = require('path')
const exif = require('exif').ExifImage

/**
 * This module is used resize and copy the images
 * 
 * @param {[int]} sizes: the sizes for which a version should be generated
 * (e.g. [20, 720, 1080]) 
 */
module.exports = function () {

	/**
	 * Copies all pictures from the pictureFolder to the destination and generates 
	 * different sizes
	 * 
	 * @param {string} pictureFolder 
	 * @param {string} destPath 
	 * 
	 * @returns {[object]} imageDefinitions: list of objects containing the image sizes
	 * (e.g. [{"720":"pathtoImg1-720.jpg", "1080":"pathtoImg2-1080.jpg"}, {"720":"pathtoImg2-720.jpg", "1080":"pathtoImg2-1080.jpg"}])
	 */
	function copyAndResizeImages(pictureFolder, destPath, sizes) {
		return globP(pictureFolder + '/*.jpg')
			.then(pictures => {
				const result = pictures.map(picturePath => {
					return generateSizes(picturePath, destPath, sizes).then(data => {
						const pictureData = path.parse(picturePath)
						data.name = pictureData.name + pictureData.ext
						return readDescriptionFromExif(picturePath).then(description => {
							data.description = description
							return data
						})
					})
				})
				return Promise.all(result)
			})
	}


	/**
	 * generates multiple sizes for an image
	 * 
	 * @param {string} source: path to image
	 * @param {string} destFolder: folder to save the images to
	 * @param {[int]} sizes: int array, containing widths to which the image should be resized. 
	 * 
	 * @returns {object} sizes: object containting all the image sizes 
	 * (e.g. {"720":"pathtoImg-720.jpg", "1080":"pathtoImg-1080.jpg"})
	 */
	function generateSizes(source, destFolder, sizes) {
		return sizes.reduce((promise, size) => {
			return promise.then(result => {
				return resizeAndCopy(source, size, destFolder)
					.then((fileName) => {
						result[size] = fileName
						return result
					}).catch((error) => {
						console.error(error)
					})
			})
		}, Promise.resolve({})).then(sizeDefinitions => {
			return resizeAndCopy(source, 20, destFolder).then(fileName => {
				sizeDefinitions.placeholder = fileName
				return sizeDefinitions
			})
		})
	}

	/**
	 * 
	 * @param {string} source: path to original image 
	 * @param {int} size: size, expressed in width, to which the image should be reduce
	 * @param {string} destFolder: folder to save the images to
	 * @returns {string} fileName: name of the generated file
	 */
	function resizeAndCopy(source, size, destFolder) {
		const pictureData = path.parse(source)
		const fileName = pictureData.name + '_' + size + pictureData.ext
		const destPicturePath = path.join(destFolder, fileName)
		return sharp(source)
			.resize(size)
			.jpeg({
				quality: 80,
			})
			.toFile(destPicturePath).then(() => fileName)
	}

	function readDescriptionFromExif(path) {
		return new Promise((resolve, reject) => {

			try {
				new exif({ image: path }, function (error, exifData) {
					if (error) {
						reject(error.message)
					}
					else {
						resolve(exifData.image.ImageDescription)
					}
				})
			} catch (error) {
				reject(error.message)
			}
		})
	}


	return {
		copyAndResizeImages
	}
}