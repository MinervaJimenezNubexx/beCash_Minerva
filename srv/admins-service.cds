using {my.beCash as db} from '../db/schema';

@requires: 'admin'
service AdminsService {

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

    entity Positions                   as select from db.Positions;

}