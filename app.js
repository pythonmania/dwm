"use strict";
/**
 * Module dependencies.
 */

var express = require('express'),
    routes = require('./routes');

var app = module.exports = express.createServer();

// Configuration
app.configure(function() {
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.static(__dirname + '/public'));
    app.use(express.cookieParser());
    app.use(express.session({
        secret: "keyboard cat"
    }));
    app.use(app.router);
});

app.configure('development', function() {
    app.use(express.errorHandler({
        dumpExceptions: true,
        showStack: true
    }));
});

app.configure('production', function() {
    app.use(express.errorHandler());
});

// Routes
app.get('/', routes.index);
app.post('/login', routes.login);
app.get('/logout', routes.logout);
app.get('/main', routes.main);
app.get('/online', routes.online);
app.get('/chat/:uids', routes.chat);
app.get('/search/:keyword', routes.search);

require('./socket').listen(app);

app.listen(4000, function() {
    console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});