(function (window, $, _) {

    var templates = {};

    function loadTemplate(id) {
        if (id in templates) {
            return;
        }
        templates[id] = _.template($('#' + id).text());
    }

    function loadRSS(url) {
        $.ajax({
            url: url,
            method: 'GET',
            dataType: 'json'
        }).success(function (data) {
            $('#feed').empty().html(templates['news-items'](data));
        });
    };

    $(function () {
        loadTemplate('news-items');
        if (window.location.hash.length > 1) {
            loadRSS('http://localhost:8080?kind=' + window.location.hash.substring(1));
        }
        $(window).on('hashchange', function (e) {
            var hash = window.location.hash.substring(1);
            loadRSS('http://localhost:8080?kind=' + hash);
        });
    });
})(window, jQuery, _);

