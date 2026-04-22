async function deactivateEmployees(req) {
    const employeeId = req.params[0].ID

    if (!employeeId) {
        return req.error(400, 'NO_EMPLOYEE_ID_ERROR')
    }

    const updated = await UPDATE('my.beCash.Employees')
        .set({ isActive: false })
        .where({ ID: employeeId });

    if (updated === 0) {
        return req.error(404, 'EMPLOYEE_NOT_FOUND_ERROR');
    }

    req.notify('EMPLOYEE_DEACTIVATED');

    return { msg: 'OK' };
}

module.exports = {
    deactivateEmployees
};