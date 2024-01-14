---
title: Kontroler ingress NGINX dla n8n - jak go stworzyć i wdrożyć w Kubernetes
date: 2024-01-12T21:00:00+00:00
description: Artykuł wyjaśnia, czym jest kontroler ingress NGINX w Kubernetes i jak go stworzyć dla n8n oraz wdrożyć. Opisuje również błąd 404 kontrolera ingress NGINX i pokazuje, jak rozwiązać ten problem.
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
- Raspberry Pi
image: images/2023-thumbs/nginx-ingress-controller-n8n.webp
---
**Oto krótki film; czytaj dalej, aby dowiedzieć się więcej.**
{{<youtube wMaaoJ9Oj8M>}}

  Zalecam obejrzenie całego filmu, aby zrozumieć, jak wszystko zostało zrobione i wdrożone.

W poprzednim samouczku [Jak wdrożyć n8n w Kubernetes - k3s](/en/blog/how-to-deploy-n8n-in-kubernetes-k3s/) wdrożyłem n8n.

Sprawdziłem, że wszystko działa poprawnie.

```bash
kubectl get all -n n8n
NAME                                  READY   STATUS    RESTARTS   AGE
pod/postgres-statefulset-0            1/1     Running   0          23h
pod/n8n-deployment-6dfd7cc794-pgccd   1/1     Running   0          23h

NAME                       TYPE        CLUSTER-IP     EXTERNAL-IP   PORT(S)        AGE
service/postgres-service   ClusterIP   None           <none>        5432/TCP       23h
service/n8n-service        NodePort    10.43.216.21   <none>        80:32469/TCP   23h

NAME                             READY   UP-TO-DATE   AVAILABLE   AGE
deployment.apps/n8n-deployment   1/1     1            1           23h

NAME                                        DESIRED   CURRENT   READY   AGE
replicaset.apps/n8n-deployment-6dfd7cc794   1         1         1       23h

NAME                                    READY   AGE
statefulset.apps/postgres-statefulset   1/1     23h
```

Jedna osoba (ona lub on) zostawiła komentarz pod moim krótkim filmem {{<youtube FW8TP5UDq4g>}}

> Wdrożyłem moje klastry k8s na metalu i wdrożyłem kontroler wejścia nginx w klastrze, problem, z którym się borykam, to taki, że domena, którą wskazałem na węzeł główny, gdy używam curl na domenie, otrzymuję pożądany wynik, ale w przeglądarce mam 404, czy masz jakiś pomysł, jak mogę rozwiązać ten problem?
>
> <cite>@user-ph7sl6mn5q  </cite>

Zdecydowałem wyjaśnić, jak działa kontroler wejścia NGINX, używając przykładu wdrożenia dla aplikacji n8n i co ważniejsze, odtworzyć błąd 404 kontrolera wejścia NGINX.

Przedstawiłem, że oprócz kontrolera wejścia potrzebna jest dodatkowa usługa. Możesz zapytać: - Dlaczego potrzebuję drugiej usługi, aby to działało?

Poniżej znajdują się wszystkie pliki potrzebne do kontrolera wejścia nginx dla n8n znajdujące się w katalogu ingress, które możesz pobrać za pomocą repozytorium: [n8n-k3s](https://github.com/sysadmin-info/n8n-k3s.git)

```bash
cat ingress-n8n-class.yml
```

```yaml
apiVersion: networking.k8s.io/v1
kind: IngressClass
metadata:
  name: nginx
spec:
  controller: k8s.io/ingress-nginx
```

```bash
cat n8n-ingress.yml
```

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: n8n-ingress
  namespace: n8n
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  ingressClassName: nginx
  rules:
  - http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: n8n-service
            port:
              number: 80
```

```bash
cat nginx-ingress-n8n-service.yml
```

```yaml
apiVersion: v1
kind: Service
metadata:
  name: nginx-ingress-n8n
  namespace: ingress-nginx
spec:
  type: NodePort
  ports:
    - port: 80
      nodePort: 5678
      protocol: TCP
      name: http
  selector:
    app.kubernetes.io/name: ingress-nginx
```

Ponieważ wdrażam n8n wraz z kontrolerem wejścia NGINX, zamieszanie wydaje się dotyczyć konieczności posiadania dwóch różnych usług: n8n-service i nginx-ingress-n8n-service. Wyjaśnijmy ich role i dlaczego obie są potrzebne.

1. **n8n-service (NodePort Service)**: Ta usługa jest odpowiedzialna za udostępnianie wewnętrznych aplikacji n8n w klastrze Kubernetes. Działa jako wewnętrzny balanser obciążenia, który kieruje ruch do twoich podów n8n. Jako usługa NodePort umożliwia również dostęp do aplikacji z zewnątrz klastra, ale przez określony port na węzłach.

2. **nginx-ingress-n8n-service (NodePort Service dla Ingress)**: Ta usługa jest powiązana z kontrolerem wejścia NGINX. Jej główna rola polega na udostępnieniu samego kontrolera wejścia na zewnątrz. To jest inne niż `n8n-service`, ponieważ nie udostępnia bezpośrednio twojej aplikacji. Zamiast tego udostępnia kontroler wejścia, który następnie zarządza i kieruje zewnętrzny ruch do twoich wewnętrznych usług (takich jak `n8n-service`) na podstawie zdefiniowanych przez ciebie zasad wejścia.

Oto dlaczego obie są potrzebne:

- `n8n-service` umożliwia dostęp do twojej aplikacji n8n wewnątrz klastra Kubernetes i potencjalnie bezpośrednio z zewnątrz klastra (choć to ostatnie zwykle nie jest zalecane w środowiskach produkcyjnych).
  
- `nginx-ingress-n8n-service` udostępnia kontroler wejścia NGINX. Gdy zewnętrzny ruch trafia na tę usługę, to kontroler wejścia decyduje, dokąd skierować ten ruch na podstawie twoich zasad wejścia (`n8n-ingress.yml`). W tym przypadku kieruje ruch do `n8n-service`.

Podsumowując, `n8n-service` służy do wewnętrznego balansowania obciążenia i potencjalnego bezpośredniego zewnętrznego dostępu do n8n, podczas gdy `nginx-ingress-n8n-service` służy do zewnętrznego dostępu do kontrolera wejścia, który następnie inteligentnie kieruje ruch do wewnętrznych usług, takich jak `n8n-service`. To oddzielenie umożliwia bardziej wyrafinowane zasady routingu, lepsze bezpieczeństwo i łatwiejsze zarządzanie ruchem wejściowym w środowisku Kubernetes.

{{< notice success "Ważna informacja" >}}
Kontroler NGINX ingress dla konkretnej usługi musi zostać utworzony w tej samej przestrzeni nazw, w której usługa jest uruchomiona.
{{< /notice >}}

Ale to nie wszystko, co musisz wiedzieć, aby zrozumieć, jak to działa.

Poniższy wpis pokazuje regułę iptables:

```bash
sudo iptables -t nat -L PREROUTING --line-numbers -n -v
Chain PREROUTING (polityka ACCEPT 326 pakietów, 43216 bajtów)
num   pkts bytes target     prot opt in     out     source               destination         
1    17677 2468K KUBE-SERVICES  all  --  *      *       0.0.0.0/0            0.0.0.0/0            /* portale usług kubernetes */
```

Musisz również zmodyfikować usługę k3s, aby zmienić zakres portów w sposób, który przedstawiłem. Bez tego nie zadziała, ponieważ używam NodePort 5678, a domyślnie Kubernetes używa zakresu portów od 30000 do 32767.

Więc edytuj plik k3s.service

```bash
sudo vim /etc/systemd/system/k3s.service
```

i dodaj wpis w sposób, jaki możesz zobaczyć na filmie.

```vim
'--service-node-port-range=5678-32767'
```

Następnie przeładuj daemona i zrestartuj usługę k3s.

```bash
sudo systemctl daemon-reload
sudo systemctl restart k3s.service
```

{{< notice success "Ważna informacja" >}}
Restart usługi Kubernetes ( w tym przypadku K3S) nie powoduje zmiany NodePort dla usług, których deployment nastąpił wcześniej i działałya, ponieważ raz przypisany losowo przez Kubernetes NodePort ulega zmianie dopiero w momencie usunięcia usługi.
{{< /notice >}}

Dodatkowo IngressClass został dodany przez ingress-class.yml i jest również określony w pliku n8n-ingresss.yml.

Przeanalizujmy komponenty i ich role w zarządzaniu ruchem sieciowym dla mojego ustawienia Kubernetes, koncentrując się na iptables, kontrolerze Ingress i zakresie portów usługi node.

1. **Wpis Iptables dla usług Kubernetes**: Wpis iptables, który pokazałeś (`KUBE-SERVICES`), jest częścią mechanizmu, którego Kubernetes używa do zarządzania ruchem sieciowym do usług. Ta reguła jest generowana automatycznie przez Kubernetes i odpowiada za kierowanie ruchem do odpowiednich usług w klastrze na podstawie ich typu i konfiguracji.

2. **Zakres portów usługi Node (`--service-node-port-range=5678-32767`)**: Ta modyfikacja konfiguracji `k3s.service` rozszerza zakres portów, które mogą być używane dla usług NodePort. Domyślnie usługi NodePort w Kubernetes są przydzielane portom z zakresu 30000-32767. Twoja modyfikacja pozwala usługom używać portów zaczynając od 5678, co obejmuje konkretny port, który skonfigurowałeś dla twojej usługi Ingress NGINX (`nginx-ingress-n8n-service`).

3. **Ingress i IngressClass**: Twoje pliki `n8n-ingress.yml` i `ingress-n8n-class.yml` definiują zasób Ingress i IngressClass, odpowiednio. IngressClass (`nginx`) informuje Kubernetes, który kontroler Ingress powinien obsługiwać zasoby Ingress. Ingress (`n8n-ingress`) definiuje, jak ruch powinien być kierowany do twoich usług (takich jak `n8n-service`).

4. **Przepływ ruchu**:
    - Zewnętrzny ruch dociera do węzła Kubernetes na konkretnym porcie (zdefiniowanym przez twoją usługę NodePort, `nginx-ingress-n8n-service`).
    - Reguła iptables (`KUBE-SERVICES`) kieruje ten ruch do kontrolera Ingress NGINX, na podstawie mapowania NodePort.
    - Kontroler Ingress NGINX, na podstawie reguł Ingress (`n8n-ingress`), kieruje ruch do odpowiedniej usługi wewnątrz klastra (w twoim przypadku `n8n-service`).

Reguła iptables jest rzeczywiście wystarczająca, aby upewnić się, że ruch docierający do węzła Kubernetes na określonym NodePort jest prawidłowo przekierowywany do kontrolera Ingress NGINX. Stamtąd kontroler Ingress przejmuje kontrolę nad kier

owaniem ruchu zgodnie z zdefiniowanymi przez ciebie regułami Ingress. Ta konfiguracja zapewnia elastyczny i wydajny sposób zarządzania trasowaniem ruchu w twoim środowisku Kubernetes.

##### Jak to wdrożyć?

```bash
git clone https://github.com/sysadmin-info/n8n-k3s.git
cd n8n-k3s/ingress
kubectl apply -f ingress-n8n-class.yml -f n8n-ingress.yml -f nginx-ingress-n8n-service.yml
```

##### Jak używać domeny zamiast adresu IP?

{{< notice success "Uwaga!" >}}
W wideo pokazuję Adguard Home, który działa jako DNS na porcie 53 oraz NGINX Proxy Manager, aby pokazać, w jaki sposób można przypisać konkretną domenę do konkretnego adresu IP (Adguard Home) oraz NodePort (NGINX Proxy Manage).
{{< /notice >}}

Aby używać nazwy domeny zamiast adresu IP do dostępu do twoich usług Kubernetes (jak n8n w twoim przypadku), zazwyczaj wykonujesz następujące kroki:

1. **Zarejestruj nazwę domeny**: Jeśli jeszcze jej nie masz, musisz zarejestrować nazwę domeny u rejestratora domen. Wybierz nazwę, która odpowiada twojej usłudze lub organizacji.

2. **Skonfiguruj rekordy DNS**: Po uzyskaniu nazwy domeny musisz skonfigurować jej ustawienia DNS. Obejmuje to tworzenie rekordów DNS, które wskazują na adres IP twojego klastra Kubernetes (lub konkretnego węzła, jeśli używasz usług NodePort).

   - **Rekord A**: Utwórz rekord A w konfiguracji DNS, który wskazuje twoją domenę (np. `example.com`) na zewnętrzny adres IP twojego klastra Kubernetes. Jeśli twój klaster znajduje się na platformie chmurowej, byłby to zewnętrzny adres IP twojego Load Balancera. Jeśli jest to instalacja lokalna lub na miejscu, byłby to zewnętrzny adres IP twojego węzła.
   - **Rekord CNAME (opcjonalnie)**: Jeśli chcesz użyć subdomeny (takiej jak `n8n.example.com`), możesz utworzyć rekord CNAME, który wskazuje na twoją główną domenę.

3. **Skonfiguruj Ingress, aby używać domeny**: W twoim zasobie Kubernetes Ingress (`n8n-ingress.yml`) musisz określić pole host, aby używać nazwy twojej domeny. Oto przykładowa modyfikacja:

   ```yaml
   apiVersion: networking.k8s.io/v1
   kind: Ingress
   metadata:
     name: n8n-ingress
     namespace: n8n
     annotations:
       nginx.ingress.kubernetes.io/rewrite-target: /
   spec:
     ingressClassName: nginx
     rules:
     - host: n8n.example.com
       http:
         paths:
         - path: /
           pathType: Prefix
           backend:
             service:
               name: n8n-service
               port:
                 number: 80
   ```

W tym przykładzie zastąp `n8n.example.com` swoją rzeczywistą nazwą domeny.

4. **Przeładuj lub zastosuj ponownie Ingress**: Po zmodyfikowaniu zasobu Ingress zastosuj zmiany za pomocą `kubectl apply -f n8n-ingress.yml`. Kontroler Ingress NGINX powinien załapać te zmiany i zacząć kierować ruch na podstawie nazwy domeny.

5. **Przetestuj nazwę domeny**: Po ustawieniu wszystkiego możesz przetestować dostęp do twojej usługi za pomocą nazwy domeny (np. `http://n8n.example.com`). Powinno to kierować do twojej usługi n8n tak samo jak wcześniej metoda IP i port.

Pamiętaj, że zmiany w DNS mogą zająć trochę czasu, aby rozprzestrzenić się w internecie, więc może to nie działać od razu. Upewnij się również, że konfiguracja sieciowa twojego klastra Kubernetes pozwala na przychodzący ruch na odpowiednich portach (takich jak 80 lub 443 dla HTTP/HTTPS).

##### Jak odtworzyłem błąd 404 dla kontrolera Ingress NGINX?

Translation:

Zrobiłem celowo błąd w pliku n8n-ingress.yml, aby pokazać, że ma on problem z syntaxem w sekcji rules. To może być powodem, dla którego Twój Ingress nie kieruje ruchu poprawnie do twojej usługi n8n. Klucze host i http powinny być częścią tej samej reguły, ale obecnie są oddzielone, co sprawia, że konfiguracja Ingress jest nieprawidłowa.

Poniżej znajduje się plik yaml z błędem:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: n8n-ingress
  namespace: n8n
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  ingressClassName: nginx
  rules:
  - host: n8n.example.com
    - http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: n8n-service
            port:
              number: 80

```

A tu masz poprawny plik. Różnica jest prosta. Usunąłem symbol - dla http:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: n8n-ingress
  namespace: n8n
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  ingressClassName: nginx
  rules:
  - host: n8n.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: n8n-service
            port:
              number: 80
```

W tej poprawionej wersji klucz `host` jest teraz poprawnie powiązany z kluczem `http` w ramach tej samej reguły. Ta zmiana powinna pozwolić Ingress na poprawne kierowanie ruchu dla `n8n.sysadmin.homes` do usługi `n8n-service` na porcie 80.

Po dokonaniu tej zmiany zastosuj konfigurację używając:

```bash
kubectl apply -f n8n-ingress.yml
```

Następnie przetestuj dostęp do `n8n.sysadmin.homes` ponownie. To powinno rozwiązać problem z komunikatem 404 Not Found, zakładając, że wszystkie inne elementy twojej konfiguracji (jak DNS i konfiguracja usługi) są poprawne.