---
title: "How to connect device through module with relays to Raspberry Pi or CM4 IO board"
date:  2023-08-01T09:00:00+00:00
description: "How to connect device through module with relays to Raspberry Pi or CM4 IO board"
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
- water cooling
series:
- Water cooling for CM4 / Raspberry Pi  
categories:
- Raspberry Pi
image: images/2023-thumbs/module-with-relays-raspberry-pi-cm4.webp
---
I will walk you through the installation and configuration steps in this article so you can use the same module with relays to connect it with Raspberry Pi or CM4 IO board.

1. **Here is a video tutorial; continue reading for a list of written instructions.**

{{<youtube lrXF7fZe85E>}}


##### What You Need For This Tutorial
* Raspberry Pi 4 or CM4 IO board with Compute Module 4
* Micro SD Card or eMMC or NVMe/SSD drive
* Power Supply aprropriate for a Raspberry Pi or CM4 IO board.
* Module with two relays
* Power supply for the module with relays
* 3 female to female jumper cables
* 2 female to male jumper cables
* 7 male to male jumper cables


##### Exercises to complete:
1. Connect wiring according to schema between module with relays and Raspberry Pi / CM4 IO board.
2. Use a Python script to test the module with relays.
3. Check does the module work as expected.

##### Introduction

I decided to connect the pump and fan using a module with two relays in order to control them simply because controlling the 5V pump is not possible because it is not a PWM device, and controlling solely the Noctua 5V fan with PWM didn't make much sense to me. When the temperature rises above a predetermined threshold (for instance, 50 degrees Celsius), I wanted both devices to turn on, and I wanted them to turn off when the temperature falls below the predetermined threshold.

##### Module with 2 relays - technical details.

[Relay 2 channel module with optoisolation - 10A/250VAC contacts - 5V coil](https://botland.store/relays/2170-relay-2-channel-module-with-optoisolation--5904422359126.html)

##### GPIO pinout

[Raspberry Pi GPIO pinout](https://pinout.xyz/)

[CM4 IO board GPIO pinout](https://pi4j.com/1.3/pins/rpi-cm4.html)

##### Wiring

![module with relays - wiring](/images/2023/wiring.webp "module with relays - wiring")
<figcaption>module with relays - wiring</figcaption>

{{< notice success "Important information" >}}
Due to the fact that my GND will be the low state (logical zero) from the GPIO PINs, I do not connect the GND from the Raspberry Pi / CM4 IO.
{{< /notice >}}

{{< notice success "jumper hat" >}}
The power supply of the circuit is created by the jumper (jumper) shorting JD-VCC along with VCC and the power supply of the optoisoloator with the power supply of the relay coil. We can isolate the Raspberry Pi / CM4 circuit from the relay control circuit if we remove this jumper.The red wire from the external 5V power source should then be connected to JD-VCC in addition to being used. The jumper should be left in place if I do not wish to utilize an external power source for the relays because doing so increases the load on the Raspberry Pi / CM4's 5V line and causes (small) interference while switching the relays.
{{< /notice >}}

##### Python script that tests the module

```python
# getting the main GPIO library
import RPi.GPIO as GPIO
# getting the time library
import time

# setting a current mode
GPIO.setmode(GPIO.BCM)
#removing the warings 
GPIO.setwarnings(False)
#creating a list (array) with the number of GPIO's that we use 
pins = [12,13] 

#setting the mode for all pins so all will be switched on 
GPIO.setup(pins, GPIO.OUT)

#for loop where pin = 12 next 13
for pin in pins :
        #setting the GPIO to HIGH or 1 or true
        GPIO.output(pin,  GPIO.HIGH)
        print("GPIO HIGH")
        #wait 5 second
        time.sleep(5)
        print("sleep")
        #setting the GPIO to LOW or 0 or false
        GPIO.output(pin,  GPIO.LOW)
        print("GPIO LOW")
        #wait 5 second
        time.sleep(5)
        print("sleep")

        #Checking if the current relay is running and printing it 
        if not GPIO.input(pin) : 
                print("Pin "+str(pin)+" is working")


#same but the difference is that  we have 
#for loop where pin = 12 next 13
# backwards
print("Backwards")
for pin in reversed(pins) :
        GPIO.output(pin,  GPIO.HIGH)
        print("GPIO HIGH")
        time.sleep(5)
        print("sleep")

        GPIO.output(pin,  GPIO.LOW)
        print("GPIO LOW")
        time.sleep(5)
        print("sleep")


#cleaning all GPIO's 
GPIO.cleanup()
print("GPIO cleanup")
print("Shutdown All relays")
```

##### Run the script

```bash
python3 relay.py
```

##### Issues described during the prototyping procedure.

The issue of undervoltage and throttling emerges when we add more devices—in my instance, fans—to the Raspberry Pi / CM4's GPIO pins when I have two devices connected through a module with relays. The HDMI-connected display becomes dark (image is lost). Ensure that it is powered properly and that this behavior is usual.

##### The final version of the script

```python
#!/usr/bin/python3
import os
import RPi.GPIO as GPIO
import time
import datetime
import sys

# */1 * * * * cd /home/adrian/PWM/relay && sudo python3 module.py
# A crontab will run every minute and check the temperature. 
# If the temperature is above 31 degrees of Celsius the script will start 
# the fan and the pump until the temperature goes down to 29 degrees of Celsius. 
# When it does, the script will end, shutting down the fan and pump as well.
# If the script executes again while a previous script is running, the latter will exit
# ... meaning the Pi/CM4 is in hell, and will never get bellow ACTION_END value!

# Identify which pins control the relays
FAN_PIN = 12 # GPIO for fan
PUMP_PIN = 13 # GPIO for pump
PINS = [FAN_PIN, PUMP_PIN] # Array to handle both fan and pump

# Temperature checks
ACTION_START = 31
ACTION_END = 29

# Get what action. If you manually turning on/off the fan and pump
action = sys.argv.pop()


def GPIOsetup():
	GPIO.setwarnings(False) 
	GPIO.setmode(GPIO.BCM)
	for pin in PINS:
		GPIO.setup(pin, GPIO.OUT)
	
def fansON():
	GPIOsetup()
	for pin in PINS:
		GPIO.output(pin, GPIO.LOW)	#fan and pump on
	return()

def fansOFF():
	GPIOsetup()
	for pin in PINS:
		GPIO.output(pin, GPIO.HIGH) #fan and pump off
	return()
	
def get_temp_from_system():
	res = os.popen('vcgencmd measure_temp').readline()
	return(res.replace("temp=","").replace("'C\n",""))

def check_fans():
	GPIOsetup()
	return all(GPIO.input(pin) for pin in PINS)

def run():
	current_date = datetime.datetime.now()
	temp = get_temp_from_system()
	if float(temp) >= ACTION_START:
		print(temp+' @ '+str(current_date))
		if check_fans():
			print('Fan and pump are off... Starting them.')
			fansON()
		else:
			time.sleep(5)
			print('Fan and pump are on')
	elif float(temp) <= ACTION_END:
		print(temp+' @ '+str(current_date))
		if not check_fans():
			print('Fan and pump are on... Shuting them down.')
			fansOFF()
			GPIO.cleanup()
			return 1 
		else:
			time.sleep(5) 
			print('Fan and pump are off')
	else:
			pass 
			
			
if action == "on" :
   print('Turning fan and pump on')
   fansON()
elif action == "off" :
   print('Turning fan and pump off')
   fansOFF()

# first check if script is already running
if not check_fans():
	print('Fan and pump are on, script must be running from another instance...')
else:
	temp = get_temp_from_system()
	if float(temp) < ACTION_START:
		print('Pi/CM4 is operating under normal temperatures.')
	else:
		try:
			while(True):
				tmp = run()
				if tmp == 1: 
					break
		except KeyboardInterrupt:
			fansOFF()
			GPIO.cleanup()
		finally:
			fansOFF()
			GPIO.cleanup()
```


##### Making The Script Run Automatically On Startup

Now that the display is running, we would like it to do so automatically when the computer starts up because it will cease as soon as we close the terminal window. We're going to use crontab to accomplish this.

Enter the next command to launch crontab:

```bash
crontab –e
```

If you're opening crontab for the first time, you'll be asked to choose an editor; choose 1 and press enter.

To execute the script, include the following line at the end of the file:

```bash
@reboot sudo python3 /home/username/relay.py &
```

Remember to add the "&" at the end to instruct the Pi to continue booting up and to continue running the script.

When you finish, save the crontab file, and then reboot your Pi/CM4 to check if everything is operating as it should.

If you followed the steps exactly, you should now have a functional module with relays that launches whenever your Raspberry Pi / CM4 boots up. If you haven't already, you can go ahead and put it into your case immediately.

Please share your thoughts on this tutorial in the space provided below. Please share your thoughts and recommendations with me.
