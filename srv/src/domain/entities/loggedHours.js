const { day } = require("@cap-js/hana/lib/cql-functions");

function ValidateHours(req) {
    const num = req.data.quantity;
    if (!num) return;

    if (num % 0.25 !== 0) {
        req.error(400, 'NOT_VALID_HOURS_NUM_ERROR')
    }
}

async function ValidateActiveProject(req) {
    const projectId = req.data.project_ID;
    if (!projectId) return;
    const project = await SELECT.one('my.beCash.Projects').where({ ID: projectId });
    if (project && project.status_ID === 'C') {
        req.error(400, 'NOT_VALID_SELECTED_PROJECT_ERROR')
    }
}

async function employeeNotUpdateWhenSent(req) {
    const logId = req.params[0].ID
    if (!logId) return;
    const log = await SELECT.one('my.beCash.LoggedHours').where({ ID: logId });
    if (log && log.status_ID !== 'N') {
        req.error(400, 'NOT_EDIT_LOG_ALREADY_SENT_ERROR')
    }
}

async function employeeNotUpdateStatusOfLog(req) {
    const logId = req.params[0].ID;
    if (!logId) return;
    const altStatus = req.data.status_ID;
    const rejReason = req.data.rejectionReason_ID;
    if (!rejReason && !altStatus) return;
    const log = await SELECT.one('my.beCash.LoggedHours').where({ ID: logId });
    if (log && (log.status_ID !== altStatus) || log && (log.rejectionReason_ID !== rejReason)) {
        req.error(400, 'NOT_EDIT_STATUS_OF_LOG_ERROR');
    }
}

function defaultNotSentStatusOnCreateLog(req) {
    req.data.status_ID = 'N';
    req.data.rejectionReason_ID = 'NR';
}

function blockNewIfAlreadySentThisMonth(req) {

}

function onlySendLastLaboralDayThisMonth(req) {

}

function employeeAssignedToThisProject(req) {

}

function notMoreThanEstablishedWorkHours(req) {

}

async function notMoreThanEightHoursPerDay(req) {
    let logId = null;
    if (req.data && req.data.ID) {
        logId = req.data.ID;
    } else if (req.params && req.params[0]) {
        logId = req.params[0].ID ? req.params[0].ID : req.params[0];
    }
    let employeeId = req.data.employee_ID,
        date = req.data.imputationDate,
        incomingQuantity = req.data.quantity,
        totalExistingHours = 0,
        currentLog = null;

    if (logId) {
        currentLog = await SELECT.one('my.beCash.LoggedHours').where({ ID: logId });
    }

    if (!employeeId && currentLog) {
        employeeId = currentLog.employee_ID;
    }
    if (!date && currentLog) {
        date = currentLog.imputationDate;
    }
    if (incomingQuantity === undefined && currentLog) {
        incomingQuantity = currentLog.quantity;
    }

    if (!employeeId || !date || incomingQuantity === undefined) return;

    const hoursThatDay = SELECT.from('my.beCash.LoggedHours')
        .where({ employee_ID: employeeId, imputationDate: date });

    if (logId) { //except the log that is being updated so we don't sum both the old and the new value of this log
        hoursThatDay.and({ ID: { '!=': logId } });
    }

    const existingLogs = await hoursThatDay;

    for (let i = 0; i < existingLogs.length; i++) {
        totalExistingHours = totalExistingHours + existingLogs[i].quantity;
    }

    if (totalExistingHours + incomingQuantity > 8) {
        req.error(400, 'NOT_LOG_MORE_THAN_8_HOURS_PER_DAY_ERROR', [totalExistingHours, date]);
    }
}

function notLogHoursOnPastOrFututeMonths(req) {
    const stringImpDate = req.data.imputationDate;
    if (!stringImpDate) return;
    const impDate = new Date(stringImpDate),
        currentDate = new Date(),
        impMonth = impDate.getMonth(),
        impYear = impDate.getFullYear(),
        currentMonth = currentDate.getMonth(),
        currentYear = currentDate.getFullYear();

        if (impMonth !== currentMonth || impYear !== currentYear) {
        req.error(400, 'NOT_LOG_OUTSID_THIS_MONTH_ERROR');
    }
}

function notLogHoursOnWeekend(req) {
    const stringImpDate = req.data.imputationDate;
    if (!stringImpDate) return;
    const impDate = new Date(stringImpDate),
        dayOfTheWeek = impDate.getDay();
    if (dayOfTheWeek == 6 || dayOfTheWeek == 0) {
        req.error(400, 'NOT_LOG_ON_WEEKENDS_ERROR')
    }
}

module.exports = {
    ValidateHours,
    ValidateActiveProject,
    employeeNotUpdateWhenSent,
    employeeNotUpdateStatusOfLog,
    defaultNotSentStatusOnCreateLog,
    blockNewIfAlreadySentThisMonth,
    onlySendLastLaboralDayThisMonth,
    employeeAssignedToThisProject,
    notMoreThanEstablishedWorkHours,
    notMoreThanEightHoursPerDay,
    notLogHoursOnPastOrFututeMonths,
    notLogHoursOnWeekend
};