const User = require("../models/user");
const config = require("../config");
//生成随机字符串的npm包
const stringRandom = require("string-random");
//node加密相关
const crypto = require("crypto");
const md5 = require("md5");
const axios = require("axios");
//解析和生成xml文件的npm包
const Xml2js = require("xml2js");


const objToXml = obj => {
  let xml = '<xml>'
  for (let key in obj) {
    xml += `<${key}>${obj[key]}</${key}>`
  }
  xml += '</xml>'
  return xml
}
const obj2String = _obj => {
  var t = typeof _obj;
  if (t != "object" || _obj === null) {
    // simple data type
    if (t == "string") {
      _obj = '"' + _obj + '"';
    }
    return String(_obj);
  } else {
    if (_obj instanceof Date) {
      return _obj.toLocaleString();
    }
    // recurse array or object
    var n,
      v,
      json = [],
      arr = _obj && _obj.constructor == Array;
    for (n in _obj) {
      v = _obj[n];
      t = typeof v;
      if (t == "string") {
        v = '"' + v + '"';
      } else if (t == "object" && v !== null) {
        v = this.obj2String(v);
      }
      json.push((arr ? "" : '"' + n + '":') + String(v));
    }
    return (arr ? "[" : "{") + String(json) + (arr ? "]" : "}");
  }
};

const setTimeDateFmt = s => {
  // 个位数补齐十位数
  return s < 10 ? "0" + s : s;
};
const randomNumber = () => {
  const now = new Date();
  let month = now.getMonth() + 1;
  let day = now.getDate();
  let hour = now.getHours();
  let minutes = now.getMinutes();
  let seconds = now.getSeconds();
  month = setTimeDateFmt(month);
  day = setTimeDateFmt(day);
  hour = setTimeDateFmt(hour);
  minutes = setTimeDateFmt(minutes);
  seconds = setTimeDateFmt(seconds);
  let orderCode =
    now.getFullYear().toString() +
    month.toString() +
    day +
    hour +
    minutes +
    seconds +
    Math.round(Math.random() * 1000000).toString();
  console.log(orderCode);
  return orderCode;
};


module.exports = {
  async getAll(ctx) {
    const { openid } = ctx.request.body;
    var files = require("./flies.js");
    let result = {
      state: false,
      data: null,
      filesLength: 0,
      message: "获取失败"
    };
    let imageList = files.getImageFiles(__dirname + "/../public/images/");
    var iamgeFmt = [];
    imageList.forEach(item => {
      iamgeFmt.push({
        name: item.split(".")[0],
        enable: false,
        filePath: ctx.request.origin + "/h5/" + item.split(".")[0] + ".html",
        imagePath: ctx.request.origin + "/images/" + item
      });
    });
    if (openid) {
      let boughtList = [];
      await User.findOne({ openid: openid }, (err, res) => {
        if (res) {
          boughtList = res.magazine;
          console.log(boughtList);
        }
      });
      iamgeFmt.forEach((item, i) => {
        boughtList.forEach((db, j) => {
          if (item.name === db) {
            console.log(item.name);
            item.enable = true;
          }
        });
      });
    }
    result = {
      state: true,
      data: iamgeFmt,
      filesLength: iamgeFmt.length,
      message: "获取成功"
    };
    ctx.body = result;
  },

  async getPayment(ctx) {
    let result = {
      state: false,
      message: "支付失败"
    };
    const url = "https://api.mch.weixin.qq.com/pay/unifiedorder";
    const { total_fee, openid, body } = ctx.request.body;
    const trade_no = randomNumber();
    let order = {
      appid: config.appid,
      attach: 'test',
      body: body,
      device_info: 100,
      mch_id: config.mch_id,
      //    生成随机字符串，长度32位以内,我们使用stringRandom库生成16位随机数
      nonce_str: stringRandom(16),
      notify_url: ctx.request.origin + "/pay/result",
      openid: openid,
      out_trade_no: trade_no,
      spbill_create_ip: ctx.request.ip.replace(/::ffff:/g, ''),
      total_fee: total_fee,
      trade_type: "JSAPI"
    };
    //    将参数对象转为key=value模式的字符串,用&分隔

    let stringA = obj2String(order);
    //    将生成的字符串末尾拼接上API密钥（key设置路径：微信商户平台(pay.weixin.qq.com)-->账户设置-->API安全-->密钥设置）
    let stringSignTemp = stringA + `&key=${config.merchantKey}`;
    //    通过HMAC-SHA256或者MD5生成sign签名，这里我们使用md5，然后将签名加入参数对象内
    // let md5 = crypto.createHash("md5");
    // md5.update(stringSignTemp);
    // order.sign = md5.digest("hex").toUpperCase();
    stringSignTemp = stringSignTemp.replace(/\"/g, '');
    stringSignTemp = stringSignTemp.replace('{', '');
    stringSignTemp = stringSignTemp.replace('}', '');
    stringSignTemp = stringSignTemp.replace(/,/g, '&');
    stringSignTemp = stringSignTemp.replace(/:/g, '=');
    stringSignTemp = stringSignTemp.replace('https=', 'https:');
    order.sign = md5(stringSignTemp).toUpperCase();
    //    将参数对象专为xml格式
    const builder = new Xml2js.Builder();
    const xml = objToXml(order);

    //    发送请求
    await axios.post(url, xml).then(async res => {
      //   由于微信服务器返回的data格式是xml，所以这里我们需要转成object
      const parser = new Xml2js.Parser();
      const xmlObj = await parser.parseStringPromise(res.data);
      if (xmlObj.xml.return_code[0] === "FAIL") {
        result.message = `支付失败,${xmlObj.xml.return_msg[0]}`;
        ctx.body = result;
      }
      if (xmlObj.xml.result_code && xmlObj.xml.result_code[0] === "SUCCESS") {
        let payData = {
          appId: xmlObj.xml.appid[0],
          nonceStr: xmlObj.xml.nonce_str[0],
          package: `prepay_id=${xmlObj.xml.prepay_id[0]}`,
          signType: "MD5",
          timeStamp: new Date().getTime().toString(),
        };
        const StringPay = obj2String(payData);
        //    将生成的字符串末尾拼接上API密钥（key设置路径：微信商户平台(pay.weixin.qq.com)-->账户设置-->API安全-->密钥设置）
        let stringSignTemp2 = StringPay + `&key=${config.merchantKey}`;
        stringSignTemp2 = stringSignTemp2.replace(/\"/g, '');
        stringSignTemp2 = stringSignTemp2.replace('{', '');
        stringSignTemp2 = stringSignTemp2.replace('}', '');
        stringSignTemp2 = stringSignTemp2.replace(/,/g, '&');
        stringSignTemp2 = stringSignTemp2.replace(/:/g, '=');
        payData.paySign = md5(stringSignTemp2).toUpperCase();
        ctx.body = payData;
      } else {
        result.message = `支付失败,${xmlObj.xml.return_msg[0]}`;
        ctx.body = result;
      }
    });
  },
  async payResult() {
    const xml = ctx.request.body.xml;
    const successXml = `<xml><return_code><![CDATA[SUCCESS]]></return_code><return_msg><![CDATA[OK]]></return_msg></xml>`;
    if (returnCode === "SUCCESS" && xml.result_code[0] === "SUCCESS") {
      //返回xml告诉微信已经收到，并且不会再重新调用此接口
      ctx.body = successXml;
    }
  },
  async setMagazine(ctx) {
    let result = {
      state: false,
      message: "订阅错误,请联系客服"
    };
    const { openid, filename } = ctx.request.body;
    await User.update(
      { openid: openid },
      { $addToSet: { magazine: filename } },
      (err, resp) => {
        if (err) {
          ctx.body = result;
        } else {
          result.message = "订阅成功";
          result.state = true;
          result.openid = openid;
          result.filename = filename;
          ctx.body = result;
        }
      }
    );
  }
};
