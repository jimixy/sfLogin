

const extend = require('extend');
if (typeof localStorage === "undefined" || localStorage === null) {
  var LocalStorage = require('node-localstorage').LocalStorage;
  localStorage = new LocalStorage('./scratch');
}

// localStorage.clear(); return

// 打卡账号和密码
const accounts = {}

const startTime = '09:00'; 
const endTime = '18:55'; 
const minStartTime = '08:00'; 
const maxStartTime = '10:00'; 

let allConfig = {
  accounts,
  startTime, // 上班打卡时间
  endTime, // 下班打卡时间
  minStartTime, // 最早上班时间
  maxStartTime, // 最晚上班时间
  code0: false, // 周日打卡
  code6: false, // 周六打卡
  minTime: 8 + 1.5, // 最小上班 8小时 + 午休1.5
  minSign: true, // 最小上班时间打卡, 此时endTime无效
}

// 存储用户信息
let config = localStorage.getItem('config');
config = config ? JSON.parse(config) : ''
const newObj = extend(true, allConfig, config);
localStorage.setItem('config', JSON.stringify(newObj));

module.exports = newObj
