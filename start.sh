#!/bin/bash

# 检查是否传入了模式参数
if [ -z "$1" ]; then
    echo "用法: $0 [prod|start]"
    exit 1
fi

# 获取运行模式（prod 或 start）
MODE=$1

# 指定端口号
PORT=9999

# 查找占用指定端口的进程ID
PIDS=$(lsof -t -i :$PORT)

# 检查是否有进程占用该端口
if [ -z "$PIDS" ]; then
    echo "没有进程占用端口 $PORT。"
else
    echo "正在终止占用端口 $PORT 的进程: $PIDS"
    # 终止进程
    kill -9 $PIDS
    echo "进程已终止。"
fi

# 确保日志目录存在
mkdir -p logs

# 备份之前的 nohup.out 文件
if [ -f logs/nohup.out ]; then
    # 查找最大的编号后缀
    for file in logs/nohup*.out; do
        if [[ $file =~ nohup([0-9]+)\.out ]]; then
            num=${BASH_REMATCH[1]}
            if (( num >= max )); then
                max=$num
            fi
        fi
    done
    # 增加最大编号并备份
    new_num=$((max + 1))
    mv logs/nohup.out logs/nohup$new_num.out
    echo "备份已创建: logs/nohup$new_num.out"
fi

# 检查端口是否已经有进程在运行
RUNNING_PID=$(lsof -t -i :$PORT)
if [ ! -z "$RUNNING_PID" ]; then
    echo "端口 $PORT 上已经有进程在运行 (PID: $RUNNING_PID)，请先停止它。"
    exit 1
fi

# 根据模式选择启动命令
if [ "$MODE" = "prod" ]; then
    echo "正在以生产模式启动..."
    nohup npm run prod > logs/nohup.out 2>&1 &
else
    echo "正在以开发模式启动..."
    nohup npm run start > logs/nohup.out 2>&1 &
fi

echo "进程已启动，查看 logs/nohup.out 获取输出日志。"
