#!/bin/bash


while getopts m: opts
do
    case "${opts}" in
        m) mode=${OPTARG};;
    esac
done

m=${mode:-dev};

pids=`ps -ef|grep $m/baoxuan-api | grep -v grep | awk '{print $2}'`

for id in $pids
do
  echo "kill -9 pid:" $id
  kill -9 $id
done

if [ "$m"  == 'prod' ]; then
    nohup npm run prod > logs/nohup.out 2>&1 &
else
    nohup npm run start > logs/nohup.out 2>&1 &
fi