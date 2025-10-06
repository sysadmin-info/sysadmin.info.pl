---
title: Writing Your First AWX Test from Scratch with Gauge and Taiko in Visual Studio Code
date: 2024-05-12T12:00:00+00:00
description: Writing Your First AWX Test from Scratch with Gauge and Taiko in Visual Studio Code
draft: false
hideToc: false
enableToc: true
enableTocContent: false
author: sysadmin
authorEmoji: 🐧
pinned: false
asciinema: true
series:
- Taiko
categories:
- Taiko
- Gauge
- Node.js
- npm
cover:
    image: images/2024-thumbs/taiko03.webp
---

[Taiko repository](https://github.com/getgauge/taiko)
[Taiko API](https://docs.taiko.dev/)

1. **Here is a video tutorial**

{{<youtube YwfnjKwf-HI>}}

Let's revise the tutorial to specifically focus on using Visual Studio Code with the Gauge, ESLint, and Babel JavaScript extensions for running and managing the test. This adjustment will align the tutorial with your video presentation that demonstrates executing the setup and tests directly from Visual Studio Code.

---

### **Creating and Running Automated Tests in AWX with Gauge and Taiko in Visual Studio Code**

Welcome to this detailed tutorial where we will create and run an automated test for logging into the AWX management interface using Gauge and Taiko in Visual Studio Code. This guide will walk you through setting up your test environment, creating spec and JavaScript files, and executing the test—all within Visual Studio Code.

#### **Prerequisites**
Make sure you have the following installed:
- Node.js
- Gauge
- Taiko
- Visual Studio Code with Gauge, ESLint, and Babel JavaScript extensions

#### **Step 1: Set Up Your Visual Studio Code Environment**
1. **Open Visual Studio Code** and create a new project folder named `awx-tests`.
2. **Open the terminal** in Visual Studio Code by selecting `Terminal` > `New Terminal` from the top menu.
3. Initialize a Gauge JavaScript project within this folder by running:

```bash
gauge init js
```

This command creates a basic project structure with example specs and supporting files that are useful as starting points.

#### **Step 2: Explore and Modify Example Files**
Navigate through the files in the Explorer pane of Visual Studio Code. Look at the example spec and JavaScript files to understand the basics of Gauge and Taiko interactions.

#### **Step 3: Create a New Spec File**
1. **Create a new file** called `test-awx.spec` in the `specs` directory.
2. **Define the spec** with a scenario that describes the steps to log into AWX:

```markdown
# AWX Login Test

to execute this specification, use
npm test

This is a context step that runs before every scenario
* Open AWX website

## Login to AWX
* Login with credentials "admin":"password"
___
* Clear all tasks
```

#### **Step 4: Implement the Steps in JavaScript**

Create a corresponding JavaScript file named `awx-steps.js.js` in the `tests` directory:

1. **Set up the necessary imports** and Gauge annotations:

```javascript
/* globals gauge*/
"use strict";
const path = require('path');
const {
    openBrowser,
    write,
    closeBrowser,
    goto,
    press,
    screenshot,
    above,
    click,
    checkBox,
    listItem,
    toLeftOf,
    link,
    text,
    into,
    textBox,
    evaluate
} = require('taiko');
const assert = require("assert");
const headless = process.env.headless_chrome.toLowerCase() === 'true';
```

2. **Define pre-test and post-test behaviors**:

```javascript
beforeSuite(async () => {
    await openBrowser({
        headless: headless
    })
});

afterSuite(async () => {
    await closeBrowser();
});

// Return a screenshot file name
gauge.customScreenshotWriter = async function () {
    const screenshotFilePath = path.join(process.env['gauge_screenshots_dir'],
        `screenshot-${process.hrtime.bigint()}.png`);

    await screenshot({
        path: screenshotFilePath
    });
    return path.basename(screenshotFilePath);
};
```

3. **Script the test steps** based on your spec definition:

```javascript
step("Open AWX website", async function () {
    await goto("awx.sysadmin.homes");
});

step('Login with credentials <username>:<passwortd>', async (username, password) => {
    await write('admin', into(textBox("Username"),{force:true}));
    await write('password', into(textBox("Password"),{force:true}));
    await press('Enter');
})

step("Clear all tasks", async function () {
    await evaluate(() => localStorage.clear());
});
```

#### **Step 5: Run Your Test from Visual Studio Code**
1. **Save all files** and ensure your project structure is correct.
2. **Run the test** by opening the Command Palette (`Ctrl+Shift+P`) and typing 'Gauge: Run All Specifications'. This command will execute all your specs and display the results directly in Visual Studio Code, or just click Run spec or scenario (available in Visual Studio Code after installation of the Gauge extension).

#### **Conclusion**
This tutorial guided you through creating and executing an automated login test for AWX using Visual Studio Code, Gauge, and Taiko. By leveraging Visual Studio Code extensions like Gauge, ESLint, and Babel JavaScript, you can streamline your test development and execution process.