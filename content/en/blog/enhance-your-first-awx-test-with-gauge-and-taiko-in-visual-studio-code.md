---
title: Enhance Your First AWX Test with Gauge and Taiko in Visual Studio Code
date: 2024-05-14T12:00:00+00:00
description: Enhance Your First AWX Test with Gauge and Taiko in Visual Studio Code
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
    image: images/2024-thumbs/taiko04.webp
---

[Taiko repository](https://github.com/getgauge/taiko)
[Taiko API](https://docs.taiko.dev/)

1. **Here is a video tutorial**

{{<youtube FdoGmHA4tEQ>}}


### **Creating Automated Tests with Gauge and Taiko: Logging into AWX**

Welcome to this lesson, where we'll walk you through utilizing Gauge and Taiko to create a basic automated test. This test will carry out basic tasks and automate the AWX administration interface login process. The main goal of this article is to automate a test that opens the AWX (Ansible AWX) login screen, inputs credentials, and then completes a basic activity, such cleaning tasks. 

Using some functionalities from a Gauge example, we will begin by starting from scratch with a new spec file and associated JavaScript file.

#### **Prerequisites**

Ensure you have the following installed:

- Node.js
- Gauge
- Taiko
- Visual Studio Code or any preferred IDE

If you haven't installed these yet, please refer back to the installation steps in my previous tutorials.

#### **Step 1: Initialize a Gauge JavaScript Project**

If you haven't already set up a project:

1. Create a new directory and navigate into it:

```bash
mkdir awx-taiko
cd awx-taiko
```
2. Initialize a Gauge project with JavaScript:

```bash
gauge init js
```

This command sets up a basic project structure with example specs and support files.

#### **Step 2: Explore the Example Files**

Take a moment to examine the example spec and JavaScript files created by `gauge init js`. These files provide a good starting point for understanding how to interact with web elements using Taiko.

#### **Step 3: Create a New Spec File**

1. In your Gauge project directory, create a new file called `login.spec`.
2. Start by defining the spec title and a scenario:

```markdown
# AWX login test

to execute this specification, use
npm test

This is a context step that runs before every scenario
* Navigate to the AWX login page

## Login to AWX
* Assert the login page is loaded
* Use credentials "admin":"password"
* Click the login button
* Verify successful login
___
* Clear all tasks
```

#### **Step 4: Implement the Spec in JavaScript**

Create a new JavaScript file named `login.js` and start scripting the actions:

1. Import Taiko and necessary Gauge annotations:

```javascript
/* globals gauge*/
"use strict";
const path = require('path');
const {
    openBrowser,
    write,
    closeBrowser,
    goto,
    button,
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

3. Implement the steps:

```javascript
step("Navigate to the AWX login page", async function () {
    await goto("awx.sysadmin.homes");
});

step("Assert the login page is loaded", async () => {
    assert(await text("Welcome to AWX!").exists());
});

step('Use credentials <username>:<passwortd>', async (username, password) => {
    await write('admin', into(textBox("Username"),{force:true}));
    await write('password', into(textBox("Password"),{force:true}));
});

step("Click the login button", async () => {
    await click(button("Log In"));
});

step("Verify successful login", async () => {
    assert(await text("Dashboard").exists());
});
step("Clear all tasks", async function () {
    await evaluate(() => localStorage.clear());
});
```

#### **Step 5: Run Your Test from command line**

Now that your spec and implementation are ready:

1. Open your terminal.
2. Run the test by executing:

```bash
gauge run specs
```

#### **Step 5: Run Your Test from Visual Studio Code**

1. Make sure your project structure is right and save all files.
2. Start the test by entering 'Gauge: Run All Specifications' in the Command Palette ({Ctrl+Shift+P}). You can also click Run spec or scenario (accessible in Visual Studio Code after installing the Gauge extension) to run all of your specifications and view the results directly in Visual Studio Code.

#### **Conclusion**

This post demonstrated how to use Gauge and Taiko to develop a simple automated test for logging into AWX. More complex scenarios can be automated using this approach by modifying the JavaScript and spec files. Try out various functions and assignments as required.