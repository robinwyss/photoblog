function loadPage(pageLink) {
    // remove # and append .html
    var url = pageLink.slice(1) + '.html';
    fetch(url).then(function (content) {
        return content.text();
    }).then(function (content) {
        return document.querySelector('#content').innerHTML = content;
    }).catch(function (error) {
        console.error(error);
    });
}

function getRelativeUrl(link) {
    var url = link.href
    if (url.startsWith(link.baseURI)) {
        return url.substring(link.baseURI.length);
    } else {
        return url;
    }
}

function router() {
    var pages = document.querySelectorAll('#menu li');
    // Current route url (getting rid of '#' in hash as well):
    var url = location.hash;
    if (url) {
        loadPage(url);
    } else {
        // no page specified, load the latest one (first in the list)
        var firstPageLink = pages[0].querySelector('a');
        var firstPageUrl = getRelativeUrl(firstPageLink);
        loadPage(firstPageUrl);
    }
}
function init() {
    var pages = document.querySelectorAll('#menu li a');
    // prepend menu links with #, this allows to have a fallback if js is disabled
    pages.forEach(function (link) {
        var url = getRelativeUrl(link)
        // remove .html extension
        url = url.substring(0, url.length - 5);
        // prepend # and remove .html ending
        link.href = '#' + url;
    });
    router();
}
document.addEventListener("DOMContentLoaded", init);
window.addEventListener('hashchange', router);