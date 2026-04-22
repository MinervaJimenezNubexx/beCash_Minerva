function ClientEmailFormat(req) {

    const email = req.data.email

    if (!email) return

    const emailFormat = /^[A-Za-z0-9._]+@[a-z]+\.(es|com)$/

    if (!emailFormat.test(email)) {
        req.error(400, 'INVALID_EMAIL_FORMAT_ERROR')
    }

}

module.exports = { 
    ClientEmailFormat
};