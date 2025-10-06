---
title: Effortless HashiCorp Vault unsealing - a step-by-step guide using systemd services
date: 2024-06-17T13:00:00+00:00
description: Effortless HashiCorp Vault unsealing - a step-by-step guide using systemd services
draft: false
hideToc: false
enableToc: true
enableTocContent: false
author: sysadmin
authorEmoji: 🐧
pinned: false
asciinema: true
series:
- GitLab
categories:
- GitLab
cover:
    image: images/2024-thumbs/gitlab05.webp
---

#### Introduction

Vault by HashiCorp requires unsealing after every restart to ensure the security of the secrets it stores. This tutorial will guide you through automating the unseal process using a systemd service on a Linux system.

#### Prerequisites

- Vault installed and configured on your system
- Access to unseal keys
- Basic knowledge of systemd and bash scripting
- `gpg` installed for encryption

#### How to install gpg

{{< tabs Debian CentOS Fedora Arch OpenSUSE >}}
  {{< tab >}}

##### Debian/Ubuntu

  ```bash
  sudo apt update
  sudo apt -y install gnupg
  gpg --version
  ```

  {{< /tab >}}
  {{< tab >}}

##### CentOS/RHEL

  ```bash
  sudo yum update
  sudo yum -y install gnupg
  gpg --version
  ```

  {{< /tab >}}
  {{< tab >}}

##### Fedora

  ```bash
  sudo dnf update
  sudo dnf -y install gnupg
  gpg --version
  ```

  {{< /tab >}}
  {{< tab >}}

##### Arch Linux

  ```bash
  sudo pacman -Syu
  sudo pacman -S gnupg
  gpg --version
  ```

  {{< /tab >}}
  {{< tab >}}

##### OpenSUSE

  ```bash
  sudo zypper refresh
  sudo zypper install gpg2
  gpg --version
  ```

  {{< /tab >}}
{{< /tabs >}}

#### Step 1: Preparation

1. **Log in via SSH**: Connect to your server as a standard user and switch to root.

    ```bash
    sudo -i
    ```

2. **Start a new bash session**: Execute a new bash shell and disable history.

Explanation: For the highest security, run the command in a new shell session where history is disabled, and ensure no sensitive information is stored.

   ```bash
   bash
   set +o history
   ```

3.**Create a file to store the GPG passphrase**: Ensure the file is accessible only to the root user.

   ```bash
   echo "your-passphrase" > /root/.gpg_passphrase
   ```

4.**Set the permissions to make it readable only by the root user.**

   ```bash
   chmod 400 /root/.gpg_passphrase
   ```

#### Step 2: Encrypt the Unseal Keys

1. **Create an encrypted file to store your unseal keys**:

    ```bash
    echo -e "your-unseal-key-1\nyour-unseal-key-2\nyour-unseal-key-3" | gpg --batch --yes --passphrase-file /root/.gpg_passphrase --symmetric --cipher-algo AES256 -o /root/.vault_unseal_keys.gpg
    chmod 400 /root/.vault_unseal_keys.gpg
    ```

2. **Clear the bash history and exit the temporary session**:

    ```bash
    history -c
    exit
    ```

#### Step 3: Create the Unseal Script

Create a script to unseal Vault that securely fetches the unseal keys. Save the following script to `/usr/local/bin/unseal_vault.sh`.

```bash
#!/bin/bash

export VAULT_ADDR='https://<vault IP address>:8200'

# Create log file if it doesn't exist
LOGFILE=/var/log/unseal_vault.log
if [ ! -f "$LOGFILE" ]; then
    touch "$LOGFILE"
    chown vault:vault "$LOGFILE"
else
    echo "$LOGFILE exists"
fi

# Log the start time
echo "Starting unseal at $(date)" >> $LOGFILE

# Wait for Vault to be ready
while ! vault status 2>&1 | grep -q "Sealed.*true"; do
  echo "Waiting for Vault to be sealed and ready..." >> $LOGFILE
  sleep 5
done

echo "Vault is sealed and ready at $(date)" >> $LOGFILE

# Load the GPG passphrase
GPG_PASSPHRASE=$(cat /root/.gpg_passphrase)

# Decrypt the unseal keys
UNSEAL_KEYS=$(gpg --quiet --batch --yes --decrypt --passphrase "$GPG_PASSPHRASE" /root/.vault_unseal_keys.gpg)
if [ $? -ne 0 ]; then
  echo "Failed to decrypt unseal keys at $(date)" >> $LOGFILE
  exit 1
fi

echo "Unseal keys decrypted successfully at $(date)" >> $LOGFILE

# Convert decrypted keys to an array
UNSEAL_KEYS_ARRAY=($(echo "$UNSEAL_KEYS"))

# Unseal Vault
for key in "${UNSEAL_KEYS_ARRAY[@]}"; do
# commented out because I do not want to debug it anymore
  vault operator unseal "$key" # >> $LOGFILE 2>&1
  #if [ $? -ne 0 ]; then
  #  echo "Failed to unseal with key $key at $(date)" >> $LOGFILE
  #  exit 1
  #fi
  #echo "Successfully used unseal key $key at $(date)" >> $LOGFILE
done

echo "Vault unsealed successfully at $(date)" >> $LOGFILE
```

Make the script executable:

```bash
chmod 500 /usr/local/bin/unseal_vault.sh
```

#### Step 4: Modify Vault Service

Modify the `/etc/systemd/system/vault.service` file to include a dependency on the `vault-unseal.service`.

```ini
[Unit]
Description=HashiCorp Vault
Documentation=https://www.vaultproject.io/docs/
Requires=network-online.target
After=network-online.target
Requires=vault-unseal.service

[Service]
User=vault
Group=vault
EnvironmentFile=/etc/vault.d/vault.env
ExecStart=/usr/local/bin/vault server -config=/etc/vault.d/vault.hcl
ExecReload=/bin/kill --signal HUP $MAINPID
KillMode=process
KillSignal=SIGINT
Restart=on-failure
RestartSec=5
LimitNOFILE=65536
LimitMEMLOCK=infinity

[Install]
WantedBy=multi-user.target
```

#### Step 5: Create Vault Unseal Service

Create a new service file at `/etc/systemd/system/vault-unseal.service` with the following content:

```ini
[Unit]
Description=Unseal Vault
After=vault.service
Requires=vault.service

[Service]
Type=oneshot
ExecStart=/usr/local/bin/unseal_vault.sh
Environment=VAULT_ADDR=https://<vault IP address>:8200
Environment=DBUS_SESSION_BUS_ADDRESS=$XDG_RUNTIME_DIR/bus

[Install]
WantedBy=multi-user.target
```

#### Step 6: Create vault.env file

```bash
cat << 'EOF' > /etc/vault.d/vault.env
VAULT_ADDR=https://<vault IP address>:8200
DBUS_SESSION_BUS_ADDRESS=$XDG_RUNTIME_DIR/bus
EOF
```

#### Step 7: export variables to .bashrc

```bash
BASHRC_PATH="$HOME/.bashrc"
echo "export VAULT_ADDR='https://<vault IP address>:8200'" >> $BASHRC_PATH
echo "export DBUS_SESSION_BUS_ADDRESS=\$XDG_RUNTIME_DIR/bus" >> $BASHRC_PATH
source $BASHRC_PATH
```

With these modifications, the `vault-unseal.service` will be considered part of the `vault.service` process. Restarting `vault.service` will now also trigger the `vault-unseal.service`.

#### Step 6: Reload Systemd and Start Services

Reload systemd to apply the changes and start the services:

```bash
systemctl daemon-reload
systemctl restart vault.service
```

#### Step 8: Enable both services during boot

```bash
systemctl enable vault-unseal.service
systemctl enable vault.service
```

#### Explanation: What happens during the boot process

When your system boots up, the following sequence happens:

1. **`vault.service` starts**: This is the main service for Vault. It will start according to its configuration.
2. **`vault-unseal.service` starts**: This service is configured to start after `vault.service` because of the `After=vault.service` directive. This means that `vault-unseal.service` will not start until `vault.service` has fully started.

The `vault-unseal.service` depends on `vault.service`, and it will only execute the unseal script after the Vault service is running.

### Behavior on Manual Restart

#### Manual restart of `vault.service`

When you manually restart `vault.service` using the command:

```bash
systemctl restart vault.service
```

Here’s what happens:

1. **`vault.service` stops**: The Vault service stops and then starts again.
2. **`vault-unseal.service` automatically restarts**: The service `vault-unseal.service` automatically restarts just because `vault.service` was restarted. The `vault-unseal.service` is set to run after `vault.service` during the boot process.

### Ensuring Unseal After Restart

To ensure that the `vault-unseal.service` runs every time `vault.service` is restarted, run the below command:

```bash
tail -f /var/log/unseal_vault.log
```

In another SSH session, restart the `vault.service`:

```bash
systemctl restart vault.service
```

Then, check the status of both services to ensure they are working as expected:

```bash
systemctl status vault.service
systemctl status vault-unseal.service
```

### Summary

This configuration ensures a secure method of unsealing Vault by encrypting the unseal keys with GPG and securely storing the passphrase. The script fetches the passphrase and decrypts the keys at runtime, enhancing the security of your setup.

By following this guide, you ensure that sensitive unseal keys are not exposed in plaintext, and access to the passphrase is restricted to the root user, providing an additional layer of security.

The `vault-unseal.service` will run both during the boot process and any manual restarts of `vault.service`, keeping Vault automatically unsealed and operational.

#### Walkthrough video

{{<youtube AvtRY9EszSI>}}

#### Bash script that automates the whole process

```bash
vim vault.sh
```

Put the below content:

```bash
#!/bin/bash

echo "This quick installer script requires root privileges."
echo "Checking..."
if [[ $(/usr/bin/id -u) -ne 0 ]]; 
then
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

# Step 1: Create passphrase file
echo "<your passphrase>" > /root/.gpg_passphrase
chmod 400 /root/.gpg_passphrase

# Step 2: Encrypt unseal keys
echo -e "your-unseal-key-1\nyour-unseal-key-2\nyour-unseal-key-3" | gpg --batch --yes --passphrase-file /root/.gpg_passphrase --symmetric --cipher-algo AES256 -o /root/.vault_unseal_keys.gpg

chmod 400 /root/.vault_unseal_keys.gpg

# Step 3: Clear bash history and exit the temporary session
history -c

# Step 4: Create the unseal script
cat << 'EOF' > /usr/local/bin/unseal_vault.sh
#!/bin/bash

export VAULT_ADDR='https://<vault IP address>:8200'

# Create log file if it doesn't exist
LOGFILE=/var/log/unseal_vault.log
if [ ! -f "$LOGFILE" ]; then
    touch "$LOGFILE"
    chown vault:vault "$LOGFILE"
else
    echo "$LOGFILE exists"
fi

# Log the start time
echo "Starting unseal at $(date)" >> $LOGFILE

# Wait for Vault to be ready
while ! vault status 2>&1 | grep -q "Sealed.*true"; do
  echo "Waiting for Vault to be sealed and ready..." >> $LOGFILE
  sleep 5
done

echo "Vault is sealed and ready at $(date)" >> $LOGFILE

# Load the GPG passphrase
GPG_PASSPHRASE=$(cat /root/.gpg_passphrase)

# Decrypt the unseal keys
UNSEAL_KEYS=$(gpg --quiet --batch --yes --decrypt --passphrase "$GPG_PASSPHRASE" /root/.vault_unseal_keys.gpg)
if [ $? -ne 0 ]; then
  echo "Failed to decrypt unseal keys at $(date)" >> $LOGFILE
  exit 1
fi

echo "Unseal keys decrypted successfully at $(date)" >> $LOGFILE

# Convert decrypted keys to an array
UNSEAL_KEYS_ARRAY=($(echo "$UNSEAL_KEYS"))

# Unseal Vault
for key in "${UNSEAL_KEYS_ARRAY[@]}"; do
# commented out because I do not want to debug it anymore
  vault operator unseal "$key" # >> $LOGFILE 2>&1
  #if [ $? -ne 0 ]; then
  #  echo "Failed to unseal with key $key at $(date)" >> $LOGFILE
  #  exit 1
  #fi
  #echo "Successfully used unseal key $key at $(date)" >> $LOGFILE
done

echo "Vault unsealed successfully at $(date)" >> $LOGFILE
EOF

chmod 500 /usr/local/bin/unseal_vault.sh

# Step 5: Modify vault.service
cat << 'EOF' > /etc/systemd/system/vault.service
[Unit]
Description=HashiCorp Vault
Documentation=https://www.vaultproject.io/docs/
Requires=network-online.target
After=network-online.target
Requires=vault-unseal.service

[Service]
User=vault
Group=vault
EnvironmentFile=/etc/vault.d/vault.env
ExecStart=/usr/local/bin/vault server -config=/etc/vault.d/vault.hcl
ExecReload=/bin/kill --signal HUP $MAINPID
KillMode=process
KillSignal=SIGINT
Restart=on-failure
RestartSec=5
LimitNOFILE=65536
LimitMEMLOCK=infinity

[Install]
WantedBy=multi-user.target
EOF

# Step 6: Create vault-unseal.service
cat << 'EOF' > /etc/systemd/system/vault-unseal.service
[Unit]
Description=Unseal Vault
After=vault.service
Requires=vault.service

[Service]
Type=oneshot
ExecStart=/usr/local/bin/unseal_vault.sh
Environment=VAULT_ADDR=https://<vault IP address>:8200
Environment=DBUS_SESSION_BUS_ADDRESS=$XDG_RUNTIME_DIR/bus

[Install]
WantedBy=multi-user.target
EOF

# Step 7: Create vault.env file
cat << 'EOF' > /etc/vault.d/vault.env
VAULT_ADDR=https://<vault IP address>:8200
DBUS_SESSION_BUS_ADDRESS=$XDG_RUNTIME_DIR/bus
EOF

# Step 8: Reload systemd and start services
systemctl daemon-reload
systemctl enable vault-unseal.service
systemctl enable vault.service
systemctl restart vault.service

# Step 9: export variables to .bashrc
BASHRC_PATH="$HOME/.bashrc"
echo "export VAULT_ADDR='https://<vault IP address>:8200'" >> $BASHRC_PATH
echo "export DBUS_SESSION_BUS_ADDRESS=\$XDG_RUNTIME_DIR/bus" >> $BASHRC_PATH
source $BASHRC_PATH
```

Make the bash script executable:

```bash
chmod +x vault.sh
```

Run the script:

```bash
sudo ./vault.sh
```

#### Bash script that reverts all changes

```bash
#!/bin/bash

echo "This quick installer script requires root privileges."
echo "Checking..."
if [[ $(/usr/bin/id -u) -ne 0 ]]; 
then
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
rm -f /var/log/unseal_vault.log
rm -f /root/.gpg_passphrase
rm -f /root/.vault_unseal_keys.gpg
rm -f /usr/local/bin/unseal_vault.sh
rm -f /etc/systemd/system/vault-unseal.service
rm -f /etc/vault.d/vault.env
cat << 'EOF' > /etc/systemd/system/vault.service
[Unit]
Description=HashiCorp Vault
Documentation=https://www.vaultproject.io/docs/
Requires=network-online.target
After=network-online.target

[Service]
User=vault
Group=vault
ExecStart=/usr/local/bin/vault server -config=/etc/vault.d/vault.hcl
ExecReload=/bin/kill --signal HUP $MAINPID
KillMode=process
KillSignal=SIGINT
Restart=on-failure
RestartSec=5
LimitNOFILE=65536
LimitMEMLOCK=infinity

[Install]
WantedBy=multi-user.target
EOF
systemctl daemon-reload
systemctl restart vault

BASHRC_PATH="$HOME/.bashrc"
sed -i "/export VAULT_ADDR='https:\/\/<vault IP address>:8200'/d" $BASHRC_PATH
sed -i "/export DBUS_SESSION_BUS_ADDRESS=\$XDG_RUNTIME_DIR\/bus/d" $BASHRC_PATH
source $BASHRC_PATH
```
