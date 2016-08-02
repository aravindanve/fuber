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
        field('driver')
            .trim()
            .required(),
        field('pink')

    ), function (req, res, next) {
        if (req.form.isValid) {
            var car = new models.Car({
                driver: req.form.driver,
                location: [],
                isPink: req.form.pink == 'true'
            });
            car.save(function (err, result) {
                if (err) {
                    return next(err);
                }
                return res.created({
                    message: 'car successfully created',
                    car: result
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
        field('driver')
            .trim(),
        field('pink')

    ), function (req, res, next) {
        if (req.form.isValid) {
            models.Car.findOne({
                _id: req.form.id

            }, function (err, result) {
                if (err) {
                    return next(err);
                }
                if (!result) {
                    return next(new errors.ResourceNotFoundError(
                        'car does not exist'));
                }

                req.form.driver && (result.driver = req.form.driver);
                req.form.pink == 'true' && (result.isPink = true);
                req.form.pink == 'false' && (result.isPink = false);
                result.save(function (err, result) {
                    if (err) {
                        return next(err);
                    }
                    return res.success({
                        car: result
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
        field('id')
            .trim()
            .required()

    ), function (req, res, next) {
        if (req.form.isValid) {
            models.Car.findOne({
                _id: req.form.id

            }, function (err, result) {
                if (err) {
                    return next(err);
                }
                if (!result) {
                    return next(new errors.ResourceNotFoundError(
                        'car does not exist'));
                }
                return res.success({
                    car: result
                });
            });

        } else {
            return next(new errors.ValidationError(
                req.form.errors[0]));
        }
    })

    // delete
    .delete(form(
        field('id')
            .trim()
            .required()

    ), function (req, res, next) {
        if (req.form.isValid) {
            models.Car.findOne({
                _id: req.form.id

            }, function (err, car) {
                if (err) {
                    return next(err);
                }
                if (!car) {
                    return next(new errors.ResourceNotFoundError(
                        'car does not exist'));
                }
                function deleteCar() {
                    car.remove(function (err) {
                        if (err) {
                            return next(err);
                        }
                        return res.deleted({
                            message: 'car successfully deleted'
                        });
                    });
                }
                if (car.ride) {
                    models.Ride.findOne({
                        _id: car.ride

                    }, function (err, ride) {
                        if (err) {
                            return next(err);
                        }
                        if (!ride) {
                            return deleteCar();
                        }
                        ride.stopRide(null, function (err, ride) {
                            if (err) {
                                return next(err);
                            }
                            return deleteCar();
                        });
                    });
                    
                } else {
                    return deleteCar();
                }
                
            });

        } else {
            return next(new errors.ValidationError(
                req.form.errors[0]));
        }
    });


router.route('/location')

    // update location
    .put(form(
        field('id')
            .trim()
            .required(),
        field('lng')
            .required()
            .isNumeric(),
        field('lat')
            .required()
            .isNumeric()

    ), function (req, res, next) {
        if (req.form.isValid) {
            models.Car.findOne({
                _id: req.form.id

            }, function (err, result) {
                if (err) {
                    return next(err);
                }
                if (!result) {
                    return next(new errors.ResourceNotFoundError(
                        'car does not exist'));
                }

                result.location = [
                    req.form.lng, req.form.lat
                ];

                result.save(function (err, result) {
                    if (err) {
                        return next(err);
                    }
                    return res.success({
                        car: result
                    });
                });
            });

        } else {
            return next(new errors.ValidationError(
                req.form.errors[0]));
        }
    });


// eof 