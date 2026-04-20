const cds = require('@sap/cds')
const handlers = require('./handlers')
const src = require('./src')

module.exports = cds.service.impl(async function (srv) {
    /*
        ENTITIES
    */

    //Logged Hours: all shared between manager and employee
    srv.before(['CREATE', 'UPDATE'], "LoggedHours", src.domain.loggedHours.ValidHours); //done

    srv.before(['CREATE', 'UPDATE'], "LoggedHours", src.domain.loggedHours.ActiveProject); //done

    srv.before(['UPDATE'], "LoggedHours", src.domain.loggedHours.employeeNotUpdateWhenSent); //done

    srv.before(['UPDATE'], "LoggedHours", src.domain.loggedHours.employeeNotUpdateStatusOfLog);

    srv.before(['CREATE'], "LoggedHours", src.domain.loggedHours.blockNewIfAlreadySentThisMonth);

    srv.before(['UPDATE'], "LoggedHours", src.domain.loggedHours.onlySendLastLaboralDayThisMonth);

    srv.before(['CREATE'], "LoggedHours", src.domain.loggedHours.employeeAssignedToThisProject);

    srv.before(['CREATE'], "LoggedHours", src.domain.loggedHours.notMoreThanEstablishedWorkHours);

    srv.before(['CREATE'], "LoggedHours", src.domain.loggedHours.notMoreThanEightHoursPerDay);

    srv.before(['CREATE'], "LoggedHours", src.domain.loggedHours.notLogHoursOnPastOrFututeMonths);

    srv.before(['CREATE'], "LoggedHours", src.domain.loggedHours.notLogHoursOnWeekend);


    /*
        ACTIONS
    */

    //Employees
})