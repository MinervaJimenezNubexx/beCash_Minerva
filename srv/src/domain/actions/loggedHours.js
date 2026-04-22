const { Object_keys } = require("@sap/cds/lib/utils/cds-utils");

function getLastTwoWorkingDays(year, month) {
    const lastDay = new Date(year, month + 1, 0),
        dayOfWeek = lastDay.getDay();

    if (dayOfWeek === 0) {
        lastDay.setDate(lastDay.getDate() - 2);
    } else if (dayOfWeek === 6) {
        lastDay.setDate(lastDay.getDate() - 1);
    }

    const secondToLast = new Date(lastDay);
    if (lastDay.getDay() === 1) {
        secondToLast.setDate(secondToLast.getDate() - 3);
    } else {
        secondToLast.setDate(secondToLast.getDate() - 1);
    }

    return {
        lastDayStr: lastDay.toISOString().split('T')[0],
        secondToLastStr: secondToLast.toISOString().split('T')[0]
    };
}

async function sendThisMonthHours(req) {
    const today = new Date(),
        year = today.getFullYear(),
        month = today.getMonth(),
        validDays = getLastTwoWorkingDays(year, month),
        todayStr = today.toISOString().split('T')[0];

    if (todayStr !== validDays.lastDayStr && todayStr !== validDays.secondToLastStr) {
        return req.error(400, 'ONLY_SEND_LAST_TWO_WORKING_DAYS_ERROR', [validDays.secondToLastStr, validDays.lastDayStr]);
    }

    const loginName = req.user.id,
        employee = await SELECT.one('my.beCash.Employees').where({ loginName: loginName });

    if (!employee) {
        return req.error(404, 'EMPLOYEE_NOT_FOUND_ERROR');
    }

    const firstDayOfMonthStr = new Date(year, month, 1).toISOString().split('T')[0],
        lastDayOfMonthStr = new Date(year, month + 1, 0).toISOString().split('T')[0];

    const updatedCount = await UPDATE('my.beCash.LoggedHours')
        .set({ status_ID: 'P' })
        .where({
            employee_ID: employee.ID,
            status_ID: 'N',
            imputationDate: { 'between': firstDayOfMonthStr, 'and': lastDayOfMonthStr }
        });

    if (updatedCount === 0) {
        req.notify('NO_PENDING_HOURS_TO_SEND_ERROR');
        return { message: 'OK. NO' };
    }

    req.notify('HOURS_SENT_SUCCESSFULLY', [updatedCount]);
    return { message: 'OK. SENT'};
}

module.exports = {
    sendThisMonthHours
};