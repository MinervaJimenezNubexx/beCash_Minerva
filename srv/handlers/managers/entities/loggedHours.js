async function managerReviewLogStatus(req) {
    const logId = req.params[0].ID
    if (!logId) return;

    const newStatus = req.data.status_ID;
    const newReason = req.data.rejectionReason_ID;

    if (!newStatus && !newReason) return;

    const currentLog = await SELECT.one('my.beCash.LoggedHours').where({ ID: logId });
    if (!currentLog) return;

    const isChangingStatus = newStatus && (currentLog.status_ID !== newStatus),
        isChangingReason = newReason && (currentLog.rejectionReason_ID !== newReason);

    if (isChangingStatus || isChangingReason) {

        if (currentLog.status_ID !== 'P') {
            return req.error(400, 'Managers can only modify the status of hours that are currently Pending.');
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
                return req.error(400, 'You must provide a valid rejection reason when rejecting logged hours.');
            }
        }

        if (newStatus === 'A') {
            req.data.rejectionReason_ID = 'NR';
        }
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
        req.error(400, 'You are not allowed to modify the data other than the status and rejection reason of a register of hours.');
    }
}

module.exports = {
    managerReviewLogStatus,
    managerNotUpdateBasicInfoWhenSent
};