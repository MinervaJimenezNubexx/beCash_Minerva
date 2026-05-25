const cds = require('@sap/cds')
const handlers = require('./handlers')

module.exports = cds.service.impl(async function (srv) {
    /*
        ENTITIES
    */

    //LoggedHours
    srv.before(['UPDATE'], "LoggedHours", handlers.admins.entities.loggedHours.modifiedByAdmin); //done
    
    //Employees
    srv.before(['CREATE', 'UPDATE'], "Employees", handlers.admins.entities.employees.EmployeeEmailFormat); //done

    //Clients
    srv.before(['CREATE', 'UPDATE'], "Clients", handlers.admins.entities.clients.ClientEmailFormat); //done

    /*
        ACTIONS
    */


    //Employees
    srv.on("deactivateEmployees", handlers.admins.actions.employees.deactivateEmployees); //done
    srv.on("activateEmployees", handlers.admins.actions.employees.activateEmployees); //done

    //Clients
    srv.on("deactivateClients", handlers.admins.actions.clients.deactivateClients); //done
    srv.on("activateClients", handlers.admins.actions.clients.activateClients); //done

})