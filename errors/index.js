// error handlers

module.exports = function (app, debug) {
    app.use(function(req, res, next) {
        var err = new Error('Not Found');
        err.status = 404;
        next(err);
    });

    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        if (res._json_only) {
            return res.json({
                error: true,
                status: err.status,
                name: err.name,
                message: err.message
            });
        } else {
            res.render('error', {
                message: err.message,
                error: debug? err : {}
            });
        }
    });
};



