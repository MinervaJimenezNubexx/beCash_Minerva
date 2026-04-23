async function resolveEmployeeHoursByDateRange(req) {
    const project_ID = req.params[0]?.ID || req.params[0],
    { startDate, endDate, status_ID, rejectionReason_ID } = req.data;

    if (!project_ID || !startDate || !endDate || !status_ID) {
        return req.error(400, 'MISSING_PARAMETERS_ERROR');
    }
    if (status_ID === 'R' && !rejectionReason_ID) {
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

    if (status_ID === 'R') {
        updateData.rejectionReason_ID = rejectionReason_ID;
    } else if (status_ID === 'A') {
        updateData.rejectionReason_ID = 'NR'; 
    }

    const updatedCount = await UPDATE('my.beCash.LoggedHours')
        .set(updateData)
        .where({
            project_ID: project_ID, 
            status_ID: 'P',
            imputationDate: { 'between': startDate, 'and': endDate }
        });

    if (updatedCount === 0) {
        req.info('NO_PENDING_HOURS_FOUND_IN_RANGE');
        return { message: "No hours updated.", updatedCount: 0 };
    }

    req.notify('HOURS_RESOLVED_SUCCESSFULLY', [updatedCount]);
    return { message: `Successfully resolved ${updatedCount} logs for this project.`, updatedCount };
}

module.exports = { 
    resolveEmployeeHoursByDateRange 
};
