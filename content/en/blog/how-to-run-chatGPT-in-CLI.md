---
title: "How to use ChatGPT with the API in the Linux command line interface:"
date:  2023-05-25T12:25:00+00:00
description: "How to use ChatGPT with the API in the Linux command line interface (CLI):"
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
##### Exercises to complete:
1. Obtain an API key
2. Make sure that you have the OpenAI Python client installed
3. Create a python 3 script
4. Create a Bash script
5. Make scripts executable and run the Bash script

<script async id="asciicast-587324" src="https://asciinema.org/a/587324.js"></script>

##### To be able to run chatGPT in command line, you can follow these steps. Please note that you need to have sudo privileges or root access.

1. **Obtain an API key**

To use the OpenAI API, you need an API key. If you don't have one, you can [sign up on the OpenAI website](https://beta.openai.com/account/api-keys) and create a new API key.

Note: The API is priced at $0.002 per 1K tokens. You have free credit to use, though.

![OpenAI API key](/images/2023/API-keys-create.webp "OpenAI API key")
<figcaption>OpenAI API key</figcaption>

Remember that OpenAI won’t display your secret API key again after you generate it, so copy your API key and save it. I’ll create an environment variable named OPENAI_API_KEY that will contain my API key for this tutorial.

2. **You can use the OpenAI API with Python in a Bash script. To do this, first make sure that you have the OpenAI Python client installed:**

Now, you can install Docker with the following command.

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

3. **Create a python 3 script:**

```
vim chatgpt.py
```

put he below content into the file:

```python
#!/usr/bin/python3
import os
import openai

# Replace `'your-api-key'` with your actual OpenAI API key.
openai.api_key = os.getenv("OPENAI_API_KEY")

message = {"role":"user", "content": input("This is the beginning of your chat with AI. [To exit, type \"exit\".]\nYou: ")};

conversation = [{"role": "system", "content": "DIRECTIVE_FOR_gpt-3.5-turbo"}]

while(message["content"]!="exit"):
    conversation.append(message)
    completion = openai.ChatCompletion.create(model="gpt-3.5-turbo", messages=conversation)
    message["content"] = input(f"Assistant: {completion.choices[0].message.content} \nYou: ")
    print()
    conversation.append(completion.choices[0].message)
```

4. **Now, you can use a Python script in a Bash script that invokes the OpenAI API. Here's an example Bash script that runs a Python script:**

```bash
#!/bin/bash
# Change to the directory containing the Python script
cd $HOME

# Run the Python script
python3 chatgpt.py
```

5. **Set permissions:**

```bash
chmod +x chatgpt.sh
chmod +x chatgpt.py
```

The script runs this Python code directly.

Note that this script must be run in an environment where Python and the `openai` package are available.

Add to .bashrc or .zshrc below variable:

```
export OPENAI_API_KEY=your-API-key
```

And then load it with the following command:

```
source .bashrc
or
source .zshrc
```

Remember to secure your API keys and consider environment variables or other secure methods to store them, as hard coding them in scripts can lead to security vulnerabilities.

6. **Now you can use the script to get responses from ChatGPT by running:**

```bash
./chatgpt.sh
```

That's it! You now have a basic tutorial on how to use ChatGPT with the API in the Linux CLI. Feel free to customize the script or explore more advanced features of the OpenAI API.