var express = require('express'),
    router = express.Router(),
    models = require('../../models'),
    validators = require('../../validators'),
    errors = require('../../errors/errors'),
    form = require('express-form'),
    field = form.field;

module.exports = router;

router.route('/')

    // create
    .post(form(
        field('username')
            .trim()
            .required()
            .custom(validators.usernameAvailable)

    ), function (req, res, next) {
        if (req.form.isValid) {
            var user = new models.User({
                username: req.form.username
            });
            user.save(function (err, result) {
                if (err) {
                    return next(err);
                }
                return res.created({
                    message: 'user successfully created',
                    user: result
                });
            });

        } else {
            return next(new errors.ValidationError(
                req.form.errors[0]));
        }
    })

    // update
    .put(form(
        field('id')
            .trim()
            .required(),
        field('username')
            .trim()
            .custom(validators.usernameAvailable)

    ), function (req, res, next) {
        if (req.form.isValid) {
            models.User.findOne({
                _id: req.form.id

            }, function (err, result) {
                if (err) {
                    return next(err);
                }
                if (!result) {
                    return next(new errors.ResourceNotFoundError(
                        'user does not exist'));
                }

                req.form.username && (
                    result.username = req.form.username);

                result.save(function (err, result) {
                    if (err) {
                        return next(err);
                    }
                    return res.success({
                        user: result
                    });
                });
            });

        } else {
            return next(new errors.ValidationError(
                req.form.errors[0]));
        }
    })

    // read
    .get(form(
        field('username')
            .trim()
            .required()

    ), function (req, res, next) {
        if (req.form.isValid) {
            models.User.findOne({
                username: req.form.username

            }, function (err, result) {
                if (err) {
                    return next(err);
                }
                if (!result) {
                    return next(new errors.ResourceNotFoundError(
                        'user does not exist'));
                }
                return res.success({
                    user: result
                });
            });

        } else {
            return next(new errors.ValidationError(
                req.form.errors[0]));
        }
    })

    // delete
    .delete(form(
        field('username')
            .trim()
            .required()

    ), function (req, res, next) {
        if (req.form.isValid) {
            models.User.findOne({
                username: req.form.username

            }, function (err, user) {
                if (err) {
                    return next(err);
                }
                if (!user) {
                    return next(new errors.ResourceNotFoundError(
                        'user does not exist'));
                }
                function deleteUser() {
                    user.remove(function (err) {
                        if (err) {
                            return next(err);
                        }
                        return res.deleted({
                            message: 'user successfully deleted'
                        });
                    });
                }
                if (user.ride) {
                    models.Ride.findOne({
                        _id: user.ride

                    }, function (err, ride) {
                        if (err) {
                            return next(err);
                        }
                        if (!ride) {
                            return deleteUser();
                        }
                        ride.stopRide(null, function (err, ride) {
                            if (err) {
                                return next(err);
                            }
                            return deleteUser();
                        });
                    });

                } else {
                    return deleteUser();
                }
            });

        } else {
            return next(new errors.ValidationError(
                req.form.errors[0]));
        }
    });


// eof 