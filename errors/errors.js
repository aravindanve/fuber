var util = require('util')
    errors = {};

module.exports = errors = {};

// errors

function BadRequest(message) {
    Error.apply(this, arguments);
    this.status = 400;
    this.name = 'BadRequest';
    this.message = message ||
        'your request was malformed or invalid';
}
util.inherits(BadRequest, Error);
errors.BadRequest = BadRequest;

function ValidationError(message) {
    BadRequest.apply(this, arguments);
    this.name = 'ValidationError';
    this.message = message ||
        'your request contained invalid data';
}
util.inherits(ValidationError, BadRequest);
errors.ValidationError = ValidationError;

//

function NotFound(message) {
    Error.apply(this, arguments);
    this.status = 404;
    this.name = 'NotFound';
    this.message = message ||
        'we could not find the resource you are looking for';
}
util.inherits(NotFound, Error);
errors.NotFound = NotFound;

function ResourceNotFoundError(message) {
    NotFound.apply(this, arguments);
    this.name = 'ResourceNotFoundError';
    this.message = message ||
        'we could not find the resource you are looking for';
}
util.inherits(ResourceNotFoundError, NotFound);
errors.ResourceNotFoundError = ResourceNotFoundError;