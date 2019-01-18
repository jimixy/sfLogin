var AipOcrClient = require("baidu-aip-sdk").ocr;

// 设置APPID/AK/SK
var APP_ID = "14406355";
var API_KEY = "Fz7Xts5UkBWb2gvendrP55GF";
var SECRET_KEY = "XEu97zMQdUCLNsKxTIcXju6IATjYH6eZ";

// 新建一个对象，建议只保存一个对象调用服务接口
var client = new AipOcrClient(APP_ID, API_KEY, SECRET_KEY);

var fs = require('fs');

function getPicCode(url = 'images/imgCode.png', callback) {
  var image = fs.readFileSync(url).toString("base64");
  var options = {};
  options["detect_direction"] = "true";
  // 调用通用文字识别, 图片参数为本地图片
  client.generalBasic(image, options).then(function (result) {
    const {
      words_result
    } = result;
    if (!words_result) {
      callback && callback()
      return
    }
    const res = words_result.reduce((sum, item) => {
      sum += item.words
      return sum;
    }, '').replace(/\s/g, '');
    if (res.length === 4) {
      callback && callback(res)
    }else{
      callback && callback()
    }
  }).catch(function (err) {
    // 如果发生网络错误
    console.log('error', err);
    callback && callback()
  });
}

module.exports = getPicCode
