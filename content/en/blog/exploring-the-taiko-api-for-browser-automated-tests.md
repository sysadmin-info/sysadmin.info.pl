---
title: Exploring the Taiko API for Browser Automated Tests
date: 2024-05-11T16:00:00+00:00
description: Exploring the Taiko API for Browser Automated Tests
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
    image: images/2024-thumbs/taiko02.webp
---

[Taiko repository](https://github.com/getgauge/taiko)
[Taiko API](https://docs.taiko.dev/)

1. **Here is a video tutorial**

{{<youtube Tk5eCTpO0rA>}}

Welcome to this tutorial where we will delve into the powerful capabilities of the Taiko API. Taiko is a Node.js library designed to automate web browsers with a clear and concise API. In this session, we will use Taiko's interactive Read-Eval-Print Loop (REPL) to explore and demonstrate how to use different API functions effectively.

#### **Getting Started**

Before we begin, ensure that you have Taiko installed. If you haven't installed Taiko yet, you can do so by following my previous tutorial:

[Set Up and Run Automated Browser Tests with Taiko and Gauge in Visual Studio Code](/en/blog/set-up-and-run-automated-browser-tests-with-taiko-and-gauge-in-visual-studio-code)

This will install Taiko and the necessary components to get started.

#### **Launching Taiko REPL**

To start exploring Taiko's API, we need to launch the REPL. Open your terminal and type:

```bash
npx taiko
```

This command opens the Taiko prompt, where you can start typing Taiko commands directly.

#### **Exploring API Functions**

Once in the REPL, you can list all available API functions by typing:

```javascript
.api
```

This will display a list of all commands you can use with their brief descriptions.

##### **Detailed Function Information**

To get more details about a specific function, such as usage examples and parameters, use the `.api` command followed by the function name. Let’s explore a few key functions:

- **Goto**
  
  ```javascript
  .api goto
  ```
  
  Use the `goto` function to navigate to a URL. Here’s how you can use it:

  ```javascript
  goto('https://google.com')
  ```

- **Click**
  
  ```javascript
  .api click
  ```
  
  The `click` function is used to simulate mouse click events on elements. For instance:

  ```javascript
  click('Sign In')
  ```

- **Write**
  
  ```javascript
  .api write
  ```
  
  `write` is used to type text into input fields:

  ```javascript
  write('hello@taiko.dev', into(textBox({placeholder: 'Email'})))
  ```

- **Evaluate**
  
  ```javascript
  .api evaluate
  ```
  
  Use `evaluate` to execute custom JavaScript on the page:

  ```javascript
  evaluate(() => document.title)
  ```

#### **Combining Commands**

Now, let's combine some of these commands to perform a sequence of actions that a real user might do:

1. Open a browser and navigate to a website.
2. Search for a term.
3. Click on a search result.

Here’s how it looks in the REPL:

```javascript
await openBrowser();
await goto('https://google.com');
await write('Taiko test automation', into(textBox({id: 'search'})));
await click('Google Search');
await click(link('Taiko GitHub'));
```

#### **Generating a Script**

Once you complete a flow of commands in the REPL, you can generate a script using the `.code` command. This is useful for saving your session as an executable script:

```javascript
.code
```

#### **Conclusion**

This tutorial covered how to interactively explore and use the Taiko API for browser automation. By understanding these functions, you can write more robust and maintainable browser automation scripts.

Feel free to experiment with other API functions and explore more complex interactions on your own. Happy testing!