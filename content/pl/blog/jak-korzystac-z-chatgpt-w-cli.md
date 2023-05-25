---
title: "Jak korzystać z ChatGPT za pomocą interfejsu API w wierszu poleceń systemu Linux"
date:  2023-05-25T12:25:00+00:00
description: "Jak korzystać z ChatGPT za pomocą interfejsu API w wierszu poleceń systemu Linux (CLI)"
draft: false
hideToc: false
enableToc: true
enableTocContent: false
author: admin
authorEmoji: 🐧
pinned: false
asciinema: true
tags:
- chatGPT
- openAI
- LLM
series:
- chatGPT
categories:
- openAI
image: images/2023-thumbs/chatgpt.webp
---
##### Ćwiczenia do wykonania:
1. Uzyskaj klucz API
2. Upewnij się, że masz zainstalowanego klienta Python dla OpenA
3. Stwórz skrypt Python 3
4. Stwórz skrypt Bash
5. Nadaj skryptom uprawnienia do uruchomienia i uruchom skrypt Bash

<script async id="asciicast-587324" src="https://asciinema.org/a/587324.js"></script>

##### Aby móc uruchomić ChatGPT w wierszu poleceń, możesz postępować zgodnie z poniższymi krokami. Pamiętaj, że musisz mieć uprawnienia sudo lub dostęp root.


1. **Uzyskaj klucz API:**

Aby korzystać z interfejsu API OpenAI, potrzebny jest klucz API. Jeśli go nie posiadasz, możesz [zarejestrować się na stronie OpenAI](https://beta.openai.com/account/api-keys) i utworzyć nowy klucz API.

Uwaga: cena API wynosi 0,002 USD za 1 tys. tokenów. Masz jednak darmowy kredyt do wykorzystania.

![OpenAI klucz API](/images/2023/API-keys-create.webp "OpenAI klucz API")
<figcaption>OpenAI klucz API</figcaption>

Pamiętaj, że OpenAI nie wyświetli twojego tajnego klucza API ponownie po jego wygenerowaniu, więc skopiuj swój klucz API i zapisz go. Utworzę zmienną środowiskową o nazwie OPENAI_API_KEY, która będzie zawierać mój klucz API na potrzeby tego samouczka.

2. **Możesz używać API OpenAI z Pythonem w skrypcie Bash. Aby to zrobić, najpierw upewnij się, że masz zainstalowanego klienta Python dla OpenAI:**

{{< tabs SLES Debian RedHat >}}
  {{< tab >}}
  ### SLES
  ```bash
  sudo zypper install python3-pip
  pip3 --version
  pip3 install openai
  ```  
  {{< /tab >}}
  {{< tab >}}
  ### Debian
  ```bash
  sudo apt install python3-pip
  pip3 --version
  pip3 install openai
  ```
  {{< /tab >}}
  {{< tab >}}
  ### Red Hat
  ```bash
  sudo dnf install python3-pip
  pip3 --version
  pip3 install openai
  ```
  {{< /tab >}}
{{< /tabs >}}


3. **Stwórz skrypt Python 3:**

```
vim chatgpt.py
```

Wklej poniższą zawartość do pliku:

```python
#!/usr/bin/python3
import os
import openai

# Zamień `'twój-klucz-api'` na swój rzeczywisty klucz API OpenAI. 
openai.api_key = os.getenv("OPENAI_API_KEY")

message = {"role":"user", "content": input("To jest początek czatu z AI. [Aby wyjść, wpisz \"wyjdz\".]\nTy: ")};

conversation = [{"role": "system", "content": "DIRECTIVE_FOR_gpt-3.5-turbo"}]

while(message["content"]!="wyjdz"):
    conversation.append(message)
    completion = openai.ChatCompletion.create(model="gpt-3.5-turbo", messages=conversation)
    message["content"] = input(f"Asystent: {completion.choices[0].message.content} \nTy: ")
    print()
    conversation.append(completion.choices[0].message)
```

4. **Teraz możesz użyć skryptu Python w skrypcie Bash, który wywołuje API OpenAI. Oto przykładowy skrypt Bash, który uruchamia skrypt Python:**

```
vim chatgpt.sh
```

Wklej poniższą zawartość do pliku:

```bash
#!/bin/bash
# Change to the directory containing the Python script
cd $HOME

# Run the Python script
python3 chatgpt.py
```

5. **Nadaj uprawnienia**

```bash
chmod +x chatgpt.sh
chmod +x chatgpt.py
```

Skrypt bezpośrednio uruchamia ten kod Python.

Pamiętaj, że ten skrypt musi być uruchamiany w środowisku, w którym dostępne są Python i pakiet `openai`.

Dodaj do pliku .bashrc lub .zshrc poniższą zmienną:

```
export OPENAI_API_KEY=twoj-klucz-API
```

A następnie załaduj ją za pomocą poniższej komendy:

```
source .bashrc
lub
source .zshrc
```

Pamiętaj, aby zabezpieczyć swoje klucze API i rozważyć użycie zmiennych środowiskowych lub innych bezpiecznych metod do ich przechowywania, ponieważ ich twarde kodowanie w skryptach może prowadzić do podatności na zagrożenia bezpieczeństwa.

6. **Teraz możesz użyć skryptu, aby uzyskać odpowiedzi z ChatGPT poprzez uruchomienie:**

```bash
./chatgpt.sh
```

To wszystko! Masz teraz podstawowy samouczek na temat korzystania z ChatGPT z API w Linux CLI. Zachęcam do dostosowania skryptu lub poznania bardziej zaawansowanych funkcji API OpenAI.