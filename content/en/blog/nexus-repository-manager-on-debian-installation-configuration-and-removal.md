---
title: Nexus Repository Manager on Debian - Installation, Configuration, and Removal
date: 2024-05-15T16:00:00+00:00
description: Nexus Repository Manager on Debian - Installation, Configuration, and Removal
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
    image: images/2024-thumbs/taiko06.webp
---

[Nexus repository](https://github.com/sonatype-nexus-community/nexus-repository-installer)
[My Nexus repository that contains Bash scripts](https://github.com/sysadmin-info/nexus)

1. **Here is a video tutorial**

{{<youtube nUFXEMCkAho>}}

## Prerequisites
Ensure you have root privileges or are in the sudoers group before running the scripts.

## Step 1: Make the Scripts Executable
First, make both the installation and removal scripts executable.

```bash
chmod +x setup_nexus.sh
chmod +x remove_nexus.sh
```

## Step 2: Run the Installation Script
Run the setup script with superuser privileges to install Nexus and Java.

```bash
sudo ./setup_nexus.sh
```

## Step 3: Run the Removal Script
Run the removal script with superuser privileges to uninstall Nexus and Java.

```bash
sudo ./remove_nexus.sh
```

## Installation Script: `setup_nexus.sh`
This script automates the installation and setup of the Nexus Repository Manager along with the necessary Java environment on Debian 11 and 12.

### What the Script Does:
1. **Root Privileges Check**: Ensures the script is being run with root privileges.
2. **Install Necessary Packages**: Installs `gnupg` and adds the Sonatype repository for Nexus.
3. **Add Sonatype GPG Key**: Adds the GPG key for the Sonatype repository.
4. **Update Package Lists**: Updates the package list to include the Sonatype repository.
5. **Install Nexus**: Installs the Nexus Repository Manager package.
6. **Stop Nexus Service**: Stops the Nexus service if it is running.
7. **Install Java**: Downloads and installs BellSoft JDK 8.
8. **Set Permissions**: Sets appropriate ownership and permissions for Nexus directories.
9. **Start Nexus Service**: Starts the Nexus service.
10. **Install Curl**: Installs the `curl` package for HTTP requests.
11. **Validate Installation**: Uses `curl` to check if the Nexus service is running and accessible.
12. **Configure OrientDB**: Connects to the OrientDB console to update the admin password.
13. **Set Permissions Again**: Resets ownership and permissions after configuring OrientDB.
14. **Start Nexus Service**: Starts the Nexus service again.

```bash
#!/bin/bash

##########################################################################################################
# Author: Sysadmin                                                                                       #
# mail: admin@sysadmin.info.pl                                                                           #
# Use freely                                                                                             #
# Key Points:                                                                                            #
# 1. **Root Privileges Check**: The script verifies if it's being run as root.                           #
# 2. **Package Installation**: It installs necessary packages, including `gnupg` and `curl`.             #
# 3. **Nexus Repository Installation**: Downloads and installs Nexus Repository Manager.                 #
# 4. **Java Installation**: Downloads and installs the specified Java version.                           #
# 5. **Permissions**: Sets the correct ownership and permissions for Nexus directories.                  #
# 6. **Service Management**: Stops and starts the Nexus service at appropriate points.                   #
# 7. **OrientDB Console Commands**: Connects to the OrientDB console to update the admin password.       #
# 8. **Validation**: Uses `curl` to check if the Nexus service is running and accessible.                #
# This script covers the installation and setup process comprehensively,                                 #
# including handling dependencies and setting up the necessary environment for Nexus Repository Manager. #
##########################################################################################################

echo "This quick installer script requires root privileges."
echo "Checking..."
if [[ $(/usr/bin/id -u) -ne 0 ]]; then
    echo "Not running as root"
    exit 0
else
    echo "Installation continues"
fi

SUDO=
if [ "$UID" != "0" ]; then
    if [ -e /usr/bin/sudo -o -e /bin/sudo ]; then
        SUDO=sudo
    else
        echo "*** This quick installer script requires root privileges."
        exit 0
    fi
fi

# Install necessary packages
apt install gnupg gnupg1 gnupg2 -y
wget -P /etc/apt/sources.list.d/ https://repo.sonatype.com/repository/community-hosted/deb/sonatype-community.list
sed -i '1i deb [arch=all trusted=yes] https://repo.sonatype.com/repository/community-apt-hosted/ bionic main' /etc/apt/sources.list.d/sonatype-community.list
sed -i '2s/^/#/' /etc/apt/sources.list.d/sonatype-community.list
wget -q -O - https://repo.sonatype.com/repository/community-hosted/pki/deb-gpg/DEB-GPG-KEY-Sonatype.asc | apt-key add -
apt update && apt install nexus-repository-manager -y

# Stop the Nexus Repository Manager service
systemctl stop nexus-repository-manager.service

# Install Java JDK 8 update 412
wget https://download.bell-sw.com/java/8u412+9/bellsoft-jdk8u412+9-linux-amd64.deb
dpkg -i bellsoft-jdk8u412+9-linux-amd64.deb
apt --fix-broken install -y
dpkg -i bellsoft-jdk8u412+9-linux-amd64.deb

# Set correct ownership and permissions
chown -R nexus3:nexus3 /opt/sonatype
chmod -R 750 /opt/sonatype

# Start the Nexus Repository Manager service
systemctl start nexus-repository-manager.service

# Install curl
apt install curl -y

# Extract the first IP address from `hostname -I` and store it in a variable
IP_ADDRESS=$(hostname -I | awk '{print $1}')

echo "sleep 120 seconds ..."
sleep 120

# Use the IP address variable
echo "The IP address is: $IP_ADDRESS"
curl http://$IP_ADDRESS:8081

# Stop the Nexus Repository Manager service
systemctl stop nexus-repository-manager.service

# Execute OrientDB console commands using a here document
java -jar /opt/sonatype/nexus3/lib/support/nexus-orient-console.jar <<EOF
connect plocal:/opt/sonatype/sonatype-work/nexus3/db/security admin admin
select * from user where id = "admin"
update user SET password="\$shiro1\$SHA-512\$1024\$NE+wqQq/TmjZMvfI7ENh/g==\$V4yPw8T64UQ6GfJfxYq2hLsVrBY8D1v+bktfOxGdt4b/9BthpWPNUy/CBk6V9iA0nHpzYzJFWO8v/tZFtES8CA==" UPSERT WHERE id="admin"
exit
EOF

# Set correct ownership and permissions
chown -R nexus3:nexus3 /opt/sonatype
chmod -R 750 /opt/sonatype

# Start the Nexus Repository Manager service
systemctl start nexus-repository-manager.service

# Check logs with the below command:
# sudo tail -f /opt/sonatype/sonatype-work/nexus3/log/nexus.log
```

## Removal Script: `remove_nexus.sh`
This script automates the uninstallation and cleanup of the Nexus Repository Manager and the Java environment on Debian 11 and 12.

### What the Script Does:
1. **Root Privileges Check**: Ensures the script is being run with root privileges.
2. **Stop Nexus Service**: Stops the Nexus service if it is running.
3. **Disable Nexus Service**: Disables the Nexus service to prevent it from starting on boot.
4. **Remove Pre-removal Script**: Manually removes the problematic pre-removal script to avoid errors during uninstallation.
5. **Force Remove Nexus Package**: Forces the removal of the Nexus package.
6. **Remove Nexus Directories**: Deletes all directories and files related to Nexus.
7. **Remove Java Packages**: Removes BellSoft Java and Temurin JDK 8 packages if they are installed.
8. **Remove Residual Configurations**: Removes any remaining configuration files for Java packages.
9. **Clean Up Dependencies**: Removes unused dependencies and cleans up package manager files.
10. **Remove Nexus User and Group**: Optionally removes the user and group created for Nexus.
11. **Final Cleanup**: Ensures that all configuration files are purged.
12. **Verify Removal**: Checks and lists any remaining Nexus and Java packages to verify complete removal.

```bash
#!/bin/bash

echo "This uninstaller script requires root privileges."
echo "Checking..."
if [[ $(/usr/bin/id -u) -ne 0 ]]; then
    echo "Not running as root"
    exit 0
else
    echo "Uninstallation continues"
fi

# Stop the Nexus Repository Manager service if it exists
if systemctl is-active --quiet nexus-repository-manager.service; then
    systemctl stop nexus-repository-manager.service
fi

# Disable the Nexus Repository Manager service if it exists
if systemctl is-enabled --quiet nexus-repository-manager.service; then
    systemctl disable nexus-repository-manager.service
fi

# Manually remove the problematic pre-removal script of nexus-repository-manager
if [ -e /var/lib/dpkg/info/nexus-repository-manager.prerm ]; then
    mv /var/lib/dpkg/info/nexus-repository-manager.prerm /var/lib/dpkg/info/nexus-repository-manager.prerm.bak
fi

# Force remove Nexus Repository Manager package
dpkg --remove --force-remove-reinstreq nexus-repository-manager

# Remove Nexus directories
rm -rf /

opt/sonatype
rm -f /etc/systemd/system/nexus-repository-manager.service
rm -f /etc/apt/sources.list.d/sonatype-community.list
rm -rf /var/cache/apt/archives/nexus-repository-manager_*.deb
rm -rf /usr/share/doc/nexus-repository-manager

# Remove BellSoft Java package if installed
if dpkg -l | grep -q bellsoft-java8; then
    dpkg --purge bellsoft-java8 || true
fi

# Remove Temurin JDK 8 package if installed
if dpkg -l | grep -q temurin-8-jdk; then
    apt remove --purge temurin-8-jdk -y || true
fi

# Remove residual configuration files
dpkg --purge ca-certificates-java java-common

# Clean up unused dependencies
apt autoremove -y

# Clean up any remaining configuration files
apt clean

echo "Uninstallation completed."

# Optionally remove user and group created for Nexus
if id -u nexus3 >/dev/null 2>&1; then
    userdel nexus3
fi

if getent group nexus3 >/dev/null 2>&1; then
    groupdel nexus3
fi

# Remove any remaining configuration files
dpkg --purge nexus-repository-manager ca-certificates-java java-common

# Verify the removal
echo "Verifying the removal of Nexus and Java packages..."
dpkg -l | grep nexus
dpkg -l | grep java
```

## Accessing Nexus and Setting Up an NPM Proxy Repository

### Access Nexus Repository Manager

1. **Open Nexus in Your Browser:**
   - Open your preferred web browser.
   - In the address bar, type `http://<IP_ADDRESS>:8081` and press Enter. Replace `<IP_ADDRESS>` with the actual IP address of your Nexus server.
   
   Example:

   ```plaintext
   http://192.168.1.100:8081
   ```

2. **Log in to Nexus:**
   - On the login page, use the default credentials:
     - **Username:** `admin`
     - **Password:** `admin123`
   - Click on the **Sign In** button.

### Change the Admin Password

3. **Change the Admin Password:**
   - After logging in, click on the user icon in the top-right corner of the interface.
   - Select **Change Password** from the dropdown menu.
   - Enter the current password (`admin123`) and then enter and confirm your new password.
   - Click on the **Save** button to apply the changes.

### Disable Anonymous Access

4. **Disable Anonymous Access:**
   - From the left-hand sidebar, navigate to **Security** -> **Anonymous Access**.
   - Uncheck the **Allow anonymous users to access the server** option.
   - Click **Save** to apply the changes.

5. **Log out and Log in with the New Password:**
   - Click on the user icon in the top-right corner again.
   - Select **Sign Out** from the dropdown menu.
   - Log back in using the new admin password you set in the previous step.

### Set Up an NPM Proxy Repository

6. **Set Up an NPM Proxy Repository:**
   - From the left-hand sidebar, navigate to **Repositories**.
   - Click on the **Create repository** button.
   - Select **npm (proxy)** from the list of repository types.

7. **Configure the NPM Proxy Repository:**
   - In the **Name** field, enter a meaningful name for your repository (e.g., `npm-proxy`).
   - In the **Remote storage** field, enter the URL of the NPM registry:

     ```plaintext
     http://registry.npmjs.org
     ```
   - Adjust other settings as needed (e.g., Blob store, Strict Content Validation).

8. **Save the Repository Configuration:**
   - Scroll to the bottom of the configuration page and click the **Create repository** button to save the new NPM proxy repository.

### Verification

9. **Verify the Repository:**
   - Navigate to the **Repositories** section to ensure your new NPM proxy repository is listed and active.

### Summary of Commands and Configuration

- **Login to Nexus:**

  ```plaintext
  http://<IP_ADDRESS>:8081
  ```

- **Default Credentials:**

  ```plaintext
  Username: admin
  Password: admin123
  ```

- **NPM Registry URL for Proxy Repository:**

  ```plaintext
  http://registry.npmjs.org
  ```

By following these steps, you should have successfully accessed Nexus Repository Manager, changed the admin password, disabled anonymous access, and set up an NPM proxy repository. You are now ready to manage your NPM packages through Nexus!

---

This tutorial covers the full lifecycle of installing, configuring, and removing the Nexus Repository Manager and Java on Debian 11 and 12, as well as setting up and securing your Nexus environment.