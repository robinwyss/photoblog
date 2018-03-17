function loadPage(pageLink) {
    // remove # and append .html
    var url = pageLink.slice(1) + '.html';
    fetch(url).then(function (content) {
        return content.text();
    }).then(function (content) {
        window.scrollTo(0, 0);
        var parsedContent = applyLazyLoad(content)
        document.querySelector('#content').innerHTML = parsedContent;
        window.lazyLoadInstance.update();
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
    initLazyLoad().then(function(){
        router();
    });
}

function initLazyLoad() {
    return new Promise(function (resolve) {
        // Listen to the Initialized event
        window.addEventListener('LazyLoad::Initialized', function (e) {
            // Get the instance and puts it in the lazyLoadInstance variable
            window.lazyLoadInstance = e.detail.instance;
            resolve();
        }, false);

        // Set the lazyload options for async usage
        // lazyLoadOptions = {
        //     class_loaded: "loaded"
        //     /* your lazyload options */
        // };
    });
}

function applyLazyLoad(content) {
    var wrapper = document.createElement('div');
    wrapper.innerHTML = content;
    wrapper.querySelectorAll('picture').forEach(pic => {
        var placeholderImg = pic.querySelector('source.placeholderImg');
        var img = pic.querySelector('img');
        img.setAttribute('data-src', img.src);
        img.src = placeholderImg.srcset;
        pic.querySelectorAll('source').forEach(source => {
            source.setAttribute('data-srcset', source.srcset)
            source.srcset = '';
        })
    });
    return wrapper.innerHTML;
}

document.addEventListener("DOMContentLoaded", init);
window.addEventListener('hashchange', router);