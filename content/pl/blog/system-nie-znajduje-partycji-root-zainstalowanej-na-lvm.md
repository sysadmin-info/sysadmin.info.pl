---
title: System nie znajduje partycji root zainstalowanej na LVM
date: 2020-09-20T10:37:17+00:00
description: System nie znajduje partycji root zainstalowanej na LVM
draft: false
hideToc: false
enableToc: true
enableTocContent: false
author: sysadmin
authorEmoji: 🐧
pinned: false
series:
- 
categories:
- Linux
image: images/2020-thumbs/linux-cli.webp
---

Artykuł pokazuje, jak rozwiązać problem brakującej partycji wymiany (swap) oraz błędu plymouthd sigrtmin, gdy partycja wymiany nie jest utworzona jako LVM, ale jako standardowa partycja wymiany.

Komunikat uruchomieniowy (Boot-Message):

```bash
dracut-initqueue[279] Ostrzeżenie: Nie można uruchomić
dracut-initqueue[279] Ostrzeżenie: /dev/mapper/rhel_…-root nie istnieje
sigrtmin+20 od PID 297 plymouthd
```

Ostatni błąd wynika z nieudanego montowania partycji wymiany.

Rozwiązanie jest naprawdę proste. Sprawdź, czy standardowa partycja wymiany jest włączona, używając polecenia:

```bash
swapon -s
```

Sprawdź, gdzie jest zamontowana partycja wymiany w pliku /etc/fstab:

```bash
cat /etc/fstab | grep -i swap
```

Jeśli pojawi się coś podobnego do tego:

```bash
/dev/sdc    swap swap defaults 0 0
```

Wyłącz partycję wymiany:

```bash
swapoff /dev/sdc
```

Następnie rozszerz grupę logiczną (VG), na przykład rhel, utwórz logiczną partycję wymiany (LV) w grupie logicznej rhel i utwórz wymianę na tej logicznej partycji:

```bash
vgextend rhel /dev/sdc
lvcreate rhel -n swap -L 1024M
mkswap /dev/rhel/swap
```

Dodaj poniższy wpis do pliku /etc/fstab zamiast /dev/sdc:

```bash
/dev/rhel/swap swap swap defaults 0 0
```

Włącz partycję wymiany:

```bash
swapon -v /dev/rhel/swap
```

Przykład: Zmień to:

```vim
GRUB_CMDLINE_LINUX="rd.lvm.lv=rootVG/root rd.lvm.lv=oldnameVG/swapLV rhgb quiet"
```

Na to:

```vim
GRUB_CMDLINE_LINUX="rd.lvm.lv=rootVG/root rd.lvm.lv=rhel/swap rhgb quiet"
```

Po zakończeniu tych kroków, konieczne będzie ponowne wygenerowanie konfiguracji Gruba:

```bash
grub2-mkconfig -o /boot/grub2/grub.cfg
```

Możesz sprawdzić, czy zadziałało, przeglądając plik /boot/grub2/grub.cfg i upewniając się, że partycja wymiany jest teraz skonfigurowana prawidłowo w VG/LV:

```bash
cat /boot/grub2/grub.cfg
```

Powinno zawierać to:

```vim
GRUB_CMDLINE_LINUX="rd.lvm.lv=rootVG/root rd.lvm.lv=rhel/swap rhgb quiet"
```