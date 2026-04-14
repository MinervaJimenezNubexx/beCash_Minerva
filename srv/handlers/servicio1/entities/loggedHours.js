function ValidHours(req) {

    const num = req.data.quantity;
    if (!num) return
    const decimal = num - Math.floor(num);

    let isValid = [0.00, 0.25, 0.50, 0.75].includes(decimal.toFixed(2));

    if (!isValid) {
        req.error(400, 'Invalid number of hours.')
    }
}

function ActiveProject(req){
    const status = req.data.project.status;
    if (!status) return
    if(status == 'Closed'){
        req.error(400, 'The selected project is closed.')
    }

}

module.exports = { 
    ValidHours,
    ActiveProject
};