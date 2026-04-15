const cds = require('@sap/cds')
const handlers = require('./handlers')

module.exports = cds.service.impl(async function (srv) {
    /*
        ENTITIES
    */

    //Logged Hours
    srv.before(['UPDATE'], "LoggedHours", handlers.managers.entities.loggedHours.managerNotUpdateWhenResolved);

    //Projects
    //srv.before(['CREATE'], "Projects", handlers.managers.entities.projects.validInitialBudget);
    //srv.before(['UPDATE'], "Projects", handlers.managers.entities.projects.notUpdateBudgetToLowerQuantity);
    //srv.before(['CREATE'], "Projects", handlers.managers.entities.projects.validProjectStatus);
    //srv.before(['CREATE'], "Projects", handlers.managers.entities.projects.autoAssignManager);
    //srv.before(['CREATE', 'UPDATE'], "Projects", handlers.managers.entities.projects.managerOnChargeIsManager);


    /*
        ACTIONS
    */

})