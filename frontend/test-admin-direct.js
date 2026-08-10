#!/usr/bin/env node

import { chromium } from 'playwright';

async function testAdminDirect() {
  console.log('🛡️ Testing Direct Admin Navigation...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
  });
  
  const page = await context.newPage();
  
  // Set the user role to 'superadmin' in localStorage before navigating
  await page.addInitScript(() => {
    localStorage.setItem('primerent_user_role', 'superadmin');
    localStorage.setItem('prime_mock_user', JSON.stringify({
      uid: 'mock_admin_id',
      email: 'admin@primerent.com',
      displayName: 'Super Admin',
      role: 'superadmin',
      isMock: true
    }));
  });
  
  // Track page console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log(`❌ Browser Console Error: ${msg.text()}`);
    }
  });
  
  try {
    console.log('\n📍 Test 1: Navigating directly to /admin/members...');
    await page.goto('http://localhost:3001/admin/members', { waitUntil: 'load', timeout: 45000 });
    
    // Close Next.js dev overlay
    try {
      await page.evaluate(() => {
        const overlay = document.querySelector('script[data-nextjs-dev-overlay="true"]');
        if (overlay) overlay.remove();
        const portal = document.querySelector('nextjs-portal');
        if (portal) portal.style.pointerEvents = 'none';
      });
    } catch (e) {}
    
    await page.waitForTimeout(3000);
    console.log(`✅ Loaded URL: ${page.url()}`);
    console.log(`   Page title: ${await page.title()}`);
    
    // Check if the member management table or container is visible
    const memberHeader = await page.locator('h1:has-text("จัดการสมาชิก"), h2:has-text("จัดการสมาชิก")').first();
    if (await memberHeader.isVisible()) {
      console.log('✅ Member Management Header is visible!');
    } else {
      console.log('❌ Member Management Header not found on page.');
    }
    
    console.log('\n📸 Test 2: Taking screenshot...');
    await page.screenshot({ 
      path: 'test-admin-members-direct.png',
      fullPage: false 
    });
    console.log('✅ Screenshot saved to test-admin-members-direct.png');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
  } finally {
    console.log('\n🔒 Closing browser...');
    await browser.close();
    console.log('✅ Browser closed');
  }
}

testAdminDirect().catch(console.error);
