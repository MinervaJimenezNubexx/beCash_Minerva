namespace my.beCash;

using {cuid} from '@sap/cds/common';

type Name                 : String(30);
type Email                : String(121);

type loggedHoursStatus    : String enum {
    hoursStatusNotSent = 'Not sent';
    hoursStatusPending = 'Pending';
    hoursStatusApproved = 'Approved';
    hoursStatusRejected = 'Rejected';
} default 'Not sent';

type hoursRejectionReason : String enum {
    rejectionReasonNotRejected = 'Not rejected';
    rejectionReasonInconsistencies = 'Time inconsistencies';
    rejectionReasonLackOfHours = 'Lack of hours';
    rejectionReasonNoProgress = 'There is no progress generated in the project by this hours';
    rejectionReasonUnauthorizedOvertime = 'Unauthorized overtime';
} default 'Not rejected';

type projectStatus        : String enum {
    projectStatusOpen = 'Open';
    projectStatusDevelopment = 'Development';
    projectStatusQuality = 'Quality';
    projectStatusTesting = 'Testing';
    projectStatusClosed = 'Closed';
} default 'Open';

type PositionName         : String enum {
    juniorName = 'Junior';
    midName = 'Mid-level';
    seniorName = 'Senior';
    leadName = 'Lead';
    managerName = 'Manager';
}

type PositionBilling      : Decimal(5, 2) enum {
    juniorBilling = 20.00;
    midLevelBilling = 30.00;
    seniorBilling = 40.00;
    leadBilling = 50.00;
    managerBilling = 50.00;
}

entity Positions {
    key name      : PositionName;
        billing   : PositionBilling;
        employees : Association to many Employees
                        on employees.position = $self;
}

@assert.unique: {uniqueEmail: [email]}
entity Employees : cuid {
    firstName         : Name not null;
    lastName          : Name not null;
    email             : Email not null;
    isActive          : Boolean default true;
    weeklyTargetHours : Decimal(4, 2);
    position          : Association to Positions not null;
    loggedHours       : Composition of many LoggedHours
                            on loggedHours.employee.ID = ID;
    projects          : Composition of many EmployeesAssigned
                            on projects.employee.ID = ID;
}

entity LoggedHours : cuid {
    quantity          : Double not null;
    employee          : Association to Employees not null;
    project           : Association to Projects not null;
    imputationDate    : Date not null;
    status            : loggedHoursStatus not null;
    rejectionReason   : hoursRejectionReason not null;
    isLocked          : Boolean default false;
    isModifiedByAdmin : Boolean default false;
    modificationDate  : DateTime;
}

// intermediate table between employees and projects for the n:n relation
entity EmployeesAssigned {
    key employee : Association to Employees not null;
    key project  : Association to Projects not null;
}

entity Projects : cuid {
    name               : Name not null;
    client             : Association to Clients not null;
    employeesAssigned  : Composition of many EmployeesAssigned
                             on employeesAssigned.project = $self;
    managerOnCharge    : Association to Employees not null;
    status             : projectStatus not null;
    initialBudget      : Decimal(15, 2) not null;
    closedAt           : DateTime;
    reportSentToClient : Boolean default false;
}

@assert.unique: {uniqueEmail: [email]}
entity Clients : cuid {
    name     : Name not null;
    email    : Email not null;
    isActive : Boolean default true;
    projects : Composition of many Projects
                   on projects.client = $self;
}
