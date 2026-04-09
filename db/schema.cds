namespace my.beCash;

using {cuid} from '@sap/cds/common';

type Name             : String(30);
type Email            : String(121);

type loggedHoursToday : {
    numHours   : Int16 @assert.range: [
        1,
        8
    ];
    presentDay : Date;
};

type Position         : {
    positionName : String enum {
        juniorName = 'Junior';
        midName = 'Mid-level';
        seniorName = 'Senior';
        leadName = 'Lead';
        managerName = 'Manager';
    };
    billing      : Int16 enum {
        juniorBilling = 20;
        midLevelBilling = 30;
        seniorBilling = 40;
        leadBilling = 50;
        managerBilling = 50;
    }
};

entity Employees : cuid {
    fullName         : Name not null;
    email            : Email not null;
    loggedHoursToday : loggedHoursToday;
    position         : Position not null;
    loggedHours      : Composition of many LoggedHours
                           on loggedHours.worker = $self;
    projects         : Composition of many EmployeesAssigned
                           on projects.employee = $self;
}

entity LoggedHours : cuid {
    quantity        : Int16 @assert.range: [
        1,
        8
    ] not null;
    worker          : Association to Employees not null;
    project         : Association to Projects not null;
    imputationDate  : Date not null;
    status          : String enum {
        hoursStatusNotSent = 'Not sent';
        hoursStatusPending = 'Pending';
        hoursStatusApproved = 'Approved';
        hoursStatusRejected = 'Rejected';
    } default 'Not sent' not null;
    rejectionReason : String enum {
        rejectionReasonNotRejected = 'Not rejected';
        rejectionReasonInconsistencies = 'Time inconsistencies';
        rejectionReasonLackOfHours = 'Lack of hours';
        rejectionReasonNoProgress = 'There is no progress generated in the project by this hours';
        rejectionReasonUnauthorizedOvertime = 'Unauthorized overtime';
    } default 'Not rejected' not null;
    isLocked : Boolean default false;
    isModifiedByAdmin : Boolean default false;
    modificationDate : DateTime;
}

// intermediate table between employees and projects for the n:n relation
entity EmployeesAssigned {
    key employee : Association to Employees not null;
    key project  : Association to Projects not null;
}

entity Projects : cuid {
    name                      : Name not null;
    client                    : Association to Clients not null;
    employeesAssigned         : Composition of many EmployeesAssigned
                                    on employeesAssigned.project = $self;
    managerOnCharge           : Association to Managers not null;
    status                    : String enum {
        projectStatusOpen = 'Open';
        projectStatusDevelopment = 'Development';
        projectStatusQuality = 'Quality';
        projectStatusTesting = 'Testing';
        projectStatusClosed = 'Closed';
    } default 'Open' not null;
    initialBudget             : Int32 not null;
    @readonly remainingBudget : Int32 not null;
    @readonly projectedBudget : Int32 not null;
    closedAt : DateTime;
    reportSentToClient : Boolean default false;
}

entity Clients : cuid {
    name               : Name not null;
    email              : Email not null;
    contractedProjects : Composition of many Projects
                             on contractedProjects.client = $self;
}

entity Managers : Employees {
    @readonly position {
        positionName : String default 'Manager';
        billing      : Int16 default 50;
    };
    projects : Composition of many Projects
                   on projects.managerOnCharge = $self;
}
