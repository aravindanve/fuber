var express = require('express'),
    router = express.Router();

module.exports = router;

// api middleware

router.use(function (req, res, next) {
    res.created = function (data) {
        res.header('Content-Type', 'application/json');
        res.status(201);
        data = data || {};
        data.error = data.error || false;
        data.message = data.message || 'resource created';
        return res.json(data);
    };

    res.deleted = function (data) {
        res.header('Content-Type', 'application/json');
        res.status(200);
        data = data || {};
        data.error = data.error || false;
        data.message = data.message || 'resource deleted';
        return res.json(data);
    };
    
    res.success = function (data) {
        res.header('Content-Type', 'application/json');
        res.status(200);
        data = data || {};
        data.error = data.error || false;
        data.message = data.message || 'resource found';
        return res.json(data);
    };
    return next();
});