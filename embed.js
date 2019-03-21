!function(window, document) {
    var getElementById = document.getElementById.bind(document);
    var getElementsByClassName = document.getElementsByClassName.bind(document);

    var getApi = function(endpoint, onsuccess, onerror) {
        var req = new XMLHttpRequest();

        req.onreadystatechange = function() {
            if (this.readyState !== 4) return;

            var responseText = this.responseText;
            if (this.status !== 200 || responseText.length === 0) {
                if (typeof onerror === 'function') {
                    onerror();
                }
                return;
            }

            if (typeof onsuccess === 'function') {
                onsuccess(responseText);
            }
        }

        req.open('GET', endpoint);
        req.send();
    }

    var loadArticles = function() {
        var tileEls = createAndInsertTiles(numItems);
        getApi('fakeapi/articles/' + params.id, function(responseText) {
            populateTiles(tileEls, JSON.parse(responseText));
        }, function() {
            populateTiles(tileEls, []);
        });
    }

    var loadConfig = function() {
        getApi('fakeapi/config/' + params.id, function(responseText) {
            config = JSON.parse(responseText);
            if (config.readMoreHref) {
                getElementById('readmore').setAttribute('href', config.readMoreHref);
            }
        });
    }

    var trackingLoaded = false;
    var loadTracking = function() {
        if (trackingLoaded) return;
        trackingLoaded = true;
        var scriptEl = document.createElement('script');
        scriptEl.src = 'fakeapi/tracking/' + params.id;
        document.body.appendChild(scriptEl);
    }

    var getUriParamDictionary = function (uri) {
        var paramRegex = new RegExp(/[&?;]([^&?#;]*?)=([^&?#;]*)/g);
        var paramDictionary = {};
    
        while (match = paramRegex.exec(uri)) {
            paramDictionary[match[1]] = match[2];
        }
    
        return paramDictionary;
    }
    
    var calculateGridClasses = function(maxItemsPerRow) {
        // xs will always contain only 1 tile
        var result = 'xs-1 ';
        var midSegmentLength = (maxItemsPerRow - 1) / 4;
    
        // calculate the remaining tile sizes for sm, md and lg
        ['sm-', 'md-', 'lg-'].forEach(function(item, index) {
            // double negative for Math.round to make it round down on .5 cases
            result += item + (-Math.round(-(midSegmentLength * (index + 1) + 1))) + ' ';
        });
    
        // xl will always be the maximum per row that a user has specified
        result += 'xl-' + maxItemsPerRow;
        return result;
    }

    var createAndInsertTiles = function(tileCount) {
        var dummyTileEl = getElementById('dummy');
        var tileEls = [];
        for (var i = 0; i < tileCount; i++) {
            var tileEl = dummyTileEl.cloneNode(true);
            tileEl.className = gridClasses;
            tileEl.id = '';
            dummyTileEl.parentNode.insertBefore(tileEl, dummyTileEl);
            tileEls.push(tileEl);
        }
    
        onResize();
        return tileEls;
    }
    
    var populateTiles = function(tileEls, articles) {
        for (var i = Math.min(articles.length, tileEls.length); i--;) {
            var getTileElementsByClassName = tileEls[0].getElementsByClassName.bind(tileEls[0]);
            getTileElementsByClassName('link')[0].href = '#';
            // background color and image have to be set separately, due to compatibility issues
            getTileElementsByClassName('content')[0].style.backgroundColor = articles[0].color;
            getTileElementsByClassName('content')[0].style.backgroundImage = 'url("img/' + articles[0].id + '.jpg")';
            getTileElementsByClassName('title')[0].innerHTML = truncateString(articles[0].title, 64);
            getTileElementsByClassName('description')[0].innerHTML = truncateString(articles[0].description, 220);
            addClass(getTileElementsByClassName('spinner')[0], 'hidden');
            removeClass(getTileElementsByClassName('info')[0], 'hidden');
    
            tileEls.shift();
            articles.shift();
        }
    
        if (tileEls.length > 0) {
            // clean up any spinner tiles, if there's less articles than expected
            tileEls.forEach(function(tileEl) {
                tileEl.parentNode.removeChild(tileEl);
            });
            // resize to remove any possible leftover whitespace
            onResize();
        }
    }

    var addClass = function(el, cls) {
        el.className += ' ' + cls;
    }

    var removeClass = function(el, cls) {
        el.className = el.className.split(' ').filter(function(c) { return c !== cls; }).join(' ');
    }
    
    var truncateString = function(str, charLimit) {
        return str.length > charLimit ? str.substr(0, charLimit - 4) + '...' : str;
    }
    
    var onResize = function() {
        var container = getElementById('container');
        container.style.fontSize = getElementsByClassName('tile')[0].clientWidth * 0.0388 + 'px';
        window.parent.postMessage(container.offsetHeight, '*');
    }

    var onMessage = function(e) {
        if (e.data == 86901) {
            loadTracking();
        }
    }
    
    var config;
    var params = getUriParamDictionary(window.location.href);
    // clamp max items per row between 1 and 8, or if it's not a number, set it to 4
    var maxItemsPerRow = Math.min(Math.max((+params['maxItemsPerRow']) || 4, 1), 8);
    // clamp num items between 1 and 64, or if it's not a number, set it to 2 * max items per row
    var numItems = Math.min(Math.max((+params['numItems']) || maxItemsPerRow * 2, 1), 64);
    var gridClasses = calculateGridClasses(maxItemsPerRow);
    
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);
    window.addEventListener('message', onMessage);

    loadArticles();
    loadConfig();
}(window, document);