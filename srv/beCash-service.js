const cds = require('@sap/cds')
const handlers = require('./handlers')

module.exports = cds.service.impl(async function (srv) {

    srv.before(['CREATE', 'UPDATE'], "LoggedHours", handlers.servicio1.entities.loggedHours.ValidHours);
    srv.before(['CREATE', 'UPDATE'], "LoggedHours", handlers.servicio1.entities.loggedHours.ActiveProject);

})