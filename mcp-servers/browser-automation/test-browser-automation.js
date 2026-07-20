#!/usr/bin/env node

import { chromium } from 'playwright';

async function testBrowserAutomation() {
  console.log('🚀 Starting browser automation test...');
  
  // Launch browser (visible mode)
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000 // Slow down actions for visibility
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
  });
  
  const page = await context.newPage();
  
  // Function to add cursor overlay
  async function addCursorOverlay() {
    await page.evaluate(() => {
      // Remove existing cursor if any
      const existing = document.getElementById('agent-cursor');
      if (existing) existing.remove();
      
      const cursor = document.createElement('div');
      cursor.id = 'agent-cursor';
      cursor.style.cssText = `
        position: fixed;
        width: 30px;
        height: 30px;
        background: rgba(255, 0, 0, 0.9);
        border: 3px solid white;
        border-radius: 50%;
        pointer-events: none;
        z-index: 9999999;
        transition: all 0.1s ease;
        box-shadow: 0 0 15px rgba(255, 0, 0, 0.8);
        display: block;
      `;
      document.body.appendChild(cursor);
      
      window.agentCursor = cursor;
      
      // Initial position
      cursor.style.left = '640px';
      cursor.style.top = '360px';
    });
  }
  
  // Function to move cursor to specific position
  async function moveCursor(x, y) {
    await page.mouse.move(x, y);
    await page.evaluate((pos) => {
      const cursor = document.getElementById('agent-cursor');
      if (cursor) {
        cursor.style.left = (pos.x - 15) + 'px';
        cursor.style.top = (pos.y - 15) + 'px';
      }
    }, { x, y });
    await page.waitForTimeout(500);
  }
  
  try {
    // Test 1: Navigate to a test page
    console.log('\n📍 Test 1: Navigating to example.com...');
    await page.goto('https://example.com', { waitUntil: 'networkidle' });
    console.log('✅ Navigation successful');
    console.log(`   Page title: ${await page.title()}`);
    
    // Add cursor overlay
    await addCursorOverlay();
    
    // Move mouse to show cursor
    await moveCursor(640, 360);
    
    // Test 2: Take screenshot
    console.log('\n📸 Test 2: Taking screenshot...');
    await page.screenshot({ 
      path: 'test-screenshot.png',
      fullPage: false 
    });
    console.log('✅ Screenshot saved to test-screenshot.png');
    
    // Test 3: Get text content
    console.log('\n📝 Test 3: Getting text content...');
    const h1Text = await page.textContent('h1');
    console.log(`✅ H1 text: ${h1Text}`);
    
    const pText = await page.textContent('p');
    console.log(`✅ First paragraph: ${pText.substring(0, 100)}...`);
    
    // Test 4: Get computed styles
    console.log('\n🎨 Test 4: Getting computed styles...');
    const styles = await page.evaluate(() => {
      const element = document.querySelector('h1');
      if (!element) return null;
      const computed = window.getComputedStyle(element);
      return {
        fontFamily: computed.fontFamily,
        fontSize: computed.fontSize,
        color: computed.color,
        display: computed.display,
      };
    });
    console.log('✅ Computed styles:', JSON.stringify(styles, null, 2));
    
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
    
    // Test 6: Navigate to a more complex page
    console.log('\n📍 Test 6: Navigating to Wikipedia...');
    await page.goto('https://en.wikipedia.org/wiki/Browser_automation', { waitUntil: 'networkidle' });
    console.log('✅ Navigation successful');
    console.log(`   Page title: ${await page.title()}`);
    
    // Test 7: Wait for selector
    console.log('\n⏳ Test 7: Waiting for selector...');
    await page.waitForSelector('#firstHeading', { timeout: 5000 });
    console.log('✅ Selector found: #firstHeading');
    
    // Test 8: Take another screenshot
    console.log('\n📸 Test 8: Taking full page screenshot...');
    await page.screenshot({ 
      path: 'test-screenshot-full.png',
      fullPage: true 
    });
    console.log('✅ Full page screenshot saved to test-screenshot-full.png');
    
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

testBrowserAutomation().catch(console.error);
