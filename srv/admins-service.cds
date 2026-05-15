using {my.beCash as db} from '../db/schema';

@requires: 'admin'
service AdminsService {

    @cds.redirection.target
    @restrict: [{
        grant: [
            'READ',
            'CREATE',
            'UPDATE',
            'deactivateEmployees'
        ],
        to   : 'admin'
    }]
    entity Employees         as
        select from db.Employees {
            *,
            firstName || ' ' || lastName as employeeName : String
        }
        actions {
            action deactivateEmployees() returns {
                msg : String
            };
        };

    @restrict: [{
        grant: [
            'READ',
            'CREATE',
            'UPDATE'
        ],
        to   : 'admin'
    }]
    entity LogStatus          as select from db.LogStatus;

        @restrict: [{
        grant: [
            'READ',
            'CREATE',
            'UPDATE'
        ],
        to   : 'admin'
    }]
    entity LogRejReason          as select from db.LogRejReason;

        @restrict: [{
        grant: [
            'READ',
            'CREATE',
            'UPDATE'
        ],
        to   : 'admin'
    }]
    entity PjStatus          as select from db.PjStatus;

    @restrict: [{
        grant: [
            'READ',
            'CREATE',
            'UPDATE'
        ],
        to   : 'admin'
    }]
    entity Projects          as select from db.Projects;

    @restrict: [{
        grant: [
            'READ',
            'CREATE',
            'UPDATE',
            'deactivateClients'
        ],
        to   : 'admin'
    }]
    entity Clients           as select from db.Clients
        actions {
            action deactivateClients() returns {
                msg : String
            };
        };

    @cds.redirection.target
    @restrict: [{
        grant: [
            'READ',
            'UPDATE'
        ],
        to   : 'admin'
    }]
    entity LoggedHours       as select from db.LoggedHours;

    @restrict: [{
        grant: [
            'READ',
            'CREATE',
            'UPDATE'
        ],
        to   : 'admin'
    }]
    entity EmployeesAssigned as select from db.EmployeesAssigned;

    @restrict: [{
        grant: [
            'READ',
            'CREATE',
            'UPDATE'
        ],
        to   : 'admin'
    }]
    entity Positions         as select from db.Positions;

}
