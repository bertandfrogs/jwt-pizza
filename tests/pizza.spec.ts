import { Page } from '@playwright/test';
import { test, expect } from 'playwright-test-coverage';

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

test('log in with invalid credentials', async ({ page }) => {
	await page.goto("/");
	await page.getByRole('link', { name: 'Login' }).click();
	await page.getByRole('textbox', { name: 'Email address' }).fill('asdfasd@jwt.com');
	await page.getByRole('textbox', { name: 'Password' }).click();
	await page.getByRole('textbox', { name: 'Password' }).fill('a');
	await page.getByRole('button', { name: 'Login' }).click();
	await expect(page.getByRole('main')).toContainText('{"code":404,"message":"unknown user"}');
})

test('successful login and logout display correctly', async ({ page }) => {
	// login
	page = await login(page);

	// logout
	await expect(page.locator('#navbar-dark')).toContainText('Logout');
	await page.getByRole('link', { name: 'Logout' }).click();
	await expect(page.locator('#navbar-dark')).toContainText('Login');
});

test('diner dashboard', async ({ page }) => {
	page = await login(page);

	// navigate to dashboard
	await page.locator('#diner-dashboard').click();
	await expect(page.getByRole('heading')).toContainText('Your pizza kitchen');
	await expect(page.getByRole('main')).toContainText('常用名字');
	await expect(page.getByRole('main')).toContainText('a@jwt.com');
});

test('order a pizza', async ({ page }) => {
	page = await login(page);

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

// helper function
async function login(page: Page) {
	await page.goto('/');
	await page.getByRole('link', { name: 'Login' }).click();
	await page.getByRole('textbox', { name: 'Email address' }).click();
	await page.getByRole('textbox', { name: 'Email address' }).fill('a@jwt.com');
	await page.getByRole('textbox', { name: 'Email address' }).press('Tab');
	await page.getByRole('textbox', { name: 'Password' }).fill('admin');
	await page.getByRole('button', { name: 'Login' }).click();

	// // make sure the page has navigated home and loaded the dashboard icon
	// await expect(page.locator('#diner-dashboard')).toBeVisible({ timeout: 10000 });
	return page;
}