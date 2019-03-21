!function(window, addEventListener, getElementById, widgetId) {
    addEventListener('message', function(e) {
        if (e.origin.split('://')[1] !== 'wuddrum.github.io') return;
        getElementById(widgetId).style.height = e.data + 'px';
    });
    addEventListener('load', function() {
        var widget = getElementById(widgetId);
        var onWindowScroll = function() {
            var widgetRect = widget.getBoundingClientRect();
            if (widgetRect.right > 0 && widgetRect.left < window.innerWidth && widgetRect.bottom > 0 && widgetRect.top < window.innerHeight) {
                window.removeEventListener('scroll', onWindowScroll);
                widget.contentWindow.postMessage(86901, '*');
            }
        }
        addEventListener('scroll', onWindowScroll);
        onWindowScroll();
    });
}(window, window.addEventListener.bind(window), document.getElementById.bind(document), 'NewsWidget');
