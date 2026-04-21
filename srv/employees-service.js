const cds = require('@sap/cds')
const handlers = require('./handlers')
const src = require('./src')

module.exports = cds.service.impl(async function (srv) {
    /*
        ENTITIES
    */

    //Logged Hours: all shared between manager and employee
    srv.before(['CREATE', 'UPDATE'], "LoggedHours", src.domain.entities.loggedHours.ValidHours); //done

    srv.before(['CREATE', 'UPDATE'], "LoggedHours", src.domain.entities.loggedHours.ActiveProject); //done

    srv.before(['UPDATE'], "LoggedHours", src.domain.entities.loggedHours.employeeNotUpdateWhenSent); //done

    srv.before(['UPDATE'], "LoggedHours", src.domain.entities.loggedHours.employeeNotUpdateStatusOfLog); //done

    srv.before(['CREATE'], "LoggedHours", src.domain.entities.loggedHours.defaultNotSentStatusOnCreateLog);

    srv.before(['CREATE'], "LoggedHours", src.domain.entities.loggedHours.blockNewIfAlreadySentThisMonth);

    srv.before(['UPDATE'], "LoggedHours", src.domain.entities.loggedHours.onlySendLastLaboralDayThisMonth);

    srv.before(['CREATE'], "LoggedHours", src.domain.entities.loggedHours.employeeAssignedToThisProject);

    srv.before(['CREATE'], "LoggedHours", src.domain.entities.loggedHours.notMoreThanEstablishedWorkHours);

    srv.before(['CREATE'], "LoggedHours", src.domain.entities.loggedHours.notMoreThanEightHoursPerDay); //done

    srv.before(['CREATE'], "LoggedHours", src.domain.entities.loggedHours.notLogHoursOnPastOrFututeMonths);

    srv.before(['CREATE'], "LoggedHours", src.domain.entities.loggedHours.notLogHoursOnWeekend);


    /*
        ACTIONS
    */

    //Employees
})