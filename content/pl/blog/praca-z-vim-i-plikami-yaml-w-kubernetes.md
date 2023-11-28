---
title: "Praca z vim i plikami YAML w Kubernetes"
date:  2023-09-01T17:00:00+00:00
description: "Praca z vim i plikami YAML w Kubernetes"
draft: false
hideToc: false
enableToc: true
enableTocContent: false
author: sysadmin
authorEmoji: 🐧
pinned: false
asciinema: true
tags:
- CM4
- CM4 board
- CM4 compute module
- Kubernetes
- k3s 
series:
- Kubernetes 
categories:
- Raspberry Pi
image: images/2023-thumbs/vim-yaml.webp
---
1. **Oto samouczek wideo; kontynuuj czytanie, aby znaleźć listę pisemnych instrukcji.**
{{<youtube 2QTqhDIlClE>}}
#### Ćwiczenia do wykonania:
1. Utwórz plik .vimrc w katalogu użytkownika.
2. Utwórz szablon YAML
3. Skopiuj szablon YAML i zmodyfikuj go
4. Zastosuj plik YAML
5. Wyświetl wszystkie pody
6. Wyświetl szczegółowe informacje o utworzonym podzie.
##### Utwórz plik .vimrc w katalogu użytkownika.
```bash
vim .vimrc
```
wklej poniższe
```vim
set tabstop=2 softtabstop=2 shiftwidth=2
set expandtab
set number ruler
set autoindent smartindent
syntax enable
filetype plugin indent on
```
#### Wyjaśnienie ustawień w pliku .vimrc
##### Vim Ustawienie Tabulacji na N Spacji
Chcesz używać klawisza Tab w Vim, aby zastępować 2, 4 lub 8 spacji za znak tabulacji (t)? Przyjrzyjmy się konfiguracjom, które muszą być dokonane, aby to osiągnąć:
1. `:set expandtab` - Gdy naciśniesz klawisz Tab, zostanie wstawiona odpowiednia liczba spacji zamiast znaku tabulacji (t). Jeśli jest wyłączona (:set noexpandtab), wciśnięcie klawisza Tab skutkuje wstawieniem znaków tabulacji zamiast spacji. Gdy jest włączona, ustawienia tabstop i softtabstop (omówione poniżej) określają szerokość (liczbę spacji do wstawienia zamiast znaku t) charakteru, a nie to, czy znak tabulacji (t) jest włączony czy wyłączony.
2. `:set shiftwidth=2` - Parametr shiftwidth określa, ile spacji zostanie automatycznie wstawionych dla wcięcia, więc gdy naciśniesz Enter, aby przejść do następnej linii, możesz zakładać, że będzie ona wcięta (z wstawioną jedną lub więcej tabulacjami). W tym przypadku będzie to wcięcie 2-spacyjne.
3. `:set tabstop=2` - Gdy expandtab jest włączone, ustawienie tabstop określa, jak szeroki będzie znak tabulacji (t) i ile znaków spacji zostanie wstawionych. Jeśli expandtab jest włączone, za każdym razem, gdy naciśniesz klawisz Tab, zostaną dodane 2 spacje.
4. `:set softtabstop=2` - Gdy naciśniesz klawisz Tab, ustawienie softtabstop wstawia podaną liczbę spacji. Podobne do tabstop pod wieloma względami, ale z kilkoma zastrzeżeniami:
#### Kontynuacja wyjaśnienia ustawień w pliku .vimrc
* Dla uderzeń klawisza Tab, jego wartość w pewnym sensie zastępuje wartość ustawienia tabstop.
* Gdy używasz klawisza Backspace, usuwa on również tę samą liczbę spacji. To jest potrzebne!
* Nawet jeśli ustawione jest set:noexpandtab, które ma wstawiać znak tabulacji (t) po naciśnięciu klawisza Tab, nadal będą wstawiane spacje.
* Gdy przyjmie wartość 0, jest wyłączone, a gdy ma wartość 0, używane jest shiftwidth jako zamiennik.
[Dokumentacja](https://vimdoc.sourceforge.net/htmldoc/options.html) podaje następujące informacje dla każdego ustawienia:
* `expandtab` - W trybie wstawiania, wstawia "Tab" poprzez użycie wymaganej liczby spacji.
* `shiftwidth` - Liczba spacji do wstawienia pomiędzy każdym krokiem (auto)wcięcia. Wykorzystywane do "cindent", ">", "<" itd.
* `tabstop` - Liczba spacji w pliku, jaką liczy się za "Tab".
* `softtabstop` - Ilość spacji, jaką liczy się za "Tab" podczas wykonywania czynności edycyjnych, takich jak dodawanie "Tab" lub używanie "BS".
Gdy edytor jest otwarty, wykonaj jedno z poniższych poleceń:
```vim
:set expandtab shiftwidth=2 tabstop=2 softtabstop=2
" Lub skrócona forma
:set et sw=2 ts=2 sts=2
```
Alternatywnie możesz dodać poniższe do swojego pliku .vimrc, który jest natychmiast ładowany przy uruchamianiu Vima:
```vim
set expandtab
set shiftwidth=2
set tabstop=2
set softtabstop=2
```
{{< notice success "Uwaga:" >}} 
Ilość spacji, które zostaną dodane po naciśnięciu klawisza tabulacji w powyższych przypadkach, zawsze wynosiła 2. Można to zmienić na 4, 8, lub dowolną inną liczbę, która Ci odpowiada.
{{< /notice >}}
{{< notice success "Bonus:" >}} 
Tabulatory, które umieścisz po ich skonfigurowaniu, będą pod wpływem wszystkich powyższych ustawień. Co z wcięciami z poprzednich tabulatorów? Chciałbyś również zastąpić je spacjami, prawda? Wystarczy wpisać polecenie :retab, które zastąpi wszystkie tabulatory liczbą spacji określoną w tabstop.
{{< /notice >}}
```vim
" Jeśli tabstop=4, zastąp wszystkie tabulatory 4 spacjami
:retab
" Ustaw tabstop=2, a następnie zastąp wszystkie tabulatory 2 spacjami
:retab 2
```
W istocie, `autoindent` nakazuje vim przenosić wcięcie z bieżącej linii do następnej. Dzieje się to poprzez naciśnięcie enter w trybie wstawiania lub O albo o w trybie normalnym.
Podczas modyfikowania kodu, `smartindent` reaguje na składnię i styl (szczególnie dla C). Musisz również włączyć autoindent, gdy jest on aktywny.
`:help autointent` Autoindent wspomina o dwóch innych opcjach: cindent i indentexpr, które nakazują vim ignorować wartość smartindent.
##### Utwórz szablon YAML
```bash
vim nginx-ubuntu.yaml 
```
Wklej do pliku:
```yaml
name: nginx-ubuntu
spec:
  containers:
    - name: nginx
      image: alpine-nginx
    - name: ubuntu
      image: ubuntu
      command: ["sleep", "inf"]
```
##### Skopiuj szablon YAML i zmodyfikuj go
```bash
cp nginx-ubuntu.yaml pod.yaml
```
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: my-pod
  namespace: default
spec:
  containers:
    - name: first-container
      image: nginx
    - name: second-container
      image: ubuntu
      command: ["sleep", "inf"]  
```
##### Zastosuj plik YAML
```bash
kubectl apply -f pod.yaml
```
##### Wyświetl wszystkie pody we wszystkich przestrzeniach nazw
```bash
kubectl get pods -A
```
##### Wyświetl szczegółowe informacje o utworzonym podzie.
```bash
kubectl describe pod my-pod
```