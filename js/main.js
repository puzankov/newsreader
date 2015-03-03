(function (window, $, _) {

    var templates = {};
    var feeds = {
        'habr': 'http://habrahabr.ru/rss/feed/posts/c8cc8e394b19eb82b62452acf4c72e72/',
        'pravda': 'http://www.pravda.com.ua/rss/'
    }

    function loadTemplate(id) {
        if (id in templates) {
            return;
        }
        templates[id] = _.template($('#' + id).text());
    }

    function parseRSS(data) {
        var $xml = $.parseXML(data);
        return $xml.find('channel').children('item').map(function (index, el) {
            return {
                title: el.find('title').text(),
                author: el.find('author').text(),
                description: el.find('description').text(),
                link: el.find('link').text()
            };
        }).get();
    }

    function loadRSS(url) {
        return $.ajax({
            url: url,
            method: 'GET',
            converters: {
                'text xml': parseRSS
            }
        });
    };

    $(function () {
        loadTemplate('news-items');
        $(window).on('hashchange', function (e) {
            var hash = window.location.hash.substring(1);

            if (hash in feeds) {
                loadRSS(feeds[hash]).success(function (data) {
                    $('#feed').empty().html(templates['news-items'](data));
                });
            }
        });
    });
})(window, jQuery, _);

