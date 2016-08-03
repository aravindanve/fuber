var models = require('../models'),
    errors = require('../errors/errors'),
    ObjectId = require('mongoose').Types.ObjectId,
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

validators.objectId = function (value, src, cb) {
    var oid;
    try {
        oid = ObjectId(value);
    } catch (e) {
        return cb(new errors.ValidationError('invalid id'));
    }
    if (!oid) {
        return cb(new errors.ValidationError('invalid id'));
    }
    return cb(null);
};