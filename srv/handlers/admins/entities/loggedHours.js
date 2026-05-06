async function modifiedByAdmin(req) {
    const logHoursId = req.params[0].ID

    if (!logHoursId) return

    const currentLog = await SELECT.one('my.beCash.LoggedHours').where({ ID: logHoursId });

    if(!currentLog){
        return req.error(404, 'LOG_NOT_FOUND_ERROR')
    }

    if (currentLog.status_ID === 'N') {
        return req.error(400, 'CANT_EDIT_NOT_SENT_LOG_ERROR');
    }

    let hasActualChanges = false;
    const fieldsToIgnore = ['ID', 'isModifiedByAdmin', 'modificationDate'];

    for (const value in req.data) {
        if (!fieldsToIgnore.includes(value)) {
            if (req.data[value] !== currentLog[value]) {
                hasActualChanges = true;
                break;
            }
        }
    }

    if (!hasActualChanges) {
        return req.error(400, 'NO_CHANGES_DETECTED_ERROR'); 
    }

    req.data.isModifiedByAdmin = true;
    req.data.modificationDate = new Date().toISOString();

    const finalStatus = req.data.status_ID || currentLog.status_ID;

    if (finalStatus === 'A') {
        req.data.rejectionReason_ID = 'NR';
    }

}

module.exports = {
    modifiedByAdmin
};