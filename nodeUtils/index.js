
const fs = require('fs');
const path = require('path');

const fileName = './status.json'

const Utils = {
  /**
   *  写入文件
   * @param {object} str 
   */
  writeFile(str = {}) {
    try {
      fs.writeFileSync(fileName, JSON.stringify(str));
      return true
    } catch (error) {
      console.log('writeFile', error);
      return null
    }
  },
  /**
   *  添加人员数据
   * @param {object} params 
   * @param {object} orgParam 
   */
  addFile(params, orgParam) {
    if (orgParam && !this.writeFile(orgParam)) {
      return
    }
    try {
      const data = fs.readFileSync(fileName);
      let person = data.toString() || '{}';
      person = Object.assign({}, JSON.parse(person), params)
      return this.writeFile(person)
    } catch (error) {
      // 初始化文件
      this.writeFile();
      return null
    }
  },
  /**
   * 删除人员数据
   * @param {string} account
   * @returns boolean
   */
  deleteFile(account) {
    try {
      const data = fs.readFileSync(fileName);
      let person = data.toString() || '{}';
      person = JSON.parse(person)
      if (person[account]) {
        delete person[account]
        return this.writeFile(person)
      }else{
        return false
      }
    } catch (error) {
      return null
    }
  },
  /**
   *  查找数据
   * @param {string, number} account 
   */
  findFile(account) {
    try {
      const data = fs.readFileSync(fileName);
      let person = data.toString() || '{}';
      person = JSON.parse(person);
      return person[account]
    } catch (error) {
      return null
    }
  },
  /**
   *递归创建目录
   * @param {string} dir
   */
  makeSync(dir) {
    let parts = dir.split(path.sep);
    for (let i = 1; i <= parts.length; i++) {
      let parent = parts.slice(0, i).join(path.sep);
      try {
        fs.accessSync(parent);
      } catch (error) {
        fs.mkdirSync(parent);
      }
    }
  }
}

module.exports = Utils



