#!/usr/bin/env node

import { chromium } from 'playwright';

async function testPlaywright() {
  console.log('🚀 Testing Playwright directly...');
  
  // Launch browser (visible mode)
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000 // Slow down actions for visibility
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
  });
  
  const page = await context.newPage();
  
  try {
    // Test 1: Navigate to a test page
    console.log('\n📍 Test 1: Navigating to example.com...');
    await page.goto('https://example.com', { waitUntil: 'networkidle' });
    console.log('✅ Navigation successful');
    console.log(`   Page title: ${await page.title()}`);
    
    // Test 2: Move mouse to show cursor
    console.log('\n🖱️ Test 2: Moving mouse cursor...');
    await page.mouse.move(640, 360);
    await page.waitForTimeout(1000);
    console.log('✅ Mouse moved to center');
    
    // Test 3: Take screenshot
    console.log('\n📸 Test 3: Taking screenshot...');
    await page.screenshot({ 
      path: 'test-playwright-screenshot.png',
      fullPage: false 
    });
    console.log('✅ Screenshot saved to test-playwright-screenshot.png');
    
    // Test 4: Get text content
    console.log('\n📝 Test 4: Getting text content...');
    const h1Text = await page.textContent('h1');
    console.log(`✅ H1 text: ${h1Text}`);
    
    // Test 5: Execute JavaScript
    console.log('\n💻 Test 5: Executing JavaScript...');
    const jsResult = await page.evaluate(() => {
      return {
        url: window.location.href,
        userAgent: navigator.userAgent,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        }
      };
    });
    console.log('✅ JavaScript execution result:', JSON.stringify(jsResult, null, 2));
    
    console.log('\n✨ All tests completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
  } finally {
    // Close browser
    console.log('\n🔒 Closing browser...');
    await browser.close();
    console.log('✅ Browser closed');
  }
}

testPlaywright().catch(console.error);
