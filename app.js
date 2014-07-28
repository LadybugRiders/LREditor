"use strict";

var express = require('express');
var http = require('http');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');

var routes = require('./routes');

var EditorServerAPI = require('editorserverapi');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'app/'));
app.set('view engine', 'ejs');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(methodOverride());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'app/')));
app.use(app.router);

// routes
app.get('/', function(req, res) {
    res.redirect('/editor');
});
app.get('/editor', routes.editor.index);
app.get('/game', routes.game.index);

/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// EditorServerAPI
var editorServerAPI = new EditorServerAPI(app);
editorServerAPI.routing();

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.render('shared/error', {
            message: err.message,
            error: err
        });

        next(err);
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
