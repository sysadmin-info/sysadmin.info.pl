---
title: "How to setup copilot in vim"
date:  2023-06-01T16:00:00+00:00
description: "How to setup copilot in vim"
draft: false
hideToc: false
enableToc: true
enableTocContent: false
author: sysadmin
authorEmoji: 🐧
pinned: false
asciinema: true
tags:
- copilot
- github
series:
- copilot
categories:
- copilot
image: images/2023-thumbs/copilot-setup.webp
---
In this video  I explained how to install proper version of nodejs and how to enable copilot in vim. See the project: https://github.com/github/copilot.vim

{{<youtube FPpDinGXcAo>}}

#### Tutorial

Check installed vim version

```
vim -version
```

1. Install vim (9.0.0185 or newer) from source

```
cd $HOME
git clone https://github.com/vim/vim.git
cd /$HOME/vim/src
NB_CORES=$(grep -c '^processor' /proc/cpuinfo)
export MAKEFLAGS="-j$((NB_CORES+1)) -l${NB_CORES}"
make
make test
sudo make install
```

##### Persistent settings
To get these settings persistent, just add in your .bashrc or .zshrc

```
NB_CORES=$(grep -c '^processor' /proc/cpuinfo)
export MAKEFLAGS="-j$((NB_CORES+1)) -l${NB_CORES}"
```

And then type:

```
source ~/.zshrc # or .bashrc
```

If there will be issues during the make or make test install missing libraries. make or make test will inform you what is exactly missing, so if any package is missing, tryto look for how to install it.

{{< tabs SLES Debian RedHat >}}
  {{< tab >}}
  ### SLES | openSUSE Leap 15.4
  ```bash
  sudo zypper install libncurses5 ncurses make gcc g++ libtool libtool-bin
  ```  
  {{< /tab >}}
  {{< tab >}}
  ### Debian
  ```bash
  sudo apt install libncurses-dev libtool libtool-bin make build-essential g++
  ```
  {{< /tab >}}
  {{< tab >}}
  ### Red Hat
  ```bash
  sudo dnf install ncurses-devel make gcc g++ libtool libtool-bin
  ```
  {{< /tab >}}
{{< /tabs >}}

2. Install nodejs using nvm 

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/master/install.sh | bash
nvm --version
nvm list-remote
nvm install v20.2.0
node -v
nvm alias default 20.2.0
nvm use default
node -v
```

3. Install copilot

```
git clone https://github.com/github/copilot.vim.git `
  $HOME/vimfiles/pack/github/start/copilot.vim
```

4. Open vim

```
vim
```

Type

```
:Copilot setup
```

4. Copy the one-time code, open the provided URL http://github.com/login/device and type the one-time code. Pay 10 USD and use copilot. 
