var express = require('express'),
    path = require('path'),
    favicon = require('serve-favicon'),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose'),
    session = require('express-session'),
    flash = require('connect-flash'),
    uuid = require('node-uuid'),
    MongoStore = require('connect-mongo')(session),
    helmet = require('helmet'),
    i18n = require("i18n"),
    useragent = require('express-useragent'),
    expressHandlebars = require('express-handlebars'),
    minifyHTML = require('express-minify-html'),
    form = require('express-form'),
    package = require('../package.json'),
    styles = require('../client/styles.json'),
    config = require('./loadconf'),
    handlebarsHelpers = require('./handlebars');

var debug, conn, models;

// configure app

module.exports = function (app) {

    // -------------------------------------------------------------------------

    // debug flag
    debug = app.get('env') === 'development';

    // set port
    app.set('port', process.env.PORT || config.app.port);

    // db connection
    conn = require('./dbconn')(config.db);

    // init models
    models = require('../models').__init(conn);

    // mongoose debug
    mongoose.set('debug', true);

    // -------------------------------------------------------------------------

    // logger middleware
    app.use(logger('dev'));

    // parser for json encoded query
    app.use(bodyParser.json());

    // parser for url encoded query
    app.use(bodyParser.urlencoded({extended: true}));

    // parser for cookies
    app.use(cookieParser());

    // favicon middleware
    app.use(favicon(path.join(__dirname, '..', 'public', 'favicon.png')));

    // static files middleware
    app.use(express.static(path.join(__dirname, '..', 'public')));

    // session AFTER STATIC FILES!

    // use session middleware
    app.use(session({
        cookie: {
            secure: config.site.https,
            maxAge: null
        },
        genid: function (req) {
            return uuid.v1();
        },
        name: 'ms',
        // force a cookie to be set on every response
        // this resets the expiration date.
        rolling: true,
        saveUninitialized: false,
        resave: false,
        secret: config.session.secret,
        store: new MongoStore({
            mongooseConnection: conn
        }),
        unset: 'destroy',
    }));

    // initialize flash
    app.use(flash());

    // configure passport
    require('./passport')(app);

    // configure internationalization
    i18n.configure({
        locales:['en', 'fr'],
        defaultLocale: 'en',
        cookie: 'rlab_i18n',
        extension: '.json',
        indent: '    ',
        directory: path.join(__dirname, '..', 'locales')
    });

    app.use(i18n.init); 
    // NOTE: 
    // use req.setLocale('fr'); to change
    // and set cookie
    // res.cookie('i18n', 'fr', {maxAge: 60000, httpOnly: true});

    app.use(useragent.express());

    // register handlebars engine
    app.engine('html', expressHandlebars.create({
        defaultLayout: 'base',
        extname: '.html',
        layoutsDir: 'views/layouts',
        partialsDir: 'views/partials',
        helpers: handlebarsHelpers
    }).engine);

    // setup view engine
    app.set('views', path.join(__dirname, '..', 'views', 'pages'));
    app.set('view engine', 'html');

    app.use(minifyHTML({
        override:      true,
        htmlMinifier: {
            removeComments:            true,
            collapseWhitespace:        true,
            collapseBooleanAttributes: true,
            removeAttributeQuotes:     false,
            removeEmptyAttributes:     false,
            minifyJS:                  true
        }
    }));

    // sets correct headers to avoid vulnerabilities
    app.use(helmet());

    // configure form validator
    form.configure({
        flashErrors: false
    });

    // versions
    app.use(function (req, res, next) {
        req.styles_version = styles.version || 'u';
        req.package_version = package.version || 'unknown';
        return next();
    });

    // -------------------------------------------------------------------------

};




