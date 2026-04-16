using {my.beCash as db} from '../db/schema';

@requires: 'employee'
service EmployeesService {

    /* @cds.redirection.target
    entity Employees                   as
        select from db.Employees {
            *,
            firstName || ' ' || lastName as employeeName : String
        }; */

    @restrict: [
        { grant: ['READ'], to: 'employee' }
    ]
    entity Projects                    as select from db.Projects;

    @restrict: [
        { grant: ['READ', 'CREATE', 'UPDATE'], to: 'employee' }
    ]
    @cds.redirection.target
    entity LoggedHours                 as select from db.LoggedHours;



    //*****************VIEWS FOR EMPLOYEES*******************

    //Total hours per project
    @readonly
    entity EmployeeProjectHoursView    as
        select from db.LoggedHours {
            key employee.ID   as employeeID,
            key project.ID    as projectID,
                project.name  as projectName,
                sum(quantity) as totalHours : Double
        }
        group by
            employee.ID,
            project.ID,
            project.name;

    //Status of logged hours per project
    @readonly
    entity EmployeeHoursStatusView     as
        select from db.LoggedHours {
            key employee.ID   as employeeID,
            key project.ID    as projectID,
            key status,
                project.name,
                sum(quantity) as hoursByStatus : Double
        }
        group by
            employee.ID,
            project.ID,
            status,
            project.name;
    
}
