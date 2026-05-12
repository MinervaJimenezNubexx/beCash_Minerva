using {my.beCash as db} from '../db/schema';

@requires: 'employee'
service EmployeesService {

    @restrict: [{
        grant: ['READ'],
        to   : 'employee'
    }]
    entity Employees                as
        select from db.Employees {
            *,
            firstName || ' ' || lastName as employeeName : String
        };

    @restrict: [{
        grant: ['READ'],
        to   : 'employee'
    }]
    entity Clients                  as select from db.Clients;

    @restrict: [{
        grant: ['READ'],
        to   : 'employee'
    }]
    entity LogStatus as select from db.LogStatus;

    @restrict: [{
        grant: ['READ'],
        to   : 'employee'
    }]
    entity Positions as select from db.Positions;

    @restrict: [{
        grant: ['READ'],
        to   : 'employee'
    }]
    entity PjStatus                 as select from db.PjStatus;

    @restrict: [{
        grant: ['READ'],
        to   : 'employee',
        where: 'employeesAssigned.employee.loginName = $user.id'
    }]
    entity Projects                 as select from db.Projects;

    @restrict: [{
        grant: [
            'READ',
            'CREATE',
            'UPDATE'
        ],
        to   : 'employee',
        where: 'employee.loginName = $user.id'
    }]
    @cds.redirection.target
    entity LoggedHours              as select from db.LoggedHours;

    action sendThisMonthHours() returns {
        message : String
    };


    //*****************VIEWS FOR EMPLOYEES*******************

    //Total hours per project
    @readonly
    entity EmployeeProjectHoursView as
        select from db.LoggedHours {
            key employee.ID   as employeeID,
            key project.ID    as projectID,
                project.name  as projectName,
                sum(quantity) as totalHours : Double
        }
        where
            employee.loginName = $user.id
        group by
            employee.ID,
            project.ID,
            project.name;

    //Status of logged hours per project
    @readonly
    entity EmployeeHoursStatusView  as
        select from db.LoggedHours {
            key employee.ID   as employeeID,
            key project.ID    as projectID,
            key status.ID     as statusID,
                project.name,
                sum(quantity) as hoursByStatus : Double
        }
        where
            employee.loginName = $user.id
        group by
            employee.ID,
            project.ID,
            status.ID,
            project.name;

}
