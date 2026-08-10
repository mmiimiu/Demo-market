#!/usr/bin/env node

import { chromium } from 'playwright';

async function testAdmin() {
  console.log('🛡️ Testing Admin Panel...');
  
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
  
  try {
    console.log('\n📍 Test 1: Navigating to Admin Panel...');
    await page.goto('http://localhost:3001/admin', { waitUntil: 'load', timeout: 45000 });
    
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
    console.log('✅ Navigation successful');
    console.log(`   Page title: ${await page.title()}`);
    
    // Test 2: Check if Sidebar is visible
    console.log('\n🔍 Test 2: Checking sidebar and navigation links...');
    const sidebar = await page.locator('nav').first();
    if (await sidebar.isVisible()) {
      console.log('✅ Admin Sidebar is visible');
    } else {
      console.log('❌ Admin Sidebar not found!');
    }
    
    // Check available menu links
    const links = await page.locator('nav a').all();
    console.log(`   Found ${links.length} links in sidebar menu:`);
    for (let link of links) {
      const text = await link.textContent();
      const href = await link.getAttribute('href');
      console.log(`   - ${text?.trim()} -> ${href}`);
    }
    
    // Test 3: Navigate to 'จัดการสมาชิก' (Members)
    console.log('\n🖱️ Test 3: Clicking on "จัดการสมาชิก" link...');
    const membersLink = await page.locator('nav a:has-text("จัดการสมาชิก")').first();
    if (await membersLink.isVisible()) {
      await membersLink.click();
      await page.waitForTimeout(2000);
      console.log(`✅ Navigated to: ${page.url()}`);
    } else {
      console.log('❌ "จัดการสมาชิก" link not found');
    }
    
    // Test 4: Take screenshot of Members Management
    console.log('\n📸 Test 4: Taking screenshot of Members page...');
    await page.screenshot({ 
      path: 'test-admin-screenshot.png',
      fullPage: false 
    });
    console.log('✅ Screenshot saved to test-admin-screenshot.png');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
  } finally {
    console.log('\n🔒 Closing browser...');
    await browser.close();
    console.log('✅ Browser closed');
  }
}

testAdmin().catch(console.error);
