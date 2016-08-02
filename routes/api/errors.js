var errors = require('../../errors/errors');

// api error handlers

module.exports = function (router) {
    router.use(function(req, res, next) {
        next(new errors.BadRequest());
    });

    router.use(function(err, req, res, next) {
        res.header('Content-Type', 'application/json');
        res.status(err.status || 500);
        return res.json({
            error: true,
            status: err.status,
            name: err.name,
            message: err.message
        });
    });
};