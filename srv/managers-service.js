const cds = require('@sap/cds')
const handlers = require('./handlers')
const src = require('./src')

module.exports = cds.service.impl(async function (srv) {
    /*
        ENTITIES
    */

    //Logged Hours: shared between manager and employee
    srv.before(['CREATE', 'UPDATE'], "LoggedHours", src.domain.entities.loggedHours.ValidateHours); //done

    srv.before(['CREATE', 'UPDATE'], "LoggedHours", src.domain.entities.loggedHours.ValidateActiveProject); //done

    srv.before(['CREATE'], "LoggedHours", src.domain.entities.loggedHours.defaultNotSentStatusOnCreateLog); //done

    srv.before(['CREATE'], "LoggedHours", src.domain.entities.loggedHours.blockNewIfAlreadySentThisMonth);

    srv.before(['UPDATE'], "LoggedHours", src.domain.entities.loggedHours.onlySendLastLaboralDayThisMonth);

    srv.before(['CREATE'], "LoggedHours", src.domain.entities.loggedHours.employeeAssignedToThisProject);

    srv.before(['CREATE'], "LoggedHours", src.domain.entities.loggedHours.notMoreThanEstablishedWorkHours);

    srv.before(['CREATE'], "LoggedHours", src.domain.entities.loggedHours.notMoreThanEightHoursPerDay); //done

    srv.before(['CREATE', 'UPDATE'], "LoggedHours", src.domain.entities.loggedHours.notLogHoursOnPastOrFututeMonths);

    srv.before(['CREATE', 'UPDATE'], "LoggedHours", src.domain.entities.loggedHours.notLogHoursOnWeekend);

    //Logged Hours: exclusive for managers only
    srv.before(['UPDATE'], "LoggedHours", handlers.managers.entities.loggedHours.managerReviewLogStatus); //done

    srv.before(['UPDATE'], "LoggedHours", handlers.managers.entities.loggedHours.managerNotUpdateBasicInfoWhenSent); //done


    /*
        ACTIONS
    */

})