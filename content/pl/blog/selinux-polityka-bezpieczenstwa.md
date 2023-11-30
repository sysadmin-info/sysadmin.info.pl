---
title: SELinux polityka bezpieczeństwa
date: 2019-09-22T17:26:09+00:00
description: SELinux polityka bezpieczeństwa
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
- IT Security
- Linux
image: images/2019-thumbs/selinux.webp
---
Nie jestem eskpertem od SELinux, ale gdy przeczytałem wiele poradników (ang. tutorial) na ten temat i widziałem dziesiątki porad, które wszystkie jednym głosem oznajmiały: wyłącz SELinux, ponieważ sprawia problemy, uznałem, że czas podważyć tę tezę i udowodnić, że SELinux może być prosty w obsłudze. 

W sytuacji, gdy jakaś usługa nie uruchamia się, z powodu problemów z uprawnieniami, tworząc plik ID procesu (PID), należy zaktualizować politykę SELinux w zakresie egzekwowania zasad w stosunku do aplikacji, która domyślnie nie jest uwzględniona w politykach tzw. SELinux’s Type Enforcement (TE). 


Znany fakt na temat SELinux: „Docelowa polityka SELinuksa z Fedory jest obecnie dystrybuowana jako 1271 plików zawierających 118815 linii konfiguracyjnych. Zalecaną praktyką nie jest zmiana tych plików, ale raczej dodanie większej ilości konfiguracji w celu zmiany zachowania SELinux.”

Po pierwsze, potrzebne jest narzędzie audit2why, aby wyjaśnić, co zostało zablokowane i dlaczego.

Aby sprawdzić w CentOS, Red Hat, czy Fedora, jaki pakiet dostarcza w/w narzędzie, wykonaj polecenie:

```bash 
sudo yum -q provides audit2why
```

```vim
policycoreutils-python-2.5-17.1.el7.x86_64 : SELinux policy core python
                                           : utilities
Repo        : base
Matched from:
Filename    : /usr/bin/audit2allow
```

Należy zainstalować pakiet policycoreutils-python (i zależności):

```bash
### CentOS 7 
sudo yum install policycoreutils-python

### CentOS 8
sudo yum install policycoreutils-python-utils
```

Następnie przeprowadzić audyt przy pomocy narzędzia audit2why oraz dziennika audytu:

```bash
sudo audit2why -i /var/log/audit/audit.log
```

Wyświetlony zostanie odpowiedni komunikat, który zawiera przykładowo takie informacje:

```vim 
scontext=system_u:system_r:nagios_t:s0
tcontext=system_u:system_r:nagios_t:s0
...
Was caused by:
  Missing type enforcement (TE) allow rule.
  You can use audit2allow to generate a loadable module to allow this access.
```

Mała podpowiedź odnośnie pierwszych dwóch linii:

```vim
  * scontext = Source Context (kontekst źródłowy)
  * tcontext = Target Context (kontekst docelowy)
  * \_u:\_r:_t:s# = user:role:type:security level (użytkownik, rola, typ, poziom zabezpieczeń)
```

Kontekst źródłowy i docelowy są identyczne, więc wydaje mi się, że polecenie powinno być dopuszczone do działania. Ale spróbujmy audit2allow i zobaczmy, co nam powie:

```bash
sudo audit2allow -i /var/log/audit/audit.log
```

```vim
#============= nagios_t ==============
allow nagios_t initrc_var_run_t:file { lock open read write };
allow nagios_t self:capability chown;
```

Nie jest dla mnie jasne, na co zezwala pierwsza zasada: czy pozwala na dostęp typu nagios (nagios\_t) do wszystkich plików initrc\_var\_run\_t? Jeśli tak, to prawdopodobnie poziom uprawnień jest zbyt duży. Jak ostrzega strona man:

> Care must be exercised while acting on the output of this utility to  
> ensure that the operations being permitted do not pose a security  
> threat. Often it is better to define new domains and/or types, or make  
> other structural changes to narrowly allow an optimal set of operations  
> to succeed, as opposed to blindly implementing the sometimes broad  
> changes recommended by this utility.

W wolnym tłumaczeniu: należy zachować ostrożność i wiedzieć jak zachowuje się program oraz czy dozwolone operacje wyjścia nie stanowią zagrożenia. Często lepiej jest zdefiniować nowe domeny i/lub typy, lub stworzyć inne zmiany strukturalne, które w sposób ograniczony zezwolą na optymalny zestaw operacji, który pozwoli na działanie aplikacji, niż na ślepo implementować zbyt duży poziom uprawnień rekomendowany przez narzędzie audit2allow.

Dość nieprzyjazne zachowanie. Chociaż jeśli alternatywą jest całkowite wyłączenie SELinux, zbyt duży poziom uprawnień zaimplementowany w polityce SELinux nie jest najgorszą rzeczą na świecie.

Więc audit2allow zapewnił kilka zasad. Co teraz? Na szczęście strony audit2why i audit2allow man zawierają szczegóły, jak włączyć zasady do polityki SELinux. Po pierwsze, należy wygenerować nowy typ polityki:

```bash
sudo audit2allow -i /var/log/audit/audit.log --module local > local.te
```

Obejmuje to pewne dodatkowe informacje oprócz domyślnego wyjścia:

```bash 
cat local.te
```

```vim
module local 1.0;

require {
        type nagios_t;
        type initrc_var_run_t;
        class capability chown;
        class file { lock open read write };
}

#============= nagios_t ==============
allow nagios_t initrc_var_run_t:file { lock open read write };
allow nagios_t self:capability chown;
```

Następnie strona man mówi o:


> SELinux provides a policy devel environment under
> /usr/share/selinux/devel including all of the shipped
> interface files.
> You can create a te file and compile it by executing

```bash
sudo make -f /usr/share/selinux/devel/Makefile local.pp
```

Jednak mój system nie miał katalogu /usr/share/selinux/devel:

```bash
ls /usr/share/selinux/
packages  targeted
```

Musiałem zainstalować pakiet policycoreutils-devel (i zależności):

```bash
sudo yum install policycoreutils-devel
```

Teraz kompilacja pliku z polisami do pliku binarnego:

```bash 
sudo make -f /usr/share/selinux/devel/Makefile local.pp
Compiling targeted local module
/usr/bin/checkmodule:  loading policy configuration from tmp/local.tmp
/usr/bin/checkmodule:  policy configuration loaded
/usr/bin/checkmodule:  writing binary representation (version 17) to tmp/local.mod
Creating targeted local.pp policy package
rm tmp/local.mod.fc tmp/local.mod
```

Następnie instalacja polityki z pliku pp, który został wcześniej wygenerowany, przy użyciu komendy make -f. Korzystam z narzędzia semodule.

```bash
sudo semodule -i local.pp
```

Czy to rozwiązało problem?


```bash
sudo systemctl start icinga
sudo systemctl status icinga
● icinga.service - LSB: start and stop Icinga monitoring daemon
   Loaded: loaded (/etc/rc.d/init.d/icinga; bad; vendor preset: disabled)
   Active: active (running) since Tue 2017-11-14 22:35:23 EST; 6s ago
     Docs: man:systemd-sysv-generator(8)
  Process: 2661 ExecStop=/etc/rc.d/init.d/icinga stop (code=exited, status=0/SUCCESS)
  Process: 3838 ExecStart=/etc/rc.d/init.d/icinga start (code=exited, status=0/SUCCESS)
   CGroup: /system.slice/icinga.service
           └─3850 /usr/bin/icinga -d /etc/icinga/icinga.cfg

Nov 14 22:35:23 localhost.localdomain systemd[1]: Starting LSB: start and sto...
Nov 14 22:35:23 localhost.localdomain icinga[3838]: Running configuration che...
Nov 14 22:35:23 localhost.localdomain icinga[3838]: Icinga with PID  not runn...
Nov 14 22:35:23 localhost.localdomain icinga[3838]: Starting icinga: Starting...
Nov 14 22:35:23 localhost.localdomain systemd[1]: Started LSB: start and stop...
Nov 14 22:35:23 localhost.localdomain icinga[3850]: Finished daemonizing... (...
Nov 14 22:35:23 localhost.localdomain icinga[3850]: Event loop started...
Hint: Some lines were ellipsized, use -l to show in full.
```

Zadziałało! Kwestie pozwoleń zostały rozwiązane bez uciekania się do wyłączenia SELinux.

Każdy problem tego typu w SELinux można rozwiązać poprzez analogię.

Na sam koniec warto zainstalować narzędzie sealert:

```bash
sudo yum install setroubleshoot setools
```

I sprawdzić stan alertów przy pomocy polecenia:

```bash
sudo sealert -a /var/log/audit/audit.log
```

Źródło: [SELinux audit2why audit2allow policy files](https://osric.com/chris/accidental-developer/2017/11/selinux-audit2why-audit2allow-policy-files/)