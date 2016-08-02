var express = require('express'),
    path = require('path'),
    favicon = require('serve-favicon'),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose'),
    handlebars = require('express-handlebars');

var app = express(),
    config = require('./config'),
    routes = require('./routes'),
    errors = require('./errors');

var env = app.get('env'),
    test = env === 'test',
    debug = test || env === 'development';

mongoose.Promise = global.Promise; // mpromise deprecated

var conn;
if (test) {
    conn = mongoose.createConnection(
        config.testconn.getUri());

} else {
    conn = mongoose.createConnection(
        config.conn.getUri());
}

var models = require('./models').__init(conn);

app.engine('html', handlebars.create(config.handlebars).engine);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');

app.use(logger('combined', config.morgan));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
// app.use(session(config.session));

app.use('/', routes.pages);
app.use('/api', routes.api); 

errors(app, debug);

module.exports = app;
