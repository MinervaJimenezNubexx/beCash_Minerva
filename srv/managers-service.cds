using {my.beCash as db} from '../db/schema';

@requires: 'manager'
service ManagersService {

    /*     @cds.redirection.target
        entity Employees                   as
            select from db.Employees {
                *,
                firstName || ' ' || lastName as employeeName : String
            }; */

    @restrict: [{
        grant: [
            'READ',
            'CREATE',
            'resolveEmployeeHoursByDateRange'
        ],
        to   : 'manager',
        where: 'managerOnCharge.loginName = $user.id'
    }]
    entity Projects                    as select from db.Projects
        actions {

            action resolveEmployeeHoursByDateRange(startDate: Date,
                                           endDate: Date,
                                           status_ID: String,
                                           rejectionReason_ID: String) returns {
                message      : String;
                updatedCount : Integer;
            };

        };

    @restrict: [{
        grant: ['READ'],
        to   : 'manager'
    }]
    entity Clients                     as select from db.Clients;

    @restrict: [{
        grant: [
            'READ',
            'CREATE',
            'UPDATE'
        ],
        to   : 'manager',
        where: 'project.managerOnCharge.loginName = $user.id'
    }]
    @cds.redirection.target
    entity LoggedHours                 as select from db.LoggedHours;

    action sendThisMonthHours() returns {
        message : String
    };


    //*********VIEWS FOR MANAGERS**********

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
                status.ID                         = 'A'
            and project.managerOnCharge.loginName = $user.id
        group by
            project.ID,
            project.name,
            project.initialBudget;

    //Project budget spent per employee position
    @readonly
    entity SpentPerPositionView        as
        select from db.LoggedHours {
            key project.ID                                as projectID,
            key employee.position.nameDescription         as position,
                project.name                              as projectName,
                employee.position.billing                 as billingPerHour,
                sum(quantity)                             as totalHours : Double,
                sum(quantity * employee.position.billing) as totalCost  : Decimal(15, 2)
        }
        where
                status.ID                         = 'A'
            and project.managerOnCharge.loginName = $user.id
        group by
            project.ID,
            project.name,
            employee.position.nameDescription,
            employee.position.billing;

    //Project budget projection on what the budget will be when all hours set by the employees are approved

    @readonly
    entity ProjectBudgetProjectionView as
        select from db.LoggedHours {
            key project.ID as projectID,
                project.name,
                project.initialBudget,
                sum(case
                        status.ID
                        when 'A'
                             then(
                                     quantity * employee.position.billing
                                 )
                        else 0
                    end)   as currentSpent           : Decimal(15, 2),

                (
                    project.initialBudget - sum(case
                                                    status.ID
                                                    when 'A'
                                                         then(
                                                                 quantity * employee.position.billing
                                                             )
                                                    else 0
                                                end)
                )          as currentRemainingBudget : Decimal(15, 2),

                sum(case
                        status.ID
                        when 'P'
                             then(
                                     quantity * employee.position.billing
                                 )
                        else 0
                    end)   as pendingSpentQuantity   : Decimal(15, 2),

                (
                    project.initialBudget - sum(case
                                                    when status.ID = 'A'
or status.ID                              = 'P'
                                                         then(
                                                                 quantity * employee.position.billing
                                                             )
                                                    else 0
                                                end)
                )          as projectedSpentBudget   : Decimal(15, 2)
        }
        where
            project.managerOnCharge.loginName = $user.id
        group by
            project.ID,
            project.name,
            project.initialBudget;

}
