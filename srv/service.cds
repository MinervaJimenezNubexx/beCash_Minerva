using {my.beCash as db} from '../db/schema';

service CapService {

    @cds.redirection.target
    entity Employees         as
        select from db.Employees {
            *,
            Employees.ID as EmployeeID,
            fullName     as EmployeeName,
        };

    entity Managers          as
        select from db.Managers {
            *,
            Managers.ID as ManagerID,
            fullName     as ManagerName,
        };

    entity Projects          as
        select from db.Projects {
            *,
            Projects.ID as ProjectsID,
            name        as ProjectName
        };

    entity Clients           as
        select from db.Clients {
            *,
            Clients.ID as ClientsID,
            name as ClientName
        };

    entity LoggedHours       as
        select from db.LoggedHours {
            *,
            LoggedHours.ID as LoggedHoursID
        };

    entity EmployeesAssigned as
        select from db.EmployeesAssigned {
            *,
            employee          as EmployeeID,
            project           as ProjectID,
            employee.fullName as EmployeeName,
            project.name      as ProjectName
        };
}
