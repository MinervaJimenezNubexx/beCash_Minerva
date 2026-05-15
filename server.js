const cds = require('@sap/cds');

const {
    projectStatusConstant,
    loggedHoursStatusConstant
} = require('./srv/src/domain/constants');

cds.on('served', async () => {

    const { Projects, LoggedHours } = cds.entities('my.beCash');

    // =================================================================================================
    // FUNCTION 1: Final Project Report
    // Generates a final report for closed projects every 30 seconds, calculating total billing based 
    // on logged hours and employee billing rates, and marks the report as sent to the client.
    // =================================================================================================
    cds.spawn({ every: 30000 }, async (tx) => { // 30 sec
        try {
            const aClosedProjects = await tx.read(Projects)
                .where({ status_ID: projectStatusConstant.CLOSED, reportSentToClient: false })
                .columns(project => {
                    project.ID, project.name, project.client(client => { client.name, client.email })
                });

            for (let oProject of aClosedProjects) {
                const aHours = await tx.read(LoggedHours)
                    .where({ project_ID: oProject.ID, status_ID: loggedHoursStatusConstant.APPROVED })
                    .columns(hours => {
                        hours.quantity,
                            hours.employee(employee => { employee.position(position => { position.billing }) })
                    });

                let nTotal = aHours.reduce((acc, hours) => acc + (hours.quantity * hours.employee.position.billing), 0);

                console.log(`
                    --- CLOSED PROJECT FINAL REPORT ---
                    Client: ${oProject.client.name}
                    Project: ${oProject.name}
                    Total Billed: ${nTotal.toFixed(2)} €
                    Status: Project settled after closure.
                    -------------------------------------------`);

                await tx.update(Projects, oProject.ID).with({ reportSentToClient: true });
            }
        } catch (err) { console.error("Error on the final report: ", err); }
    });

    // ==========================================================================================================
    // FUNCTION 2: Monthly Billing Summary Report
    // Generates a billing summary for each project every month, based on the hours logged in the previous month.
    // ==========================================================================================================
    cds.spawn({ every: 120000 }, async (tx) => { // 2 min
        try {
            console.log("Generating monthly project status review.");

            const now = new Date(),
                firstDayMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0],
                lastDayMonth = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0],
                aProjects = await tx.read(Projects).columns(project => {
                    project.ID, project.name, project.client(client => { client.name })
                });

            for (let oProject of aProjects) {
                const aMonthHours = await tx.read(LoggedHours)
                    .where({
                        project_ID: oProject.ID,
                        imputationDate: { '>=': firstDayMonth, '<=': lastDayMonth },
                        status_ID: loggedHoursStatusConstant.APPROVED
                    })
                    .columns(hours => {
                        hours.quantity,
                            hours.employee(employee => { employee.position(position => { position.billing }) })
                    });

                if (aMonthHours.length > 0) {
                    let nMonthTotal = aMonthHours.reduce((acc, hours) => acc + (hours.quantity * hours.employee.position.billing), 0);

                    console.log(`
                        --- MONTHLY PROJECT BILLING REVIEW ---
                        Period: ${firstDayMonth} to ${lastDayMonth}
                        Client: ${oProject.client.name}
                        Project: ${oProject.name}
                        Monthly Expense: ${nMonthTotal.toFixed(2)} €
                        -----------------------------------------`);
                }
            }
        } catch (error) { console.error("Monthly Billing Report Error:", error); }
    });

});

module.exports = cds.server;