function ValidHours(req) {
    const num = req.data.quantity;
    if (!num) return;

    if (num % 0.25 !== 0) {
        req.error(400, 'Invalid number of hours, decimals need to be quarters only.')
    }
}

async function ActiveProject(req) {
    const projectId = req.data.project_ID;
    if (!projectId) return;
    const project = await SELECT.one('my.beCash.Projects').where({ ID: projectId });
    if (project && project.status_ID === 'C') {
        req.error(400, 'The selected project is closed.')
    }
}

async function employeeNotUpdateWhenSent(req) {
    const logId = req.params[0].ID
    if (!logId) return;
    const log = await SELECT.one('my.beCash.LoggedHours').where({ ID: logId });
    if (log && log.status_ID !== 'N'){
        req.error(400, 'You cannot edit a register of hours that has already been sent.')
    }
}

function employeeNotUpdateStatusOfLog(req){
    
}

function blockNewIfAlreadySentThisMonth(req) {

}

function onlySendLastLaboralDayThisMonth(req) {

}

function employeeAssignedToThisProject(req) {

}

function notMoreThanEstablishedWorkHours(req) {

}

function notMoreThanEightHoursPerDay(req) {

}

function notLogHoursOnPastOrFututeMonths(req) {

}

function notLogHoursOnWeekend(req) {

}

module.exports = {
    ValidHours,
    ActiveProject,
    employeeNotUpdateWhenSent,
    employeeNotUpdateStatusOfLog,
    blockNewIfAlreadySentThisMonth,
    onlySendLastLaboralDayThisMonth,
    employeeAssignedToThisProject,
    notMoreThanEstablishedWorkHours,
    notMoreThanEightHoursPerDay,
    notLogHoursOnPastOrFututeMonths,
    notLogHoursOnWeekend
};