namespace my.beCash;

using {cuid} from '@sap/cds/common';

type Name                 : String(30);
type Email                : String(121);

type loggedHoursStatus    : String(3) enum {
    hoursStatusNotSent = 'N'; // Not sent
    hoursStatusPending = 'P'; // Pending
    hoursStatusApproved = 'A'; //Approved
    hoursStatusRejected = 'R'; //Rejected
} default 'N';

entity LogStatus {
    key ID          : loggedHoursStatus;
        description : String(30) not null;
}

type hoursRejectionReason : String(5) enum {
    rejectionReasonNotRejected = 'NR'; // Not rejected
    rejectionReasonInconsistencies = 'TI'; // Time inconsistencies
    rejectionReasonLackOfHours = 'LOH'; // Lack of hours
    rejectionReasonNoProgress = 'NP'; // There is no progress generated in the project by this hours
    rejectionReasonUnauthorizedOvertime = 'UO'; // Unauthorized overtime
} default 'NR';

entity LogRejReason {
    key ID          : hoursRejectionReason;
        description : String(60) not null;
}

type projectStatus        : String(3) enum {
    projectStatusOpen = 'O'; // Open
    projectStatusDevelopment = 'D'; // Development
    projectStatusQuality = 'Q'; // Quality
    projectStatusTesting = 'T'; // Testing
    projectStatusClosed = 'C'; // Closed
} default 'O';

entity PjStatus {
    key ID          : projectStatus;
        description : String(30) not null;
}

type PositionName         : String(5) enum {
    juniorName = 'J'; // Junior
    midName = 'MID'; // Mid-level
    seniorName = 'S'; // Senior
    leadName = 'L'; // Lead
    managerName = 'MGR'; // Manager
}

/* type PositionBilling      : Decimal(5, 2) enum {
    juniorBilling = 20.00;
    midLevelBilling = 30.00;
    seniorBilling = 40.00;
    leadBilling = 50.00;
    managerBilling = 50.00;
} */

entity Positions {
    key ID              : PositionName;
        nameDescription : String(30) not null;
        billing         : Decimal(5, 2) not null; // managed on a table that can be modified easily
        employees       : Association to many Employees
                              on employees.position = $self;
}

@assert.unique: {uniqueEmail: [email]}
entity Employees : cuid {
    //user              : String = $user;
    firstName         : Name not null;
    lastName          : Name not null;
    email             : Email not null;
    loginName         : String(255) not null; //the email or credentials that the employee will use to log in
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
    status            : Association to LogStatus not null;
    rejectionReason   : Association to LogRejReason not null;
    isLocked          : Boolean default false;
    isModifiedByAdmin : Boolean default false;
    modificationDate  : DateTime;
}

// intermediate table between employees and projects for the n:n relation
entity EmployeesAssigned {
    key employee              : Association to Employees not null;
    key project               : Association to Projects not null;
        isActiveOnThisProject : Boolean default true;
}

@assert.unique: {uniqueProjectName: [name]}
entity Projects : cuid {
    name               : Name not null;
    client             : Association to Clients not null;
    employeesAssigned  : Composition of many EmployeesAssigned
                             on employeesAssigned.project = $self;
    managerOnCharge    : Association to Employees not null;
    status             : Association to PjStatus not null;
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
    nif      : String(40) not null;
}
