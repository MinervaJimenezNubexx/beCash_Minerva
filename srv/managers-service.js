const cds = require('@sap/cds')
const handlers = require('./handlers')
const src = require('./src')

module.exports = cds.service.impl(async function (srv) {
    /*
        ENTITIES
    */

    //Logged Hours: exclusive for managers only

    //srv.before(['UPDATE'], "LoggedHours", handlers.managers.entities.loggedHours.managerReviewLogStatus); //deleted

    //srv.before(['UPDATE'], "LoggedHours", handlers.managers.entities.loggedHours.managerNotUpdateBasicInfoWhenSent); //deleted

    srv.before(['CREATE'], "Projects", handlers.managers.entities.projects.autoAssignManagerToNewProject); //done

    srv.before(['CREATE'], "Projects", handlers.managers.entities.projects.validateReasonableBudget); //done
    
    /*
        ACTIONS
    */

    //Bound Actions
    srv.on("resolveEmployeeHoursOneByOne", handlers.managers.actions.loggedHours.resolveEmployeeHoursOneByOne); //done, only for managers

    //Projects

    //Bound Actions
    srv.on("resolveEmployeeHoursByDateRange", handlers.managers.actions.projects.resolveEmployeeHoursByDateRange); //done, only for managers
    
    srv.on("managerAddEmployeeToProject", handlers.managers.actions.projects.managerAddEmployeeToProject); //done, only for managers

    srv.on("managerRemoveEmployeeFromProject", handlers.managers.actions.projects.managerRemoveEmployeeFromProject); //done, only for managers

    srv.on("advanceStatus", handlers.managers.actions.projects.advanceStatus); //done, only for managers

    srv.on("updateProjectBudget", handlers.managers.actions.projects.updateProjectBudget); //done

})