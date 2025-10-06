---
title: Set Up and Run Automated Browser Tests with Taiko and Gauge in Visual Studio Code
date: 2024-05-10T16:00:00+00:00
description: Set Up and Run Automated Browser Tests with Taiko and Gauge in Visual Studio Code
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
    image: images/2024-thumbs/taiko01.webp
---

Taiko repository: [Taiko](https://github.com/getgauge/taiko)

1. **Here is a video tutorial**

{{<youtube Ws0XGTeQgZk>}}

To set up Taiko with Gauge for browser automation testing, I have outlined a comprehensive process that includes installing the necessary tools, setting up the environment, and initializing a sample project. Here’s a step-by-step guide that details each step in a more structured format, ideal for clarity:

### Step 1: Setup Environment

1. **Create a project directory**:
   ```bash
   mkdir test
   cd test
   ```

2. **Install Node.js using NVM (Node Version Manager)**:
   ```bash
   # Installs NVM
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

   # Source nvm in the current session
   export NVM_DIR="$HOME/.nvm"
   [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
   [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

   # Install and use a specific Node.js version
   nvm install 20
   nvm use 20

   # Verify installation
   node -v # Expected output: v20.13.1
   npm -v # Expected output: 10.5.2
   ```

### Step 2: Install Dependencies

3. **Install project-specific npm packages**:
   ```bash
   npm install log4js eslint xml2js
   npx install-peerdeps --dev eslint-config-airbnb-base
   ```

4. **Configure the environment to trust self-signed certificates temporarily** (needed for some npm packages):
   ```bash
   export NODE_TLS_REJECT_UNAUTHORIZED="0"
   npm install taiko
   export NODE_TLS_REJECT_UNAUTHORIZED="1"
   ```

5. **Install and set up Gauge**:
   ```bash
   npm install -g @getgauge/cli
   gauge init js
   ```

### Step 3: Configure Development Tools

6. **Download and install Visual Studio Code**:
   - Visit [Visual Studio Code download page](https://code.visualstudio.com/download) and follow the instructions to install it.

7. **Install Visual Studio Code extensions**:
   - Open Visual Studio Code and install the following extensions via the Extensions Marketplace:
     - Gauge
     - ESLint
     - Babel JavaScript

### Step 4: Run and Write Tests

8. **Write your tests using Taiko and Gauge**:
   - Use the Taiko REPL to interactively write browser automation scripts.
   - Save your scripts and run them through Gauge to execute automated tests.

9. **Run your Gauge project**:
   ```bash
   gauge run specs
   ```

This setup ensures you have a robust testing environment utilizing modern tools like Taiko for browser automation and Gauge for test management. With Visual Studio Code and its extensions, you'll also have a powerful IDE for development and debugging.

## Visual Studio Code

Running tests directly from Visual Studio Code using the Gauge extension is a very efficient way to manage and execute your test cases. This method streamlines the development process, especially when you're frequently modifying and rerunning tests. Here’s how you can do this effectively:

### Running Gauge Tests in Visual Studio Code

1. **Open Your Project**:
   - Launch Visual Studio Code.
   - Open your project folder (`test` in this case) that contains your Gauge specs.

2. **Ensure Gauge Extension is Active**:
   - Verify that the Gauge extension is installed and enabled in Visual Studio Code. If it’s not installed, you can find it in the Extensions marketplace by searching for "Gauge" and then install it. You also need Eslint and Babel Javascript extensions to be installed and enabled. 

3. **Write Your Tests**:
   - Use the project structure created by `gauge init js` to write your tests. Typically, this will include modifying or adding specifications (`*.spec` files) and implementing step definitions in JavaScript.

4. **Run Tests**:
   - In Visual Studio Code, you can run tests directly from the editor.
   - To run a specific test, simply open a `.spec` file and you will see a "Run Scenario" or "Run Specification" button above each test scenario or at the top of the file. Clicking this button will execute the tests.
   - You can also use the Terminal in Visual Studio Code to run tests via command line using `gauge run specs`.

5. **View Test Reports**:
   - After running the tests, Gauge typically generates reports that you can view directly within Visual Studio Code. Check the output in the Terminal or the designated Gauge reports folder in your project directory.

6. **Debug Tests**:
   - Gauge and Taiko provide debugging capabilities. You can set breakpoints in your JavaScript code. Make sure to configure your `launch.json` in Visual Studio Code to attach the debugger to Node.js processes that Gauge starts.

### Benefits of Using Visual Studio Code with Gauge

- **Integrated Development Environment**: Everything from writing to running and debugging tests is integrated into one environment.
- **Immediate Feedback**: You can see test results immediately in the editor, making it easier to debug and fix issues.
- **Version Control Integration**: Visual Studio Code's strong Git integration allows for easy version control of your test scripts and specifications.

This setup provides a comprehensive and user-friendly testing environment, enhancing productivity and reducing the overhead of switching between tools. If you have any specific scenarios or setups in your project that you need help with, feel free to ask!