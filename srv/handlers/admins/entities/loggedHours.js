async function modifiedByAdmin(req) {
    const logHoursId = req.params[0].ID

    if (!logHoursId) return

    const currentLog = await SELECT.one('my.beCash.LoggedHours').where({ ID: logHoursId });

    if(!currentLog){
        return req.error(404, 'LOG_NOT_FOUND_ERROR')
    }

    if (currentLog.status_ID === 'N' || currentLog.status_ID === 'P') {
        return req.error(400, 'CANT_EDIT_NOT_RESOLVED_LOG_ERROR');
    }

    req.data.isModifiedByAdmin = true;
    req.data.modificationDate = new Date().toISOString();

    if (req.data.status_ID === 'A') {
        req.data.rejectionReason_ID = 'NR';
    }

}

module.exports = {
    modifiedByAdmin
};