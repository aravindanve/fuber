var express = require('express'),
    router = express.Router(),
    apiresponse = require('../../middleware/apiresponse');

var user = require('./user'),
    car = require('./car'),
    actions = require('./actions'),
    errors = require('./errors');

module.exports = router;

router.use(apiresponse);

router.use('/user', user);
router.use('/car', car);
router.use('/actions', actions);
errors(router);


