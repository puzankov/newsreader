'use strict';

var connect = require('connect');
var serveStatic = require('serve-static');
var port = process.env.PORT || 8888;
connect().use('/rss/', serveStatic(__dirname)).listen(port);
console.log('Listening on port:', port);
