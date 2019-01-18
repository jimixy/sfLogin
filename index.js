const path = require('path');
const puppeteer = require('puppeteer');
const dayjs = require('dayjs');
const getPicCode = require('./picCode');
const Utils = require('./nodeUtils');

let {
  accounts,
  startTime,
  endTime,
  code0,
  code6,
  minTime,
  minSign,
  minStartTime,
  maxStartTime
} = require('./defaultConfig');

// 年月日
let currentDate;

// 星期几
let currentWeak;

// 几点钟
let currentTime;

// 是否达到签到时间
let isAfterStart;

// 登陆错误次数
let errCounts = {};

// 初始化
startLogin();


// 每5分钟判断一次
setInterval(startLogin, 5 * 60 * 1000);

/**
 *时间比较
 *
 * @param {string} t1 
 * @param {string} t2
 * @returns t1 > t2
 */
function CompareDate(t1, t2) {
  var date = new Date();
  var a = t1.split(':');
  var b = t2.split(':');
  return date.setHours(a[0], a[1]) > date.setHours(b[0], b[1]);
}

// 启动
function startLogin() {
  
  currentDate = dayjs().format('YYYY-MM-DD');
  currentTime = dayjs().format('HH:mm');
  currentWeak = dayjs().format('d');

  isAfterStart = CompareDate(currentTime, startTime) 
    && CompareDate(currentTime, minStartTime)
    // && CompareDate(maxStartTime, currentTime);
  if (!Object.keys(accounts).length) {
    console.log('请配置打卡账号！！！');
    return
  }
  Object.entries(accounts).forEach(([key, value]) => {
    errCounts[key] = 0;
    const find = Utils.findFile(key)
    if (!find || !find[currentDate]) {
      // 第二天 初始化数据
      const newObj = Object.assign({}, find, {
        [currentDate]: {
          "am": '', // 上班打卡
          "pm": '' // 下班打卡
        }
      })
      const myPath = path.resolve(__dirname, `./recode/${key}/${currentDate}`);
      Utils.makeSync(myPath);
      Utils.addFile({
        [key]: newObj
      });
    } else if (find[currentDate]['am']) {
      // 最小上班时间打卡
      const minEndTime = dayjs(currentDate + ' ' + find[currentDate]['am']).add(minTime, 'hour').format('HH:mm')
      if (CompareDate(minEndTime, endTime) || minSign) {
        endTime = minEndTime
      }
    }
    // 是否达到签退时间---每个人的上班打卡时间不一致，导致下班打卡时间不一样
    const isAfterEnd = CompareDate(currentTime, endTime);
    const {
      [currentDate]: {
        am: hasSignIn,
        pm: hasSignOff
      } = {}
    } = find || {}
    // console.log('currentTime', currentDate, currentTime, isAfterStart, isAfterEnd, endTime);
console.log(`-----------------------------
系统运行中
当前时间：${currentDate} ${currentTime}
上班时间： ${hasSignIn || '未打卡'}
预计下班打卡时间: ${endTime}
-----------------------------`);
    
    // 到了上下班时间且没有打过卡
    if ((isAfterStart && !hasSignIn) || (isAfterEnd && !hasSignOff)) {
      // 周六周日打卡设置
      if ((currentWeak !== 6 && currentWeak !== 0) || (currentWeak === 6 && code6) || (currentWeak === 0 && code0)) {
        doLogin(key, value, isAfterEnd, errCounts[key])
      }
    }
  });
}

// 开始登陆
async function doLogin(account, password, isAfterEnd, errCount) {
  const browser = await puppeteer.launch({
    // headless: false,
    sloMo: 500
  });

  const page = await browser.newPage();
  await page.goto('http://hos.sf-express.com/frame.pvt');
  await page.setViewport({
    width: 1100,
    height: 900
  });

  const time1 = setTimeout(async function setCode() {
    // 验证码匹一般3次就会匹配成功，超过10次很可能是账号密码错误；
    if (errCount > 10) {
      console.log(`⚠⚠⚠ 账号:${account}密码输入有误！！！`);
      clearTimeout(time1); 
      return;
    }
    const rect = await page.evaluate(() => {
      const element = document.querySelector('.yzmImg');
      const { x, y, width, height } = element.getBoundingClientRect();
      return {
        x,
        y,
        width,
        height
      };
    });
    const imgCode = path.resolve(__dirname, './images/imgCode.png');
    // 截取验证码图片 用于识别
    await page.screenshot({
      path: imgCode,
      clip: rect
    });
    // 调用百度接口识别--核心代码
    getPicCode(imgCode, async code => {
      // console.log('code', code);
      if (code) {
        // 设置账号
        await page.focus('#username');
        await page.keyboard.sendCharacter(account);
        // 设置密码
        await page.focus('#password');
        await page.keyboard.sendCharacter(password);
        // 设置验证码
        await page.focus('#verifyCode');
        await page.keyboard.sendCharacter(code);
        await page.click('.loginbtn img');

        setTimeout(async () => {
          const ele = await page.$('#username');
          // 没有登陆进去, 验证码错误或账号密码错误
          if (ele) {
            ++errCount;
            setCode();
            return;
          }
          // 上班打卡
          if (isAfterStart) {
            await page.click('#inputButton');
            // 获取上下班时间
            let signInTime = await page.evaluate(() => document.querySelector('.fc-today .s').innerText);
            let signOffTime = await page.evaluate(() => document.querySelector('.fc-today .o').innerText);
            signInTime = signInTime.includes(':') ? signInTime.slice(0, 5) : ''
            signOffTime = signOffTime.includes(':') ? signOffTime.slice(0, 5) : ''
            // 没有打卡成功
            if (!signInTime) return
            // 重新设置状态
            const find = Utils.findFile(account)
            const newObj = Object.assign({}, find, {
              [currentDate]: {
                "am": signInTime,
                "pm": signOffTime
              }
            })
            const add = Utils.addFile({
              [account]: newObj
            });
            add && console.log(`(●'◡'●) ${account}在${signInTime.replace(':', '点')}上班打卡了 (●'◡'●)`);
            const savePath = path.resolve(__dirname, `./recode/${account}/${currentDate}/${signInTime.replace(':', '点')}上班.png`);
            // 截图为证
            setTimeout(async () => {
              await page.screenshot({
                path: savePath
              });
              await browser.close();
            }, 1500);
          }

          // 下班打卡
          if (isAfterEnd) {
            await page.click('#outputButton');
            // 获取上下班时间
            let signInTime = await page.evaluate(() => document.querySelector('.fc-today .s').innerText);
            let signOffTime = await page.evaluate(() => document.querySelector('.fc-today .o').innerText);
            signInTime = signInTime.includes(':') ? signInTime.slice(0, 5) : ''
            signOffTime = signOffTime.includes(':') ? signOffTime.slice(0, 5) : ''
            // 没有打卡成功
            if (!signOffTime) return
            // 重新设置状态
            const find = Utils.findFile(account)
            const newObj = Object.assign({}, find, {
              [currentDate]: {
                "am": signInTime,
                "pm": signOffTime
              }
            })
            const add = Utils.addFile({
              [account]: newObj
            });
            add && console.log(`(●'◡'●) ${account}在${signOffTime.replace(':', '点')}下班打卡了 (●'◡'●)`);
            const savePath = path.resolve(__dirname, `./recode/${account}/${currentDate}/${signInTime.replace(':', '点')}下班.png`);
            setTimeout(async () => {
              await page.screenshot({
                path: savePath
              });
            }, 1500);
          }
        }, 2 * 1000);
      } else {
        await page.click('.referBtn');
        await page.waitFor(100);
        setCode();
      }
    });
  }, 2 * 1000);
}
