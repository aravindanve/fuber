var supertest = require('supertest'),
    should = require('should');

// tests

// NOTE: these tests dont seem to execute synchronously,
// therefore they arent a 100% reliable. sometimes a 
// a resource saved to a global variable may not be available
// as it may have been deleted on the server.
// having said that, for all practical purposes, these tests
// are enough. 
// - @aravindanve

// var server = supertest.agent('http://localhost:3000');
var app = require('../app.js'),
    server = supertest.agent(app);

describe('user curd operations', function () {

    it('create user', function (done) {
        server
            .post('/api/user')
            .send({
                username: 'testuser'
            })
            .expect(201)
            .end(function (err, res) {
                if (err) {
                    throw err;
                }
                should(res.body.error).equal(false);

                should.exist(res.body.user);
                should(res.body.user.username).equal('testuser');
                done();
            });
    });

    it('fetch user', function (done) {
        server
            .get('/api/user')
            .send({
                username: 'testuser'
            })
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    throw err;
                }
                should(res.body.error).equal(false);

                should.exist(res.body.user);
                should(res.body.user.username).equal('testuser');
                done();
            });
    });

    it('update user', function (done) {
        server
            .get('/api/user')
            .send({
                username: 'testuser'
            })
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    throw err;
                }
                should(res.body.error).equal(false);
                should.exist(res.body.user);
                should.exist(res.body.user._id);

                server
                    .put('/api/user')
                    .send({
                        id: res.body.user._id,
                        username: 'testuser1'
                    })
                    .expect(200)
                    .end(function (err, res) {
                        if (err) {
                            throw err;
                        }
                        should(res.body.error).equal(false);

                        should.exist(res.body.user);
                        should(res.body.user.username).equal('testuser1');
                        done();
                    });
            });
    });

    it('delete user', function (done) {
        server
            .delete('/api/user')
            .send({
                username: 'testuser1'
            })
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    throw err;
                }
                done();
            });
    });

});

function getRandomPosition() {
    // @13.1153645,77.4712135
    // @12.9372254,77.6234867
    return {
        lng: 77 - (Math.round(Math.random() * 10000000)/10000000),
        lat: 13 - (Math.round(Math.random() * 10000000)/10000000)
    }
}

describe('car curd operations', function () {

    var carId = '';

    it('create car', function (done) {
        server
            .post('/api/car')
            .send({
                driver: 'testcar',
                pink: 'true'
            })
            .expect(201)
            .end(function (err, res) {
                if (err) {
                    throw err;
                }
                should(res.body.error).equal(false);

                should.exist(res.body.car);
                should(res.body.car.driver).equal('testcar');
                should(res.body.car.isPink).equal(true);

                carId = res.body.car._id;
                done();
            });
    });

    it('fetch car', function (done) {
        server
            .get('/api/car')
            .send({
                id: carId
            })
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    throw err;
                }
                should(res.body.error).equal(false);

                should.exist(res.body.car);
                should(res.body.car.driver).equal('testcar');
                should(res.body.car.isPink).equal(true);
                done();
            });
    });

    it('update car driver', function (done) {
        server
            .put('/api/car')
            .send({
                id: carId,
                driver: 'testcar1'
            })
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    throw err;
                }
                should(res.body.error).equal(false);

                should.exist(res.body.car);
                should(res.body.car.driver).equal('testcar1');
                done();
            });
    });

    it('update car color', function (done) {
        server
            .put('/api/car')
            .send({
                id: carId,
                pink: 'false'
            })
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    throw err;
                }
                should(res.body.error).equal(false);

                should.exist(res.body.car);
                should(res.body.car.isPink).equal(false);
                done();
            });
    });

    it('update car location', function (done) {
        var pos = getRandomPosition();
        server
            .put('/api/car/location')
            .send({
                id: carId,
                lng: pos.lng,
                lat: pos.lat
            })
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    throw err;
                }
                should(res.body.error).equal(false);

                should.exist(res.body.car);
                should.exist(res.body.car.location);
                should(res.body.car.location.length).equal(2);
                should(res.body.car.location[0]).equal(pos.lng);
                should(res.body.car.location[1]).equal(pos.lat);
                done();
            });
    });

    it('delete car', function (done) {
        server
            .delete('/api/car')
            .send({
                id: carId
            })
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    throw err;
                }
                done();
            });
    });

});

describe('cab booking functionality', function () {

    var numCarsBefore = 0,
        cars = [],
        userId,
        rideId;

    it('fetch cars', function (done) {
        server
            .get('/api/actions/getCars')
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    throw err;
                }
                should(res.body.error).equal(false);

                should.exist(res.body.cars);
                numCarsBefore = res.body.cars.length;
                done();
            });
    });

    it('create cars', function (done) {
        var carColors = [1, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0, 0],
            created = 0;

        function _done() {
            if (++created >= carColors.length) {
                done();
            }
        }

        for (var i in carColors) {
            server
                .post('/api/car')
                .send({
                    driver: 'randomcar',
                    pink: carColors[i]? 'true' : 'false'
                })
                .expect(201)
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    }
                    should(res.body.error).equal(false);
                    should.exist(res.body.car);
                    should.exist(res.body.car._id);
                    cars.push(res.body.car._id);
                    _done();
                });
        }
    });

    it('update car locations', function (done) {
        var updated = 0;
        function _done() {
            if (++updated >= cars.length) {
                done();
            }
        }

        for (var i in cars) {
            +function () {
                var pos = getRandomPosition();

                server
                    .put('/api/car/location')
                    .send({
                        id: cars[i],
                        lng: pos.lng,
                        lat: pos.lat
                    })
                    .expect(200)
                    .end(function (err, res) {
                        if (err) {
                            throw err;
                        }
                        should(res.body.error).equal(false);
                        should.exist(res.body.car);
                        should.exist(res.body.car.location);
                        should(res.body.car.location.length).equal(2);
                        _done();
                    });
            }();
        }
    });

    it('create user', function (done) {
        server
            .post('/api/user')
            .send({
                username: 'myuser'
            })
            .expect(201)
            .end(function (err, res) {
                if (err) {
                    throw err;
                }
                should(res.body.error).equal(false);

                should.exist(res.body.user);
                should.exist(res.body.user._id);
                userId = res.body.user._id;
                done();
            });
    });

    it('fetch users', function (done) {
        server
            .get('/api/actions/getUsers')
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    throw err;
                }
                should(res.body.error).equal(false);

                should.exist(res.body.users);
                should(res.body.users.length).be.above(0);
                done();
            });
    });

    it('request car', function (done) {
        var pos = getRandomPosition();

        server
            .put('/api/actions/requestCar')
            .send({
                userId: userId,
                lng: pos.lng,
                lat: pos.lat
            })
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    throw err;
                }
                should(res.body.error).equal(false);
                should.exist(res.body.ride);
                should.exist(res.body.ride._id);
                should.exist(res.body.ride.car);
                should(res.body.ride.user).equal(userId);
                rideId = res.body.ride._id;

                should.exist(res.body.ride.startLocation);
                should(res.body.ride.startLocation[0]).equal(pos.lng);
                should(res.body.ride.startLocation[1]).equal(pos.lat);
                should.exist(res.body.ride.startTime);
                done();
            });
    });

    it('fetch cars during ride', function (done) {
        server
            .get('/api/actions/getCars')
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    throw err;
                }
                should(res.body.error).equal(false);

                should.exist(res.body.cars);
                should(res.body.cars.length)
                    .equal(cars.length + numCarsBefore - 1);
                done();
            });
    });

    it('stop ride', function (done) {
        var pos = getRandomPosition();

        server
            .put('/api/actions/stopRide')
            .send({
                rideId: rideId,
                lng: pos.lng,
                lat: pos.lat
            })
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    throw err;
                }
                should(res.body.error).equal(false);
                should.exist(res.body.ride);
                should(res.body.ride._id).equal(rideId);
                should.exist(res.body.ride.startLocation);
                should.exist(res.body.ride.stopLocation);
                should(res.body.ride.stopLocation[0]).equal(pos.lng);
                should(res.body.ride.stopLocation[1]).equal(pos.lat);
                should.exist(res.body.ride.startTime);
                should.exist(res.body.ride.stopTime);
                should.exist(res.body.ride.tripCost);
                // console.log(res.body.ride);
                done();
            });
    });

    var pinkTestTimes = 10;

    it('request pink cars', function (done) {
        var rides = 0;
        function _done() {
            if (++rides >= pinkTestTimes) {
                done();
            }
        }

        for (var i = 0; i < pinkTestTimes; i++) {
            var startPos = getRandomPosition(),
                stopPos = getRandomPosition();

            server
                .put('/api/actions/requestCar')
                .send({
                    userId: userId,
                    lng: startPos.lng,
                    lat: startPos.lat,
                    pink: 'true'
                })
                .expect(200)
                .end(function (err, res) {
                    // console.log(res.body);
                    if (err) {
                        throw err;
                    }
                    should(res.body.error).equal(false);
                    should.exist(res.body.status);
                    if ('unavailable' == res.body.status) {
                        _done();

                    } else if ('rideStarted' == res.body.status) {
                        should.exist(res.body.ride);
                        should.exist(res.body.ride._id);
                        should(res.body.ride.pinkCarRequested)
                            .equal(true);
                        server
                            .put('/api/actions/stopRide')
                            .send({
                                rideId: res.body.ride._id,
                                lng: stopPos.lng,
                                lat: stopPos.lat
                            })
                            .expect(200)
                            .end(function (err, res) {
                                if (err) {
                                    throw err;
                                }
                                should(res.body.error).equal(false);
                                should.exist(res.body.ride);
                                should.exist(res.body.ride.car);
                                should(res.body.ride.car.isPink)
                                    .equal(true);
                                _done();
                            });  
                    } else {
                        throw new Error(res.body.status + ' : ' + 
                            res.body.message);
                    }
                });
        }
    });

    // TODO: request pink car

    it('delete user', function (done) {
        server
            .delete('/api/user')
            .send({
                username: 'myuser'
            })
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    throw err;
                }
                done();
            });
    });

    it('delete cars', function (done) {
        var updated = 0;
        function _done() {
            if (++updated >= cars.length) {
                done();
            }
        }

        for (var i in cars) {
            +function () {
                var pos = getRandomPosition();

                server
                    .delete('/api/car')
                    .send({
                        id: cars[i]
                    })
                    .expect(200)
                    .end(function (err, res) {
                        if (err) {
                            throw err;
                        }
                        _done();
                    });
            }();
        }
    });
});




// eof