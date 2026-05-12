const projectStatusConstant = {
    OPEN: 'O',
    DEVELOPMENT: 'D',
    QUALITY: 'Q',
    TESTING: 'T',
    CLOSED: 'C'
};

const hoursRejectionReasonConstant = {
    NOT_REJECTED: 'NR',
    TIME_INCONSISTENCIES: 'TI',
    LACK_OF_HOURS: 'LOH',
    NO_PROGRESS: 'NP',
    UNAUTHORIZED_OVERTIME: 'UO'
};

const loggedHoursStatusConstant = {
    NOT_SENT: 'N',
    PENDING: 'P',
    APPROVED: 'A',
    REJECTED: 'R'
};

const PositionNameConstant = {
    JUNIOR: 'J',
    MID: 'MID',
    SENIOR: 'S',
    LEAD: 'L',
    MANAGER: 'MGR'
};

module.exports = {
    projectStatusConstant,
    hoursRejectionReasonConstant,
    loggedHoursStatusConstant,
    PositionNameConstant
};