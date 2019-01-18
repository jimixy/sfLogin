
## 萌友自动打卡系统：

## 简介
&emsp;&emsp;本系统基于node实现（初次使用请确保已安装node），使用百度文本识别方式识别萌友系统验证码，识别成功率达70%，速度快；本系统使用方便；配置简单。

## 功能

- 支持多账号
- 支持配置界面化
- 支持连续打卡
- 支持打卡记录（截屏）
- 支持最短上班时常打卡

## 文件结构
```shell
├── defaultConfig  配置信息
├── images  登陆的验证码
├── nodeUtils  工具箱
├── recode  打卡截图
├── picCode  百度验证码识别
```

## 安装
```bush
npm install 或
cnpm install (最好使用这个)
```

## 配置
```bush
双击config.cmd启动
默认周六周日不打卡，可修改defaultConfig/index.js
```

## 启动
```bush
双击start.cmd启动
```
