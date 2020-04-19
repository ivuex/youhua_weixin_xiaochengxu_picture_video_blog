// 云函数入口文件
const cloud = require('wx-server-sdk');

cloud.init({
  env: 'youhua-zy',
});

const db = cloud.database();
const _ = db.command;

const result = {
  code: '',
  body: ''
}

// 云函数入口函数
exports.main = (event, context) => {

  let {
    danmuListObj,
    videoSrc
  } = event;

  const newDanmuListObj = danmuListObj;
  console.log('25-25 newDanmuListObj: ', newDanmuListObj);

  return new Promise((resolve, reject) => {
    db.collection('picture_video_cms_danmu').where({
      videoSrc: _.eq(videoSrc)
    }).get().then((res) => {
      if (res.data.length > 0) { //用户已注册
        // result.code = 400;
        // result.body = '该账户已注册';
        // resolve(result)
        console.log('30-30 res.data: ', res.data);

        const oldDanmuListObj = res.data[0].danmuListObj;
        for (let nk in newDanmuListObj) {
          if (nk in oldDanmuListObj) {
            oldDanmuListObj[nk].concat(newDanmuListObj[nk]);
          } else {
            oldDanmuListObj[nk] = newDanmuListObj[nk]
          }
        }
        const updatingData = {
          danmuListObj: oldDanmuListObj,
        };
        console.log('47-47 add updatingData: ', updatingData);
        db.collection('picture_video_cms_danmu').where({
          videoSrc: _.eq(videoSrc)
        }).update({
          data: updatingData,
        }).then(res => {
          console.log('48-48 更新弹幕成功 res: ', res);
          result.code = '200';
          result.body = res;
          resolve(result);
        }).catch(err => {
          console.log('48-48 更新弹幕成功 err: ', err);
        })

      } else { //用户未注册
        const updatingData = {
          videoSrc: videoSrc,
          _openid: 'ox-6X5F0urrzu-mruGM-AWauQ0OI',
          danmuListObj: newDanmuListObj,
        };
        // const updatingData = {
        // _openid: 'ox-6X5F0urrzu-mruGM-AWauQ0OI',
        // a:'abc'};
        console.log('66-66 add updatingData: ', updatingData);
        db.collection('picture_video_cms_danmu').add({
          data: updatingData,
        }).then((res) => {
          console.log('48-48 添加弹幕列表对象成功 res: ', res);
          result.code = '200';
          result.body = res;
          resolve(result);
        }).catch(err => {
          console.log('48-48 添加弹幕列表对象遇到错误 err: ', err);
        })

      }
    })
  })
}