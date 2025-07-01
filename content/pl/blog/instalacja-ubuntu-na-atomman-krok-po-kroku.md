---
title: Instalacja Ubuntu na AtomMan - krok po kroku
date: 2025-07-01T10:00:00+00:00
description: Instalacja Ubuntu na AtomMan - krok po kroku
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
image: images/2025-thumbs/atomman.webp
---
#### 1. Przygotowanie instalatora USB
1. Pobierz [Balena Etcher](https://www.balena.io/etcher/). Jest dostępny dla Windows, Linux i macOS. Zainstaluj go na swoim systemie.
2. Pobierz obraz ISO Ubuntu Desktop:
   - Przejdź na stronę Ubuntu i wybierz „Ubuntu 24.04 LTS Desktop.”
   - Kliknij „Download.” Możesz użyć nowszej wersji, jeśli chcesz, ale dla stabilności trzymaj się 24.04, chyba że potrzebujesz czegoś innego.
3. Podłącz pendrive (USB stick) do komputera.
4. Uruchom Balena Etcher:
   - Kliknij „Flash from file” i wybierz pobrany plik ISO Ubuntu.
   - Wybierz pendrive jako cel.
   - Kliknij „Flash” i poczekaj na zakończenie procesu.
   - Jeśli pojawią się błędy, odłącz i ponownie podłącz pendrive, po czym spróbuj ponownie.
#### 2. Uruchomienie i instalacja Ubuntu
1. Włóż pendrive do AtomMan.
2. Włącz komputer i naciśnij **F2** lub **Delete**, aby wejść do menu BIOS/Uefi.
3. W menu rozruchu ustaw pendrive jako pierwsze urządzenie rozruchowe. Zapisz i wyjdź.
4. System powinien uruchomić instalator Ubuntu. Wybierz „Try or Install Ubuntu.”
#### 3. Instalacja Ubuntu
1. Kliknij „Install Ubuntu.”
2. Wybierz język i preferencje.
3. Możesz pominąć łączenie z internetem na tym etapie.
4. Gdy dojdziesz do wyboru typu instalacji, wybierz jedną z opcji:
   - **Install Ubuntu alongside Windows Boot Manager** - konfiguracja dual-boot.
   - **Erase disk and install Ubuntu** - usuwa wszystkie dane z dysku.
   - **Manual/‘Something else’** - dla zaawansowanych użytkowników chcących ręcznie podzielić dysk (ustaw efi, swap i root według potrzeb).
5. Wykonaj kroki z nazwą użytkownika, hasłem i strefą czasową.
6. Rozpocznij instalację i poczekaj na jej zakończenie.
7. Gdy pojawi się komunikat, uruchom ponownie system i usuń pendrive.
#### 4. Ustawienie GRUB jako menedżera rozruchu
1. Uruchom Ubuntu i otwórz terminal.
2. Utwórz punkt montowania dla partycji efi Windows:
   ```bash
   sudo mkdir /mnt/efi-win
    ```
3. Zidentyfikuj swoją partycję efi za pomocą `lsblk`. Zwykle to `/dev/nvme0n1p1`, ale sprawdź, czy u ciebie jest inaczej.
4. Zamontuj partycję efi Windows:
   ```bash
   sudo mount /dev/nvme0n1p1 /mnt/efi-win
   ```
5. Skopiuj plik binarny GRUB efi:
   ```bash
   sudo cp /boot/efi/EFI/ubuntu/grubx64.efi /mnt/efi-win/EFI/ubuntu/
   ```
6. Sprawdź, czy plik został poprawnie skopiowany.
7. Odmontuj partycję:
   ```bash
   sudo umount /mnt/efi-win
   ```
#### 5. Aktualizacja Windows Boot Manager do użycia GRUB
1. Uruchom ponownie system do Windows.
2. Otwórz Wiersz polecenia jako Administrator.
3. Wprowadź polecenie:
```powershell
bcdedit /set {bootmgr} \EFI\ubuntu\grubx64.efi
```
4. Zamknij Wiersz polecenia i uruchom komputer ponownie.
GRUB powinien teraz pojawiać się przy rozruchu, umożliwiając wybór Ubuntu lub Windows.
#### 6. Rozwiązywanie problemów i dodatkowe uwagi
* Jeśli ekran dotykowy nie działa w AtomMan pod Linuksem, to z powodu braku wsparcia sterownika - obecnie brak rozwiązania.
* Aby sprawdzić stan GPU NVIDIA w Ubuntu:
* Użyj `nvidia-smi` dla podstawowych informacji.
* Zainstaluj `nvtop` (`sudo apt install nvtop`) do monitorowania GPU w czasie rzeczywistym.
* W BIOS ustaw „Primary Display” na „Auto.” Jeśli pojawią się problemy, spróbuj zmienić na IGFX.
#### 7. Dodatkowe wskazówki
* Jeśli GRUB nie pojawia się domyślnie, sprawdź kolejność rozruchu w BIOS.
* Aby ustawić domyślną kolejność rozruchu, możesz użyć narzędzi takich jak `boot-repair` w Ubuntu.
#### 8. Film z instrukcją krok po kroku
{{<youtube H1JEMWnCbW8>}}