---
title: Working with vim and YAML files in Kubernetes
date: 2023-09-01T17:00:00+00:00
description: Working with vim and YAML files in Kubernetes
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
cover:
    image: images/2023-thumbs/vim-yaml.webp
---
1. **Here is a video tutorial; continue reading for a list of written instructions.**
{{<youtube 2QTqhDIlClE>}}
#### Exercises to complete:
1. Create .vimrc file in user's directory.
2. Create a YAML template
3. Copy YAML template and modify it
4. Apply YAML file
5. Display all pods
6. Display detailed information about the created pod.

##### Create .vimrc file in user's directory.
```bash
vim .vimrc
```
paste the below
```vim
set tabstop=2 softtabstop=2 shiftwidth=2
set expandtab
set number ruler
set autoindent smartindent
syntax enable
filetype plugin indent on
```
#### Explanation of settings in .vimrc

##### Vim Set Tab to N Spaces

Want to use the tab key in Vim to substitute 2, 4, or 8 spaces for the tab character (t)? Let's examine the configurations that must be made in order to accomplish this:

1. `:set expandtab` 1. - When the tab key is pressed, inserts the proper number of spaces instead of the tab character (t). If it is disabled (:set noexpandtab), tab characters rather than spaces are entered whenever the tab key is pressed. When enabled, the tabstop and softtabstop settings (discussed below) determine the width (number of spaces to insert in place of the t) character rather than whether the tab (t) character is enabled or disabled.

2. `:set shiftwidth=2` - The shiftwidth parameter determines how many spaces are automatically inserted for indentation, so when you click enter to move to the next line, you can assume that it to be indented (with one or more tabs inserted). In this instance, there will be a 2-space indentation.

3. `:set tabstop=2` When expandtab is turned on, the tabstop setting determines how wide the tab character (t) will be and how many space characters will be inserted. If expandtab is enabled, then anytime you press the tab key, 2 spaces will be added.

4. `:set softtabstop=2` - When pressing the tab key, the softtabstop setting inserts the provided number of spaces. Similar to tabstop in several ways, but with a few caveats:

* For tab key strokes, its value sort of supersedes that of tabstop.
* When you use the backspace key, it also deletes the same number of spaces. This is a need!
* Even if set:noexpandtab is set, which is supposed to insert a tab (t) when the tab key is pressed, it will still insert spaces.
* When given a value of 0, it is disabled, and when given a value of 0, shiftwidth is used as a fallback.

The [documentation](https://vimdoc.sourceforge.net/htmldoc/options.html) states the following for each setting:

* `expandtab` - In Insert mode, insert a "Tab" by using the required number of spaces.
* `shiftwidth` - The number of spaces to insert between each (auto)indentation step. utilized for "cindent," ">," "," etc.
* `tabstop` - The number of file spaces that a "Tab" counts as.
* `softtabstop` - The amount of spaces that a "Tab" counts as when editing activities like adding a "Tab" or using "BS" are being carried out.

In conclusion, when the editor is open, either run the following set commands:

```vim
:set expandtab shiftwidth=2 tabstop=2 softtabstop=2
" Or the short form
:set et sw=2 ts=2 sts=2
```

Alternatively, you can add the following to your.vimrc file, which is immediately sourced when Vim loads:

```vim
set expandtab
set shiftwidth=2
set tabstop=2
set softtabstop=2
```

{{< notice success "Note:" >}} 
The amount of spaces that will be added when the tab key is pressed in the instances above has always been 2. That can be changed to 4, 8, or anything else you like.
{{< /notice >}}

{{< notice success "Bonus:" >}} 
The tabs you put after they have been configured will be impacted by all of the settings above. What about the indentations from the previous tabs? You would also want to substitute spaces for them, right? Simply type the:retab command to accomplish this, which will replace all tabs with tabstop number of spaces.
{{< /notice >}}

```vim
" If tabstop=4 then replace all tabs with 4 spaces
:retab
" Set tabstop=2 and then replace all tabs with 2 spaces
:retab 2
```

In essence, `autoindent` instructs vim to carry over the indentation from the current line to the following one. This is done by pressing enter in insert mode or O or o in normal mode.

When modifying code, `smartindent` responds to the syntax and style (particularly for C). You must also turn on autoindent while it is turned on.

`:help autointent` Two other options are mentioned by autoindent: cindent and indentexpr, both of which instruct vim to disregard the value of smartindent.

##### Create a YAML template
```bash
vim nginx-ubuntu.yaml 
```
Paste into the file:

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

##### Copy YAML template and modify it
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

##### Apply YAML file
```bash
kubectl apply -f pod.yaml
```
##### Display all pods in all namespaces
```bash
kubectl get pods -A
```
##### Display detailed information about the created pod.
```bash
kubectl describe pod my-pod
```