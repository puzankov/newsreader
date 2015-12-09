'use strict';

var http = require('http');
var FeedParser = require('feedparser');
var _ = require('underscore');
var request = require('request');
var url = require('url');

var FEED_CACHE_TIME = 600000;

var feeds = {
    'habr': {
        url: 'http://habrahabr.ru/rss/feed/posts/c8cc8e394b19eb82b62452acf4c72e72/',
        updatedAt: null,
        items: null
    },
    'sm': {
        url: 'http://www.smashingmagazine.com/feed/',
        updatedAt: null,
        items: null
    },
    'fe': {
        url: 'http://frontendfront.com/feed/stories',
        updatedAt: null,
        items: null
    }
};

var port = process.env.PORT || 8080;

function fetchFeedFromRSS(url, cb) {
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
          }
        }
    });

    feedparser.on('end', function () {
        cb(null, items);
    });
}

function fetchFeed(id, cb) {
    var feedObj = feeds[id];
    if (!feedObj) {
        cb(new Error('Invalid feed'));
        return;
    }
    if (feedObj.updatedAt === null || (Date.now() - feedObj.updatedAt) > FEED_CACHE_TIME) {
        fetchFeedFromRSS(feedObj.url, function (err, data) {
            if (err) {
                cb(err);
                return;
            }
            feedObj.items = data;
            feedObj.updatedAt = Date.now();
            cb(null, data);
        });
    } else {
        cb(null, feedObj.items);
    }
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
    fetchFeed(query.kind || 'habr', function (err, data) {
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
