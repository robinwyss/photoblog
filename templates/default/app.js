const pageTemplate = `
	<div>
		<div class="title">
			<span>
				<h1>
					<%= title %>
				</h1>
				<% if (date) { %>
					<h2>
						<%= date %>
					</h2>
					<%} %>
			</span>
		</div>
		<% images.forEach(function(image){ %>
			<div class="picture-container">
				<img class="pic" src="<%=name + '/' + image.name %>" 
					srcset="<%- image.sizes.reduce( (result, sizeDef) => result + name + '/' + sizeDef.filename + ' ' + sizeDef.width + 'w, ', '') %>"
					sizes="<%- image.sizes.reduce( (result, sizeDef) => result + '(max-width: '+(sizeDef.width+200)+'px) '+sizeDef.width+'px, ', '') + ', '+ image.sizes[0].width+'px' %>"
					/>
			</div>
			<% }); %>
	</div>`

function loadPage(pageLink) {
	// remove # and append .html
	var url = pageLink.slice(1) + '/pageData.json'
	fetch(url).then(function (content) {
		return content.text()
	}).then(function (content) {
		window.scrollTo(0, 0);
		var pageData = JSON.parse(content);
		renderPage(pageData);
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
	router()
}

function renderPage(pageData) {

	var html = ejs.render(pageTemplate, pageData)
	document.querySelector('#content').innerHTML = html
}

document.addEventListener('DOMContentLoaded', init)
window.addEventListener('hashchange', router)