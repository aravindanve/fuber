var models = require('../models'),
    errors = require('../errors/errors'),
    validators;

module.exports = validators = {};

// validation functions

validators.usernameAvailable = function (value, src, cb) {
    models.User.find({
        username: value

    }).exec(function (err, results) {
        if (err) {
            return cb(err);
        }
        if (results && results.length) {
            return cb(new errors.ValidationError('username exists'));
        }
        return cb(null);
    });
};