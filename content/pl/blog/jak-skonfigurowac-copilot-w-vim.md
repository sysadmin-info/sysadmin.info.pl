---
title: "Jak skonfigurować copilot w vim"
date: 2023-06-01T16:00:00+00:00
description: "Jak skonfigurować copilot w vim"
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
W tym filmie wyjaśniłem, jak zainstalować odpowiednią wersję nodejs i jak włączyć copilot w vim. Zobacz projekt: https://github.com/github/copilot.vim

{{<youtube FPpDinGXcAo>}}

### Poradnik

{{< notice success "Zarządzanie subskrypcją GitHub Copilot dla Twojego osobistego konta" >}}
Zanim zaczniesz korzystać z GitHub Copilot dla Osób Fizycznych, musisz skonfigurować bezpłatną wersję próbną lub subskrypcję. Zobacz poniższy URL:
[Zarządzanie subskrypcją GitHub Copilot dla Twojego osobistego konta](https://docs.github.com/en/billing/managing-billing-for-github-copilot/managing-your-github-copilot-subscription-for-your-personal-account "Zarządzanie subskrypcją GitHub Copilot dla Twojego osobistego konta")
{{< /notice >}}


#### Zainstaluj git, jeśli go nie masz

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

#### Sprawdź zainstalowaną wersję vima

```bash
vim -version
```

#### Zainstaluj vim (9.0.0185 lub nowszy) ze źródła

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

#### Ustawienia stałe
Aby te ustawienia były trwałe, dodaj je do swojego .bashrc lub .zshrc

```vim
NB_CORES=$(grep -c '^processor' /proc/cpuinfo)
export MAKEFLAGS="-j$((NB_CORES+1)) -l${NB_CORES}"
```

A następnie wpisz:

```bash
source ~/.zshrc # lub .bashrc
```

#### Problemy

Jeśli pojawią się problemy podczas make lub make test, zainstaluj brakujące biblioteki. make lub make test poinformują Cię, co dokładnie brakuje, więc jeśli czegoś brakuje, spróbuj dowiedzieć się, jak to zainstalować.

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

#### Zainstaluj nodejs za pomocą nvm 

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

#### Zainstaluj copilot

```bash
git clone https://github.com/github/copilot.vim.git \ 
  $HOME/.vim/pack/github/start/copilot.vim
```

#### Utwórz plik .vimrc w swoim katalogu $HOME i wpisz do niego poniższe i zapisz

```bash
cd $HOME
vim .vimrc
```

```vim
" Dodaj numery do każdej linii po lewej stronie.
 set number

" Wyłącz kompatybilność z vi, która może powodować nieoczekiwane problemy.
set nocompatible

" Włącz wykrywanie typu pliku. Vim będzie mógł próbować wykryć typ używanego pliku.
filetype on

" Poniższa linia włącza copilot
" Włącz wtyczki i załaduj wtyczkę dla wykrytego typu pliku.
filetype plugin on

" Załaduj plik wcięć dla wykrytego typu pliku.
filetype indent on

" Włącz podświetlanie składni.
syntax on
```

#### Otwórz vim

```bash
vim
```

Wpisz

```vim
:Copilot setup
```

Skopiuj kod jednorazowy, otwórz podany URL http://github.com/login/device i wpisz kod jednorazowy. Zapłać 10 USD i używaj copilot.