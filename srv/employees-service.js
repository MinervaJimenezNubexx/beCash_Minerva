const cds = require('@sap/cds')
const handlers = require('./handlers')
const src = require('./src')

module.exports = cds.service.impl(async function (srv) {
    /*
        ENTITIES
    */

    //Logged Hours: (almost) all shared between manager and employee
    srv.before(['CREATE', 'UPDATE'], "LoggedHours", src.domain.entities.loggedHours.ValidateHours); //done

    srv.before(['CREATE', 'UPDATE'], "LoggedHours", src.domain.entities.loggedHours.ValidateActiveProject); //done

    srv.before(['UPDATE'], "LoggedHours", src.domain.entities.loggedHours.employeeNotUpdateWhenSent); //done, not for managers

    srv.before(['UPDATE'], "LoggedHours", src.domain.entities.loggedHours.employeeNotUpdateStatusOfLog); //done, not for managers

    srv.before(['CREATE'], "LoggedHours", src.domain.entities.loggedHours.defaultNotSentStatusOnCreateLog); //done

    srv.before(['CREATE'], "LoggedHours", src.domain.entities.loggedHours.blockNewIfAlreadySentThisMonth); //done

    srv.before(['CREATE', 'UPDATE'], "LoggedHours", src.domain.entities.loggedHours.checkIfEmployeeAssignedToThisProject); //done

    srv.before(['CREATE', 'UPDATE'], "LoggedHours", src.domain.entities.loggedHours.notMoreThanEstablishedWorkHours); //done

    srv.before(['CREATE', 'UPDATE'], "LoggedHours", src.domain.entities.loggedHours.notMoreThanEightHoursPerDay); //done

    srv.before(['CREATE', 'UPDATE'], "LoggedHours", src.domain.entities.loggedHours.notLogHoursOnPastOrFututeMonths); //done

    srv.before(['CREATE', 'UPDATE'], "LoggedHours", src.domain.entities.loggedHours.notLogHoursOnWeekend); //done


    /*
        ACTIONS
    */

    //LoggedHours
    srv.on("sendThisMonthHours", src.domain.actions.loggedHours.sendThisMonthHours); //done
})