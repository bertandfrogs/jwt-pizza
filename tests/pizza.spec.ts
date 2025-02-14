import { Page } from '@playwright/test';
import { test, expect } from 'playwright-test-coverage';

const adminEmail = 'a@jwt.com';
const adminPass = 'admin';
const franchEmail = 'b@jwt.com';
const franchPass = '4RGk34Uk2y9JPxH';

// Public Pages (not logged in)
test('home page is displayed correctly', async ({ page }) => {
	await page.goto("/");
	expect(await page.title()).toBe('JWT Pizza');
	await expect(page.getByRole('button', { name: 'Order now' })).toBeVisible();
	await expect(page.getByRole('link', { name: 'Order' })).toBeVisible();
	await expect(page.getByLabel('Global').getByRole('link', { name: 'Franchise' })).toBeVisible();
	await expect(page.getByRole('link', { name: 'Login' })).toBeVisible();
	await expect(page.getByRole('link', { name: 'Register' })).toBeVisible();
});

test('logged out user cannot order pizzas', async ({ page }) => {
	await page.goto("/");
	await page.getByRole('link', { name: 'Order' }).click();
	await page.getByRole('combobox').selectOption('1');
	await page.getByRole('link', { name: 'Image Description Pepperoni' }).click();
	await page.getByRole('button', { name: 'Checkout' }).click();
	await expect(page.getByText('Welcome back')).toBeVisible();
	await expect(page.getByRole('textbox', { name: 'Email address' })).toBeVisible();
});

test('franchise non-franchisee', async ({ page }) => {
	await page.goto('/');
	await page.getByLabel('Global').getByRole('link', { name: 'Franchise' }).click();
	await expect(page.getByRole('list')).toContainText('homefranchise-dashboard');
	await expect(page.getByRole('main')).toContainText('So you want a piece of the pie?');
	await expect(page.getByRole('alert')).toBeVisible();
})


test('about page', async ({ page }) => {
	await page.goto('/');
	await page.getByRole('link', { name: 'About' }).click();
	await expect(page.getByRole('list')).toContainText('homeabout');
	await expect(page.getByRole('main')).toContainText('The secret sauce');
});

test('history page', async ({ page }) => {
	await page.goto('/');
	await page.getByRole('link', { name: 'History' }).click();
	await expect(page.getByRole('list')).toContainText('homehistory');
	await expect(page.getByRole('heading')).toContainText('Mama Rucci, my my');
})

test('log in with invalid credentials', async ({ page }) => {
	await page.goto("/");
	await page.getByRole('link', { name: 'Login' }).click();
	await page.getByRole('textbox', { name: 'Email address' }).fill('asdfasd@jwt.com');
	await page.getByRole('textbox', { name: 'Password' }).click();
	await page.getByRole('textbox', { name: 'Password' }).fill('a');
	await page.getByRole('button', { name: 'Login' }).click();
	await expect(page.getByRole('main')).toContainText('{"code":404,"message":"unknown user"}');
})

test('404 page', async ({page}) => {
	await page.goto('/jwtsux');
	await expect(page.getByRole('heading')).toContainText('Oops');
 	await expect(page.getByRole('main')).toContainText('It looks like we have dropped a pizza on the floor. Please try another page.');
})

test('successful login and logout display correctly', async ({ page }) => {
	// login
	page = await login(page, adminEmail, adminPass);

	// logout
	await expect(page.locator('#navbar-dark')).toContainText('Logout');
	await logout(page);
	
	await expect(page.locator('#navbar-dark')).toContainText('Login');
});

test('diner dashboard', async ({ page }) => {
	page = await login(page, adminEmail, adminPass);

	// navigate to dashboard
	await page.locator('#diner-dashboard').click();
	await expect(page.getByRole('heading')).toContainText('Your pizza kitchen');
	await expect(page.getByRole('main')).toContainText('常用名字');
	await expect(page.getByRole('main')).toContainText('a@jwt.com');

	await logout(page);
});

test('order a pizza', async ({ page }) => {
	page = await login(page, adminEmail, adminPass);
	await page.goto('/');
	
	// make sure the page has navigated home and loaded the dashboard icon
	await expect(page.locator('#diner-dashboard')).toBeVisible({ timeout: 10000 });

	await page.getByRole('button', { name: 'Order now' }).click();
	await page.getByRole('combobox').selectOption('1');
	await page.locator('#menu-items button').nth(0).click();
	await expect(page.locator('form')).toContainText('Selected pizzas: 1');
	
	// payment screen
	await page.getByRole('button', { name: 'Checkout' }).click();
	await expect(page.getByRole('main')).toContainText('Send me that pizza right now!');
	await expect(page.locator('tfoot')).toContainText('1 pie');
	
	// make sure that data is saved if the user cancels
	await page.getByRole('button', { name: 'Cancel' }).click();
	await expect(page.locator('form')).toContainText('Selected pizzas: 1');
	
	await page.getByRole('button', { name: 'Checkout' }).click();
	await page.getByRole('button', { name: 'Pay now' }).click();
	
	// ordered
	await expect(page.getByRole('heading')).toContainText('Here is your JWT Pizza!');
	await page.getByText('1', { exact: true }).click();
	await expect(page.getByRole('main')).toContainText('1');
	
	// verify jwt
	await page.getByRole('button', { name: 'Verify' }).click();
	await expect(page.locator('h3')).toContainText('JWT Pizza - valid');
	await expect(page.locator('#hs-jwt-modal div').nth(3)).toBeVisible();
	await page.getByRole('button', { name: 'Close' }).click();
	
	// go back to order page
	await page.getByRole('button', { name: 'Order more' }).click();
	await expect(page.getByRole('list')).toContainText('homemenu');
	await expect(page.locator('form')).toContainText('What are you waiting for? Pick a store and then add some pizzas!');

	await logout(page);
});

test('franchise valid franchisee', async ({ page }) => {
	page = await login(page, franchEmail, franchPass);

	await page.getByLabel('Global').getByRole('link', { name: 'Franchise' }).click();
	await expect(page.getByRole('list')).toContainText('homefranchise-dashboard');
	await expect(page.getByRole('main')).toContainText('Everything you need to run an JWT Pizza franchise. Your gateway to success.');
	await expect(page.getByRole('button', { name: 'Create store' })).toBeVisible();
	await page.getByRole('button', { name: 'Create store' }).click();
	await expect(page.getByText('Create store')).toBeVisible();

	await logout(page);
});

test('admin dashboard', async ({ page }) => {
	page = await login(page, adminEmail, adminPass);
	await page.getByRole('link', { name: 'Admin' }).click();
	await page.locator('#root div').filter({ hasText: 'Keep the dough rolling and' }).nth(3).click();
	await expect(page.getByRole('main')).toContainText('Keep the dough rolling and the franchises signing up.');
	await expect(page.getByRole('button', { name: 'Add Franchise' })).toBeVisible();
	await page.getByRole('button', { name: 'Add Franchise' }).click();
	await page.getByRole('textbox', { name: 'franchise name' }).click();
	await page.getByRole('textbox', { name: 'franchise name' }).fill('placeholder');
	await page.getByRole('textbox', { name: 'franchisee admin email' }).click();
	await page.getByRole('textbox', { name: 'franchisee admin email' }).fill(franchEmail);
	
	await page.getByRole('button', { name: 'Create' }).click();
	await expect(page.getByRole('table')).toContainText('placeholder');
	await page.getByRole('row', { name: 'placeholder b Close' }).getByRole('button').click();
	await expect(page.getByRole('main')).toContainText('Are you sure you want to close the placeholder franchise? This will close all associated stores and cannot be restored. All outstanding revenue will not be refunded.');
	
	await page.getByRole('button', { name: 'Close' }).click();
	
	await expect(page.getByRole('table')).not.toContainText('placeholder');

	await logout(page);
})

test('register', async ({ page }) => {
	const testName = Math.random().toString(36).substring(2, 12);
	const testEmail = testName + "@jwt.com";
	const testPass = Math.random().toString(36).substring(2, 12);

	await page.goto('/');
	await page.getByRole('link', { name: 'Register' }).click();
	await expect(page.getByRole('heading')).toContainText('Welcome to the party');
	await page.getByRole('textbox', { name: 'Full name' }).click();
	await page.getByRole('textbox', { name: 'Full name' }).fill(testName);
	await page.getByRole('textbox', { name: 'Email address' }).click();
	await page.getByRole('textbox', { name: 'Email address' }).fill(testEmail);
	await page.getByRole('textbox', { name: 'Password' }).click();
	await page.getByRole('textbox', { name: 'Password' }).fill(testPass);
	const registerResponse = page.waitForResponse('http://localhost:3000/api/auth');
	await page.getByRole('button', { name: 'Register' }).click();
	await registerResponse;

	await page.locator('#diner-dashboard').click();
	await expect(page.getByRole('heading')).toContainText('Your pizza kitchen');
	await expect(page.getByRole('main')).toContainText(testName);
	await expect(page.getByRole('main')).toContainText(testEmail);
	await expect(page.getByRole('main')).toContainText('diner');

	await logout(page);
});

// helper functions
async function login(page: Page, email: string, password: string) {
	await page.goto('/');
	await page.getByRole('link', { name: 'Login' }).click();
	await page.getByRole('textbox', { name: 'Email address' }).click();
	await page.getByRole('textbox', { name: 'Email address' }).fill(email);
	await page.getByRole('textbox', { name: 'Email address' }).press('Tab');
	await page.getByRole('textbox', { name: 'Password' }).fill(password);
	const loginResponse = page.waitForResponse('http://localhost:3000/api/auth');
	await page.getByRole('button', { name: 'Login' }).click();
	await loginResponse;
	return page;
}

async function logout(page: Page) {
	const logoutResponse = page.waitForResponse("http://localhost:3000/api/auth");
	await page.getByRole('link', { name: 'Logout' }).click();
	await logoutResponse;
}