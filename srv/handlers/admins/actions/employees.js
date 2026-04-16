async function deactivateEmployees(req) {
    const employeeId = req.params[0].ID

    if (!employeeId) {
        return req.error(400, 'There is no employee ID.')
    }

    const updated = await UPDATE('my.beCash.Employees')
        .set({ isActive: false })
        .where({ ID: employeeId });

    if (updated === 0) {
        return req.error(404, 'Employee not found.');
    }

    return { msg: 'Employee deactivated.' };
}

module.exports = {
    deactivateEmployees
};