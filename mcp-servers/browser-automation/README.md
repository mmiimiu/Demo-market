# Browser Automation MCP Server

MCP server สำหรับ browser automation และ visual testing ด้วย Playwright

## Features

- 🌐 Navigate to URLs
- 📸 Take screenshots (full page or viewport)
- 🖱️ Click elements
- 📝 Get text content
- 💻 Execute JavaScript
- ⏳ Wait for elements
- 🎨 Get computed CSS styles
- 🔒 Close browser

## Installation

```bash
cd mcp-servers/browser-automation
npm install
```

## Configuration

Add to `.kiro/settings/mcp.json`:

```json
{
  "mcpServers": {
    "browser-automation": {
      "command": "node",
      "args": ["./mcp-servers/browser-automation/index.js"],
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

## Available Tools

### navigate
Navigate to a URL
```typescript
{
  url: string  // URL to visit
}
```

### screenshot
Take a screenshot
```typescript
{
  path?: string     // Save path (optional)
  fullPage?: boolean // Full page capture (default: false)
}
```

### click
Click an element
```typescript
{
  selector: string  // CSS selector
}
```

### get_text
Get element text
```typescript
{
  selector: string  // CSS selector
}
```

### evaluate
Execute JavaScript
```typescript
{
  script: string  // JavaScript code
}
```

### wait_for_selector
Wait for element to appear
```typescript
{
  selector: string  // CSS selector
  timeout?: number  // Timeout in ms (default: 30000)
}
```

### get_computed_styles
Get computed CSS styles
```typescript
{
  selector: string  // CSS selector
}
```

### close_browser
Close browser instance

## Usage Example

```javascript
// Navigate to local app
await use("browser-automation", "navigate", {
  url: "http://127.0.0.1:9002"
});

// Take screenshot
await use("browser-automation", "screenshot", {
  path: "homepage.png",
  fullPage: true
});

// Click sidebar item
await use("browser-automation", "click", {
  selector: "[data-nav='explore']"
});

// Check computed styles
await use("browser-automation", "get_computed_styles", {
  selector: ".feed-card"
});
```

## Notes

- Browser launches in **headless: false** mode (visible window)
- Default viewport: 1280x720
- Screenshots return both file path and base64 image data
- Automatically waits for network idle on navigation
