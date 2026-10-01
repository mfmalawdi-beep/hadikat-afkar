import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch();const page=await browser.newPage();let errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto('http://127.0.0.1:5173');await page.locator('#newsletter-form').waitFor();await page.locator('#email').fill('test@example.com');await page.locator('[name="consent"]').check();await page.locator('#newsletter-form button').click();await page.waitForFunction(()=>document.querySelector('.newsletter-status').textContent.includes('غير مفعّل'));assert.match(await page.locator('.newsletter-status').innerText(),/لم يُرسل/);console.log('Unconfigured signup clearly reports no delivery.');
await page.goto('http://127.0.0.1:5173/admin/');await page.getByRole('heading',{name:'اللوحة جاهزة للربط'}).waitFor();console.log('Admin safely shows setup rather than fake login.');
await page.goto('http://127.0.0.1:5173/admin/setup.html');await page.getByRole('heading',{name:'تفعيل لوحة الكتابة والاشتراك البريدي'}).waitFor();console.log('Activation guide renders.');assert.deepEqual(errors,[]);await browser.close();
