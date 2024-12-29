# 将代码fork到你的仓库并运行的操作步骤

## [保活serv00](https://github.com/yixiu001/serv00-login) /<sub>[视频_一休](https://www.youtube.com/watch?v=ApJXnjjdFK8&t=306s)</sub>

#### 1. Fork 仓库

1. **访问原始仓库页面**：
    - 打开你想要 fork 的 GitHub 仓库页面。

2. **Fork 仓库**：
    - 点击页面右上角的 "Fork" 按钮，将仓库 fork 到你的 GitHub 账户下。

#### 2. 设置 GitHub Secrets

1. **创建 Telegram Bot**
    - 在 Telegram 中找到 `@BotFather`，创建一个新 Bot，并获取 API Token。
    - 获取到你的 Chat ID 方法，可以通过向 Bot 发送一条消息，然后访问 `https://api.telegram.org/bot<your_bot_token>/getUpdates` 找到 Chat ID。

2. **配置 GitHub Secrets**
    - 转到你 fork 的仓库页面。
    - 点击 `Settings`，然后在左侧菜单中选择 `Secrets`。
    - 添加以下 Secrets：
        - `ACCOUNTS_JSON`: 包含账号信息的 JSON 数据。例如：
        - 
          ```json
          [
            {"username": "serv00的账号", "password": "serv00的密码", "panel": "panel2.serv00.com"},
            {"username": "user2", "password": "password2", "panel": "panel3.serv00.com"}
          ]
          ```
        - `TELEGRAM_BOT_TOKEN`: 你的 Telegram Bot 的 API Token。
        - `TELEGRAM_CHAT_ID`: 你的 Telegram Chat ID。

    - **获取方法**：
        - 在 Telegram 中创建 Bot，并获取 API Token 和 Chat ID。
        - 在 GitHub 仓库的 Secrets 页面添加这些值，确保它们安全且不被泄露。

#### 3. 启动 GitHub Actions

1. **配置 GitHub Actions**
    - 在你的 fork 仓库中，进入 `Actions` 页面。
    - 如果 Actions 没有自动启用，点击 `Enable GitHub Actions` 按钮以激活它。

2. **运行工作流**
    - GitHub Actions 将会根据你设置的定时任务（例如每三天一次）自动运行脚本。
    - 如果需要手动触发，可以在 Actions 页面手动运行工作流。

#### 示例 Secrets 和获取方法总结

- **TELEGRAM_BOT_TOKEN**
    - 示例值: `1234567890:ABCDEFghijklmnopQRSTuvwxyZ`
    - 获取方法: 在 Telegram 中使用 `@BotFather` 创建 Bot 并获取 API Token。

- **TELEGRAM_CHAT_ID**
    - 示例值: `1234567890`
    - 获取方法: 发送一条消息给你的 Bot，然后访问 `https://api.telegram.org/bot<your_bot_token>/getUpdates` 获取 Chat ID。

- **ACCOUNTS_JSON**
    - 示例值:
      ```
      [
            {"username": "serv00的账号", "password": "serv00的密码", "panel": "panel2.serv00.com"},
            {"username": "user2", "password": "password2", "panel": "panel2.serv00.com"}
          ]
      ```
    - 获取方法: 创建一个包含serv00账号信息的 JSON 文件，并将其内容添加到 GitHub 仓库的 Secrets 中。
---  

## [恢复pm2](https://github.com/milaone/Serv00-PM2-AutoRun) /<sub>[视频_米拉一 (Milaone Channel)](https://www.youtube.com/watch?v=f5hkBPO3804)</sub>

### 方法：利用github的Actions中自动工作流脚本每5分钟check一下 https://status.sharkbee.us.kg 的运行状态，出错就ssh登录运行脚本

#### [什么网站](https://www.milaone.com/archives/93.html) 是[https://status.sharkbee.us.kg]

#### 1 在Serv00中编写PM2恢复快照脚本
```
cd ~
touch run.sh
chmod +x run.sh

#run.sh中粘贴下面脚本

#!/bin/sh
~/.npm-global/bin/pm2 kill
/home/用户名/.npm-global/bin/pm2 resurrect >/dev/null 2>&1
sleep 10
/home/用户名/.npm-global/bin/pm2 restart all
~/.npm-global/bin/pm2 save

```
#### 2 serv00生成密钥对，添加公钥到服务器、并且拿到私钥
serv00中运行，生成密钥对
```
ssh-keygen -t rsa -b 4096 -C "dino@milaone.app"
``` 
将公钥并添加到authorized_keys中
    
```
cat ~/.ssh/id_rsa.pub | tee -a ~/.ssh/authorized_keys
```

打印私钥内容，复制私钥全部内容
```
cat ~/.ssh/id_rsa
```
复制私钥内容作为SSH_PRIVATE_KEY的值,需要包括全部内容
```
-----BEGIN OPENSSH PRIVATE KEY-----
xxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxx
-----END OPENSSH PRIVATE KEY-----
```

- -----BEGIN OPENSSH PRIVATE KEY-----
- -----END OPENSSH PRIVATE KEY-----
这两行也要包含进来

#### 3 配置密钥
在fork后的仓库中settings--> Security --> Secrets and variables --> Actions-->New repository secret按钮
```
Name：SSH_PRIVATE_KEY
Secret： 这里填刚复制出来的私钥
```
Add secret 按钮提交

#### 4 修改仓库中
.github/workflows目录下的pm2.yml
其中需要修改的地方我都进行注释。
```
name: autorun

on:
  workflow_dispatch:
  schedule:
    # 5分钟运行一次
    - cron: '0/5 * * * *'
    

jobs:
  ssh-and-run:
    runs-on: ubuntu-latest
    steps:
    - name: Checkout
      uses: actions/checkout@v2

    - name: Setup SSH
      uses: webfactory/ssh-agent@v0.5.3
      with:
        ssh-private-key: ${{ secrets.SSH_PRIVATE_KEY }}

    - name: Check if service is running
      id: check_service
      run: |
        if curl --head --silent --fail https://status.sharkbee.us.kg > /dev/null; then #这里改成你的Web服务的地址
          echo "service_status=running" >> $GITHUB_ENV
        else
          echo "service_status=not_running" >> $GITHUB_ENV
        fi

    - name: Run script on remote server if service is not running
      if: env.service_status == 'not_running'
      run: ssh -o StrictHostKeyChecking=no sharkbee@s2.serv00.com "/home/sharkbee/run.sh" #这里改成你的用户名@你的ssh服务器地址，以及/home/你的用户名/run.sh
```
---

## [serv00注册机](https://github.com/XyHK-HUC/Serv00-Reg)

### 项目简介
`Serv00-Reg` 是一个自动化注册工具，支持创建账户、验证码识别等功能。该项目使用 Python 编写，并依赖于一些外部库。
### 下载脚本
#### 使用 `wget` 下载
```bash
wget https://raw.githubusercontent.com/SharkBee80/serv00-action/refs/heads/main/main.py
```
#### 使用 `curl` 下载
```bash
curl -O https://raw.githubusercontent.com/SharkBee80/serv00-action/refs/heads/main/main.py
```
### 安装依赖
#### 使用 `pip` 安装依赖库
你可以通过以下指令直接从 GitHub 上安装项目所需的所有依赖库：
```bash
pip install -r https://raw.githubusercontent.com/SharkBee80/serv00-action/refs/heads/main/requirements-reg.txt
```
---

## 注意事项

- **保密性**: Secrets 是敏感信息，请确保不要将它们泄露到公共代码库或未授权的人员。
- **更新和删除**: 如果需要更新或删除 Secrets，可以通过仓库的 Secrets 页面进行管理。
