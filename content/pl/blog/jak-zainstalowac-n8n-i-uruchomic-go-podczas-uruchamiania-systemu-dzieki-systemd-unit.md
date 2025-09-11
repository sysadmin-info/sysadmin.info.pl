---
title: Jak zainstalować n8n i uruchomić go podczas uruchamiania systemu dzięki systemd unit
date: 2023-12-21T11:00:00+00:00
description: Jak zainstalować n8n i uruchomić go podczas uruchamiania systemu dzięki systemd unit
draft: false
hideToc: false
enableToc: true
enableTocContent: false
author: sysadmin
authorEmoji: 🐧
pinned: false
asciinema: true
series:
- Kubernetes
categories:
- Home Assistant
image: images/2023-thumbs/ulanzi08.webp
---

{{<youtube eCjRq_UUDXw>}}

1. Utwórz plik:

```bash
touch n8n-install.sh
```

2. Wprowadź poniższą zawartość do pliku:

```vim
#!/bin/bash -e

log() {
  echo "[$(date +'%Y-%m-%d %H:%M:%S')]: $*"
}

# Funkcja wyświetlająca spinner
display_spinner() {
  local pid=$1
  local spin='-\|/'

  log "Ładowanie..."

  while [ "$(ps a | awk '{print $1}' | grep $pid)" ]; do
    local temp=${spin#?}
    printf "\r [%c]" "$spin"
    local spin=$temp${spin%"$temp"}
    sleep 0.1
  done
  printf "\r"
}

row=2
col=2

countdown() {
        msg="Poczekaj 30 sekund na ${1} n8n..."
        clear
        tput cup $row $col
        echo -n "$msg"
        l=${#msg}
        l=$(( l+$col ))
        for i in {30..1}
        do
                tput cup $row $l
                echo -n "$i"
                sleep 1
        done
}

execute_command() {
  local cmd="$*"
  log "Wykonuję: $cmd"
  bash -c "$cmd" &
  display_spinner $!
}

error_exit() {
  log "$1"
  exit 1
}

check_root(){
  echo "Ten skrypt szybkiej instalacji wymaga uprawnień root."
  echo "Sprawdzanie..."
  if [[ $(/usr/bin/id -u) -ne 0 ]]; 
    then
      echo "Nie uruchomiono jako root"
      exit 0
  else
      echo "Instalacja kontynuowana"
  fi

  SUDO=
  if [ "$UID" != "0" ]; then
        if [ -e /usr/bin/sudo -o -e /bin/sudo ]; then
                SUDO=sudo
        else
                echo "*** Ten skrypt szybkiej instalacji wymaga uprawnień root."
                exit 0
        fi
  fi
}

update_upgrade(){
  echo 'aktualizacja systemu'
  sudo apt update
  sudo apt upgrade -y
}

check_packages(){
  if [[ $(command -v build-essential) ]]; then
    echo "build-essential już zainstalowany"
  else
    sudo apt install build-essential -y 
  fi

  if [[ $(command -v python3) ]]; then
    echo "python3 już zainstalowany"
  else
    sudo apt install python3 -y
  fi

  if [[ $(command -v nodejs) ]]; then
    echo "nodejs już zainstalowany"
  else
    sudo apt install nodejs -y
  fi

  if [[ $(command -v npm) ]]; then
    echo "npm już zainstalowany"
  else
    sudo apt install npm -y
  fi
}

install_n8n(){
  execute_command "echo 'instaluję n8n globalnie'"
  npm install n8n -g
}

adding_systemd_entry(){
  echo 'dodawanie wpisu systemd'
  sudo cat > /etc/systemd/system/n8n.service <<EOF
[Unit]
Description=n8n - Łatwa automatyzacja zadań między różnymi usługami.
After=network.target

[Service]
Type=simple
User=adrian
ExecStart=/usr/local/bin/n8n start --tunnel
Restart=on-failure

[Install]
WantedBy=multi-user.target
Alias=n8n.service
EOF
}

n8n

_service(){
  echo 'przeładowanie, włączanie przy uruchomieniu i startowanie n8n'
  sudo systemctl daemon-reload
  sudo systemctl enable n8n
  sudo systemctl start n8n
}

n8n_status(){
  systemctl status n8n.service
}

main(){
  check_root
  update_upgrade
  check_packages
  install_n8n
  adding_systemd_entry
  n8n_service
  countdown
  n8n_status
}

main

```

3. Zapisz i zamknij.

4. Nadaj uprawnienia:

```bash
chmod +x n8n-install.sh
```

4. Wykonaj poniższy skrypt, aby uruchomić:

```bash
./n8n-install.sh
```

5. Sprawdź adres IP maszyny, na której wykonano skrypt, używając poniższego polecenia:

```bash
hostname -I
```

6. Otwórz przeglądarkę i wklej adres IP oraz port

```
http://IP_ADDRESS:5678
```

7. Utwórz login i hasło dla n8n.

8. To wszystko. n8n działa. Miłego korzystania!