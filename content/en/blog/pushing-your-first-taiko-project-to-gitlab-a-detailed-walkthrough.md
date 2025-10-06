---
title: Pushing your first Taiko project to GitLab - a detailed walkthrough
date: 2024-05-14T13:00:00+00:00
description: Pushing your first Taiko project to GitLab - a detailed walkthrough
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
    image: images/2024-thumbs/taiko05.webp
---

[Taiko repository](https://github.com/getgauge/taiko)
[Taiko API](https://docs.taiko.dev/)

**Here is a video tutorial**

{{<youtube 2IT8vomcuds>}}

# How to Push the Taiko Project into GitLab Repository

## Step-by-Step Guide

### Step 1: Open GitLab

- Open your web browser.
- Go to your GitLab instance URL and log in with your credentials.

### Step 2: Create a Project in the Developers Group

- Once logged in, navigate to the top menu and click on **Projects**.
- Click **Create new project**.

### Step 3: Choose "Create blank project"

- Select **Create blank project**.

### Step 4: Ensure the Project is Created in the Developers Group

- In the **Project name** field, enter your project name (e.g., `awx-taiko`).
- Under **Project URL**, make sure the namespace (group) is set to `developers` where your user is added.
- Click **Create project**.

### Step 5: Configure Git and Set Up the Repository

You can get started by cloning the repository or start adding files to it with one of the following options. You can also upload existing files from your computer using the instructions below.

#### Git Global Setup

1. Open your terminal.
2. Configure your Git user name and email (replace "your_user" and "your_user@gitlab.local" with your actual name and email):

    ```bash
    git config --global user.name "your_user"
    git config --global user.email "your_user@gitlab.local"
    ```

#### Create a New Repository

1. Clone the newly created repository:

    ```bash
    git clone git@IP_OR_URL_of_your_GitLab:developers/awx-taiko.git
    ```
2. Navigate into the cloned directory:

    ```bash
    cd awx-taiko
    ```
3. Create a new branch named `main`:

    ```bash
    git switch --create main
    ```
4. Create a `README.md` file:

    ```bash
    touch README.md
    ```
5. Add the `README.md` file to the staging area:

    ```bash
    git add README.md
    ```
6. Open `README.md` with a text editor (e.g., `vim`) and add some text:

    ```bash
    vim README.md
    ```
    - After adding text, save and close the editor (in `vim`, press `Esc`, type `:wq`, and press `Enter`).

7. Commit the changes:

    ```bash
    git commit -m "add README"
    ```

#### Initialize and Commit an Existing Folder

1. Initialize a new Git repository:

    ```bash
    git init --initial-branch=main
    ```
2. Add the remote repository:

    ```bash
    git remote add origin git@IP_OR_URL_of_your_GitLab:developers/awx-taiko.git
    ```
3. Add all files to the staging area:

    ```bash
    git add .
    ```
4. Commit the changes:

    ```bash
    git commit -m "Initial commit"
    ```

#### Push an Existing Git Repository

1. Push the local repository to GitLab:

    ```bash
    git push --set-upstream origin main
    ```

#### Copy Project Files into the Cloned Repository

1. Navigate to your home directory:

    ```bash
    cd ~
    ```
2. Copy the project files into the cloned repository (replace `/home/username/test/` and `/home/username/cloned-project/` with the actual paths):

    ```bash
    cp -r /home/username/test/* /home/username/cloned-project/
    ```

#### Confirm Overwriting `README.md` File

- If prompted, confirm overwriting the `README.md` file by typing `yes`.

#### Add and Commit All Files and Directories

1. Add all files to the staging area:

    ```bash
    git add .
    ```
2. Commit the changes:

    ```bash
    git commit -m "Added project AWX Taiko"
    ```

#### Push the Updated Repository

1. Push the changes to GitLab:

    ```bash
    git push origin main
    ```

### Step 6: Check the Status

1. Check the status of your Git repository to ensure everything is committed and pushed:

    ```bash
    git status
    ```

### Step 7: Refresh the Project in GitLab
- Go back to your GitLab project page.
- Refresh the page to see that all files and directories are up to date.

---

By following these steps, you will have successfully pushed your Taiko project into the GitLab repository. If you encounter any issues, ensure that your GitLab instance URL, project paths, and user credentials are correctly configured.