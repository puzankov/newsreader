'use strict';

var http = require('http');
var FeedParser = require('feedparser');
var _ = require('underscore');
var request = require('request');
var url = require('url');

var feeds = {
    'habr': 'http://habrahabr.ru/rss/feed/posts/c8cc8e394b19eb82b62452acf4c72e72/',
    'pravda': 'http://www.pravda.com.ua/rss/'
};

var port = process.env.PORT || 8080;

function fetchFeed(url, cb) {
    var items = [];
    var req = request(url);
    var feedparser = new FeedParser();

    req.on('error', cb);

    req.on('response', function (res) {
      var stream = this;
      if (res.statusCode != 200) {
        console.log(res.text);
        return;
      }
      stream.pipe(feedparser);
    });

    feedparser.on('error', cb);

    feedparser.on('readable', function() {
      var stream = this;
      var meta = this.meta;
      var item;

      while (item = stream.read()) {
          if (item) {
              items.push(_.pick(item, "title", "summary", "guid", "description", "author", "pubDate", "image"));
          };
      };
    });

    feedparser.on('end', function () {
        cb(null, items);
    });
}

function sendResponse(res, body, code) {
    code = code || 200;
    res.writeHead(code, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
    });
    res.end(JSON.stringify(body));
}

http.createServer(function (req, res) {
    var query = url.parse(req.url, true).query;
    fetchFeed(feeds[query.kind || 'habr'], function (err, data) {
        if (err) {
            console.log(err);
            sendResponse(res, {
                type: 'error',
                code: 500,
                details: err.toString()
            }, 500);
            return;
        }
        sendResponse(res, {
            items: data
        });
    });
}).listen(port);

console.log('Listening on port: ', port);
