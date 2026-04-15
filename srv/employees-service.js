const cds = require('@sap/cds')
const handlers = require('./handlers')

module.exports = cds.service.impl(async function (srv) {
    /*
        ENTITIES
    */

    //Logged Hours: all of this ones are shared with manager so they would go to /domain or /utils
    srv.before(['CREATE', 'UPDATE'], "LoggedHours", handlers.employees.entities.loggedHours.ValidHours); //done
    srv.before(['CREATE', 'UPDATE'], "LoggedHours", handlers.employees.entities.loggedHours.ActiveProject); //done
    srv.before(['UPDATE'], "LoggedHours", handlers.employees.entities.loggedHours.employeeNotUpdateWhenSent);

    //srv.before(['CREATE'], "LoggedHours", handlers.employees.entities.loggedHours.blockNewIfAlreadySentThisMonth);
    //srv.before(['UPDATE'], "LoggedHours", handlers.employees.entities.loggedHours.onlySendLastLaboralDayThisMonth);
    //srv.before(['CREATE'], "LoggedHours", handlers.employees.entities.loggedHours.employeeAssignedToThisProject);
    //srv.before(['CREATE'], "LoggedHours", handlers.employees.entities.loggedHours.notMoreThanEstablishedWorkHours);
    //srv.before(['CREATE'], "LoggedHours", handlers.employees.entities.loggedHours.notMoreThanEightHoursPerDay);
    //srv.before(['CREATE'], "LoggedHours", handlers.employees.entities.loggedHours.notLogHoursOnPastOrFututeMonths);
    //srv.before(['CREATE'], "LoggedHours", handlers.employees.entities.loggedHours.notLogHoursOnWeekend);


    /*
        ACTIONS
    */

    //Employees
})