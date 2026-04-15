const cds = require('@sap/cds')
const handlers = require('./handlers')

module.exports = cds.service.impl(async function (srv) {
    /*
        ENTITIES
    */

    //Logged Hours
    srv.before(['CREATE', 'UPDATE'], "LoggedHours", handlers.servicio1.entities.loggedHours.ValidHours); //done
    srv.before(['CREATE', 'UPDATE'], "LoggedHours", handlers.servicio1.entities.loggedHours.ActiveProject); //done
    srv.before(['UPDATE'], "LoggedHours", handlers.servicio1.entities.loggedHours.employeeNotUpdateWhenSent);
    srv.before(['UPDATE'], "LoggedHours", handlers.servicio1.entities.loggedHours.managerNotUpdateWhenResolved);
    srv.before(['UPDATE'], "LoggedHours", handlers.servicio1.entities.loggedHours.modifiedByAdmin);
    //srv.before(['CREATE'], "LoggedHours", handlers.servicio1.entities.loggedHours.blockNewIfAlreadySentThisMonth);
    //srv.before(['UPDATE'], "LoggedHours", handlers.servicio1.entities.loggedHours.onlySendLastLaboralDayThisMonth);
    //srv.before(['CREATE'], "LoggedHours", handlers.servicio1.entities.loggedHours.employeeAssignedToThisProject);
    //srv.before(['CREATE'], "LoggedHours", handlers.servicio1.entities.loggedHours.notMoreThanEstablishedWorkHours);
    //srv.before(['CREATE'], "LoggedHours", handlers.servicio1.entities.loggedHours.notMoreThanEightHoursPerDay);
    //srv.before(['CREATE'], "LoggedHours", handlers.servicio1.entities.loggedHours.notLogHoursOnPastOrFututeMonths);
    //srv.before(['CREATE'], "LoggedHours", handlers.servicio1.entities.loggedHours.notLogHoursOnWeekend);

    //Employees
    srv.before(['CREATE', 'UPDATE'], "Employees", handlers.servicio1.entities.employees.EmployeeEmailFormat);
    //srv.before(['DELETE'], "Employees", handlers.servicio1.entities.employees.notDeleteEmployees);

    //Clients
    srv.before(['CREATE', 'UPDATE'], "Clients", handlers.servicio1.entities.clients.ClientEmailFormat);
    //srv.before(['DELETE'], "Clients", handlers.servicio1.entities.clients.notDeleteClients);

    //Projects
    //srv.before(['CREATE'], "Projects", handlers.servicio1.entities.projects.validInitialBudget);
    //srv.before(['UPDATE'], "Projects", handlers.servicio1.entities.projects.notUpdateBudgetToLowerQuantity);
    //srv.before(['CREATE'], "Projects", handlers.servicio1.entities.projects.validProjectStatus);
    //srv.before(['CREATE'], "Projects", handlers.servicio1.entities.projects.autoAssignManager);
    //srv.before(['CREATE', 'UPDATE'], "Projects", handlers.servicio1.entities.projects.managerOnChargeIsManager);


     /*
        ACTIONS
    */

    //Employees(Managers)

    
    //Employees(Normal)
})