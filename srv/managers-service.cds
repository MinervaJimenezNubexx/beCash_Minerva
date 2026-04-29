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
            'resolveEmployeeHoursByDateRange',
            'managerAddEmployeeToProject',
            'managerRemoveEmployeeFromProject',
            'advanceStatus'
        ],
        to   : 'manager',
        where: 'managerOnCharge.loginName = $user.id'
    }]
    @cds.redirection.target
    entity Projects                    as
        select from db.Projects {
            *,
            status.ID as projectStatus : String
        }
        actions {

            action resolveEmployeeHoursByDateRange(startDate: Date,
                                                   endDate: Date,
                                                   status_ID: String,
                                                   rejectionReason_ID: String) returns {
                message      : String;
                updatedCount : Integer;
            };

            action managerAddEmployeeToProject(employee_ID: UUID)              returns {
                message      : String
            };

            action managerRemoveEmployeeFromProject(employee_ID: UUID)         returns {
                message      : String
            };

            action advanceStatus();
        };

    @restrict: [{
        grant: ['READ'],
        to   : 'manager'
    }]
    entity Clients                     as select from db.Clients;

    @restrict: [{
        grant: ['READ'],
        to   : 'manager'
    }]
    entity PjStatus                    as select from db.PjStatus;

    @restrict: [{
        grant: [
            'READ',
            'CREATE',
            'UPDATE',
            'resolveEmployeeHoursOneByOne'
        ],
        to   : 'manager',
        where: 'project.managerOnCharge.loginName = $user.id'
    }]
    @cds.redirection.target
    entity LoggedHours                 as select from db.LoggedHours
        actions {
            action resolveEmployeeHoursOneByOne(status_ID: String,
                                                rejectionReason_ID: String) returns {
                message : String;
            };

        };

    action sendThisMonthHours() returns {
        message : String
    };


    //*********VIEWS FOR MANAGERS**********

    //Total spent and budget of the projects
    @readonly
    entity ManagerProjectFinancesView  as
        select from db.Projects as P
        left join db.LoggedHours as L
            on  L.project.ID = P.ID
            and L.status.ID  = 'A'
        {
            key P.ID                 as ID,
                P.name               as projectName,
                P.initialBudget,
                P.status.ID          as status_ID,
                P.status.description as status_description,
                coalesce(
                    sum(L.quantity), 0
                )                    as totalApprovedHours : Double,
                coalesce(
                    sum(L.quantity * L.employee.position.billing), 0
                )                    as totalSpent         : Decimal(15, 2),
                P.initialBudget - coalesce(
                    sum(L.quantity * L.employee.position.billing), 0
                )                    as remainingBudget    : Decimal(15, 2)
        }
        where
            P.managerOnCharge.loginName = $user.id
        group by
            P.ID,
            P.name,
            P.initialBudget;

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
                sum(case status.ID when 'A' then(quantity * employee.position.billing)
                        else 0 end) as currentSpent : Decimal(15, 2),

                (project.initialBudget - sum(case status.ID when 'A' then(quantity * employee.position.billing)
                                                else 0 end)) as currentRemainingBudget : Decimal(15, 2),

                sum(case status.ID when 'P' then(quantity * employee.position.billing)
                        else 0 end)   as pendingSpentQuantity   : Decimal(15, 2),

                (project.initialBudget - sum(case when status.ID = 'A'or status.ID = 'P' then(quantity * employee.position.billing)
                                                else 0 end)) as projectedSpentBudget : Decimal(15, 2)
        }
        where
            project.managerOnCharge.loginName = $user.id
        group by
            project.ID,
            project.name,
            project.initialBudget;

    @readonly
    entity ProjectDetailsView          as
        select from db.Projects as Projects
        left join db.LoggedHours as L
            on  L.project.ID = Projects.ID
            and L.status.ID  = 'A'
        {
            key Projects.ID                        as ID,
                Projects.name                      as projectName,
                Projects.client.name               as clientName,
                Projects.initialBudget,
                Projects.status.ID                 as status_ID,
                Projects.status.description        as status_description,
                Projects.closedAt,
                Projects.managerOnCharge.firstName as managerFirstName,
                Projects.managerOnCharge.lastName  as managerLastName,
                Projects.reportSentToClient
        }
        where
            Projects.managerOnCharge.loginName = $user.id
        group by
            Projects.ID,
            Projects.name,
            Projects.client.name,
            Projects.initialBudget,
            Projects.status.ID,
            Projects.status.description,
            Projects.closedAt,
            Projects.managerOnCharge,
            Projects.reportSentToClient;

    @readonly
    entity ProjectTeamView as projection on db.Projects {
        key ID,
            employeesAssigned : redirected to TeamMembers
    };

    @readonly
    entity TeamMembers as projection on db.EmployeesAssigned {
        key project,
        key employee,
        employee.firstName as firstName,
        employee.lastName as lastName,
        employee.email as email,
        employee.position.nameDescription as position,
        isActiveOnThisProject
    };

}
