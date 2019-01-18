
const inquirer = require('inquirer')
const extend = require('extend');
if (typeof localStorage === "undefined" || localStorage === null) {
  var LocalStorage = require('node-localstorage').LocalStorage;
  localStorage = new LocalStorage('./scratch');
}

const obj = {
  accounts: [],
  startTime:''
}

/**
 *输入用户账号和密码
 *
 * @param {*} sucCall
 */
function getInput(sucCall) {
  const promptList = [{
      type: 'input',
      message: '添加的账号:',
      name: 'account',
      filter: function(val) {
        return val.replace(/^\s+|\s+$/,'');
      }
    }, {
      type: 'input',
      message: '添加的密码:',
      name: 'password',
      filter: function (val) {
        return val.replace(/^\s+|\s+$/, '');
      }
    },
    {
      type: 'confirm',
      name: 'add',
      message: '是否继续添加?',
      default: false
    }
  ];
  inquirer.prompt(promptList).then(answers => {
    obj.accounts.push(answers);
    // 不继续添加了
    if (!answers.add) {
      sucCall && sucCall()
    }else{
      getInput(sucCall)
    }
  })
}

getInput(()=>{
  const promptList = [{
    type: 'list',
    message: '请选择上班打卡时间:',
    name: 'startTime',
    choices: [
      "08:50",
      "09:00",
      "09:10",
      "09:20"
    ]
  }];
  inquirer.prompt(promptList).then(answers => {
    obj.startTime = answers.startTime
    obj.accounts = obj.accounts.reduce((sum, item) => {
      sum[item.account] = item.password
      return sum
    }, {})
    // 存储用户信息
    let config = localStorage.getItem('config');
    config = config ? JSON.parse(config) : ''
    const newObj = extend(true, config, obj);
    localStorage.setItem('config', JSON.stringify(newObj));
  })
})
