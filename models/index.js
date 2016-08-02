var schemas = require('./schemas'),
    models;

// models 

module.exports = models = {};

models.__init = function (conn) {
    for (schema in schemas) {
        if (schemas.hasOwnProperty(schema)) {
            models[schema] = conn.model(
                schema, schemas[schema]);
        }
    }
    delete models.__init;
    return models;
};