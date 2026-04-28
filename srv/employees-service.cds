using {my.beCash as db} from '../db/schema';

@requires: 'employee'
service EmployeesService {

    /* @cds.redirection.target
    entity Employees                   as
        select from db.Employees {
            *,
            firstName || ' ' || lastName as employeeName : String
        }; */

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

    @readonly
    entity ProjectDetailsView          as
        select from db.Projects as P
        left join db.LoggedHours as L
            on  L.project.ID = P.ID
            and L.status.ID  = 'A'
        {
            key P.ID                 as ID,
                P.name               as projectName,
                P.client.name        as clientName,
                P.initialBudget,
                P.status.ID          as status_ID,
                P.status.description as status_description,
                P.closedAt,
                P.managerOnCharge.firstName as manager,
                P.reportSentToClient
        }
        where
            P.managerOnCharge.loginName = $user.id
        group by
            P.ID,
            P.name,
            P.client.name,
            P.initialBudget,
            P.status.ID,
            P.status.description,
            P.closedAt,
            P.managerOnCharge,
            P.reportSentToClient;

}
