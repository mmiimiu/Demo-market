#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { chromium } from "playwright";
import { spawn } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const server = new Server(
  {
    name: "playwright-with-cursor",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

let browser = null;
let context = null;
let page = null;
let cursorOverlayAdded = false;

// Initialize browser with cursor overlay
async function initBrowser() {
  if (!browser) {
    browser = await chromium.launch({ 
      headless: false,
      slowMo: 500 // Slow down actions for visibility
    });
    context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      deviceScaleFactor: 1,
    });
    page = await context.newPage();
    
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
    
    cursorOverlayAdded = true;
  }
  return page;
}

// Function to move cursor to specific position
async function moveCursor(x, y) {
  if (!page) return;
  await page.mouse.move(x, y);
  await page.evaluate((pos) => {
    const cursor = document.getElementById('agent-cursor');
    if (cursor) {
      cursor.style.left = pos.x + 'px';
      cursor.style.top = pos.y + 'px';
    }
  }, { x, y });
  await page.waitForTimeout(200);
}

// Tool: Navigate to URL
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "navigate",
        description: "Navigate to a URL in the browser with visible cursor",
        inputSchema: {
          type: "object",
          properties: {
            url: {
              type: "string",
              description: "URL to navigate to",
            },
          },
          required: ["url"],
        },
      },
      {
        name: "screenshot",
        description: "Take a screenshot of the current page",
        inputSchema: {
          type: "object",
          properties: {
            path: {
              type: "string",
              description: "Path to save screenshot (optional)",
            },
            fullPage: {
              type: "boolean",
              description: "Capture full page (default: false)",
            },
          },
        },
      },
      {
        name: "click",
        description: "Click an element by selector with visible cursor",
        inputSchema: {
          type: "object",
          properties: {
            selector: {
              type: "string",
              description: "CSS selector of element to click",
            },
          },
          required: ["selector"],
        },
      },
      {
        name: "move_cursor",
        description: "Move the visible cursor to specific coordinates",
        inputSchema: {
          type: "object",
          properties: {
            x: {
              type: "number",
              description: "X coordinate",
            },
            y: {
              type: "number",
              description: "Y coordinate",
            },
          },
          required: ["x", "y"],
        },
      },
      {
        name: "get_text",
        description: "Get text content of an element",
        inputSchema: {
          type: "object",
          properties: {
            selector: {
              type: "string",
              description: "CSS selector of element",
            },
          },
          required: ["selector"],
        },
      },
      {
        name: "evaluate",
        description: "Execute JavaScript in the page",
        inputSchema: {
          type: "object",
          properties: {
            script: {
              type: "string",
              description: "JavaScript code to execute",
            },
          },
          required: ["script"],
        },
      },
      {
        name: "close_browser",
        description: "Close the browser instance",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
    ],
  };
});

// Tool implementations
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "navigate": {
        const currentPage = await initBrowser();
        await currentPage.goto(args.url, { waitUntil: "networkidle" });
        return {
          content: [
            {
              type: "text",
              text: `Navigated to ${args.url}. Page title: ${await currentPage.title()}`,
            },
          ],
        };
      }

      case "screenshot": {
        if (!page) throw new Error("Browser not initialized. Navigate to a page first.");
        const screenshotPath = args.path || `screenshot-${Date.now()}.png`;
        const buffer = await page.screenshot({
          path: screenshotPath,
          fullPage: args.fullPage || false,
        });
        return {
          content: [
            {
              type: "text",
              text: `Screenshot saved to ${screenshotPath}`,
            },
            {
              type: "image",
              data: buffer.toString("base64"),
              mimeType: "image/png",
            },
          ],
        };
      }

      case "click": {
        if (!page) throw new Error("Browser not initialized. Navigate to a page first.");
        const element = await page.locator(args.selector).first();
        const box = await element.boundingBox();
        if (box) {
          await moveCursor(box.x + box.width / 2, box.y + box.height / 2);
        }
        await element.click();
        return {
          content: [
            {
              type: "text",
              text: `Clicked element: ${args.selector}`,
            },
          ],
        };
      }

      case "move_cursor": {
        if (!page) throw new Error("Browser not initialized. Navigate to a page first.");
        await moveCursor(args.x, args.y);
        return {
          content: [
            {
              type: "text",
              text: `Cursor moved to (${args.x}, ${args.y})`,
            },
          ],
        };
      }

      case "get_text": {
        if (!page) throw new Error("Browser not initialized. Navigate to a page first.");
        const text = await page.textContent(args.selector);
        return {
          content: [
            {
              type: "text",
              text: `Text content: ${text}`,
            },
          ],
        };
      }

      case "evaluate": {
        if (!page) throw new Error("Browser not initialized. Navigate to a page first.");
        const result = await page.evaluate(args.script);
        return {
          content: [
            {
              type: "text",
              text: `Result: ${JSON.stringify(result, null, 2)}`,
            },
          ],
        };
      }

      case "close_browser": {
        if (browser) {
          await browser.close();
          browser = null;
          context = null;
          page = null;
          cursorOverlayAdded = false;
        }
        return {
          content: [
            {
              type: "text",
              text: "Browser closed",
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Playwright with Cursor MCP server running on stdio");
}

main();
