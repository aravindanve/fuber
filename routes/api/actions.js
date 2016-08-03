var express = require('express'),
    router = express.Router(),
    models = require('../../models'),
    validators = require('../../validators'),
    errors = require('../../errors/errors'),
    form = require('express-form'),
    field = form.field;

module.exports = router;

router.get('/getCars', form(
    field('active')

), function (req, res, next) {
    var query = {
        location: {$size: 2}
    };
    if (!req.form.active) {
        query.ride = null;
    }
    models.Car.find(query, function (err, results) {
        if (err) {
            return next(err);
        }
        return res.success({
            status: 'available',
            message: 'cars available are shown on the map',
            cars: results
        });
    });
});

router.get('/getUsers', function (req, res, next) {
    models.User.find().exec(function (err, results) {
        if (err) {
            return next(err);
        }
        return res.success({
            status: 'available',
            message: 'users available shown in the side panel',
            users: results
        });
    });
});

router.put('/requestCar', form(
    field('userId')
        .trim()
        .required()
        .custom(validators.objectId),
    field('lng')
        .required()
        .isNumeric(),
    field('lat')
        .required()
        .isNumeric(),
    field('pink')

), function (req, res, next) {
    if (req.form.isValid) {

        var query = {
            ride: null,
            location: {$near: [
                req.form.lng, req.form.lat
            ]}
        };

        if ('true' == req.form.pink) {
            query.isPink = true;
        }

        models.User.findOne({
            _id: req.form.userId
        
        }, function (err, user) {
            if (err) {
                return next(err);
            }
            if (!user) {
                return next(new errors.ResourceNotFoundError(
                    'user does not exist'));
            }
            if (user.ride) {
                return next(new errors.ValidationError(
                    'user already in car'));
            }
            models.Car.findOne(query, function (err, car) {
                if (err) {
                    return next(err);
                }
                if (!car) {
                    return res.success({
                        status: 'unavailable',
                        message: 'sorry, no cars available ' + 
                            'near you right now.',
                        ride: null
                    });
                }
                car.startRide([
                    req.form.lng, req.form.lat

                ], user, {
                    pinkCarRequested: query.isPink

                }, function (err, ride) {
                    if (err) {
                        return res.success({
                            status: 'unavailable',
                            message: 'sorry, no cars available ' + 
                                'near you right now.',
                            ride: null
                        });
                    }
                    return res.success({
                        status: 'rideStarted',
                        message: 'your ride has started, ' + 
                            'click anywhere on the map to stop ride.',
                        ride: ride
                    });
                });
            });
        });

    } else {
        return next(new errors.ValidationError(
            req.form.errors[0]));
    }
});

router.put('/stopRide', form(
    field('rideId')
        .trim()
        .required()
        .custom(validators.objectId),
    field('lng')
        .required()
        .isNumeric(),
    field('lat')
        .required()
        .isNumeric()

), function (req, res, next) {
    if (req.form.isValid) {
        models.Ride.findOne({
            _id: req.form.rideId

        }).populate('car user').exec(function (err, ride) {
            if (err) {
                return next(err);
            }
            if (!ride) {
                return next(new errors.ResourceNotFoundError(
                    'ride does not exist'));
            }
            if (!(ride.car.ride && ride.user.ride)) {
                return next(new errors.ValidationError(
                    'ride already ended'));
            }
            ride.stopRide([
                req.form.lng, req.form.lat

            ], function (err, ride) {
                if (err) {
                    return next(err);
                }
                return res.success({
                    status: 'rideEnded',
                    message: 'your ride has ended',
                    ride: ride
                });
            });
        });

    } else {
        return next(new errors.ValidationError(
            req.form.errors[0]));
    }
});





// eof 