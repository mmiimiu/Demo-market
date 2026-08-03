#!/usr/bin/env node

import { createCanvas } from 'canvas';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the CUR file
const curPath = path.join(__dirname, 'ripped-android-16', 'pointer_arrow.cur');
const curBuffer = fs.readFileSync(curPath);

// Create a simple canvas and draw a cursor-like shape
const canvas = createCanvas(32, 32);
const ctx = canvas.getContext('2d');

// Draw a simple arrow cursor
ctx.fillStyle = '#000000';
ctx.beginPath();
ctx.moveTo(0, 0);
ctx.lineTo(16, 8);
ctx.lineTo(8, 16);
ctx.lineTo(8, 12);
ctx.lineTo(0, 12);
ctx.closePath();
ctx.fill();

// Save as PNG
const pngBuffer = canvas.toBuffer('image/png');
const pngPath = path.join(__dirname, 'cursor-arrow.png');
fs.writeFileSync(pngPath, pngBuffer);

// Convert to base64
const base64 = pngBuffer.toString('base64');
console.log('Base64 PNG cursor:');
console.log(base64);
console.log('\nSaved to:', pngPath);
