function ClientEmailFormat(req) {

    const email = req.data.Email

    if (!email) return

    const emailFormat = /^[A-Za-z0-9._]+@[a-z]+\.(es|com)$/

    if (!emailFormat.test(email)) {
        req.error(400, 'Invalid email format.')
    }

}

function notDeleteClients(req) {


}

module.exports = { 
    ClientEmailFormat,
    notDeleteClients
};