using {my.beCash as db} from '../db/schema';

service CapService {

    @cds.redirection.target
    entity Employees                   as
        select from db.Employees {
            *,
            Employees.ID as EmployeeID,
            fullName     as EmployeeName
        };

    entity Managers                    as
        select from db.Managers {
            *,
            Managers.ID as ManagerID,
            fullName    as ManagerName
        };

    entity Projects                    as
        select from db.Projects {
            *,
            Projects.ID as ProjectsID,
            name        as ProjectName
        };

    entity Clients                     as
        select from db.Clients {
            *,
            Clients.ID as ClientsID,
            name       as ClientName
        };

    @cds.redirection.target
    entity LoggedHours                 as
        select from db.LoggedHours {
            *,
            LoggedHours.ID as LoggedHoursID
        };

    entity EmployeesAssigned           as
        select from db.EmployeesAssigned {
            *,
            employee          as EmployeeID,
            project           as ProjectID,
            employee.fullName as EmployeeName,
            project.name      as ProjectName
        };


    /*---------------------------------------------
                        VIEWS
    ---------------------------------------------*/

    //DATA FOR EMPLOYEES

    //Total hours per project
    @readonly
    entity EmployeeProjectHoursView    as
        select from db.LoggedHours {
            key worker.ID     as employeeID,
            key project.ID    as projectID,
                project.name  as projectName,
                sum(quantity) as totalHours : Integer
        }
        group by
            worker.ID,
            project.ID,
            project.name;

    //Status of logged hours per project
    @readonly
    entity EmployeeHoursStatusView     as
        select from db.LoggedHours {
            key worker.ID     as employeeID,
            key project.ID    as projectID,
            key status,
                project.name,
                sum(quantity) as hoursByStatus : Integer
        }
        group by
            worker.ID,
            project.ID,
            status,
            project.name;

    //DATA FOR MANAGERS

    //Total spent and budget of the projects
    @readonly
    entity ManagerProjectFinancesView  as
        select from db.LoggedHours {
            key project.ID                                                      as projectID,
                project.name                                                    as projectName,
                project.initialBudget,
                sum(quantity)                                                   as totalApprovedHours : Integer,
                sum(quantity * worker.position.billing)                         as totalSpent         : Integer,
                project.initialBudget - sum(quantity * worker.position.billing) as remainingBudget    : Integer
        }
        where
            status = 'Approved'
        group by
            project.ID,
            project.name,
            project.initialBudget;

    //Project budget spent per employee position
    @readonly
    entity SpentPerPorsitionView       as
        select from db.LoggedHours {
            key project.ID                              as projectID,
            key worker.position.positionName            as position,
                project.name                            as projectName,
                worker.position.billing                 as billingPerHour,
                sum(quantity)                           as totalHours : Integer,
                sum(quantity * worker.position.billing) as totalCost  : Integer
        }
        where
            status = 'Approved'
        group by
            project.ID,
            project.name,
            worker.position.positionName,
            worker.position.billing;

    //Project budget projection on what the budget will be when all hours set by the employees are approved

    @readonly
    entity ProjectBudgetProjectionView as
        select from db.LoggedHours {
            key project.ID as projectID,
                project.name,
                project.initialBudget,
                sum(case
                        status
                        when 'Approved'
                             then(
                                     quantity * worker.position.billing
                                 )
                        else 0
                    end)   as currentSpent         : Integer,

                sum(case
                        status
                        when 'Pending'
                             then(
                                     quantity * worker.position.billing
                                 )
                        else 0
                    end)   as pendingSpentQuantity : Integer,

                sum(case
                        when status = 'Approved'
                             or status = 'Pending'
                             then(
                                     quantity * worker.position.billing
                                 )
                        else 0
                    end)   as projectedSpentBudget : Integer
        }
        group by
            project.ID,
            project.name,
            project.initialBudget;


}
