# Short Stories
A Node JS application implementing role based user authentication system.

Tech Stack used: Node JS, MongoDB

## How to Run
- Install the dependancies from package.json
- Create a folder named "config" in project root.
- Create two .env files: dev.env, test.env in the config folder.
- Add the following environment variables in the .env files.
  - DATABASE (URL to your database)
  - PORT (example: 3000)
  - EMAIL (Email account from which automated mails will be sent when users are created or password is changed.
  - EMAIL_PASSWORD
  - JWT_SECRET (Secret key for generating authentication token using jsonwebtoken module)
- Execute "npm start" from the project root to run the project.
- To run test cases, execute "npm test" from project root. 

## Roles
- Writer: Can submit/view/update own stories.
- Approver: Can only approve stories of every writer.
- Admin: Has privileges of both writer and approver. In addition, admins can delete/view users and change passwords for users too.
