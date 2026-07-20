#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { chromium } from "playwright";

const server = new Server(
  {
    name: "browser-automation",
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

// Initialize browser
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
    
    // Add cursor overlay for visibility
    await page.addInitScript(() => {
      const cursor = document.createElement('div');
      cursor.id = 'agent-cursor';
      cursor.style.cssText = `
        position: fixed;
        width: 20px;
        height: 20px;
        background: rgba(255, 0, 0, 0.7);
        border: 2px solid white;
        border-radius: 50%;
        pointer-events: none;
        z-index: 999999;
        transition: all 0.3s ease;
        box-shadow: 0 0 10px rgba(255, 0, 0, 0.5);
      `;
      document.body.appendChild(cursor);
      
      window.agentCursor = cursor;
      
      document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX - 10 + 'px';
        cursor.style.top = e.clientY - 10 + 'px';
      });
      
      document.addEventListener('mousedown', () => {
        cursor.style.background = 'rgba(0, 255, 0, 0.7)';
        cursor.style.transform = 'scale(0.8)';
      });
      
      document.addEventListener('mouseup', () => {
        cursor.style.background = 'rgba(255, 0, 0, 0.7)';
        cursor.style.transform = 'scale(1)';
      });
    });
  }
  return page;
}

// Tool: Navigate to URL
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "navigate",
        description: "Navigate to a URL in the browser",
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
        description: "Click an element by selector",
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
        name: "wait_for_selector",
        description: "Wait for an element to appear",
        inputSchema: {
          type: "object",
          properties: {
            selector: {
              type: "string",
              description: "CSS selector to wait for",
            },
            timeout: {
              type: "number",
              description: "Timeout in milliseconds (default: 30000)",
            },
          },
          required: ["selector"],
        },
      },
      {
        name: "get_computed_styles",
        description: "Get computed CSS styles of an element",
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
      };

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
        await page.click(args.selector);
        return {
          content: [
            {
              type: "text",
              text: `Clicked element: ${args.selector}`,
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

      case "wait_for_selector": {
        if (!page) throw new Error("Browser not initialized. Navigate to a page first.");
        await page.waitForSelector(args.selector, {
          timeout: args.timeout || 30000,
        });
        return {
          content: [
            {
              type: "text",
              text: `Element found: ${args.selector}`,
            },
          ],
        };
      }

      case "get_computed_styles": {
        if (!page) throw new Error("Browser not initialized. Navigate to a page first.");
        const styles = await page.evaluate((selector) => {
          const element = document.querySelector(selector);
          if (!element) return null;
          const computed = window.getComputedStyle(element);
          return {
            display: computed.display,
            position: computed.position,
            width: computed.width,
            height: computed.height,
            margin: computed.margin,
            padding: computed.padding,
            backgroundColor: computed.backgroundColor,
            color: computed.color,
            fontSize: computed.fontSize,
            fontFamily: computed.fontFamily,
            borderRadius: computed.borderRadius,
            border: computed.border,
            overflow: computed.overflow,
            zIndex: computed.zIndex,
          };
        }, args.selector);
        return {
          content: [
            {
              type: "text",
              text: `Computed styles for ${args.selector}:\n${JSON.stringify(styles, null, 2)}`,
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
  console.error("Browser Automation MCP server running on stdio");
}

main();
