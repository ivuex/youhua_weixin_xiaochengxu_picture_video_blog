// 云函数入口文件
const cloud = require('wx-server-sdk');

cloud.init({
  env: 'youhua-zy',
});



// 云函数入口函数
exports.main = async (event, context) => {

  try {


    let {
      danmuListObj,
      videoSrc,
    } = event;

    var newDanmuListObj = danmuListObj;
    // var videoSrc = event.videoSrc;
    const db = cloud.database();
  
    console.log('19-19');

    // function updateData(oldDanmuListObj, newDanmuListObj) {
      
    // }

    console.log('54-54');

    var matchRecord = flase;

    try{
    var result = (await async function(){
      db.collection('picture_video_cms_danmu')
      .doc(videoSrc)
      .get()
      .then(res => {
        console.log('64-64', res);        
        if('data' in res && JSON.stringify(res.data).length > 10){
          matchRecord = true;
          var oldDanmuListObj = res.data;
          // updateData(oldDanmuListObj, newDanmuListObj);
  
          
          console.log('21-21 oldDanmuListObj: ', oldDanmuListObj);
      for (let nk in newDanmuListObj) {
        if (nk in oldDanmuListObj) {
          oldDanmuListObj[nk].concat(newDanmuListObj[nk]);
        } else {
          oldDanmuListObj[nk] = newDanmuListObj[nk]
        }
      }
      // delete oldDanmuListObj['videoSrc']; // 避免报错: Error: errCode: -501007 invalid parameters | errMsg: 不能更新_id的值;       at Object.returnAsCloudSDKErro
      console.log('30-30 new oldDanmuListObj: ', oldDanmuListObj);
      oldDanmuListObj = JSON.parse(JSON.stringify(oldDanmuListObj));
      // oldDanmuListObj = {};
      db.collection('picture_video_cms_danmu')
        // .doc(videoSrc)
        .set({
          data: oldDanmuListObj
        })
        .then(rs => {
          console.log('34-34 更新 danmuListObj 成功, rs: ', rs);
          return rs;
        })
        .catch(er => {
          console.error('34-34 更新 danmuListObj 遇到错误, er: ', er);
        });



        }
      }).catch(async err => {
        

        // updateData({}, newDanmuListObj);
        console.log('云函数端根据 videoSrc 获取旧的 danmuListObj 遇到异常, err: ', err);
        });
        console.log('82-82 result: ', result);
        return result;
    })();


    if(! matchRecord){
      newDanmuListObj['_id'] = videoSrc;
        console.log('63-63 no exist record for videoSrc: ', videoSrc);
        return await db.collection('picture_video_cms_danmu')
        // .doc(videoSrc)
        .add({
          data: newDanmuListObj
        })
        .then(rs => {
          console.log('70-70 添加 danmuListObj 作为记录 成功, rs: ', rs);
          // return rs;
          result = rs
        })
        .catch(er => {
          console.error('74-74 添加 danmuListObj 作为记录 遇到错误, er: ', er);
        });
    }

    return result;

  }catch(errr){
    console.log('88-88 操作数据库时 遇到错误, errr: ', errr);
  } 


  } catch (e) {
    try {
    } catch (eerr) {
      console.log(eerr)
    }
  }

}