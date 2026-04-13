using {my.beCash as db} from '../db/schema';

service CapService {

    @cds.redirection.target
    entity Employees                   as
        select from db.Employees {
            *,
            firstName || ' ' || lastName as employeeName : String
        };

    entity Projects                    as select from db.Projects;

    entity Clients                     as select from db.Clients;

    @cds.redirection.target
    entity LoggedHours                 as select from db.LoggedHours;

    entity EmployeesAssigned           as select from db.EmployeesAssigned;

    entity Positions                    as select from db.Positions;


    /*---------------------------------------------
                        VIEWS
    ---------------------------------------------*/

    //DATA FOR EMPLOYEES

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

    //DATA FOR MANAGERS

    //Total spent and budget of the projects
    @readonly
    entity ManagerProjectFinancesView  as
        select from db.LoggedHours {
            key project.ID                                                        as projectID,
                project.name                                                      as projectName,
                project.initialBudget,
                sum(quantity)                                                     as totalApprovedHours : Double,
                sum(quantity * employee.position.billing)                         as totalSpent         : Decimal(15, 2),
                project.initialBudget - sum(quantity * employee.position.billing) as remainingBudget    : Decimal(15, 2)
        }
        where
            status = 'Approved'
        group by
            project.ID,
            project.name,
            project.initialBudget;

    //Project budget spent per employee position
    @readonly
    entity SpentPerPositionView        as
        select from db.LoggedHours {
            key project.ID                                as projectID,
            key employee.position.name                    as position,
                project.name                              as projectName,
                employee.position.billing                 as billingPerHour,
                sum(quantity)                             as totalHours : Double,
                sum(quantity * employee.position.billing) as totalCost  : Decimal(15, 2)
        }
        where
            status = 'Approved'
        group by
            project.ID,
            project.name,
            employee.position.name,
            employee.position.billing;

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
                                     quantity * employee.position.billing
                                 )
                        else 0
                    end)   as currentSpent           : Decimal(15, 2),

                (
                    project.initialBudget - sum(case
                                                    status
                                                    when 'Approved'
                                                         then(
                                                                 quantity * employee.position.billing
                                                             )
                                                    else 0
                                                end)
                )          as currentRemainingBudget : Decimal(15, 2),

                sum(case
                        status
                        when 'Pending'
                             then(
                                     quantity * employee.position.billing
                                 )
                        else 0
                    end)   as pendingSpentQuantity   : Decimal(15, 2),

                (
                    project.initialBudget - sum(case
                                                    when status = 'Approved'
or status                                 = 'Pending'
                                                         then(
                                                                 quantity * employee.position.billing
                                                             )
                                                    else 0
                                                end)
                )          as projectedSpentBudget   : Decimal(15, 2)
        }
        group by
            project.ID,
            project.name,
            project.initialBudget;

}
