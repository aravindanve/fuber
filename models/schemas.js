var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    errors = require('../errors/errors'),
    schemas;

// schemas

module.exports = schemas = {};

// cars

schemas.Car = new Schema({
    driver: {
        type: String, 
        required: true
    },
    location: [Number],
    isPink: {
        type: Boolean, 
        required: true, 
        default: false
    },
    ride: {
        type: ObjectId, 
        ref: 'Ride', 
        default: null
    }
});

schemas.Car.index({
    location: '2d'
});

// users

schemas.User = new Schema({
    username: {
        type: String, 
        required: true, 
        unique: true,
        validate:  function (value) {
            return /^[a-z][._a-z0-9]*$/i.test(value);
        }
    },
    ride: {
        type: ObjectId, 
        ref: 'Ride', 
        default: null
    }
});

// rides

schemas.Ride = new Schema({
    car: {
        type: ObjectId, 
        ref: 'Car', 
        required: true
    },
    user: {
        type: ObjectId, 
        ref: 'User', 
        required: true
    },
    pinkCarRequested: {
        type: Boolean, 
        default: false, 
        required: true
    },
    startLocation: [Number],
    startTime: {
        type: Date, 
        default: Date.now(), 
        required: true
    },
    stopLocation: [Number],
    stopTime: {
        type: Date, 
        default: null
    },
    distance: Number,
    time: Number,
    tripCost: Number
});

// methods

schemas.Car.methods.startRide = function (location, user, options, cb) {
    options = options || {};
    options.pinkCarRequested || (
        options.pinkCarRequested = false
    );
    if (!(location && location[0] && location[1])) {
        return cb(new errors.ValidationError('invalid location'));
    }
    var car = this,
        Ride = this.model('Ride'),
        ride = new Ride({
            car: this._id,
            user: user._id,
            pinkCarRequested: options.pinkCarRequested,
            startLocation: [location[0], location[1]],
            startTime: Date.now()
        });
    ride.save(function (err, ride) {
        if (err) {
            return cb(err);
        }
        car.ride = ride;
        car.location = [location[0], location[1]];
        car.save(function (err, car) {
            if (err) {
                return cb(err);
            }
            user.ride = ride;
            user.save(function (err, user) {
                if (err) {
                    return cb(err);
                }
                return cb(null, ride);
            });
        });
    });
};

schemas.Ride.methods.stopRide = function (location, cb) {
    if (!location) {
        location = this.startLocation;
    }
    if (!(location && location[0] && location[1])) {
        return cb(new errors.ValidationError('invalid location'));
    }
    this.stopLocation = [location[0], location[1]];
    this.stopTime = Date.now();

    // NOTE:
    // considering 1 deg of longitude and 
    // latitude to be 100kms for simplicity
    var distance = Math.sqrt(
            Math.pow(this.stopLocation[0] - this.startLocation[0], 2) + 
            Math.pow(this.stopLocation[1] - this.startLocation[1], 2)) * 100,
        time = (this.stopTime - this.startTime) / 60000,
        pinkCharge = this.pinkCarRequested? 5 : 0,
        tripCost = Math.round(
            (1 * time) + (2 * distance) + pinkCharge);

    this.distance = distance;
    this.time = time;
    this.tripCost = tripCost;
    this.save(function (err, ride) {
        if (err) {
            return cb(err);
        }
        ride.model('User').update({
            _id: ride.user

        }, {
            $set: {ride: null}

        }, function (err, affected) {
            if (err) {
                return cb(err);
            }
            ride.model('Car').update({
                _id: ride.car

            }, {
                $set: {ride: null, 
                location: [location[0], location[1]]
            }

            }, function (err, affected) {
                if (err) {
                    return cb(err);
                }
                return cb(null, ride);
            });
        });
    });
};






