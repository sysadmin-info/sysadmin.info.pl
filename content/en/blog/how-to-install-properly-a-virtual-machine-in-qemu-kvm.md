---
title: How to install properly a virtual machine in QEMU KVM
date: 2022-10-25T11:39:32+00:00
description: How to install properly a virtual machine in QEMU KVM
draft: false
hideToc: false
enableToc: true
enableTocContent: false
author: sysadmin
authorEmoji: 🐧
pinned: false
series:
- Qemu KVM
categories:
- Linux
- Qemu KVM
cover:
    image: images/2022-thumbs/vm-in-qemu-kvm.webp
---
{{< youtube ZYafBlfFfcQ >}}
<figcaption>In this video I explained how to properly install the QEMU KVM virtual machine. I provided two methods of installation and described in details how to make it work.</figcaption>

preallocation=metadata – allocates the space required by the metadata but doesn’t allocate any space for the data. This is the quickest to provision but the slowest for guest writes. Read the article: <a href="https://www.youtube.com/redirect?event=video_description&redir_token=QUFFLUhqbDJJQVBNajRia2VFUVdsRTJVX1hCbU5TaUtBd3xBQ3Jtc0tsMjEtLUFxXzVLRFlnNU9XX2l3dFNHcnUzN3JkdVBpQnE0bWVOWTcyUEpMcElsZTBUODVtVzZJNEowWmdfdmptVE83NWt1TDJLV2ZwNERTRzVLal93SEVtcjQtY21EQ1V4YkdIMkE3WUNBaU1lVm8tdw&q=https%3A%2F%2Fwww.jamescoyle.net%2Fhow-to%2F1810-qcow2-disk-images-and-performance&v=ZYafBlfFfcQ" target="_blank" rel="noreferrer noopener">https://www.jamescoyle.net/how-to/181&#8230;</a>  
  
model=virtio virtualport_type=openvswitch explained here: <a href="https://www.youtube.com/redirect?event=video_description&redir_token=QUFFLUhqbmF6Y2VQOVlXQWFHVTNrMGxNNDAwcXFCN3lBQXxBQ3Jtc0ttR2RyQ3BlTE50Tm5BbDViVEhBQVdLM2IzVUJieHR0VzJYMElDNEo2Q1UydVgxUlVEeEkwdUxKTWdEOE9JR0huc2I0WG9ITXgxeU9BMjg3eldYYW00SXhPSm44SDZSbmpSQ28yVUg1V2QwdW5wMS1SQQ&q=https%3A%2F%2Fwww.mankier.com%2F1%2Fvirt-install%23Networking_Options&v=ZYafBlfFfcQ" target="_blank" rel="noreferrer noopener">https://www.mankier.com/1/virt-instal&#8230;</a>