const { chromium } = require('playwright');

// List of known human behaviors from tiles.js
const humanBehaviors = [
    "needs coffee", "oversleeps", "hungry", "forgets PW", "loses keys",
    "stubbed toe", "daydreams", "sneezes", "spills drink", "bites nails",
    "gets angry", "bad hair day", "takes naps", "loves pizza", "feels lonely",
    "loses phone", "giggles", "eats snacks", "calls mom", "talks to pet",
    "is confused", "sleepy", "gets bored", "needs nap", "snoozes",
    "spills tea", "overthinks", "feels guilt", "has anxiety", "gets jealous",
    "impulsive", "cries at ads", "slacks off", "hates Mon", "buys junk",
    "gets tired", "makes typos", "oversleeping", "crying"
];

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Generate human-like Bezier curve points
function generateBezierPoints(start, end, steps = 25) {
    const points = [];
    
    // Create random control points to add a natural curve/deviations
    const deviationX = (Math.random() - 0.5) * 80;
    const deviationY = (Math.random() - 0.5) * 80;
    
    const control1 = {
        x: start.x + (end.x - start.x) * 0.25 + deviationX,
        y: start.y + (end.y - start.y) * 0.25 - deviationY
    };
    
    const control2 = {
        x: start.x + (end.x - start.x) * 0.75 - deviationX,
        y: start.y + (end.y - start.y) * 0.75 + deviationY
    };

    for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const mt = 1 - t;
        // Cubic Bezier calculation
        const x = mt * mt * mt * start.x + 3 * mt * mt * t * control1.x + 3 * mt * t * t * control2.x + t * t * t * end.x;
        const y = mt * mt * mt * start.y + 3 * mt * mt * t * control1.y + 3 * mt * t * t * control2.y + t * t * t * end.y;
        
        // Add tiny sub-pixel tremors/noise
        const noiseX = (Math.random() - 0.5) * 1.5;
        const noiseY = (Math.random() - 0.5) * 1.5;
        
        points.push({ x: x + noiseX, y: y + noiseY });
    }
    return points;
}

// Simulate human mouse movement using Bezier curves and variable speeds
async function humanMouseMove(page, start, end, fastMode = false) {
    const steps = fastMode ? 10 : 30;
    const points = generateBezierPoints(start, end, steps);
    let currentX = start.x;
    let currentY = start.y;

    for (const point of points) {
        const progress = points.indexOf(point) / points.length;
        let delay = fastMode ? 2 : 6; // base delay in ms
        
        // Decelerate near the end (last 25%) only if NOT in fastMode
        if (!fastMode && progress > 0.75) {
            delay += (progress - 0.75) * 40; 
        }
        
        await page.mouse.move(point.x, point.y);
        await sleep(delay);
        currentX = point.x;
        currentY = point.y;
    }
    
    // Tiny overshoot and adjustment at the end (skip in fastMode)
    if (!fastMode && Math.random() > 0.4) {
        const overshootX = end.x + (Math.random() - 0.5) * 6;
        const overshootY = end.y + (Math.random() - 0.5) * 6;
        await page.mouse.move(overshootX, overshootY);
        await sleep(40 + Math.random() * 60);
        await page.mouse.move(end.x, end.y);
        await sleep(20);
    }
}

async function runDumbBot() {
    console.log('\n--- 🤖 RUNNING DUMB BOT TEST ---');
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto('http://localhost:4000');
    
    // Type email instantly
    await page.fill('input[type="email"]', 'dumb-bot@example.com');
    
    // Locate the iframe
    const iframe = page.frameLocator('iframe');
    await sleep(1000); // Wait for challenge to render

    // Find tiles inside the iframe
    const tileElements = iframe.locator('.tile');
    const count = await tileElements.count();
    
    // Select all human tiles instantly with no mouse movement or delays
    for (let i = 0; i < count; i++) {
        const text = await tileElements.nth(i).textContent();
        if (humanBehaviors.includes(text.trim())) {
            // Click instantly at the element center
            await tileElements.nth(i).click({ force: true });
        }
    }
    
    // Click Verify instantly
    await iframe.locator('.verify-btn').click({ force: true });
    await sleep(1000);
    
    // Click Submit
    await page.click('.console-submit');
    await sleep(2000);
    
    // Check results
    const statusText = await page.locator('.console-status').textContent().catch(() => 'No status box found');
    console.log('Result Status:\n', statusText.trim());
    
    await browser.close();
}

async function runSmartBot() {
    console.log('\n--- 🤖 RUNNING SMART BOT TEST ---');
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto('http://localhost:4000');
    
    // Type email with slight delay
    await page.type('input[type="email"]', 'smart-bot@example.com', { delay: 30 });
    
    const iframe = page.frameLocator('iframe');
    await sleep(1000);
    
    const tileElements = iframe.locator('.tile');
    const count = await tileElements.count();
    
    let currentPos = { x: 100, y: 100 };
    await page.mouse.move(currentPos.x, currentPos.y);

    // Identify and click tiles with linear mouse movement and uniform delays
    for (let i = 0; i < count; i++) {
        const text = await tileElements.nth(i).textContent();
        if (humanBehaviors.includes(text.trim())) {
            const box = await tileElements.nth(i).boundingBox();
            if (box) {
                const targetPos = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
                // Perfectly linear path in exactly 5 steps
                await page.mouse.move(targetPos.x, targetPos.y, { steps: 5 });
                await sleep(200); // Fixed robotic interval
                await page.mouse.down();
                await page.mouse.up();
                await sleep(200);
                currentPos = targetPos;
            }
        }
    }
    
    // Click Verify
    const verifyBox = await iframe.locator('.verify-btn').boundingBox();
    if (verifyBox) {
        await page.mouse.move(verifyBox.x + verifyBox.width / 2, verifyBox.y + verifyBox.height / 2, { steps: 5 });
        await sleep(200);
        await page.mouse.click(verifyBox.x + verifyBox.width / 2, verifyBox.y + verifyBox.height / 2);
    }
    
    await sleep(1000);
    
    // Click Submit
    await page.click('.console-submit');
    await sleep(2000);
    
    const statusText = await page.locator('.console-status').textContent().catch(() => 'No status box found');
    console.log('Result Status:\n', statusText.trim());
    
    await browser.close();
}

async function runSuperSmartBot() {
    console.log('\n--- 🧑‍💻 RUNNING SUPER SMART BOT TEST ---');
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto('http://localhost:4000');
    
    // Human-like typing delay (random per keystroke)
    const email = 'supersmart-bot@example.com';
    for (const char of email) {
        await page.type('input[type="email"]', char);
        await sleep(70 + Math.random() * 120); // 70ms - 190ms delay
    }
    await sleep(500 + Math.random() * 500); // Wait before starting challenge

    const iframe = page.frameLocator('iframe');
    
    let currentPos = { x: 50 + Math.random() * 100, y: 50 + Math.random() * 100 };
    await page.mouse.move(currentPos.x, currentPos.y);
    
    // Round 1: Satirical Quiz
    const tileElements = iframe.locator('.tile');
    const count = await tileElements.count();
    
    // Identify target human behaviors
    const targetIndices = [];
    for (let i = 0; i < count; i++) {
        const text = await tileElements.nth(i).textContent();
        if (humanBehaviors.includes(text.trim())) {
            targetIndices.push(i);
        }
    }
    
    // Shuffle target order to simulate natural visual scanning
    targetIndices.sort(() => Math.random() - 0.5);

    for (const index of targetIndices) {
        const box = await tileElements.nth(index).boundingBox();
        if (box) {
            const targetPos = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
            
            // Move mouse slightly faster to hit the "uncertain" range (41-69)
            await humanMouseMove(page, currentPos, targetPos, true);
            
            // Small pause before clicking
            await sleep(30 + Math.random() * 40);
            await page.mouse.down();
            await sleep(20 + Math.random() * 20);
            await page.mouse.up();
            
            currentPos = targetPos;
            
            // Short delay after clicking before moving to next target
            await sleep(100 + Math.random() * 100);
        }
    }
    
    // Move to and click Verify button in fastMode
    const verifyBox = await iframe.locator('.verify-btn').boundingBox();
    if (verifyBox) {
        const targetPos = { x: verifyBox.x + verifyBox.width / 2, y: verifyBox.y + verifyBox.height / 2 };
        await humanMouseMove(page, currentPos, targetPos, true);
        await sleep(50 + Math.random() * 50);
        await page.mouse.down();
        await sleep(20 + Math.random() * 20);
        await page.mouse.up();
        currentPos = targetPos;
    }
    
    await sleep(2000); // Wait for response from server

    // Handle next rounds if they are requested (e.g. if the verdict is uncertain)
    // Round 2: Reaction round
    const reactionBox = iframe.locator('.reaction-box');
    if (await reactionBox.count() > 0) {
        console.log('Detected Round 2 (Reaction Flash)... solving humanly.');
        // Reaction loop (3 sub-rounds)
        for (let i = 0; i < 3; i++) {
            // Wait for target to turn red
            await iframe.locator('.reaction-box.red').waitFor({ state: 'visible', timeout: 10000 });
            const box = await reactionBox.boundingBox();
            if (box) {
                const targetPos = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
                // Move mouse humanly to the box
                await humanMouseMove(page, currentPos, targetPos);
                // Simulate human reaction time delay (250ms - 400ms)
                await sleep(250 + Math.random() * 150);
                await page.mouse.click(targetPos.x, targetPos.y);
                currentPos = targetPos;
            }
            // Wait brief moment before next sub-round loads
            await sleep(1000);
        }
        await sleep(2000);
    }

    // Submit the form
    await page.click('.console-submit');
    await sleep(2500);
    
    const statusText = await page.locator('.console-status').textContent().catch(() => 'No status box found');
    console.log('Result Status:\n', statusText.trim());
    
    await browser.close();
}

async function runAll() {
    try {
        await runDumbBot();
    } catch (e) {
        console.error('Error running Dumb Bot:', e);
    }
    
    try {
        await runSmartBot();
    } catch (e) {
        console.error('Error running Smart Bot:', e);
    }
    
    try {
        await runSuperSmartBot();
    } catch (e) {
        console.error('Error running Super Smart Bot:', e);
    }
}

runAll();
