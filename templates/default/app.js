function loadPage(pageLink) {
	// remove # and append .html
	var url = pageLink.slice(1) + '.html'
	fetch(url).then(function (content) {
		return content.text()
	}).then(function (content) {
		window.scrollTo(0, 0)
		document.querySelector('#content').innerHTML = content
		window.lazyLoadInstance.update()
	}).catch(function (error) {
		console.error(error)
	})
}

function router() {
	var pages = document.querySelectorAll('#menu li')
	// Current route url (getting rid of '#' in hash as well):
	var url = location.hash
	if (url) {
		loadPage(url)
	} else {
		// no page specified, load the latest one (first in the list)
		var firstPageLink = pages[0].querySelector('a')
		loadPage(firstPageLink.hash)
	}
}
function init() {
	initLazyLoad().then(function () {
		router()
	})
}

function initLazyLoad() {
	return new Promise(function (resolve) {
		// Listen to the Initialized event
		window.addEventListener('LazyLoad::Initialized', function (e) {
			// Get the instance and puts it in the lazyLoadInstance variable
			window.lazyLoadInstance = e.detail.instance
			resolve()
		}, false)
	})
}

document.addEventListener('DOMContentLoaded', init)
window.addEventListener('hashchange', router)