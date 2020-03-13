const User = require("../models/user");
const config = require("../config");
//生成随机字符串的npm包
const stringRandom = require("string-random");
//node加密相关
const crypto = require("crypto");
//解析和生成xml文件的npm包
const Xml2js = require("xml2js");
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
            let boughtList = []; //测试用
            await User.findOne({ openid: openid }, (err, res) => {
                boughtList = res.magazine
                console.log(boughtList)
            })

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

    // getPayment(out_trade_no, total_fee) {
    //   const url = "https://api.mch.weixin.qq.com/pay/unifiedorder";
    //   let order = {
    //     appid: config.appid,
    //     body: "购买杂志",
    //     mch_id: config.mch_id,
    //     //    生成随机字符串，长度32位以内,我们使用stringRandom库生成16位随机数
    //     nonce_str: stringRandom(16),
    //     notify_url: ctx.request.origin + '/setMagazine',
    //     openid,
    //     out_trade_no: out_trade_no,
    //     spbill_create_ip: config.spbill_create_ip,
    //     total_fee,
    //     trade_type: "JSAPI"
    //   };
    //   //    将参数对象转为key=value模式的字符串,用&分隔
    //   let stringA = obj2String(order);
    //   //    将生成的字符串末尾拼接上API密钥（key设置路径：微信商户平台(pay.weixin.qq.com)-->账户设置-->API安全-->密钥设置）
    //   let stringSignTemp = stringA + `&key=${config.apiKey}`;
    //   //    通过HMAC-SHA256或者MD5生成sign签名，这里我们使用md5，然后将签名加入参数对象内
    //   let md5 = crypto.createHash("md5");
    //   md5.update(stringSignTemp);
    //   order.sign = md5.digest("hex").toUpperCase();
    //   //    将参数对象专为xml格式
    //   const builder = new Xml2js.Builder();
    //   const xml = builder.buildObject(order);
    //   //    发送请求
    //   axios.post(url, xml);
    //   //   由于微信服务器返回的data格式是xml，所以这里我们需要转成object
    //   const parser = new Xml2js.Parser();
    //   const xmlObj = await parser.parseStringPromise(result.data);
    //   if (xmlObj.xml.return_code[0] === 'FAIL') {
    //     throw new Failed({
    //       msg: `支付失败,${xmlObj.xml.return_msg[0]}`,
    //     })
    //   }
    //   if (xmlObj.xml.result_code && xmlObj.xml.result_code[0] === 'SUCCESS') {
    //     let payData = {
    //       appId: xmlObj.xml.appid[0],
    //       nonceStr: xmlObj.xml.nonce_str[0],
    //       package: `prepay_id=${xmlObj.xml.prepay_id[0]}`,
    //       signType: "MD5",
    //       timeStamp: new Date().getTime().toString(),
    //       key: config.getItem('wx.merchantKey')
    //     }
    //     const StringPay = obj2String(payData)
    //     let payMd5 = crypto.createHash('md5')
    //     payMd5.update(StringPay);
    //     let paySign = payMd5.digest('hex').toUpperCase();
    //     payData.paySign = paySign;
    //     delete payData.key;
    //     //前面已经将需要的字段拼接好，将对象从方法返回，服务端可以将对象直接传回给小程序客户端
    //     return payData
    //   } else {
    //     throw new Failed({
    //       msg: `支付失败,${xmlObj.xml.err_code[0]}:${xmlObj.xml.err_code_des[0]}`,
    //     })
    //   }
    // },

    async setMagazine(ctx) {
        // const xml = ctx.request.body.xml;
        // const successXml = '<xml><return_code><![CDATA[SUCCESS]]></return_code><return_msg><![CDATA[OK]]></return_msg></xml>';

        // // 这里进行签名和校验返回xml数据的真实性，以防恶意调用接口
        // //校验过程省略...

        // if (returnCode === 'SUCCESS' && xml.result_code[0] === 'SUCCESS') {
        //   // 根据自己的业务需求支付成功后的操作
        //   //......
        //   //返回xml告诉微信已经收到，并且不会再重新调用此接口
        //   ctx.body = successXml
        // }
        let result = {
            state: false,
            message: "服务器错误,请联系客服"
        };
        const { openid, filename } = ctx.request.body;
        await User.update(
            { openid: openid },
            { $addToSet: { magazine: filename } },
            (err, resp) => {
                if (err) {
                    ctx.body = result;
                } else {
                    result.message = "购买成功";
                    result.state = true;
                    result.openid = openid;
                    result.filename = filename;
                    ctx.body = result;
                }
            }
        );
    }
};
