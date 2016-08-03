
+function ($, document, window) {

    var apiPath = '/api';

    var messageSelector = '[data-message]',
        clearMessageSelector = '[data-clear-message]',
        panelMainSelector = '[data-panel-main]',
        panelPageSelector = '[data-panel-page]',
        panelPageTitleSelector = '[data-pp-title]',
        panelPageContentSelector = '[data-pp-content]',
        showMainSelector = '[data-show-main]',
        usersSelector = '[data-users]',
        carsSelector = '[data-cars]',
        newUserInputSelector = '[name="new-user"]',
        newCarsInputSelector = '[name="new-cars"]',
        addUserSelector = '[data-add-user]',
        removeUserSelector = '[data-remove-user]',
        userSelector = '[data-user]',
        userData = 'data-user',
        userIdData = 'data-id',
        addCarsSelector = '[data-add-cars]',
        deleteCarSelector = '[data-delete-car]',
        deleteCarData = 'data-delete-car',
        deleteCarsSelector = '[data-delete-cars]',
        carSelector = '[data-car]',
        actionLayer = '.action-layer',
        carData = 'data-car',
        locationSelector = '[data-location]',
        mapLeftOffset = 350,
        requestCarSelector = '[data-request-car]',
        requestIdData = 'data-request-id',
        requestLocationData = 'data-request-location',
        requestPinkData = 'data-request-pink',
        stopRideSelector = '[data-stop-ride]';

    var _user = null;

    function msg(str) {
        $(messageSelector)
            .html(str)
            .parent()
            .css('display', 'block');
    } 

    function clearMsg() {
        $(messageSelector)
            .parent()
            .css('display', '');
    }

    function err(str) {
        msg(str);
    }

    function req(type, url, data, cb) {
        'function' == typeof data && (cb = data);

        $.ajax({
            type: type,
            url: apiPath + url,
            data: data || null,
            dataType: 'json',
            success: function (res) {
                if (res.error) {
                    var errText = (
                        res.name? res.name + ': ' : ''
                        ) + res.message;
                    return err(errText);
                } 
                return cb(res);
            },
            error: function (jqxhr) {
                if (jqxhr && jqxhr.responseJSON && 
                    jqxhr.responseJSON.message) {

                    var errText = (jqxhr.responseJSON.name? 
                        jqxhr.responseJSON.name + ': ' : '') + 
                        jqxhr.responseJSON.message;
                    return err(errText);
                }
                return err('Oops, something went wrong');
            }
        })
    }

    function showPage() {
        $(panelMainSelector).css('display', 'none');
        $(panelPageSelector).css('display', 'block');
    }

    function showMain() {
        $(panelMainSelector).css('display', '');
        $(panelPageSelector).css('display', '');
        refresh();
    }

    function showMainAction() {
        $(carSelector).removeClass('current');
        showMain();
    }

    function refresh() {
        clearMsg();
        getUsers();
        getCars();
    }

    function parsePixelPosition(location) {
        return {
            lng: ((location[0] - 76) * 600) + 100,
            lat: ((location[1] - 12) * 600) + 50
        };
    }

    function parseLocation(left, top) {
        return {
            lng: ((left - 100) / 600) + 76,
            lat: ((top - 50) / 600) + 12
        };
    }

    var carTemplate = '<a class="car%PINK%" data-car="%ID%" ' + 
        'style="left: %LNG%px; top: %LAT%px;"></a>';

    function getCars() {
        req('get', '/actions/getCars', function (res) {
            $(carsSelector).empty();

            res.cars.forEach(function (item, i) {
                var pos = parsePixelPosition(item.location),
                    lng = pos.lng,
                    lat = pos.lat;

                $(carsSelector).append(
                    carTemplate
                        .replace(/%ID%/g, item._id)
                        .replace(/%LNG%/g, lng)
                        .replace(/%LAT%/g, lat)
                        .replace(/%PINK%/g, 
                            item.isPink? ' pink' : '')
                    );
            });
            // msg(JSON.stringify(res));
        });
    }

    var locationTemplate = '<a class="location current" ' + 
        'data-location="%COORD%" ' + 
        'style="left: %LNG%px; top: %LAT%px;"></a>';

    function selectLocation(e) {
        if (!$(this).filter(actionLayer).length) return;
        var posX = e.pageX - $(this).position().left - mapLeftOffset,
            posY = e.pageY - $(this).position().top,
            loc = parseLocation(posX, posY);

        $(locationSelector).remove();
        $(this).append(locationTemplate
            .replace(/%LNG%/, posX)
            .replace(/%LAT%/, posY));

        locationSelected(loc.lng, loc.lat);
    }

    var requestCarTemplate = '<div class="props">' + 
            '<div><span class="prop-name">user</span>' + 
            '<span class="prop-val">%USERNAME%</span></div>' + 
            '<div><span class="prop-name">location</span>' + 
            '<span class="prop-val">%LOCATION%</span></div>' + 
            '</div><div class="a-input combo-2" ' + 
            'data-request-id="%ID%" data-request-location=' + 
            '"%LOCATION%"><button ' + 
            'class="blue" data-request-car="%ID%" ' + 
            'data-request-pink="false">Request Car</button>' + 
            '<button class="pink" data-request-car="%ID%" ' + 
            'data-request-pink="true">' + 
            'Request Pink Car</button></div>';

    var stopRideTemplate = '<div class="props">' + 
            '<div><span class="prop-name">user</span>' + 
            '<span class="prop-val">%USERNAME%</span></div>' + 
            '<div><span class="prop-name">location</span>' + 
            '<span class="prop-val">%LOCATION%</span></div>' + 
            '</div><div class="a-input combo-2" ' + 
            'data-request-id="%ID%" data-request-location=' + 
            '"%LOCATION%"><button ' + 
            'class="blue" data-stop-ride="%ID%">' + 
            'Stop Ride Here</button></div>';

    var noUserSelectedTemplate = 'You must go back and select ' + 
            'a user to request a car';

    function locationSelected(lng, lat) {
        $(panelPageTitleSelector).html('Location');
        if (_user && _user.ride) {
            $(panelPageContentSelector).html(
                stopRideTemplate
                    .replace(/%ID%/g, _user.ride)
                    .replace(/%USERNAME%/g, _user.username)
                    .replace(/%LOCATION%/g, [lng, lat].join(', '))
            );
            showPage();

        } else if (_user) {
            $(panelPageContentSelector).html(
                requestCarTemplate
                    .replace(/%ID%/g, _user._id)
                    .replace(/%USERNAME%/g, _user.username)
                    .replace(/%LOCATION%/g, [lng, lat].join(', '))
            );
            showPage();

        } else {
            $(panelPageContentSelector).html(
                noUserSelectedTemplate);
            showPage();
        }
    }

    function requestCar(e) {
        var parent = $(this).parent(),
            userId = parent.attr(requestIdData),
            location = parent.attr(requestLocationData),
            pink = $(this).attr(requestPinkData);

        location = location.replace(/\s/g, '').split(',');

        req('put', '/actions/requestCar', {
            userId: userId,
            lng: location[0],
            lat: location[1],
            pink: pink

        }, function (res) {
            updateUser(function () {
                if (res.status && 'rideStarted' == res.status) {
                    $(panelPageTitleSelector).html('Ride Started');
                    $(panelPageContentSelector).html(
                        'Click anywhere on the map to end ride');
                    
                } else {
                    $(panelPageTitleSelector).html('Unavailable');
                    $(panelPageContentSelector).html(
                        'Sorry there are no cars available at this moment.');
                }
                showPage();
                refresh();
            });
        });
    }

    var rideEndedTemplate = '<div class="props">' + 
            '<div><span class="prop-name">ID</span>' + 
            '<span class="prop-val">%ID%</span></div>' + 
            '<div><span class="prop-name">user</span>' + 
            '<span class="prop-val">%USERNAME%</span></div>' + 
            '<div><span class="prop-name">distance</span>' + 
            '<span class="prop-val">%DISTANCE%</span></div>' +
            '<div><span class="prop-name">time</span>' + 
            '<span class="prop-val">%TIME%</span></div>' + 
            '<div><span class="prop-name">pinkCharge</span>' + 
            '<span class="prop-val">%PINK%</span></div>' + 
            '<div><span class="prop-name">bill amount</span>' + 
            '<span class="prop-val">%BILL%</span></div>' + 
            '</div>';

    function stopRide(e) {
        var parent = $(this).parent(),
            rideId = parent.attr(requestIdData),
            location = parent.attr(requestLocationData);

        location = location.replace(/\s/g, '').split(',');

        req('put', '/actions/stopRide', {
            rideId: rideId,
            lng: location[0],
            lat: location[1]

        }, function (res) {
            updateUser(function () {
                if (res.status && 'rideEnded' == res.status) {
                    $(panelPageTitleSelector).html('Ride Ended');
                    $(panelPageContentSelector).html(
                        rideEndedTemplate
                            .replace(/%ID%/g, res.ride._id)
                            .replace(/%USERNAME%/g, _user.username)
                            .replace(/%DISTANCE%/g, 
                                (Math.round(res.ride.distance*100)/100
                                    ) + ' km')
                            .replace(/%TIME%/g, 
                                (Math.round(res.ride.time*100)/100
                                    ) + ' min')
                            .replace(/%PINK%/g, 
                                res.ride.pinkCarRequested? 
                                    '5.00 dogecoins' : '0')
                            .replace(/%BILL%/g, 
                                res.ride.tripCost.toFixed(2) + 
                                ' dogecoins')
                    );
                } else {
                    $(panelPageTitleSelector).html('Unavailable');
                    $(panelPageContentSelector).html(
                        'Something went wrong, unable to stop the ride.');
                }
                showPage();
                refresh();
            });
        });
    }

    function getRandomPosition() {
        // @13.1153645,77.4712135
        // @12.9372254,77.6234867
        return {
            lng: 77 - (Math.round(Math.random() * 10000000)/10000000),
            lat: 13 - (Math.round(Math.random() * 10000000)/10000000)
        }
    }

    function getRandomIsPink() {
        return Math.round(Math.random())? 'true' : 'false';
    }

    function addCars(e) {
        var num = parseInt($(newCarsInputSelector).val()),
            added = 0;

        isNaN(num) && (num = 0);
        if (!num) return false;

        function _done() {
            if (++added >= num) {
                refresh();
            }
        }
        for (var i = 0; i < num; i++) {
            req('post', '/car', {
                driver: 'random car',
                pink: getRandomIsPink()

            }, function (res) {
                var pos = getRandomPosition();

                req('put', '/car/location', {
                    id: res.car._id,
                    lng: pos.lng,
                    lat: pos.lat

                }, function (res) {
                    _done();
                });
            });
        }
        
    }

    function deleteCar(e) {
        req('delete', '/car', {
            id: $(this).attr(deleteCarData)

        }, function (res) {
            showMain();
            refresh();
        });
        return false;
    }

    function deleteAllCars(e) {
        req('get', '/actions/getCars', {
            active: 1

        }, function (res) {
            var deleted = 0;

            function _done() {
                if (++deleted >= res.cars.length) {
                    refresh();
                }
            }
            res.cars.forEach(function (item, i) {
                req('delete', '/car', {
                    id: item._id

                }, function (res) {
                    _done();
                });
            });
            // msg(JSON.stringify(res));
        });
    }

    var deleteCarTemplate = '<div class="props">' + 
            '<div><span class="prop-name">ID</span>' + 
            '<span class="prop-val">%ID%</span></div>' + 
            '<div><span class="prop-name">driver</span>' + 
            '<span class="prop-val">%DRIVER%</span></div>' + 
            '<div><span class="prop-name">location</span>' + 
            '<span class="prop-val">%LOCATION%</span></div>' + 
            '<div><span class="prop-name">isPink</span>' + 
            '<span class="prop-val">%PINK%</span></div>' + 
            '</div><button class="red" ' + 
            'data-delete-car="%ID%">Delete Car</button>';

    function showCarInfo(e) {
        var $elem = $(this),
            carId = $elem.attr(carData);

        req('get', '/car', {
            id: carId

        }, function (res) {
            $(carSelector).removeClass('current');
            $elem.addClass('current');
            $(panelPageTitleSelector).html('Car');
            $(panelPageContentSelector).html(
                deleteCarTemplate
                    .replace(/%ID%/g, res.car._id)
                    .replace(/%DRIVER%/g, res.car.driver)
                    .replace(/%LOCATION%/g, res.car.location.join(', '))
                    .replace(/%PINK%/g, res.car.isPink? 'true' : 'false')
            );
            showPage();
            // msg(JSON.stringify(res));
        });
        $(locationSelector).remove();
        return false;
    }

    var userTemplate = '<div class="customer">' +
            '<a class="user%CURRENT%" data-user="%USERNAME%" ' + 
            'data-id="%ID%">' +
            '<div class="u-name">%USERNAME%</div>' +
            '<div class="u-status%ACTIVECLASS%">%ACTIVE%</div>' +
            '</a><a class="user-remove" data-remove-user>' +
            '&times;</a></div>';

    function getUsers() {
        req('get', '/actions/getUsers', function (res) {
            $(usersSelector).empty();

            res.users.forEach(function (item, i) {
                var activeClass = item.ride && 
                        item.ride? ' active' : '',
                    activeText = activeClass? 
                        'ride active' : 'inactive',
                    current = _user && (
                        _user.username == item.username)? 
                        ' current' : '';

                if (current) {
                    _user = item;
                }
                $(usersSelector).append(
                    userTemplate
                        .replace(/%CURRENT%/g, current)
                        .replace(/%USERNAME%/g, item.username)
                        .replace(/%ID%/g, item._id)
                        .replace(/%ACTIVECLASS%/g, activeClass)
                        .replace(/%ACTIVE%/g, activeText)
                    );
            });
            if (!$(userSelector).filter('.current').length) {
                _user = null;
            }
            // msg(JSON.stringify(res));
        });
    }

    function addUser(e) {
        var newUser = $(newUserInputSelector).val();
        req('post', '/user', {
            username: newUser

        }, function (res) {
            // msg(JSON.stringify(res));
            $(newUserInputSelector).val('');
            refresh();
        });
    }

    function removeUser(e) {
        var user = $(this).siblings(userSelector).attr(userData);
        req('delete', '/user', {
            username: user

        }, function (res) {
            // msg(JSON.stringify(res));
            refresh();
        });
    }

    function selectUser(e) {
        var $elem = $(this);
        req('get', '/user', {
            username: $elem.attr(userData)

        }, function (res) {
            $(userSelector).removeClass('current');
            $elem.addClass('current');
            _user = res.user;
        });
    }

    function updateUser(cb) {
        if (!_user) return;
        req('get', '/user', {
            username: _user.username

        }, function (res) {
            _user = res.user;
            return cb();
        });
    }

    $(document).ready(function () {

        $(document).on('click', clearMessageSelector, clearMsg);
        $(document).on('click', showMainSelector, showMainAction);
        $(document).on('click', addUserSelector, addUser);
        $(document).on('click', removeUserSelector, removeUser);
        $(document).on('click', userSelector, selectUser);
        $(document).on('click', addCarsSelector, addCars);
        $(document).on('click', deleteCarSelector, deleteCar);
        $(document).on('click', deleteCarsSelector, deleteAllCars);
        $(document).on('click', carSelector, showCarInfo);
        $(document).on('click', actionLayer, selectLocation);
        $(document).on('click', requestCarSelector, requestCar);
        $(document).on('click', stopRideSelector, stopRide);
        refresh();
        msg('Start booking cabs now!');

    });

}(jQuery, document, window);












// eof


