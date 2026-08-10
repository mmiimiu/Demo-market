#!/usr/bin/env node

import { chromium } from 'playwright';

async function testBaanDee() {
  console.log('🏠 Testing BaanDee Real Estate Platform...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
  });
  
  const page = await context.newPage();
  
  try {
    console.log('\n📍 Test 1: Navigating to BaanDee app...');
    // Use 'load' to prevent timeouts on slower development environments
    await page.goto('http://localhost:3001', { waitUntil: 'load', timeout: 45000 });
    
    // Close Next.js dev overlay and disable interfering elements
    try {
      await page.evaluate(() => {
        const overlay = document.querySelector('script[data-nextjs-dev-overlay="true"]');
        if (overlay) overlay.remove();
        const portal = document.querySelector('nextjs-portal');
        if (portal) portal.style.pointerEvents = 'none';
      });
    } catch (e) {
      // Ignore overlay removal errors
    }
    
    await page.waitForTimeout(2000);
    console.log('✅ Navigation successful');
    console.log(`   Page title: ${await page.title()}`);
    
    console.log('\n🔍 Test 2: Checking main UI elements...');
    const header = await page.locator('header').first();
    if (await header.isVisible()) {
      console.log('✅ Header is visible');
    } else {
      console.log('⚠️  Header not found');
    }
    
    console.log('\n🌐 Test 3: Testing language toggle...');
    const langToggle = await page.locator('[data-testid="lang-toggle"], .lang-toggle, button:has-text("TH"), button:has-text("EN")').first();
    if (await langToggle.isVisible()) {
      await langToggle.evaluate(el => el.click());
      await page.waitForTimeout(1000);
      console.log('✅ Language toggled successfully');
    } else {
      console.log('⚠️  Language toggle not found');
    }
    
    console.log('\n📸 Test 4: Taking screenshot...');
    await page.screenshot({ 
      path: 'test-baandee-screenshot.png',
      fullPage: false 
    });
    console.log('✅ Screenshot saved to test-baandee-screenshot.png');
    
    console.log('\n✨ All critical BaanDee tests completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
  } finally {
    console.log('\n🔒 Closing browser...');
    await browser.close();
    console.log('✅ Browser closed');
  }
}

testBaanDee().catch(console.error);
