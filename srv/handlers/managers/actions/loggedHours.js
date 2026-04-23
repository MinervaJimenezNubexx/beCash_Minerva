async function resolveEmployeeHoursOneByOne (req){
    const { status_ID, rejectionReason_ID } = req.data,
    logId = req.params[0]?.ID || req.params[0];

    if (!status_ID) return req.error(400, 'STATUS_REQUIRED_ERROR');

    if (status_ID === 'R' && !rejectionReason_ID) {
        return req.error(400, 'REJECTION_REASON_REQUIRED_ERROR');
    }

    const currentLog = await SELECT.one('my.beCash.LoggedHours')
        .columns('project_ID', 'status_ID')
        .where({ ID: logId });

    if (!currentLog) return req.error(404, 'LOG_NOT_FOUND');

    if (currentLog.status_ID !== 'P') {
        return req.error(400, 'ONLY_PENDING_LOGS_CAN_BE_RESOLVED');
    }

    //backend security
    const currentManager = await SELECT.one('my.beCash.Employees').where({ loginName: req.user.id });
    const project = await SELECT.one('my.beCash.Projects')
        .where({ ID: currentLog.project_ID, managerOnCharge_ID: currentManager.ID });
    //backend security
    if (!project) {
        return req.error(403, 'CANNOT_MANAGE_LOGS_FROM_OTHER_PROJECTS');
    }

    const updateData = { status_ID: status_ID };
    if (status_ID === 'R') {
        updateData.rejectionReason_ID = rejectionReason_ID;
    } else {
        updateData.rejectionReason_ID = 'NR';
    }

    await UPDATE('my.beCash.LoggedHours').set(updateData).where({ ID: logId });

    return { message: "Log resolved successfully." };
}

module.exports = { 
    resolveEmployeeHoursOneByOne 
};
