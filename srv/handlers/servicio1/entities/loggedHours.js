function ValidHours(req) {
    const num = req.data.quantity;
    if (!num) return;

    if (num % 0.25 !== 0) {
        req.error(400, 'Invalid number of hours, decimals need to be quarters only.')
    }
}

async function ActiveProject(req){
    const projectId = req.data.project_ID;
    if (!projectId) return;
    const project = await SELECT.one('my.beCash.Projects').where({ ID: projectId });
    if(project && project.status === 'Closed'){
        req.error(400, 'The selected project is closed.')
    }
}

function employeeNotUpdateWhenSent(req) {
    
}

function managerNotUpdateWhenResolved(req) {

}

function modifiedByAdmin(req) {
    
}

module.exports = { 
    ValidHours,
    ActiveProject,
    employeeNotUpdateWhenSent,
    managerNotUpdateWhenResolved,
    modifiedByAdmin
};