var express = require('express'),
    router = express.Router();

module.exports = router;

// homepage
router.get('/', function(req, res, next) {
    return res.render('index', {
        title: 'Fuber'
    });
});

