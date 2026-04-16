function EmployeeEmailFormat(req) {

    const email = req.data.Email

    if (!email) return

    const emailFormat = /^[A-Za-z0-9._]+@nubexx\.(es|com)$/

    if (!emailFormat.test(email)) {
        req.error(400, 'Invalid email format.')
    }
}

function notDeleteEmployees(req) {


}

module.exports = { 
    EmployeeEmailFormat,
    notDeleteEmployees
};