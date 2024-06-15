---
title: Effortless HashiCorp Vault unsealing - a step-by-step guide using systemd services
date: 2024-06-15T10:00:00+00:00
description: Effortless HashiCorp Vault unsealing - a step-by-step guide using systemd services
draft: true
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

#### Step 1: Encrypt the Unseal Keys

For the highest security, run the command in a new shell session where history is disabled, and ensure no sensitive information is stored.

1. Start a new shell session.

   ```bash
   bash
   ```

2. Disable history.

   ```bash
   set +o history
   ```

3. Create an encrypted file to store your unseal keys using `gpg`.

   ```bash
   echo -e "your-unseal-key-1\nyour-unseal-key-2\nyour-unseal-key-3" | gpg --symmetric --cipher-algo AES256 -o /root/.vault_unseal_keys.gpg
   ```

4. You will be prompted to enter a passphrase. Remember this passphrase as you will need it to decrypt the file.

5. Exit the shell session.

   ```bash
   exit
   ```

#### Step 2: Store the GPG Passphrase

1. Create a file to store the GPG passphrase. This file will be accessible only to the root user.

   ```bash
   vim /root/.gpg_passphrase
   # enter "your-passphrase"
   # save and exit
   ```

2. Set the permissions to make it readable only by the root user.
   ```bash
   chmod 400 /root/.gpg_passphrase
   ```

#### Step 3: Create the Unseal Script

Create a script to unseal Vault that securely fetches the unseal keys. Save the following script to `/usr/local/bin/unseal_vault.sh`.

```bash
#!/bin/bash

# Load the GPG passphrase
GPG_PASSPHRASE=$(cat /root/.gpg_passphrase)

# Decrypt the unseal keys
UNSEAL_KEYS=$(gpg --quiet --batch --yes --decrypt --passphrase "$GPG_PASSPHRASE" /root/.vault_unseal_keys.gpg)

# Convert decrypted keys to an array
UNSEAL_KEYS_ARRAY=($(echo "$UNSEAL_KEYS"))

# Unseal Vault
vault operator unseal ${UNSEAL_KEYS_ARRAY[0]}
vault operator unseal ${UNSEAL_KEYS_ARRAY[1]}
vault operator unseal ${UNSEAL_KEYS_ARRAY[2]}
```

Make the script executable:

```bash
chmod +x /usr/local/bin/unseal_vault.sh
```

#### Step 2: Create a systemd Service

Next, we create a systemd service to run the unseal script after the Vault service starts. Create a new service file at `/etc/systemd/system/vault-unseal.service` with the following content:

```ini
[Unit]
Description=Unseal Vault
After=vault.service

[Service]
Type=oneshot
ExecStart=/usr/local/bin/unseal_vault.sh

[Install]
WantedBy=multi-user.target
```

#### Step 3: Enable the Unseal Service

Enable the unseal service to ensure it runs after Vault starts:

```bash
systemctl enable vault-unseal.service
```

Reload systemd to apply the changes:

```bash
systemctl daemon-reload
```

#### Step 4: Verify the Setup

Finally, restart the Vault service and verify that the unseal script runs successfully.

```bash
systemctl restart vault.service
```

Check the status of the unseal service:

```bash
systemctl status vault-unseal.service
```

Ensure Vault is unsealed by checking its status:

```bash
vault status
```

#### What happens during the boot process

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
2. **`vault-unseal.service` does not automatically restart**: By default, `vault-unseal.service` does not automatically restart just because `vault.service` was restarted. The `vault-unseal.service` is set to run after `vault.service` during the boot process, but it doesn’t automatically bind to restarts of `vault.service`.

### Ensuring Unseal After Restart

To ensure that the `vault-unseal.service` runs every time `vault.service` is restarted, you need to add a dependency in the `vault.service` file.

#### Modify `vault.service`

Edit the `vault.service` file (usually found in `/etc/systemd/system/` or `/lib/systemd/system/`) to include the `vault-unseal.service` as a dependency:

```ini
[Unit]
Description="HashiCorp Vault - A tool for managing secrets"
Documentation=https://www.vaultproject.io/docs/
Requires=network-online.target
After=network-online.target
# Add the following line to ensure vault-unseal.service runs after vault.service
PartOf=vault-unseal.service

[Service]
User=vault
Group=vault
ExecStart=/usr/local/bin/vault server -config=/etc/vault.d/vault.hcl
ExecReload=/bin/kill -HUP $MAINPID
LimitNOFILE=65536
# Other options...

[Install]
WantedBy=multi-user.target
```

And modify the `vault-unseal.service` file to include:

```ini
[Unit]
Description=Unseal Vault
After=vault.service
Requires=vault.service

[Service]
Type=oneshot
ExecStart=/usr/local/bin/unseal_vault.sh

[Install]
WantedBy=multi-user.target
```

With these modifications, the `vault-unseal.service` will be considered part of the `vault.service` process. Restarting `vault.service` will now also trigger the `vault-unseal.service`.

### Testing the Setup

After making these changes, reload the systemd configuration and restart the Vault service:

```bash
systemctl daemon-reload
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

{{<youtube >}}