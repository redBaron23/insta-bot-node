#!/bin/bash
#
#Run ASF

if [ ! -d /tmp/server/logs/ ]
then
	mkdir -p /tmp/server/logs/;
	touch /tmp/server/logs/asf.txt /tmp/server/logs/helper.txt /tmp/server/logs/hellcase.txt /tmp/server/logs/insta-bot.txt
fi

node /home/pi/projects/insta-bot-node/app.js >> /tmp/server/logs/insta-bot.txt 
