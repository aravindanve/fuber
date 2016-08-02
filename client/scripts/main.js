
+function ($, document, window) {

    var api = '/api';

    function msg(str) {
        $('[data-message]').html(str);
    } 

    function err(str) {
        $('[data-message]').html(str);
    }

    function req(type, url, data, cb) {
        'function' == typeof data && (cb = data);

        $.ajax({
            type: type,
            url: api + url,
            data: data || null,
            dataType: 'json',
            success: function (res) {
                if (res.error) {
                    var errText = (res.name? res.name + ': ' : '') + 
                        res.message;
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

    var CURRENT_USER = null;

    function refresh() {
        hidePopup();
        getUsers();
        getCars();
    }

    function requestCarPopup(e) {
        
    }

    var carTemplate = '<a class="car%PINK%" data-car="%ID%" ' + 
        'style="left: %LNG%px; top: %LAT%px;"></a>';

    function getCars() {
        req('get', '/actions/getCars', function (res) {
            $('[data-cars]').empty();
            res.cars.forEach(function (item, i) {
                var lng = ((item.location[0] - 76) * 600) + 100,
                    lat = ((item.location[1] - 12) * 600) + 50;

                $('[data-cars]').append(
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

    function getRandomPosition() {
        // @13.1153645,77.4712135
        // @12.9372254,77.6234867
        return {
            lng: 77 - (Math.round(Math.random() * 10000000)/10000000),
            lat: 13 - (Math.round(Math.random() * 10000000)/10000000)
        }
    }
    function randomPink() {
        return Math.round(Math.random())? 'true' : 'false';
    }

    function addCars(e) {
        var num = parseInt($('[name="new-cars"]').val());
        isNaN(num) && (num = 0);
        console.log(num);
        if (!num) return false;
        var added = 0;
        function _done() {
            if (++added >= num) {
                $('[name="new-user"]').val('');
                refresh();
            }
        }
        for (var i = 0; i < num; i++) {
            req('post', '/car', {
                driver: 'random car',
                pink: randomPink()

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
            id: $(this).attr('data-delete-car')

        }, function (res) {
            refresh();
        });
        return false;
    }

    function deleteAllCars(e) {
        req('get', '/actions/getCars', function (res) {
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

    var deleteCarTemplate = '<button class="red" ' + 
            'data-delete-car="%ID%">Delete Car</button>';

    function showCarInfo(e) {
        var position = $(this).position(),
            left = position.left,
            top = position.top,
            gridWidth = $('[data-cars]').width(),
            gridHeight = $('[data-cars]').height(),
            rt = !!1, rr = !!1, rb = !!1, rl = !!1;

        if (left > (gridWidth / 2)) {
            $('[data-popup]').css({
                left: 'auto',
                right: (gridWidth - left - 5) + 'px'
            });
            rl = false;

        } else {
            $('[data-popup]').css({
                right: 'auto',
                left: (left + 5 + 350) + 'px'
            });
            rr = false;
        }

        if (top > (gridHeight / 2)) {
            $('[data-popup]').css({
                top: 'auto',
                bottom: (gridHeight - top - 5) + 'px'
            });
            rt = false;

        } else {
            $('[data-popup]').css({
                bottom: 'auto',
                top: (top + 5) + 'px'
            });
            rb = false;
        }

        $('[data-popup]').css({
            display: 'block',
            borderRadius: 
                (rl && rt? '0' : '6px') + ' ' + 
                (rt && rr? '0' : '6px') + ' ' + 
                (rr && rb? '0' : '6px') + ' ' + 
                (rb && rl? '0' : '6px')
        });

        req('get', '/car', {
            id: $(this).data('car')

        }, function (res) {
            $('[data-popup]').empty()
                .append(
                    deleteCarTemplate
                        .replace(/%ID%/g, res.car._id)
                );
        });
        return false;
    }

    function hidePopup(e) {
        $('[data-popup]').css('display', '');
    }

    var userTemplate = '<div class="customer">'+
            '<a class="user" data-user="%NAME%">'+
            '<div class="u-name">%NAME%</div>'+
            '<div class="u-status">trip active</div>'+
            '</a><a class="user-remove" data-remove-user>&times;</a></div>';

    function getUsers() {
        req('get', '/actions/getUsers', function (res) {
            $('[data-customers]').empty();
            res.users.forEach(function (item, i) {
                $('[data-customers]').append(
                    userTemplate
                        .replace(/%NAME%/g, item.username)
                    );
            });
            if (CURRENT_USER &&
                $('[data-user="' + CURRENT_USER + '"]').length) {
                $('[data-user="' + CURRENT_USER + '"]')
                    .addClass('current');

            } else {
                $('[data-user]').removeClass('current');
            }
            // msg(JSON.stringify(res));
        });
    }

    function addUser(e) {
        var newUser = $('[name="new-user"]').val();
        req('post', '/user', {
            username: newUser

        }, function (res) {
            // msg(JSON.stringify(res));
            $('[name="new-user"]').val('');
            refresh();
        });
    }

    function removeUser(e) {
        var user = $(this).siblings('[data-user]').data('user');
        req('delete', '/user', {
            username: user

        }, function (res) {
            // msg(JSON.stringify(res));
            refresh();
        });
    }

    function selectUser(e) {
        $('[data-user]').removeClass('current');
        $(this).addClass('current');
        CURRENT_USER = $(this).data('user');
    }

    $(document).ready(function () {

        $(document).on('click', '[data-add-user]', addUser);
        $(document).on('click', '[data-remove-user]', removeUser);
        $(document).on('click', '[data-user]', selectUser);
        $(document).on('click', '[data-add-cars]', addCars);
        $(document).on('click', '[data-delete-car]', deleteCar);
        $(document).on('click', '[data-delete-cars]', deleteAllCars);
        $(document).on('click', '[data-car]', showCarInfo);


        $(document).on('click', '[data-popup]', function (e) {
            return false;
        });
        $(document).on('click', hidePopup);

        refresh();

    });

}(jQuery, document, window);












// eof


