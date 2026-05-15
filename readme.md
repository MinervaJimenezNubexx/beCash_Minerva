# BeCash Project

This is the implementation of the proposed BeCash Project for Nubexx internship program, done by intern Minerva Jiménez.

In this project, the objective is to implement a consistent and solid backend for a Billing and Projects tracking system, as well
as a more simple frontend for it.

To try both frontend apps, you can log in as the same user, pedro, with no password. This user has both the manager and the employee
role, so that you can easily access both frontends without having to switch users. 

If a project is closed, a final billing report will be shown on the BAS console 30 seconds after its closing time. In addition, every 2 minutes (short time interval for testing) a monthly billing report will be shown on the BAS console, with the summary made about last month's data.

## Extra Details and Features implemented

- Soft deletes:
    Clients and employees cannot be deleted, so instead I deactivate them and consider the false active state as the deleted state 
    to show or not show those rows. This is also applied on a specific project context, so if an employee that already has resolved
    hours on a specific project is removed from the team of the project, the already sent or resolved hours won't be affected.

- Automatic coherent hour and project states:
    When an hour registry is approved or created, the rejection reason is automatically set to 'Not Rejected', and when a new project
    is created, its status is automatically set to "Open" in order to prevent projects to be created on an advanced status, which is
    incoherent. Also, when an hour registry is created, the status is automatically set to "Not sent".

- Sequential progress of project states:
    In the frontend, the project status can only be updated to the next one, it cannot directly be updated from "Open" to "Closed".

- Automatic management of pending hours when a project is closed:
    When the status of a project advances to the "Closed" state, if there are pending hours that have not been resolved before closing
    the project they are automatically approved by the system.

- Management of hours by date range:
    A group of hours can be resolved by using the resolve by date range function, allowing the manager to selec an initial and ending date,
    as well as the status he wants the hours to be resolved to (Approved, or Rejected and a valid reason for it). All of the hours within
    that date range on that project will be resolved.

- Visual feedback on the projected budget:
    The projected budget shows the exact budget that will be remaining if all the hours that are pending in that moment are approved. When
    the quantity is above 20% of the total budget of the project, it is shown in green and an "OK" icon, when it is below 20%, it is shown
    in yellow with a "Warning" icon, and when the budget is being exceeded it is shown as a negative quantity, in red, and with an "Error" icon.

- Basic data validation for hour registers:
    Hours can be imputed either in whole hours or by quarters of an hour, allowing only those values, any other value is considered invalid. The system also checks that not more than 8 hours per day are being logged, and no more than the established weekly hours
    for each specific employee are being logged. It is also checked that an hour registry cannot be modified when it has already been sent, and that an employee cannot modify the status of the hour registry. 
    
    It is also checked if an employee is assigned to the project he is trying to log hours to and if the project is not closed before successfully creating that hour registry.

    When a new project wants to be created, it is also checked if the initial budget for the project is a reasonable quantity, wich in
    this case would be if the quantity is above 5000.

- Managers are automatically assigned to the projects they create and cannot be (soft) deleted from the projects they directly manage.

- Managers cannot modify hour registers that they have already been resolved, only an admin could, if necessary.

- Managers cannot resolve hour registers from projects they are assigned to but are not managed by them.

- Admins can modify hour registers, but not when they have not been sent yet, and the modification date and status is internally registered 
    when done by and admin to keep track of this unusual manual modification.

- Automatic injection of the Employee_ID:
    On the Employee App, the Employee_ID wasn't being correctly taken, so I made a function that is used at the start of every other function for the employee, that automatically injects the employee_ID by taking it based on the current logged user.

- Confirmation before irreversible actions:
    Before important actions on both the employee's and the manager's frontend, confirmation through a MessageBox.confirm is needed to prevent unintentional or mistaken irreversible actions, such as sending for approval the monthly hours, or advancing the status of a project.

- 





