function getRandomColor() {
  let rgb = []
  for (let i = 0; i < 3; ++i) {
    let color = Math.floor(Math.random() * 256).toString(16)
    color = color.length == 1 ? '0' + color : color
    rgb.push(color)
  }
  return '#' + rgb.join('')
}

const db = wx.cloud.database();
const _ = db.command;

Page({
  data: {
    // maxDanmuedIntTime: 0,
    // danmuDisplay: 'block',
    inputValue: '',
    toggle: true,
    videoSrc: '',
    editingDanmuObj: {
      content: '',
      color: '#fff',
    },
    playingIntTime: 0,
    danmuListObj: {},
  },
  onLoad: function (option) {
    // wx.reLaunch({url: '/pages/videoplay/videoplay',});
    this.setData({
      videoSrc: option.cloudVideoUrl,
    });
    this.videoContext = wx.createVideoContext('myVideo');
  },
  onUnload() {
    this.uploadDanmu();
  },
  // onPlay() {
  //   this.setData({
  //     danmuDisplay: 'block',
  //   });
  // },
  onPlay() {

    this.addBarrage();
  },

  addBarrage() {
    var that = this;
    const barrageComp = this.selectComponent('.barrage')

    this.barrage = barrageComp.getBarrageInstance({
      font: 'bold 16px sans-serif',
      duration: 10,
      lineHeight: 2,
      // mode: 'separate',
      padding: [10, 0, 10, 0],
      tunnelShow: false,
      range: [0, 0.4],
    });

    this.barrage.open();
    // this.barrage.showTunnel();
    try {
      db.collection('picture_video_cms_danmu')
        // .doc(this.data.videoSrc)
        .where({
          videoSrc: _.eq(that.data.videoSrc)
        })        
        .get({
          success(res) {
            console.log("35-35 请求云弹幕列表成功", res);
            console.log("73-73 res.data[0]: ", res.data[0]);
            console.log("73-73 res.data[0].danumListObj: ", res.data[0].danmuListObj);
            if(res.data.length){
              that.setData({
                danmuListObj: res.data[0].danmuListObj,
              });
            }else{
              console.log(`78-78 该视频 that.data.videoSrc: ${that.data.videoSrc} ,  res.data.length: `, res.data.length);
            }
          },
          fail(res) {
            console.log("41-41 请求云弹幕列表失败，这通常意味着该视频还没有弹幕", res)
          }
        });
    } catch (err) {
      console.log(err, '没有取到云弹幕列表就代表当前视频没有弹幕');
    }
  },

  fullscreenchange() {
    this.setData({
      toggle: false
    })
    setTimeout(() => {
      if (this.barrage) this.barrage.close()
      this.setData({
        toggle: true
      })
      this.addBarrage()
    }, 1000)
  },

  onPlayTimeUpdate: function (event) {
    var that = this;
    var playingIntTime = Math.floor(event.detail.currentTime).toString();
    // console.log('131-131 playingIntTime: ', playingIntTime);
    if (playingIntTime > that.data.playingIntTime) {
      this.setData({
        'playingIntTime': playingIntTime
      });
      if (playingIntTime in this.data.danmuListObj) {
        console.log(`101-101 playingIntTime: ${playingIntTime} in this.data.danmuListObj`);
        console.log('102-102 that.data.danmuListObj[playingIntTime] : ', that.data.danmuListObj[playingIntTime]);
        that.barrage.addData(that.data.danmuListObj[playingIntTime]);
      }
    }

    // if(playingIntTime + 1 >= that.videoContext.duration){
    //   this.uploadDanmu('onPlayTimeUpdate playingIntime + 1 >= that.videoContext.duration');
    // }
    // if(playingIntTime + 1 == that.videoContext.duration){    

    // }
  },

  onInput: function (event) {
    var randomColor = getRandomColor();
    this.setData({
      'editingDanmuObj.content': event.detail.value,
      'editingDanmuObj.color': randomColor,
      inputValue: '',
    });;
  },
  onSubmitDanmu: function () {
    console.log('66-66 this.data.editingDanmuObj: ', this.data.editingDanmuObj);
    var editingDanmuObj = this.data.editingDanmuObj;
    var playingIntTime = this.data.playingIntTime;
    // this.barrage.addData([editingDanmuObj]);
    this.barrage.send(editingDanmuObj);
    var key = `danmuListObj.${playingIntTime}`;
    console.log('165-165 key: ', key, 'editingDanmuObj: ', editingDanmuObj);
    if (playingIntTime.toString() in this.data.danmuListObj) {
      console.log(`131-131 playingIntTime.toString(): ${playingIntTime.toString()} in this.data.danmuListObj : `, this.data.danmuListObj);
      var newdanmuListObj = this.data.danmuListObj[playingIntTime].concat(editingDanmuObj);
      this.setData({
        [key]: newdanmuListObj,
      });
    } else {
      console.log('163-163 not playingIntTime in this.data.danmuListObj');
      this.setData({
        [key]: [editingDanmuObj],
      })
    }
  },
  onHide() {
    this.uploadDanmu('onHide');
  },
  uploadDanmu(reaseon) {
    var that = this;
    console.log('157-157 上传弹幕原因 reaseon: ', reaseon);
    if (JSON.parse(JSON.stringify(this.data.danmuListObj)) != JSON.parse(JSON.stringify({}))) {

      // wx.cloud.database().collection('picture_video_cms_danmu')
      //   .doc(this.data.videoSrc)
      //   .set({
      //     data: {
      //       danumListObj: this.data.danmuListObj,
      //     },
      //     success: res => {
      //       console.log('95-95 发送弹幕成功 res: ', res, 'this.data.danmuListObj: ', this.data.danmuListObj);
      //     },
      //     fail: err => {
      //       console.log('102-102 上传刚刚提交的弹幕到云数据库时遇到错误 err: ', err);
      //     },
      //   });
      //让云函数端计算并也较安全的方式 根据 videoSrc 更新 的弹幕

      
    //   wx.cloud.callFunction({
    //     name: 'syncReadStore',
    //     data: {
    //       tel: '15823170299',
    //       password: 'a12345',
    //     },
    //     success: res => {
    //         console.log("更新数据成功", res)
    //         // this.setData({
    //         //     wxAcode: res.result
    //         // })
    //     },
    //     fail: error => {
    //         console.log("更新数据失败", error)
    //     }
    // });      

      wx.cloud.callFunction({
        name: 'safeUpdateDanmu',
        data: {
          danmuListObj: this.data.danmuListObj,
          videoSrc: that.data.videoSrc,
        },
        success: res => {
            console.log("更新弹幕成功", res)
            this.setData({
                wxAcode: res.result
            })
        },
        fail: error => {
            console.log("更新弹幕失败", error)
        }
    });

    }

  },
  onEnded() {
    this.setData({
      // danmuDisplay: 'none',
      playingIntTime: 0,
    });
    this.uploadDanmu('onEnded');

    // this.setData({
    // });
    // this.barrage.hideTunnel()
    // wx.reLaunch({
    //   url: '/pages/videoplay/videoplay?videoSrc='+this.data.videoSrc,
    // })
  },
  onPause() {
    // this.uploadDanmu('onPause');


    // this.barrage.close();
    // this.barrage.hideTunnel();
  },
  videoErrorCallback: function (event) {
    console.log('In videoErrorCallback, 视频错误信息: event.detail.errMsg');
    this.uploadDanmu('videoErrorCallback');
    console.log(e.detail.errMsg);
  }
})