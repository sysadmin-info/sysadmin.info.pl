---
title: Ubuntu installation on AtomMan - step-by-step
date: 2025-07-01T10:00:00+00:00
description: Ubuntu installation on AtomMan - step-by-step
draft: false
hideToc: false
enableToc: true
enableTocContent: false
author: sysadmin
authorEmoji: 🐧
pinned: false
asciinema: true
series:
- RHCSA
categories:
- RHCSA
cover:
    image: images/2025-thumbs/atomman.webp
---
#### 1. Preparing the USB Installer
1. Download [Balena Etcher](https://www.balena.io/etcher/). It’s available for Windows, Linux, and macOS. Install it on your system.
2. Download the Ubuntu Desktop ISO:
   - Go to the Ubuntu website and select “Ubuntu 24.04 LTS Desktop.”
   - Click “Download.” You can use a newer version if you want, but for stability, stick with 24.04 unless you specifically need something else.
3. Plug a USB stick (also called a pen drive) into your computer.
4. Open Balena Etcher:
   - Click “Flash from file” and select the Ubuntu ISO you downloaded.
   - Choose your USB stick as the target.
   - Click “Flash” and wait for the process to complete.
   - If you run into any errors, unplug and replug your USB stick and try again.
#### 2. Booting and Installing Ubuntu
1. Insert the USB stick into the AtomMan.
2. Power on the machine and press **F2** or **Delete** to enter the BIOS/Uefi menu.
3. In the boot menu, set the USB stick as the first boot device. Save and exit.
4. The system should now boot into the Ubuntu installer. Select “Try or Install Ubuntu.”
#### 3. Installing Ubuntu
1. Click “Install Ubuntu.”
2. Choose your language and preferences.
3. You can skip connecting to the internet at this stage.
4. When you reach the installation type, choose one of the following:
   - **Install Ubuntu alongside Windows Boot Manager** - sets up dual boot.
   - **Erase disk and install Ubuntu** - wipes the drive.
   - **Manual/‘Something else’** - for advanced users who want to manually partition their drive (set up efi, swap, and root partitions as needed).
5. Complete the steps for username, password, and time zone.
6. Begin installation and wait until it finishes.
7. When prompted, restart and remove the USB stick.
#### 4. Setting GRUB as the Boot Manager
1. Boot into Ubuntu and open a terminal.
2. Create a mount point for the Windows efi partition:
   ```bash
   sudo mkdir /mnt/efi-win
   ```
3. Identify your efi partition with `lsblk`. Usually it’s `/dev/nvme0n1p1`, but check if yours is different.
4. Mount the Windows efi partition:  
   ```bash
   sudo mount /dev/nvme0n1p1 /mnt/efi-win
   ```
5. Copy the GRUB efi binary:
   ```bash
   sudo cp /boot/efi/EFI/ubuntu/grubx64.efi /mnt/efi-win/EFI/ubuntu/
   ```
6. Verify that the file copied successfully.
7. Unmount the partition:  
   ```bash
   sudo umount /mnt/efi-win
   ```
#### 5. Updating Windows Boot Manager to Use GRUB
1. Reboot into Windows.
2. Open Command Prompt as Administrator.
3. Enter this command:
```powershell
bcdedit /set {bootmgr} \EFI\ubuntu\grubx64.efi
```
4. Close Command Prompt and restart your computer.
GRUB should now appear when you boot, letting you select Ubuntu or Windows.
#### 6. Troubleshooting and Additional Notes
- If the touchscreen doesn’t work in AtomMan under Linux, it’s due to missing driver support—there’s no fix for this at the moment.
- To check your NVIDIA GPU status in Ubuntu:
- Use `nvidia-smi` for basic information.
- Install `nvtop` (`sudo apt install nvtop`) for real-time GPU monitoring.
- In BIOS, ensure “Primary Display” is set to “Auto.” If you have issues, try switching to IGFX.
#### 7. Additional Tips
- If GRUB doesn’t show up by default, double-check your BIOS boot order.
- To set the default boot order, you can use tools like `boot-repair` in Ubuntu.
#### 8. Walkthrough video
{{<youtube H1JEMWnCbW8>}}