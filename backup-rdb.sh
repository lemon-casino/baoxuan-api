#! /bin/bash


abs_path='/usr/local/redis/redis-6.2.6/data'
files=`ls -l $abs_path | wc -l`
echo $files
if [ $files -ge 7 ]; then
  earliest_file_name=`ls -l $abs_path|sort| head -n 1|awk '{print $9}'`
  rm  "$abs_path/$earliest_file_name"
fi

cp "$abs_path/dump.rdb" "$abs_path/$(date +%F).$(date +%T).dump.rdb"