# Learning notes

## JWT Pizza code study and debugging

As part of `Deliverable ⓵ Development deployment: JWT Pizza`, start up the application and debug through the code until you understand how it works. During the learning process fill out the following required pieces of information in order to demonstrate that you have successfully completed the deliverable.

| User activity                                       | Frontend component | Backend endpoints          | Database SQL                                      |
| --------------------------------------------------- | ------------------ | -----------------------    | ------------------------------------------------- |
| View home page                                      | home.tsx           | _none_                     | _none_                                            |
| Register new user<br/>(t@jwt.com, pw: test)         | register.tsx       | auth/ POST                 | INSERT INTO user<br/>INSERT INTO userRole         |
| Login new user<br/>(t@jwt.com, pw: test)            | login.tsx          | auth/ PUT                  | INSERT INTO auth                                  |
| Order pizza                                         | menu.tsx           | order/ POST                | INSERT INTO dinerOrder<br/>INSERT INTO orderItem  |
| Verify pizza                                        | delivery.tsx       | order/verify/ POST         | _none_                                            |
| View profile page                                   | dinerDashboard.tsx | order/ GET                 | SELECT FROM dinerOrder<br/>SELECT FROM orderItem  |
| View franchise<br/>(as diner)                       | franchiseDashboard | franchise/6/ GET           | _none_                                            |
| Logout                                              | logout.tsx         | auth/ DELETE               | DELETE FROM auth                                  |
| View About page                                     | about.tsx          | _none_                     | _none_                                            |
| View History page                                   | history.tsx        | _none_                     | _none_                                            |
| Login as franchisee<br/>(f@jwt.com, pw: franchisee) | login.tsx          | auth/ PUT                  | INSERT INTO auth                                  |
| View franchise<br/>(as franchisee)                  | franchiseDashboard | franchise/5/ GET           | SELECT .. FROM franchise<br/>SELECT .. FROM store |
| Create a store                                      | createStore.tsx    | franchise/2/store POST     | INSERT INTO store                                 |
| Close a store                                       | closeStore.tsx     | franchise/2/store/4/ DELETE| DELETE FROM store                                 |
| Login as admin<br/>(a@jwt.com, pw: admin)           | login.tsx          | auth/ PUT                  | INSERT INTO auth                                  |
| View Admin page                                     | adminDashboard.tsx | franchise/ GET             | SELECT .. FROM franchise<br/>SELECT .. FROM userRole<br/>SELECT .. from dinerOrder |
| Create a franchise for t@jwt.com                    | createFranchise.tsx| franchise/ POST            | SELECT .. FROM user<br/>INSERT INTO franchise<br/>INSERT INTO userRole |
| Close the franchise for t@jwt.com                   | closeFranchise.tsx | franchise/3/ DELETE        | DELETE FROM store<br/>DELETE FROM userRole<br/>DELETE FROM franchise   |
