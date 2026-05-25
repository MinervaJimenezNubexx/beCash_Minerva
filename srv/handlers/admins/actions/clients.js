async function deactivateClients(req) {
    const clientId = req.params[0].ID

    if (!clientId) {
        return req.error(400, 'NO_CLIENT_ID_ERROR')
    }

    const updated = await UPDATE('my.beCash.Clients')
        .set({ isActive: false })
        .where({ ID: clientId });

    if (updated === 0) {
        return req.error(404, 'CLIENT_NOT_FOUND_ERROR');
    }

    req.notify('CLIENT_DEACTIVATED');

    return { msg: 'OK' };

}

async function activateClients(req) {
    const clientId = req.params[0].ID

    if (!clientId) {
        return req.error(400, 'NO_CLIENT_ID_ERROR')
    }

    const updated = await UPDATE('my.beCash.Clients')
        .set({ isActive: true })
        .where({ ID: clientId });

    if (updated === 0) {
        return req.error(404, 'CLIENT_NOT_FOUND_ERROR');
    }

    req.notify('CLIENT_ACTIVATED');

    return { msg: 'OK' };

}

module.exports = {
    deactivateClients,
    activateClients
};