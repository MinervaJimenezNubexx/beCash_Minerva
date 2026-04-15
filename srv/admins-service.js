const cds = require('@sap/cds')
const handlers = require('./handlers')

module.exports = cds.service.impl(async function (srv) {
    /*
        ENTITIES
    */

    //LoggedHours
    srv.before(['UPDATE'], "LoggedHours", handlers.admins.entities.loggedHours.modifiedByAdmin);
    
    //Employees
    srv.before(['CREATE', 'UPDATE'], "Employees", handlers.admins.entities.employees.EmployeeEmailFormat);
    //srv.before(['DELETE'], "Employees", handlers.admins.entities.employees.notDeleteEmployees);

    //Clients
    srv.before(['CREATE', 'UPDATE'], "Clients", handlers.admins.entities.clients.ClientEmailFormat);
    //srv.before(['DELETE'], "Clients", handlers.admins.entities.clients.notDeleteClients);


})