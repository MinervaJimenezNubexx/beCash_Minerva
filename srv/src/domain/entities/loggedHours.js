const {
    projectStatusConstant,
    loggedHoursStatusConstant,
    hoursRejectionReasonConstant
} = require('../constants');

async function ValidateHours(req) {
    await injectEmployeeId(req);
    const num = req.data.quantity;
    if (!num) return;

    if (num % 0.25 !== 0) {
        req.error(400, 'NOT_VALID_HOURS_NUM_ERROR')
    }
}

async function ValidateActiveProject(req) {
    await injectEmployeeId(req);
    const projectId = req.data.project_ID;
    if (!projectId) return;
    const project = await SELECT.one('my.beCash.Projects').where({ ID: projectId });
    if (project && project.status_ID === projectStatusConstant.CLOSED) {
        req.error(400, 'NOT_VALID_SELECTED_PROJECT_ERROR')
    }
}

async function employeeNotUpdateWhenSent(req) {
    await injectEmployeeId(req);
    const logId = req.params[0].ID
    if (!logId) return;
    const log = await SELECT.one('my.beCash.LoggedHours').where({ ID: logId });
    if (log && log.status_ID !== loggedHoursStatusConstant.NOT_SENT) {
        req.error(400, 'NOT_EDIT_LOG_ALREADY_SENT_ERROR')
    }
}

async function employeeNotUpdateStatusOfLog(req) {
    await injectEmployeeId(req);
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
    req.data.status_ID = loggedHoursStatusConstant.NOT_SENT;
    req.data.rejectionReason_ID = hoursRejectionReasonConstant.NOT_REJECTED;
}

async function blockNewIfAlreadySentThisMonth(req) {
    await injectEmployeeId(req);
    let logId = null;
    if (req.data && req.data.ID) {
        logId = req.data.ID;
    } 
    else if (req.params && req.params.length > 0) { //update
        logId = req.params[0].ID ? req.params[0].ID : req.params[0];
    }

    let employeeId = req.data.employee_ID,
        dateString = req.data.imputationDate;

    if (logId && (!employeeId || !dateString)) {
        const currentLog = await SELECT.one('my.beCash.LoggedHours').where({ ID: logId });
        if (currentLog) {
            employeeId = employeeId || currentLog.employee_ID;
            dateString = dateString || currentLog.imputationDate;
        }
    }

    if (!employeeId || !dateString) return;

    const date = new Date(dateString),
        year = date.getFullYear(),
        month = date.getMonth(),
        firstDayStr = new Date(year, month, 1).toISOString().split('T')[0],
        lastDayStr = new Date(year, month + 1, 0).toISOString().split('T')[0];

    const sentLogsExist = await SELECT.one('my.beCash.LoggedHours')
        .where({
            employee_ID: employeeId,
            imputationDate: { 'between': firstDayStr, 'and': lastDayStr },
            status_ID: { '!=': loggedHoursStatusConstant.NOT_SENT }
        });

    if (sentLogsExist) {
        return req.error(400, 'MONTH_ALREADY_SENT_ERROR');
    }
}

async function checkIfEmployeeAssignedToThisProject(req) {
    await injectEmployeeId(req);
    const employeeId = req.data.employee_ID,
    projectId = req.data.project_ID;

    if (!employeeId || !projectId) return;

    const assignment = await SELECT.one('my.beCash.EmployeesAssigned').where({
        employee_ID: employeeId,
        project_ID: projectId
    });

    if (!assignment || assignment.isActiveOnThisProject === false) {
        return req.error(403, 'EMPLOYEE_NOT_ACTIVE_IN_PROJECT_ERROR');
    }
}

function getWeekBoundaries(dateString) { // aux function
    const d = new Date(dateString),
        day = d.getDay();

    let adjustedDay = day;

    if (day === 0) { // sunday
        adjustedDay = 7;
    }

    const monday = new Date(d);
    monday.setDate(d.getDate() - adjustedDay + 1);

    const sunday = new Date(d);
    sunday.setDate(d.getDate() - adjustedDay + 7);

    return {
        mondayStr: monday.toISOString().split('T')[0],
        sundayStr: sunday.toISOString().split('T')[0]
    };
}

async function notMoreThanEstablishedWorkHours(req) {
    await injectEmployeeId(req);
    let logId = null;
    if (req.data && req.data.ID) {
        logId = req.data.ID;
    } else if (req.params && req.params[0]) {
        logId = req.params[0].ID ? req.params[0].ID : req.params[0];
    }

    let employeeId = req.data.employee_ID,
        date = req.data.imputationDate,
        incomingQuantity = req.data.quantity,
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

    const employee = await SELECT.one('my.beCash.Employees').where({ ID: employeeId });
    if (!employee || !employee.weeklyTargetHours) return;

    const targetHours = employee.weeklyTargetHours,
        boundaries = getWeekBoundaries(date),
        query = SELECT.from('my.beCash.LoggedHours')
            .where({
                employee_ID: employeeId,
                imputationDate: { 'between': boundaries.mondayStr, 'and': boundaries.sundayStr }
            });

    if (logId) {
        query.and({ ID: { '!=': logId } });
    }

    const existingLogs = await query;
    let totalWeeklyHours = 0;

    for (let i = 0; i < existingLogs.length; i++) {
        totalWeeklyHours = totalWeeklyHours + existingLogs[i].quantity;
    }

    if (totalWeeklyHours + incomingQuantity > targetHours) {
        req.error(400, 'EXCEEDS_WEEKLY_TARGET_ERROR', [targetHours, totalWeeklyHours]);
    }
}

async function notMoreThanEightHoursPerDay(req) {
    await injectEmployeeId(req);
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

    incomingQuantity = parseFloat(incomingQuantity);

    if (!employeeId || !date || isNaN(incomingQuantity)){
        return;
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

async function notLogHoursOnPastOrFututeMonths(req) {
    await injectEmployeeId(req);
    const stringImpDate = req.data.imputationDate;
    if (!stringImpDate) return;
    const impDate = new Date(stringImpDate),
        currentDate = new Date(),
        impMonth = impDate.getMonth(),
        impYear = impDate.getFullYear(),
        currentMonth = currentDate.getMonth(),
        currentYear = currentDate.getFullYear();

    if (impMonth !== currentMonth || impYear !== currentYear) {
        req.error(400, 'NOT_LOG_OUTSIDE_THIS_MONTH_ERROR');
    }
}

async function notLogHoursOnWeekend(req) {
    await injectEmployeeId(req);
    const stringImpDate = req.data.imputationDate;
    if (!stringImpDate) return;
    const impDate = new Date(stringImpDate),
        dayOfTheWeek = impDate.getDay();
    if (dayOfTheWeek == 6 || dayOfTheWeek == 0) {
        req.error(400, 'NOT_LOG_ON_WEEKENDS_ERROR')
    }
}

async function onlyDeleteNotSent(req) {
    await injectEmployeeId(req);
    const sLogId = req.data.ID;
    if (!sLogId) return;
    const oLog = await SELECT.one.from(req.target).where({ ID: sLogId });
    if (oLog && oLog.status_ID !== loggedHoursStatusConstant.NOT_SENT) {
        req.reject(400, 'NOT_DELETE_SENT_LOGS_ERROR');
    }
}

async function injectEmployeeId(req) {
    if (!req.data.employee_ID) {
        const oEmployee = await SELECT.one.from('my.beCash.Employees').where({ loginName: req.user.id });
        if (oEmployee) {
            req.data.employee_ID = oEmployee.ID; 
        } else {
            req.reject(403, 'USER_NOT_FOUND_ERROR');
        }
    }
}

module.exports = {
    ValidateHours,
    ValidateActiveProject,
    employeeNotUpdateWhenSent,
    employeeNotUpdateStatusOfLog,
    defaultNotSentStatusOnCreateLog,
    blockNewIfAlreadySentThisMonth,
    checkIfEmployeeAssignedToThisProject,
    notMoreThanEstablishedWorkHours,
    notMoreThanEightHoursPerDay,
    notLogHoursOnPastOrFututeMonths,
    notLogHoursOnWeekend,
    onlyDeleteNotSent
};