---
title: "How to install Docker"
date:  2023-05-24T08:40:00+00:00
description: "How to install Docker"
draft: false
hideToc: false
enableToc: true
enableTocContent: false
author: admin
authorEmoji: 🐧
pinned: false
asciinema: true
tags:
- Docker
series:
- Docker
categories:
- Docker
image: images/2023-thumbs/docker.webp
---
#### Exercises to complete:
1. Update your system
2. Add the Docker repository and refresh repositories if needed
3. Install Docker
4. Enable and start Docker service
5. Verify the Docker installation

<script async id="asciicast-587002" src="https://asciinema.org/a/587002.js"></script>

#### To install Docker, you can follow these steps. Please note that you need to have sudo privileges or root access.


{{< tabs SLES Debian RedHat >}}
  {{< tab >}}
  ### SLES 15 / openSUSE Leap 15.4
  1. **Update your system:**

Firstly, make sure your package list and the system is up to date.

```bash
sudo zypper refresh
sudo zypper update
```

2. **Install Docker:**

Now, you can install Docker with the following command.

```bash
sudo zypper install docker
```

3. **Enable and start Docker service:**

After the installation, you need to start Docker and enable it to start at boot.

```bash
sudo systemctl enable docker
sudo systemctl start docker
```

4. **Verify the Docker installation:**

To ensure Docker has been installed correctly, you can check the installed version of Docker.

```bash
docker --version
```

This should display the version of Docker installed on your system. You can also run a simple Docker command such as:

```bash
sudo docker run hello-world
```

This command downloads a test image and runs it in a container. If it runs without errors, it's a good indication that Docker is functioning correctly.

Remember, in order to run Docker commands as a non-root user without prepending sudo, you need to add the user to the docker group:

```bash
sudo usermod -aG docker $USER
```

Then you need to log out and log back in so that your group membership is refreshed.

That's it! You have successfully installed Docker.
  {{< /tab >}}
  {{< tab >}}
  ### Debian 11
  To install Docker on Debian 11, follow these steps:

**Step 1: Update the System**

First, update your existing list of packages:

```bash
sudo apt update
```

Next, upgrade the packages:

```bash
sudo apt upgrade -y
```

**Step 2: Install the Necessary Software**

Docker requires some packages that are not installed by default, including packages to allow apt to use a repository over HTTPS:

```bash
sudo apt install apt-transport-https ca-certificates curl gnupg lsb-release -y
```

**Step 3: Add Docker's GPG Key**

Next, add Docker's official GPG key:

```bash
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/debian/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg
```

**Step 4: Set up the Docker Stable Repository**

Then, use the following command to set up the stable Docker repository:

```bash
echo \
  "deb [arch="$(dpkg --print-architecture)" signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian \
  "$(. /etc/os-release && echo "$VERSION_CODENAME")" stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
```

**Step 5: Install Docker CE (Community Edition)**

Update the `apt` package list and install the latest version of Docker CE:

```bash
sudo apt update
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin -y
```

**Step 6: Verify the Docker Installation**

Finally, verify that Docker CE is installed correctly by running the hello-world Docker image:

```bash
sudo docker run hello-world
```

This command downloads a test image and runs it in a container. If it runs successfully, it prints an informational message and exits.

You should now have Docker installed on your Debian 11 system. If you want to run Docker commands as a non-root user without prepending `sudo`, you'll need to add your user to the `docker` group:

```bash
sudo usermod -aG docker ${USER}
```

You may need to log out and back in for these changes to take effect.
  {{< /tab >}}
  {{< tab >}}
  ### Red Hat 9
  Red Hat Enterprise Linux 9 has removed Docker from its official repositories. However, you can still install Docker using other methods. 

One such alternative is using Podman, which is a daemonless container engine for developing, managing, and running OCI Containers on your Linux System. Containers can either be run as root or in rootless mode.

If you want to install Docker, here is a way to do it:

1. Setup the repository:

```bash
sudo dnf config-manager --add-repo=https://download.docker.com/linux/centos/docker-ce.repo
```

2. Install Docker Engine:

```bash
sudo dnf install docker-ce docker-ce-cli containerd.io
```

3. Start Docker:

```bash
sudo systemctl start docker
```

4. Verify that Docker Engine is installed correctly by running the hello-world image:

```bash
sudo docker run hello-world
```

5. Enable Docker to start on boot:

```bash
sudo systemctl enable docker
```

Please note that the installation process might slightly differ based on the exact version of your RHEL system and the system setup. If any of the steps does not work as expected, refer to the Docker official documentation.

Remember that using Docker requires root privileges so make sure to use sudo with Docker commands, or give Docker these privileges correctly. 

If you want to use a more RHEL native solution, consider using Podman and Buildah. These tools provide similar functionalities to Docker but are designed with a different architecture that doesn't require a daemon and run as a normal user.

Also, be aware that running the Docker daemon on your system can have security implications; you should understand these before deciding to use Docker.
  {{< /tab >}}
{{< /tabs >}}
