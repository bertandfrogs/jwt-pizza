import { Page } from "@playwright/test";
import { test, expect } from "playwright-test-coverage";

const dinerEmail = "d@jwt.com";
const dinerPass = "i_wanna_munch";
const adminEmail = "a@jwt.com";
const adminPass = "admin";
const franchEmail = "b@jwt.com";
const franchPass = "4RGk34Uk2y9JPxH";

// Public Pages (not logged in, no mocks needed)
test("home page is displayed correctly", async ({ page }) => {
	await page.goto("/");
	expect(await page.title()).toBe("JWT Pizza");
	await expect(page.getByRole("button", { name: "Order now" })).toBeVisible();
	await expect(page.getByRole("link", { name: "Order" })).toBeVisible();
	await expect(
		page.getByLabel("Global").getByRole("link", { name: "Franchise" })
	).toBeVisible();
	await expect(page.getByRole("link", { name: "Login" })).toBeVisible();
	await expect(page.getByRole("link", { name: "Register" })).toBeVisible();
});

test("franchise non-franchisee", async ({ page }) => {
	await page.goto("/");
	await page
		.getByLabel("Global")
		.getByRole("link", { name: "Franchise" })
		.click();
	await expect(page.getByRole("list")).toContainText(
		"homefranchise-dashboard"
	);
	await expect(page.getByRole("main")).toContainText(
		"So you want a piece of the pie?"
	);
	await expect(page.getByRole("alert")).toBeVisible();
});

test("about page", async ({ page }) => {
	await page.goto("/");
	await page.getByRole("link", { name: "About" }).click();
	await expect(page.getByRole("list")).toContainText("homeabout");
	await expect(page.getByRole("main")).toContainText("The secret sauce");
});

test("history page", async ({ page }) => {
	await page.goto("/");
	await page.getByRole("link", { name: "History" }).click();
	await expect(page.getByRole("list")).toContainText("homehistory");
	await expect(page.getByRole("heading")).toContainText("Mama Rucci, my my");
});

test("404 page", async ({ page }) => {
	await page.goto("/jwtsux");
	await expect(page.getByRole("heading")).toContainText("Oops");
	await expect(page.getByRole("main")).toContainText(
		"It looks like we have dropped a pizza on the floor. Please try another page."
	);
});

// vvvv mocking service necessary for below tests vvvv

test("logged out user cannot order pizzas", async ({ page }) => {
	// mock menu
	await page.route("*/**/api/order/menu", async (route) => {
		const menuRes = [
			{
				id: 1,
				title: "Veggie",
				image: "pizza1.png",
				price: 0.0038,
				description: "A garden of delight",
			},
			{
				id: 2,
				title: "Pepperoni",
				image: "pizza2.png",
				price: 0.0042,
				description: "Spicy treat",
			},
		];
		expect(route.request().method()).toBe("GET");
		await route.fulfill({ json: menuRes });
	});

	// mock franchises
	await page.route("*/**/api/franchise", async (route) => {
		const franchiseRes = [
			{
				id: 2,
				name: "LotaPizza",
				stores: [
					{ id: 4, name: "Lehi" },
					{ id: 5, name: "Springville" },
					{ id: 6, name: "American Fork" },
				],
			},
			{
				id: 3,
				name: "PizzaCorp",
				stores: [{ id: 7, name: "Spanish Fork" }],
			},
			{ id: 4, name: "topSpot", stores: [] },
		];
		expect(route.request().method()).toBe("GET");
		await route.fulfill({ json: franchiseRes });
	});

	await page.goto("/");

	const menuResponse = page.waitForResponse("*/**/api/order/menu");
	const franResponse = page.waitForResponse("*/**/api/franchise");
	await page.getByRole("link", { name: "Order" }).click();
	await menuResponse;
	await franResponse;

	await page.getByRole("combobox").selectOption("4");
	await page
		.getByRole("link", { name: "Image Description Veggie A" })
		.click();
	await page.getByRole("button", { name: "Checkout" }).click();

	await expect(page.getByText("Welcome back")).toBeVisible();
	await expect(
		page.getByRole("textbox", { name: "Email address" })
	).toBeVisible();
});

test("log in with invalid credentials", async ({ page }) => {
	// mock auth
	await page.route("*/**/api/auth", async (route) => {
		const unauthRes = {
			message: "unknown user" 
		}
		await route.fulfill({ status: 404, json: unauthRes });
	});

	await page.goto("/");
	await page.getByRole("link", { name: "Login" }).click();
	await page
		.getByRole("textbox", { name: "Email address" })
		.fill("asdfasd@jwt.com");
	await page.getByRole("textbox", { name: "Password" }).click();
	await page.getByRole("textbox", { name: "Password" }).fill("a");
	const loginRes = page.waitForResponse("*/**/api/auth");
	await page.getByRole("button", { name: "Login" }).click();
	await loginRes;
	await expect(page.getByRole("main")).toContainText(
		'{"code":404,"message":"unknown user"}'
	);
});

test("successful login and logout display correctly", async ({ page }) => {
	page = await mockAuth(page, adminEmail, adminPass);

	// login
	await login(page, adminEmail, adminPass);

	// logout
	await expect(page.locator("#navbar-dark")).toContainText("Logout");
	await logout(page);

	await expect(page.locator("#navbar-dark")).toContainText("Login");
});

test("diner dashboard", async ({ page }) => {
	await login(page, adminEmail, adminPass);

	// navigate to dashboard
	await page.locator("#diner-dashboard").click();
	await expect(page.getByRole("heading")).toContainText("Your pizza kitchen");
	await expect(page.getByRole("main")).toContainText(adminEmail);

	await logout(page);
});

test("order a pizza", async ({ page }) => {
	// mock order
	await page.route("*/**/api/order", async (route) => {
		const orderReq = {
			items: [
				{ menuId: 1, description: "Veggie", price: 0.0038 },
			],
			storeId: "4",
			franchiseId: 2,
		};
		const orderRes = {
			order: {
				items: [
					{ menuId: 1, description: "Veggie", price: 0.0038 },
				],
				storeId: "4",
				franchiseId: 2,
				id: 23,
			},
			jwt: "eyJpYXQ",
		};
		expect(route.request().method()).toBe("POST");
		expect(route.request().postDataJSON()).toMatchObject(orderReq);
		await route.fulfill({ json: orderRes });
	});

	// mock menu
	await page.route("*/**/api/order/menu", async (route) => {
		const menuRes = [
			{
				id: 1,
				title: "Veggie",
				image: "pizza1.png",
				price: 0.0038,
				description: "A garden of delight",
			},
			{
				id: 2,
				title: "Pepperoni",
				image: "pizza2.png",
				price: 0.0042,
				description: "Spicy treat",
			},
		];
		expect(route.request().method()).toBe("GET");
		await route.fulfill({ json: menuRes });
	});

	// mock franchises
	await page.route("*/**/api/franchise", async (route) => {
		const franchiseRes = [
			{
				id: 2,
				name: "LotaPizza",
				stores: [
					{ id: 4, name: "Lehi" },
					{ id: 5, name: "Springville" },
					{ id: 6, name: "American Fork" },
				],
			},
			{
				id: 3,
				name: "PizzaCorp",
				stores: [{ id: 7, name: "Spanish Fork" }],
			},
			{ id: 4, name: "topSpot", stores: [] },
		];
		expect(route.request().method()).toBe("GET");
		await route.fulfill({ json: franchiseRes });
	});

	// mock verify order
	await page.route("*/**/api/order/verify", async (route) => {
		const verifyRes = { 
			message: "valid",
			payload: {
				"vendor": {
					"id": "sns54",
					"name": "Sarah Smalley"
				},
				"diner": {
					"id": 5,
					"name": "b",
					"email": dinerEmail
				},
				"order": {
					items: [
						{ menuId: 1, description: "Veggie", price: 0.0038 },
					],
					storeId: "4",
					franchiseId: 2,
					id: 23,
				}
			} 
		};
		await route.fulfill({ json: verifyRes });
	});

	await login(page, dinerEmail, dinerPass);
	await page.goto("/");

	// make sure the page has navigated home and loaded the dashboard icon
	await expect(page.locator("#diner-dashboard")).toBeVisible({
		timeout: 10000,
	});

	await page.getByRole("button", { name: "Order now" }).click();
	await page.getByRole("combobox").selectOption("4");
	await page
		.locator("#menu-items button")
		.nth(0)
		.click();
	await expect(page.locator("form")).toContainText("Selected pizzas: 1");

	// payment screen
	await page.getByRole("button", { name: "Checkout" }).click();
	await expect(page.getByRole("main")).toContainText(
		"Send me that pizza right now!"
	);
	await expect(page.locator("tfoot")).toContainText("1 pie");

	// make sure that data is saved if the user cancels
	await page.getByRole("button", { name: "Cancel" }).click();
	await expect(page.locator("form")).toContainText("Selected pizzas: 1");

	await page.getByRole("button", { name: "Checkout" }).click();

	const orderRes = page.waitForResponse("*/**/api/order");
	await page.getByRole("button", { name: "Pay now" }).click();
	await orderRes;

	// ordered
	await expect(page.getByRole("heading")).toContainText(
		"Here is your JWT Pizza!"
	);
	await expect(page.getByRole("main")).toContainText("1");

	// verify jwt
	const verifyRes = page.waitForResponse("*/**/api/order/verify");
	await page.getByRole("button", { name: "Verify" }).click();
	await verifyRes;

	await expect(page.locator("h3")).toContainText("JWT Pizza - valid");
	await expect(page.locator("#hs-jwt-modal div").nth(3)).toBeVisible();

	// timeout needed to wait for modal to load (there's an animation)
	await page.waitForTimeout(500);
	await page.getByRole('button', { name: 'Close' }).click();
	await page.waitForTimeout(500);

	// go back to order page
	await page.getByRole("button", { name: "Order more" }).click();

	await expect(page.getByRole("list")).toContainText("homemenu");
	await expect(page.locator("form")).toContainText(
		"What are you waiting for? Pick a store and then add some pizzas!"
	);

	await logout(page);
});

test("franchise valid franchisee", async ({ page }) => {
	// mock franchise portal
	await page.route("*/**/api/franchise/*", async (route) => {
		expect(route.request().method()).toBe("GET");
		const franchiseRes = [
			{
				"id": 2,
				"name": "franchise2",
				"admins": [
					{
						"id": 5,
						"name": "b",
						"email": "b@jwt.com"
					}
				],
				"stores": [
					{
						"id": 2,
						"name": "b store",
						"totalRevenue": 0.0127
					}
				]
			}
		]
		await route.fulfill({ json: franchiseRes });
	});

	await login(page, franchEmail, franchPass);

	await page
		.getByLabel("Global")
		.getByRole("link", { name: "Franchise" })
		.click();
	await expect(page.getByRole("list")).toContainText(
		"homefranchise-dashboard"
	);
	await expect(page.getByRole("main")).toContainText(
		"Everything you need to run an JWT Pizza franchise. Your gateway to success."
	);
	await expect(
		page.getByRole("button", { name: "Create store" })
	).toBeVisible();
	await page.getByRole("button", { name: "Create store" }).click();
	await expect(page.getByText("Create store")).toBeVisible();

	await logout(page);
});

test("admin dashboard", async ({ page }) => {
	let franchiseAdded = false;
	// mock franchise
	await page.route("*/**/api/franchise", async (route) => {
		if (route.request().method() == "GET") {
			let franchiseRes;
			if (franchiseAdded) {
				franchiseRes = [
					{
						id: 2,
						name: "LotaPizza",
						stores: [
							{ id: 4, name: "Lehi" },
							{ id: 5, name: "Springville" },
							{ id: 6, name: "American Fork" },
						],
					},
					{
						id: 3,
						name: "PizzaCorp",
						stores: [{ id: 7, name: "Spanish Fork" }],
					},
					{ 
						id: 4, 
						name: "topSpot", 
						stores: [] 
					},
					{
						id: 32,
						name: "placeholder",
						stores: []
					}
				];
			}
			else {
				franchiseRes = [
					{
						id: 2,
						name: "LotaPizza",
						stores: [
							{ id: 4, name: "Lehi" },
							{ id: 5, name: "Springville" },
							{ id: 6, name: "American Fork" },
						],
					},
					{
						id: 3,
						name: "PizzaCorp",
						stores: [{ id: 7, name: "Spanish Fork" }],
					},
					{ 
						id: 4, 
						name: "topSpot", 
						stores: [] 
					}
				];
			}
			await route.fulfill({ json: franchiseRes });
		}
		else if (route.request().method() == "POST") {
			const franchiseReq = {stores: [], id: "", name: "placeholder", admins: [{email: "b@jwt.com"}]};
			const franchiseRes = {
				"stores": [],
				"id": 32,
				"name": "placeholder",
				"admins": [
					{
						"email": "b@jwt.com",
						"id": 5,
						"name": "b"
					}
				]
			}
			franchiseAdded = true;
			// expect(route.request()).toMatchObject(franchiseReq);
			await route.fulfill({ json: franchiseRes });
		}
	});

	// mock franchise deletion
	await page.route("*/**/api/franchise/*", async (route) => {
		expect(route.request().method()).toBe("DELETE");
		const deleteRes = {message: "franchise deleted"};
		franchiseAdded = false;
		await route.fulfill({ json: deleteRes });
	});

	await login(page, adminEmail, adminPass);

	await page.getByRole("link", { name: "Admin" }).click();
	await page
		.locator("#root div")
		.filter({ hasText: "Keep the dough rolling and" })
		.nth(3)
		.click();
	await expect(page.getByRole("main")).toContainText(
		"Keep the dough rolling and the franchises signing up."
	);
	await expect(
		page.getByRole("button", { name: "Add Franchise" })
	).toBeVisible();
	await page.getByRole("button", { name: "Add Franchise" }).click();
	await page.getByRole("textbox", { name: "franchise name" }).click();
	await page
		.getByRole("textbox", { name: "franchise name" })
		.fill("placeholder");
	await page.getByRole("textbox", { name: "franchisee admin email" }).click();
	await page
		.getByRole("textbox", { name: "franchisee admin email" })
		.fill(franchEmail);

	await page.getByRole("button", { name: "Create" }).click();
	await expect(page.getByRole("table")).toContainText("placeholder");

	await page
		.getByRole("row", { name: "placeholder Close" })
		.getByRole("button")
		.click();
	await expect(page.getByRole("main")).toContainText(
		"Are you sure you want to close the placeholder franchise? This will close all associated stores and cannot be restored. All outstanding revenue will not be refunded."
	);

	await page.getByRole("button", { name: "Close" }).click();

	await expect(page.getByRole("table")).not.toContainText("placeholder");

	await logout(page);
});

test("register", async ({ page }) => {
	const testName = Math.random().toString(36).substring(2, 12);
	const testEmail = testName + "@jwt.com";
	const testPass = Math.random().toString(36).substring(2, 12);
	
	// mock register and logout (api/auth)
	await page.route("*/**/api/auth", async (route) => {
		if (route.request().method() == "POST") {
			const registerReq = {
				name: testName,
				email: testEmail,
				password: testPass
			}
			expect(route.request().method()).toBe("POST");
			// expect(route.request()).toMatchObject(registerReq);
			const registerRes = {
				user: {
					id: 3,
					name: testName,
					email: testEmail,
					roles: [{ role: "diner" }],
				},
				token: "abcdef",
			};
			await route.fulfill({ json: registerRes });
		}
		else if (route.request().method() == "DELETE") {
			// logout
			const logoutHeader = { "authorization": "Bearer abcdef" };
			const logoutRes = {"message": "logout successful"};
			expect(route.request().headers()).toMatchObject(logoutHeader);
			await route.fulfill({ json: logoutRes });
		}
	});

	// mock order
	await page.route("*/**/api/order", async (route) => {
		const getOrderRes = {"dinerId":3,"orders":[],"page":1};
		expect(route.request().method()).toBe("GET");
		await route.fulfill({ json: getOrderRes });
	})

	await page.goto("/");
	await page.getByRole("link", { name: "Register" }).click();
	await expect(page.getByRole("heading")).toContainText(
		"Welcome to the party"
	);
	await page.getByRole("textbox", { name: "Full name" }).click();
	await page.getByRole("textbox", { name: "Full name" }).fill(testName);
	await page.getByRole("textbox", { name: "Email address" }).click();
	await page.getByRole("textbox", { name: "Email address" }).fill(testEmail);
	await page.getByRole("textbox", { name: "Password" }).click();
	await page.getByRole("textbox", { name: "Password" }).fill(testPass);
	const registerResponse = page.waitForResponse("*/**/api/auth");
	await page.getByRole("button", { name: "Register" }).click();
	await registerResponse;

	await page.locator("#diner-dashboard").click();
	await expect(page.getByRole("heading")).toContainText("Your pizza kitchen");
	await expect(page.getByRole("main")).toContainText(testName);
	await expect(page.getByRole("main")).toContainText(testEmail);
	await expect(page.getByRole("main")).toContainText("diner");

	await logout(page);
});

// helper functions
async function login(page: Page, email: string, password: string) {
	await mockAuth(page, email, password);

	await page.goto("/");
	await page.getByRole("link", { name: "Login" }).click();
	await page.getByRole("textbox", { name: "Email address" }).click();
	await page.getByRole("textbox", { name: "Email address" }).fill(email);
	await page.getByRole("textbox", { name: "Email address" }).press("Tab");
	await page.getByRole("textbox", { name: "Password" }).fill(password);
	const loginResponse = page.waitForResponse("*/**/api/auth");
	await page.getByRole("button", { name: "Login" }).click();
	await loginResponse;
}

async function mockAuth(page: Page, email: string, password: string) {
	// mock auth (login and logout)
	await page.route("*/**/api/auth", async (route) => {
		if(route.request().method() == "PUT") {
			// login
			const loginReq = { email: email, password: password };
			let userRole = [{ role: "diner" }];
			switch(email) {
				case adminEmail:
					userRole = [{ role: "admin" }];
					break;
				case dinerEmail:
					userRole = [{ role: "diner" }];
					break;
				case franchEmail:
					userRole = [{ role: "franchisee" }];
					break;
			}
			const loginRes = {
				user: {
					id: 3,
					name: "Kai Chen",
					email: email,
					roles: userRole,
				},
				token: "abcdef",
			};
			expect(route.request().postDataJSON()).toMatchObject(loginReq);
			await route.fulfill({ json: loginRes });
		}
		else if (route.request().method() == "DELETE") {
			// logout
			const logoutHeader = { "authorization": "Bearer abcdef" };
			const logoutRes = {"message": "logout successful"};
			expect(route.request().headers()).toMatchObject(logoutHeader);
			await route.fulfill({ json: logoutRes });
		}
	});
	return page;
}

async function logout(page: Page) {
	const logoutResponse = page.waitForResponse("*/**/api/auth");
	await page.getByRole("link", { name: "Logout" }).click();
	await logoutResponse;
}
