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

    //Clients
    srv.before(['CREATE', 'UPDATE'], "Clients", handlers.admins.entities.clients.ClientEmailFormat);

    /*
        ACTIONS
    */


    //Employees
    srv.on("deactivateEmployees", handlers.admins.actions.employees.deactivateEmployees);

    //Clients
    srv.on("deactivateClients", handlers.admins.actions.clients.deactivateClients);

})