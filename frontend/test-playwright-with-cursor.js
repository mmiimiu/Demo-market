#!/usr/bin/env node

import { chromium } from 'playwright';

async function testPlaywrightWithCursor() {
  console.log('🖱️ Testing Playwright with visible cursor...');
  
  // Launch browser (visible mode)
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500 // Slow down actions for visibility
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
  });
  
  const page = await context.newPage();
  
  // Add cursor overlay with prominent SVG arrow cursor with interaction states
  await page.addInitScript(() => {
    // Remove existing cursor if any
    const existing = document.getElementById('agent-cursor');
    if (existing) existing.remove();
    
    const cursor = document.createElement('div');
    cursor.id = 'agent-cursor';
    cursor.style.cssText = `
      position: fixed;
      width: 48px;
      height: 48px;
      pointer-events: none;
      z-index: 9999999;
      transition: all 0.15s ease;
      background-image: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCAgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMCAwTDMyIDE2TDE2IDMyTDE2IDI0TDAgMjRaIiBmaWxsPSIjZmYwMDAwIiBzdHJva2U9IiNmZjAwMDAiIHN0cm9rZS13aWR0aD0iNCIvPjwvc3ZnPg==');
      background-size: contain;
      background-repeat: no-repeat;
      display: block;
      filter: drop-shadow(0 0 8px rgba(255, 0, 0, 0.8)) drop-shadow(0 0 16px rgba(255, 0, 0, 0.5));
    `;
    document.body.appendChild(cursor);
    
    window.agentCursor = cursor;
    
    // Add click state
    cursor.addEventListener('mousedown', () => {
      cursor.style.transform = 'scale(0.8)';
      cursor.style.filter = 'drop-shadow(0 0 12px rgba(0, 255, 0, 0.8)) drop-shadow(0 0 20px rgba(0, 255, 0, 0.5))';
    });
    
    cursor.addEventListener('mouseup', () => {
      cursor.style.transform = 'scale(1)';
      cursor.style.filter = 'drop-shadow(0 0 8px rgba(255, 0, 0, 0.8)) drop-shadow(0 0 16px rgba(255, 0, 0, 0.5))';
    });
    
    // Initial position
    cursor.style.left = '640px';
    cursor.style.top = '360px';
  });
  
  // Function to move cursor to specific position
  async function moveCursor(x, y) {
    await page.mouse.move(x, y);
    await page.evaluate((pos) => {
      const cursor = document.getElementById('agent-cursor');
      if (cursor) {
        cursor.style.left = pos.x + 'px';
        cursor.style.top = pos.y + 'px';
      }
    }, { x, y });
    await page.waitForTimeout(500);
  }
  
  try {
    // Test 1: Navigate to BaanDee app
    console.log('\n📍 Test 1: Navigating to BaanDee app...');
    await page.goto('http://localhost:3001', { waitUntil: 'networkidle' });
    console.log('✅ Navigation successful');
    
    // Test 2: Move cursor to center
    console.log('\n🖱️ Test 2: Moving cursor to center...');
    await moveCursor(640, 360);
    console.log('✅ Cursor moved to center (you should see arrow cursor)');
    
    // Test 3: Move cursor around
    console.log('\n🖱️ Test 3: Moving cursor around...');
    await moveCursor(200, 200);
    await moveCursor(1000, 200);
    await moveCursor(1000, 500);
    await moveCursor(200, 500);
    await moveCursor(640, 360);
    console.log('✅ Cursor moved around (you should see arrow cursor moving)');
    
    // Test 4: Test click state
    console.log('\n🖱️ Test 4: Testing click state...');
    await page.mouse.click(640, 360);
    await page.waitForTimeout(1000);
    console.log('✅ Click state tested (cursor should turn green and scale down)');
    
    // Test 5: Take screenshot
    console.log('\n📸 Test 5: Taking screenshot...');
    await page.screenshot({ 
      path: 'test-cursor-screenshot.png',
      fullPage: false 
    });
    console.log('✅ Screenshot saved to test-cursor-screenshot.png');
    
    console.log('\n✨ All cursor tests completed successfully!');
    console.log('➡️ You should see an ARROW cursor moving around the screen');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
  } finally {
    // Close browser
    console.log('\n🔒 Closing browser...');
    await browser.close();
    console.log('✅ Browser closed');
  }
}

testPlaywrightWithCursor().catch(console.error);
