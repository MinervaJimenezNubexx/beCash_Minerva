async function deactivateClients(req) {
    const clientId = req.params[0].ID

    if (!clientId) {
        return req.error(400, 'There is no client ID.')
    }

    const updated = await UPDATE('my.beCash.Clients')
        .set({ isActive: false })
        .where({ ID: clientId });

    if (updated === 0) {
        return req.error(404, 'Client not found.');
    }

    return { msg: 'Client deactivated.' };

}

module.exports = { 
    deactivateClients
};