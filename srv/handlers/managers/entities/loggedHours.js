/* async function managerReviewLogStatus(req) {
    const logId = req.params[0].ID
    if (!logId) return;

    const newStatus = req.data.status_ID;
    const newReason = req.data.rejectionReason_ID;

    if (!newStatus && !newReason) return;

    const currentLog = await SELECT.one('my.beCash.LoggedHours').where({ ID: logId });
    if (!currentLog) return;

    if (currentLog.status_ID !== 'P') {
        return req.error(400, 'ONLY_MODIFY_PENDING_LOG_ERROR');
    }

    if (newStatus === 'R') {

        let finalReason;
        if (newReason) {
            finalReason = newReason;
        }
        else {
            finalReason = currentLog.rejectionReason_ID;
        }

        if (finalReason === 'NR') {
            return req.error(400, 'MUST_PROVIDE_VALID_REJREASON_ERROR');
        }
    }

    if (newStatus === 'A') {
        req.data.rejectionReason_ID = 'NR';
    }
}

async function managerNotUpdateBasicInfoWhenSent(req) {
    const logId = req.params[0].ID;
    if (!logId) return;
    const newQuantity = req.data.quantity,
        newEmp = req.data.employee_ID,
        newProj = req.data.project_ID,
        newImpDate = req.data.imputationDate;

    if (!newQuantity && !newEmp && !newProj && !newImpDate) return;

    const log = await SELECT.one('my.beCash.LoggedHours').where({ ID: logId });
    if (log && (log.quantity !== newQuantity) || log && (log.employee_ID !== newEmp) || log && (log.project_ID !== newProj) || log && (log.imputationDate !== newImpDate)) {
        req.error(400, 'NOT_MODIFY_OTHER_DATA_ERROR');
    }
}

module.exports = {
    managerReviewLogStatus,
    managerNotUpdateBasicInfoWhenSent
}; */