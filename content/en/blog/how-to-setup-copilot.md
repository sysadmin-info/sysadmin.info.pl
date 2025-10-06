---
title: How to setup copilot in vim
date: 2023-06-01T16:00:00+00:00
description: How to setup copilot in vim
draft: false
hideToc: false
enableToc: true
enableTocContent: false
author: sysadmin
authorEmoji: 🐧
pinned: false
asciinema: true
series:
- copilot
categories:
- copilot
cover:
    image: images/2023-thumbs/copilot-setup.webp
---
In this video  I explained how to install proper version of nodejs and how to enable copilot in vim. See the project: https://github.com/github/copilot.vim

{{<youtube FPpDinGXcAo>}}

### Tutorial

{{< notice success "Managing your GitHub Copilot subscription for your personal account" >}}
Before you can start using GitHub Copilot for Individuals, you will need to set up a free trial or subscription. See the URL below:
[Managing your GitHub Copilot subscription for your personal account](https://docs.github.com/en/billing/managing-billing-for-github-copilot/managing-your-github-copilot-subscription-for-your-personal-account "Managing your GitHub Copilot subscription for your personal account")
{{< /notice >}}


#### Install git if do not have it installed

{{< tabs SLES Debian RedHat >}}
  {{< tab >}}
  ##### SLES | openSUSE Leap 15.4
  ```bash
  sudo zypper install git
  ```  
  {{< /tab >}}
  {{< tab >}}
  ##### Debian
  ```bash
  sudo apt install git
  ```
  {{< /tab >}}
  {{< tab >}}
  ##### Red Hat
  ```bash
  sudo dnf install git
  ```
  {{< /tab >}}
{{< /tabs >}}

#### Check installed vim version

```
vim -version
```

#### Install vim (9.0.0185 or newer) from source

```bash
cd $HOME
git clone https://github.com/vim/vim.git
cd $HOME/vim/src
NB_CORES=$(grep -c '^processor' /proc/cpuinfo)
export MAKEFLAGS="-j$((NB_CORES+1)) -l${NB_CORES}"
make
make test
sudo make install
```

#### Persistent settings
To get these settings persistent, just add in your .bashrc or .zshrc

```vim
NB_CORES=$(grep -c '^processor' /proc/cpuinfo)
export MAKEFLAGS="-j$((NB_CORES+1)) -l${NB_CORES}"
```

And then type:

```bash
source ~/.zshrc # or .bashrc
```

#### Issues

If there will be issues during the make or make test install missing libraries. make or make test will inform you what is exactly missing, so if any package is missing, tryto look for how to install it.

{{< tabs SLES Debian RedHat >}}
  {{< tab >}}
  ##### SLES | openSUSE Leap 15.4
  ```bash
  sudo zypper install libncurses5 ncurses make gcc g++ libtool libtool-bin
  ```  
  {{< /tab >}}
  {{< tab >}}
  ##### Debian
  ```bash
  sudo apt install libncurses-dev libtool libtool-bin make build-essential g++
  ```
  {{< /tab >}}
  {{< tab >}}
  ##### Red Hat
  ```bash
  sudo dnf install ncurses-devel make gcc g++ libtool 
  ```
  {{< /tab >}}
{{< /tabs >}}

#### Install nodejs using nvm 

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

#### Install copilot

```bash
git clone https://github.com/github/copilot.vim.git \ 
  $HOME/.vim/pack/github/start/copilot.vim
```

#### Create a .vimrc file in your $HOME directory and put the below into it and save

```bash
cd $HOME
vim .vimrc
```

```vim
" Add numbers to each line on the left-hand side.
 set number

" Disable compatibility with vi which can cause unexpected issues.
set nocompatible

" Enable type file detection. Vim will be able to try to detect the type of file in use.
filetype on

" The below line enables copilot
" Enable plugins and load plugin for the detected file type.
filetype plugin on

" Load an indent file for the detected file type.
filetype indent on

" Turn syntax highlighting on.
syntax on
```

#### Open vim

```bash
vim
```

Type

```vim
:Copilot setup
```

Copy the one-time code, open the provided URL http://github.com/login/device and type the one-time code. Pay 10 USD and use copilot.