#!/bin/bash

# 检查是否提供了模式参数
if [ -z "$1" ]; then
  echo "Usage: $0 [prod|start]"
  exit 1
fi

# 获取运行模式（prod 或 start）
MODE=$1

# 指定端口号
PORT=9999

# 查找占用指定端口的进程ID
PIDS=$(lsof -t -i :$PORT)

# 检查是否找到任何进程
if [ -z "$PIDS" ]; then
  echo "No process is using port $PORT."
else
  echo "Terminating processes using port $PORT: $PIDS"
  # 终止进程
  kill -9 $PIDS
  echo "Processes terminated."
fi

# 确保 logs 目录存在
mkdir -p logs

# 根据模式选择启动命令
if [ "$MODE" = "prod" ]; then
    echo "Starting in production mode..."
    nohup npm run prod > logs/nohup.out 2>&1 &
else
    echo "Starting in development mode..."
    nohup npm run start > logs/nohup.out 2>&1 &
fi

echo "Process started with nohup. Check logs/nohup.out for output."
