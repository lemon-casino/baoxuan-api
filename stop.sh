#!/bin/bash

while getopts m: opts
do
    case "${opts}" in
        m) mode=${OPTARG};;
    esac
done

m=${mode:-dev};
p=7999
if [ "$m" == 'prod' ]; then
    p=9999
fi

pId=$(lsof -i:"$p" | awk '{print $2}' | tail -n 1)
if [[ -n $pId ]]; then
    kill -9 "${pId}"
fi
