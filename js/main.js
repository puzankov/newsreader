(function (window, $, _) {

    var templates = {};

    function loadTemplate(id) {
        if (id in templates) {
            return;
        }
        var $templateEl = $('#' + id);
        templates[id] = _.template($templateEl.text());
        $templateEl.remove();
    }

    function loadRSS(url) {
        $.ajax({
            url: url,
            method: 'GET',
            dataType: 'json'
        }).success(function (data) {
            $('#feed').empty().html(templates['news-items'](data));
            data = null;
        });
    };

    $(function () {
        loadTemplate('news-items');
        if (window.location.hash.length > 1) {
            loadRSS('/rss/data/?kind=' + window.location.hash.substring(1));
        }
        $(window).on('hashchange', function (e) {
            var hash = window.location.hash.substring(1);
            loadRSS('/rss/data/?kind=' + hash);
        });
    });
})(window, jQuery, _);

