var fs = require('fs'),
    uuid = require('node-uuid'),
    mongoose = require('mongoose'),
    config; 

// configuration

module.exports = config = {};

config.stylesVersion = 0.1;

function getUri () {
    return 'mongodb://' + 
        this.user + ':' + 
        this.pass + '@' +
        this.host + ':' + 
        this.port + '/' + 
        this.db + '?authSource=' + 
        this.authSource;
}
config.conn = {
    user: 'fuber',
    pass: 'password',
    host: 'localhost',
    port: 27017,
    db: 'fuber',
    authSource: 'fuber',
    getUri: function () {
        return getUri.call(this);
    }
};
config.testconn = {
    user: 'fuber',
    pass: 'password',
    host: 'localhost',
    port: 27017,
    db: 'fuberTest',
    authSource: 'fuberTest',
    getUri: function () {
        return getUri.call(this);
    }
};
config.handlebars = {
    defaultLayout: 'base',
    extname: '.html',
    layoutsDir: 'views/layouts',
    partialsDir: 'views/partials'
};
config.morgan = {
    stream: fs.createWriteStream(__dirname + 
        '/logs/server.log', {flags: 'a'})
};

// var session = require('express-session'),
//     MongoStore = require('connect-mongo')(session),
// config.session = {
//     cookie: {
//         secure: false,
//         maxAge: null
//     },
//     genid: function (req) {
//         return uuid.v1();
//     },
//     name: 'fu',
//     rolling: true,
//     saveUninitialized: false,
//     resave: false,
//     secret: config.session.secret,
//     store: new MongoStore({
//         mongooseConnection: conn
//     }),
//     unset: 'destroy',
// };
