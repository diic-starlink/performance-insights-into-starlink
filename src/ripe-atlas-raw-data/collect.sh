#!/bin/bash

archive_url="https://data-store.ripe.net/datasets/atlas-daily-dumps"

download_day () {
	date=$1

	for i in $(seq 0 23); do
		time=$i
		if [ $i -lt 10 ]; then
			time="0$i"
		fi

		filename="ping-${date}T${time}00.bz2"
		url="$archive_url/$date/$filename"
		echo $url
		wget -O $filename $url
		pbzip2 -d $filename
	done
}

for j in $(seq 1 10); do
	day=$j
	if [ $j -lt 10 ]; then
		day="0$j"
	fi
	download_day "2024-05-$day"
done
