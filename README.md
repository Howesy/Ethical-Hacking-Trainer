# Ethical Hacking Trainer

***Three main constructs for this project***:

- [x] A01: ***Cross Site Scripting***
- [x] A03: ***SQL Injection***
- [x] A10: ***Server Side Request Forgery***

These are all web vulnerabilities taken from OWASP. [^1]

[^1]: https://owasp.org/

***Modules used:***
* bcrypt
* ejs
* express
* express-session
* mocha
* mongodb
* mongoose

**Requirements for running:**
* Open the configuration txt and enter your information into the necessary strings.
* Change the name of the file from "Configuration.txt" to "Configuration.js"
* Save the file and run the following command:
* npm start

***Implemented Express Routes***:

| Route                                   | Method | Requires User Login | Requires Admin login |
| --------------------------------------- | ------ | ------------------- | -------------------- |
| /                                                                    | GET    | false               | false                |
| /examples                                                            | GET    | false               | false                |
| /sqlExample                                                          | GET    | false               | false                |
| /xssExample                                                          | GET    | false               | false                |
| /ssrfExample                                                         | GET    | false               | false                |
| /training                                                            | GET    | false               | false                |
| /allocateQuestion                                                 | GET    | true                | true                 |
| /register                                                                 | GET    | false               | false                |
| /login                                                                        | GET    | false               | false                |
| /account                                                                  | GET    | true                | false                |
| /leaderboard                                                         | GET    | false               | false                |
| /disclaimer                                                  | GET    | false               | false                |
| /admin                                                                      | GET    | true                | true                 |
| /destroySession                                                   | GET    | false               | false                |
| /deleteQuestion/{category}/{identifier} | GET    | true                | true                 |
| /updateQuestion/{category}/{identifier} | GET    | true                | true                 |
| /viewQuestion/{category}/{identifier}   | GET    | true                | false                |
| /initiateRegister                                                    | POST   | false               | false                |
| /initiateLogin                                                       | POST   | false               | false                |
| /manipulateQuestion                                                  | POST   | true                | true                 |
| /addQuestion                                                         | POST   | true                | true                 |
| /completeQuestion                                                    | POST   | true                | false                |
| /resetCourse                                                         | POST   | true                | false                |