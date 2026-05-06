async function autoAssignManagerToNewProject (req){
    const currentManager = await SELECT.one('my.beCash.Employees')
        .columns('ID')
        .where({ loginName: req.user.id });

    if (!currentManager) return;

    req.data.managerOnCharge_ID = currentManager.ID;

    if (!req.data.employeesAssigned) {
        req.data.employeesAssigned = [];
    }

    const alreadyAssigned = req.data.employeesAssigned.some(e => e.employee_ID === currentManager.ID);
    
    if (!alreadyAssigned) {
        req.data.employeesAssigned.push({
            employee_ID: currentManager.ID,
            isActiveOnThisProject: true
        });
    }
}

function validateReasonableBudget(req) {
    const budget = req.data.initialBudget;

    if (budget === undefined || budget === null) return;

    const MIN_BUDGET = 1000;
    const MAX_BUDGET = 10000000;

    if (budget < MIN_BUDGET || budget > MAX_BUDGET) {
        return req.error(500, 'UNREASONABLE_BUDGET_ERROR', [MIN_BUDGET, MAX_BUDGET]);
    }
}


module.exports = {
    autoAssignManagerToNewProject,
    validateReasonableBudget
};
