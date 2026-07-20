import { test, expect } from '@playwright/test';

test.describe('Todo App E2E', () => {
  test('should register, login, and manage todos', async ({ page }) => {
    const testEmail = `test_${Date.now()}_${Math.random()}@example.com`;
    const testPassword = 'Password123!';
    // 1. Registration
    await page.goto('/register');
    await page.locator('#username').fill('playwrightuser');
    await page.locator('#email').fill(testEmail);
    await page.locator('input[type="password"]').fill(testPassword);
    await page.locator('input[type="password"]').blur(); // Trigger validation
    await page.click('button[type="submit"]', { force: true });

    // Should redirect to login
    await expect(page).toHaveURL('/login');

    // 2. Login
    await page.locator('#email').fill(testEmail);
    await page.locator('input[type="password"]').fill(testPassword);
    await page.locator('input[type="password"]').blur(); // Trigger validation
    await page.click('button[type="submit"]', { force: true });

    // Should redirect to todos
    await expect(page).toHaveURL('/todos');
    
    // Verify empty state
    await expect(page.locator("text=You're all caught up!")).toBeVisible();

    // 3. Create a new task using the FAB
    await page.click('div.fab-container p-button');
    await expect(page.locator('text=Create New Task')).toBeVisible();
    
    await page.fill('input[formControlName="title"]', 'My First Task');
    await page.fill('textarea[formControlName="description"]', 'Task description');
    await page.click('button[type="submit"]');

    // Wait for empty state to disappear and task to appear
    await expect(page.locator("text=You're all caught up!")).not.toBeVisible();
    await expect(page.locator('text=My First Task')).toBeVisible();

    // 4. Test Bug 2: FAB should still be visible and usable
    await page.click('div.fab-container p-button');
    await expect(page.locator('text=Create New Task')).toBeVisible();
    await page.fill('input[formControlName="title"]', 'Second Task');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Second Task')).toBeVisible();

    // 5. Test Bug 3: Edit form should NOT show previous task info
    // Click edit on the first task
    const firstTaskDots = page.locator('app-todo-item').filter({ hasText: 'My First Task' }).locator('button.p-button-text').first();
    await firstTaskDots.click();
    await page.locator('text=Edit').click();
    
    // Verify it says "My First Task"
    await expect(page.locator('input[formControlName="title"]')).toHaveValue('My First Task');
    await page.click('button:has-text("Cancel")');

    // Click edit on the second task
    const secondTaskDots = page.locator('app-todo-item').filter({ hasText: 'Second Task' }).locator('button.p-button-text').first();
    await secondTaskDots.click();
    await page.locator('text=Edit').click();
    
    // Verify it says "Second Task", proving Bug 3 is fixed!
    await expect(page.locator('input[formControlName="title"]')).toHaveValue('Second Task');
    await page.fill('input[formControlName="title"]', 'Second Task Edited');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Second Task Edited')).toBeVisible();

    // 6. Test Bug 1: Sidebar filtering
    // Mark first task as completed
    const firstTaskCheck = page.locator('app-todo-item').filter({ hasText: 'My First Task' }).locator('p-checkbox');
    await firstTaskCheck.click();
    
    // Wait for the request to settle and visual update
    await page.waitForTimeout(1000); 

    // Go to "Completed" filter in sidebar
    await page.click('text=Completed');
    await page.waitForTimeout(500); // Wait for query param and API request
    
    await expect(page.locator('text=My First Task')).toBeVisible();
    await expect(page.locator('text=Second Task Edited')).not.toBeVisible();

    // Go to "Active" filter
    await page.click('text=Active');
    await page.waitForTimeout(500); 
    
    await expect(page.locator('text=Second Task Edited')).toBeVisible();
    await expect(page.locator('text=My First Task')).not.toBeVisible();
    
    // Go back to "All Tasks"
    await page.click('a:has-text("All Tasks")');
    await page.waitForTimeout(500); 
    await expect(page.locator('text=My First Task')).toBeVisible();
    await expect(page.locator('text=Second Task Edited')).toBeVisible();
  });
});
