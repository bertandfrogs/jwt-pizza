# Learning notes

## JWT Pizza code study and debugging

As part of `Deliverable ⓵ Development deployment: JWT Pizza`, start up the application and debug through the code until you understand how it works. During the learning process fill out the following required pieces of information in order to demonstrate that you have successfully completed the deliverable.

| User activity                                       | Frontend component | Backend endpoints          | Database SQL                                      |
| --------------------------------------------------- | ------------------ | -----------------------    | ------------------------------------------------- |
| View home page                                      | home.tsx           | _none_                     | _none_                                            |
| Register new user<br/>(t@jwt.com, pw: test)         | register.tsx       | [POST] api/auth/           | INSERT INTO user<br/>INSERT INTO userRole         |
| Login new user<br/>(t@jwt.com, pw: test)            | login.tsx          | [PUT] api/auth/            | INSERT INTO auth                                  |
| Order pizza                                         | menu.tsx           | [POST] api/order/          | INSERT INTO dinerOrder<br/>INSERT INTO orderItem  |
| Verify pizza                                        | delivery.tsx       | [POST] api/order/verify/   | _none_                                            |
| View profile page                                   | dinerDashboard.tsx | [GET] api/order/           | SELECT FROM dinerOrder<br/>SELECT FROM orderItem  |
| View franchise<br/>(as diner)                       | franchiseDashboard | _none_                     | _none_                                            |
| Logout                                              | logout.tsx         | [DELETE] api/auth/         | DELETE FROM auth                                  |
| View About page                                     | about.tsx          | _none_                     | _none_                                            |
| View History page                                   | history.tsx        | _none_                     | _none_                                            |
| Login as franchisee<br/>(f@jwt.com, pw: franchisee) | login.tsx          | [PUT] api/auth/            | INSERT INTO auth                                  |
| View franchise<br/>(as franchisee)                  | franchiseDashboard | [GET] api/franchise/5/     | SELECT .. FROM franchise<br/>SELECT .. FROM store |
| Create a store                                      | createStore.tsx    | [POST] api/franchise/2/store      | INSERT INTO store                                 |
| Close a store                                       | closeStore.tsx     | [DELETE] api/franchise/2/store/4/ | DELETE FROM store                                 |
| Login as admin<br/>(a@jwt.com, pw: admin)           | login.tsx          | [PUT] api/auth/            | INSERT INTO auth                                  |
| View Admin page                                     | adminDashboard.tsx | [GET] api/franchise/       | SELECT .. FROM franchise<br/>SELECT .. FROM userRole<br/>SELECT .. from dinerOrder |
| Create a franchise for t@jwt.com                    | createFranchise.tsx| [POST] api/franchise/      | SELECT .. FROM user<br/>INSERT INTO franchise<br/>INSERT INTO userRole |
| Close the franchise for t@jwt.com                   | closeFranchise.tsx | [DELETE] api/franchise/3/  | DELETE FROM store<br/>DELETE FROM userRole<br/>DELETE FROM franchise   |
