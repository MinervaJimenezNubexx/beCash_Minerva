const {
    projectStatusConstant,
    loggedHoursStatusConstant,
    hoursRejectionReasonConstant
} = require('../../../src/domain/constants');

async function resolveEmployeeHoursByDateRange(req) {
    const project_ID = req.params[0]?.ID || req.params[0],
        { startDate, endDate, status_ID, rejectionReason_ID } = req.data;

    if (!project_ID || !startDate || !endDate || !status_ID) {
        return req.error(400, 'MISSING_PARAMETERS_ERROR');
    }
    if (status_ID === loggedHoursStatusConstant.REJECTED && !rejectionReason_ID) {
        return req.error(400, 'REJECTION_REASON_REQUIRED_ERROR');
    }

    const currentManager = await SELECT.one('my.beCash.Employees').where({ loginName: req.user.id });
    if (!currentManager) return req.error(404, 'MANAGER_NOT_FOUND_ERROR');

    const targetProject = await SELECT.one('my.beCash.Projects').where({
        ID: project_ID,
        managerOnCharge_ID: currentManager.ID
    });

    if (!targetProject) {
        return req.error(403, 'CANNOT_MANAGE_THIS_PROJECT_ERROR');
    }

    const updateData = { status_ID: status_ID };

    if (status_ID === loggedHoursStatusConstant.REJECTED) {
        updateData.rejectionReason_ID = rejectionReason_ID;
    } else if (status_ID === loggedHoursStatusConstant.APPROVED) {
        updateData.rejectionReason_ID = hoursRejectionReasonConstant.NOT_REJECTED;
    }

    const updatedCount = await UPDATE('my.beCash.LoggedHours')
        .set(updateData)
        .where({
            project_ID: project_ID,
            status_ID: loggedHoursStatusConstant.PENDING,
            imputationDate: { 'between': startDate, 'and': endDate }
        });

    if (updatedCount === 0) {
        req.info('NO_PENDING_HOURS_FOUND_IN_RANGE');
        return { message: "No hours updated.", updatedCount: 0 };
    }

    req.notify('HOURS_RESOLVED_SUCCESSFULLY', [updatedCount]);
    return { message: `Successfully resolved ${updatedCount} logs for this project.`, updatedCount };
}

async function managerAddEmployeeToProject(req) {
    const project_ID = req.params[0]?.ID || req.params[0],
        { employee_ID } = req.data;

    if (!employee_ID) return req.error(400, 'EMPLOYEE_ID_REQUIRED_ERROR');

    const currentManager = await SELECT.one('my.beCash.Employees').where({ loginName: req.user.id }),
        project = await SELECT.one('my.beCash.Projects')
            .where({ ID: project_ID, managerOnCharge_ID: currentManager.ID });
        employee = await SELECT.one('my.beCash.Employees').where({ ID: employee_ID });
        
    if (!employee) return req.error(404, 'EMPLOYEE_NOT_FOUND_ERROR');

    if (!project) return req.error(403, 'CANNOT_MANAGE_THIS_PROJECT_ERROR');

    const existingAssignment = await SELECT.one('my.beCash.EmployeesAssigned')
        .where({ employee_ID: employee_ID, project_ID: project_ID });

    if (existingAssignment) {
        if (existingAssignment.isActiveOnThisProject) {
            return req.error(400, 'EMPLOYEE_ALREADY_ACTIVE_IN_PROJECT');
        }
        await UPDATE('my.beCash.EmployeesAssigned')
            .set({ isActiveOnThisProject: true })
            .where({ employee_ID: employee_ID, project_ID: project_ID });

        return { message: "Employee successfully reactivated in the project." };
    } else {
        await INSERT.into('my.beCash.EmployeesAssigned').entries({
            employee_ID: employee_ID,
            project_ID: project_ID,
            isActiveOnThisProject: true
        });

        return { message: "Employee successfully added to the project." };
    }
}

async function managerRemoveEmployeeFromProject(req) {
    const project_ID = req.params[0]?.ID || req.params[0],
        { employee_ID } = req.data;

    if (!employee_ID) return req.error(400, 'EMPLOYEE_ID_REQUIRED_ERROR');

    const currentManager = await SELECT.one('my.beCash.Employees').where({ loginName: req.user.id }),
        project = await SELECT.one('my.beCash.Projects')
            .where({ ID: project_ID, managerOnCharge_ID: currentManager.ID });

    if (!project) return req.error(403, 'CANNOT_MANAGE_THIS_PROJECT_ERROR');

    const updatedCount = await UPDATE('my.beCash.EmployeesAssigned')
        .set({ isActiveOnThisProject: false })
        .where({
            employee_ID: employee_ID,
            project_ID: project_ID,
            isActiveOnThisProject: true
        });

    if (updatedCount === 0) {
        return req.error(404, 'EMPLOYEE_NOT_FOUND_OR_ALREADY_INACTIVE');
    }

    return { message: "Employee successfully removed from the project." };
}

async function advanceStatus(req) {
    try {
        const Projects = req.target;
        let projectId = typeof req.params[0] === 'object' ? req.params[0].ID : req.params[0];

        if (!projectId) {
            return req.reject(400, 'PROJECT_NOT_IDENTIFIED_ERROR');
        }

        let project = await SELECT.one.from(Projects).where({ ID: projectId });

        if (!project) {
            return req.reject(404, 'PROJECT_NOT_FOUND_ERROR');
        }

        let nextStatus;
        switch (project.status_ID) {
            case projectStatusConstant.OPEN: nextStatus = projectStatusConstant.DEVELOPMENT; break;
            case projectStatusConstant.DEVELOPMENT: nextStatus = projectStatusConstant.QUALITY; break;
            case projectStatusConstant.QUALITY: nextStatus = projectStatusConstant.TESTING; break;
            case projectStatusConstant.TESTING:
                closingDate = new Date().toISOString();
                await UPDATE(Projects).set({ closedAt: closingDate }).where({ ID: projectId });
                await UPDATE('my.beCash.LoggedHours')
                    .set({ status_ID: loggedHoursStatusConstant.APPROVED, rejectionReason_ID: hoursRejectionReasonConstant.NOT_REJECTED })
                    .where({ project_ID: projectId, status_ID: loggedHoursStatusConstant.PENDING });
                nextStatus = projectStatusConstant.CLOSED;
                break;
            case projectStatusConstant.CLOSED:
                return req.reject(400, 'STATUS_CLOSED_CANNOT_BE_CHANGED');
            default:
                return req.reject(400, 'UNKNOWN_PROJECT_STATUS_ERROR');
        }

        await UPDATE(Projects).set({ status_ID: nextStatus }).where({ ID: projectId });
        return;

    } catch (error) {
        console.error('UPDATE_STATUS_CRITICAL_ERROR', error);
        return req.reject(500, 'UPDATE_STATUS_SYSTEM_ERROR');
    }
}

async function updateProjectBudget(req) {
    const ProjectsTable = 'my.beCash.Projects';
    let projectId = typeof req.params[0] === 'object' ? req.params[0].ID : req.params[0];

    if (!projectId) {
        return req.reject(400, 'PROJECT_NOT_IDENTIFIED_ERROR');
    }

    let newBudget = req.data.initialBudget;

    if (newBudget === undefined || newBudget === null) {
        return req.reject(400, 'NEW_BUDGET_REQUIRED_ERROR');
    }

    if (newBudget === undefined || newBudget === null) return;

    const MIN_BUDGET = 5000,
        MAX_BUDGET = 10000000;

    if (newBudget < MIN_BUDGET || newBudget > MAX_BUDGET) {
        return req.error(500, 'UNREASONABLE_BUDGET_ERROR', [MIN_BUDGET, MAX_BUDGET]);
    }
        
    try {
        const project = await SELECT.one(ProjectsTable).where({ ID: projectId });

        if (!project) {
            return req.reject(404, 'PROJECT_NOT_FOUND_ERROR');
        }

        if (project.status_ID === projectStatusConstant.CLOSED) {
            return req.reject(403, 'PROJECT_CLOSED_BUDGET_ERROR'); 
        }

        await UPDATE(ProjectsTable).set({ initialBudget: newBudget }).where({ ID: projectId });
        return;

        } catch (error) {
        console.error('UPDATE_BUDGET_CRITICAL_ERROR', error);
        return req.reject(500, 'UPDATE_BUDGET_SYSTEM_ERROR');
    }
}

module.exports = {
    resolveEmployeeHoursByDateRange,
    managerAddEmployeeToProject,
    managerRemoveEmployeeFromProject,
    advanceStatus,
    updateProjectBudget
};
