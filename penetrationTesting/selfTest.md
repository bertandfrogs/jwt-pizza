### Self Attack 1
| Item           | Result                                                                         |
| -------------- | ------------------------------------------------------------------------------ |
| Date           | April 13, 2025                                                                 |
| Target         | pizza-service.smalley329.com                                                   |
| Classification | Injection                                                                      |
| Severity       | 3                                                                              |
| Description    | SQL injection attempted, able to inject sql from update user endpoint          |
| Images         |                                                                                |
| Corrections    | Sanitize user inputs from that endpoint by adding 'fields' and 'params' array  |

### Self Attack 2
| Item           | Result                                                                         |
| -------------- | ------------------------------------------------------------------------------ |
| Date           | April 13, 2025                                                                 |
| Target         | pizza-service.smalley329.com                                                   |
| Classification | Identification and Authentication Failures                                     |
| Severity       | 1                                                                              |
| Description    | I realized that I needed to change the user information from the defaults      |
| Images         |                                                                                |
| Corrections    | Changed admin username and password, no weak testing accounts                  |