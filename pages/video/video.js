 /**
  * 柚花网络技术工作室
  * qq: 2838309423
  */

 // pages/video/video.js

 let app = getApp();
 Page({
   data: {
     sourceInfoList: [],
     desc: '',
   },

   //获取输入内容
   getInput(event) {
     console.log('18-18 文本框中输入的内容: ', event.detail.value);
     this.setData({
       desc: event.detail.value,
     });
   },

   //选择图片
   chooseVideo() {
     var that = this;
     wx.chooseVideo({
       //  count: 3 - this.data.videoList.length, //最多一次上传3个视频
       //  sizeType: true
       sourceType: ['album', 'camera'],
       maxDuration: 60,
       compressed: true,
       camera: 'back', //选择后置摄像头
       success: res => {
         console.log('31-31 选择视频成功, res: ', res);
         var msg = '';
         if (/^\s*$/.test(res.thumbTempFilePath)) {
           msg = '获取视频缩略图异常，请重新选择视频';
           console.log(msg);
           wx.showToast({
             icon: "none",
             title: msg,
           });
           return;
         }
         if (/^\s*$/.test(res.tempFilePaths)) {
           msg = '获取视频临时路径异常，请重新选择视频';
           wx.showToast({
             icon: "none",
             title: msg,
           });
           return;
         }

         this.setData({
           sourceInfoList: this.data.sourceInfoList.concat({
             type: 'video',
             tmpThumbUrl: res.thumbTempFilePath,
             cloudThumbUrl: '',
             tmpVideoUrl: res.tempFilePath,
             cloudVideoUrl: '',
           }),
         });

         //  that.setData({
         //    tmpSourceInfoList: this.tmpSourceInfoList.concat({
         //      type: 'video',
         //      tmpThumbUrl
         //    })
         //  videoList: that.data.videoList.concat([
         //    res.tempFilePath
         //  ]),
         //  thumbList: that.data.thumbList.concat([
         //    res.thumbTempFilePath
         //  ]),
         //  })
       },
       fail: res => {
         console.log('34-34 选择视频失败, res: ', res);
       },
       complete: res => {
         // console.log('37-37 选择视频成功, res: ', res);
         // if(this.data.videoList.length != 0){
         //   this.setData({
         //     vedioList: this.data.videoList.concat(res.tempFilePath),
         //   });
         // }else{
         //   this.setData({
         //     videoList: res.tempFilePaths,
         //   });
         // }
         // console.log("路径 this.data.videoList: ", this.data.videoList);
       }
     });
   },

   //删除图片
   deleteVideoFromPage(event) {
     wx.showModal({
       title: '要删除这个视频吗?',
       content: '',
       cancelText: '取消',
       confirmText: '确定',
       success: res => {
         if (res.confirm) {
           this.data.sourceInfoList.splice(
             event.currentTarget.dataset,
             1
           );
           this.setData({
             sourceInfoList: this.data.sourceInfoList
           });
         }
       },
     });
   },

   publish() {
     var that = this;
     let desc = this.data.desc;
     //  let videoList = this.data.videoList;
     if (!desc || desc.length < 4) {
       wx.showToast({
         icon: 'none',
         title: '内容不能少于4个字符',
       })
       return;
     }

     if (this.data.sourceInfoList.length == 0) {
      wx.showToast({
        icon: "none",
        title: '请选择视频 (^^)',
      });
      return;
    }

     wx.showLoading({
       title: '视频正在发布中...',
     });


     const promiseArr = [];

     var filenamePrefix = new Date().getTime();

     //只能一张张上传 遍历临时的图片数组
     for (let i = 0; i < this.data.sourceInfoList.length; i++) {
       let sourceInfoList = this.data.sourceInfoList[i];
       console.log('104-104 this.data.sourceInfoList: ', this.data.sourceInfoList);
       let videoSuffix = /\.[^.]+$/.exec(sourceInfoList.tmpVideoUrl)[0]; // 正则表达式,获取视频文件扩展名
       // 在每次上传视频的时候,就往promiseArr里存一个promise,只有当所有的都返回结果时，才可以继续网下执行
       promiseArr.push(new Promise((resolve, reject) => {

         wx.cloud.uploadFile({
           cloudPath: `${filenamePrefix}_${i}_video_${videoSuffix}`, // 这是储存在服务端的文件名
           filePath: sourceInfoList.tmpVideoUrl, //文件路径
         }).then(res => {
           //get video resource ID
           console.log(`109-109 视频 sourceInfoList.tmpVideoUrl: ${sourceInfoList.tmpVideoUrl} 上传后获取到的fileID res.fileID: ${res.fileID}, 作为this.data.sourceInfo.cloudVideoUrl的值`);
           var key = `sourceInfoList[${i}].cloudVideoUrl`;
           this.setData({
             [key]: res.fileID,
           });
         }).catch(error => {
           console.log('115-115 视频上传失败 error: ', error);
         }).then(error => {
           let thumbSuffix = /\.[^.]+$/.exec(sourceInfoList.tmpThumbUrl)[0]; // 正则表达式,获取缩略图文件扩展名
           wx.cloud.uploadFile({
             cloudPath: `${filenamePrefix}_${i}_thumb_${thumbSuffix}`,
             filePath: sourceInfoList.tmpThumbUrl, //文件路径
           }).then(res => {
             //get thumb resouce ID
             console.log(`164-164 视频 sourceInfoList.tmpThumbUrl: ${sourceInfoList.tmpThumbUrl} 上传后获取到的fileID res.fileID: ${res.fileID}, 作为this.data.sourceInfo.cloudThumbUrl的值`);
             var key = `sourceInfoList[${i}].cloudThumbUrl`;
             this.setData({
               [key]: res.fileID,
             });
             resolve();

             // console.log("145-145 缩略图上传后获取到的fileID res.fileID: ", res.fileID);
             // this.setData({
             //   fileIDs: this.data.fileIDs.concat(res.fileID),
             // });
           });
         })
       }))
     }

     //  for (let i = 0; i < this.data.thumbList.length; i++){
     //    let filePath = this.data.thumbList[i];
     //    console.log('104-104 this.data.thumbList: ', this.data.thumbList, 'filePath: ', filePath);
     //    let suffix = /\.[^.]+$/.exec(filePath)[0]; // 正则表达式，获取文件扩展名
     //    // 在每次上传缩略图的时候,就往promiseArr里存一个promise,只有当所有的都返回结果时，才可以继续网下执行

     //  }

     console.log('119-119 promiseArr: ', promiseArr);


     Promise.all(promiseArr).then(res => {
       //将上传的视频信息更新到mongo库的timeline collection 中
       let db = wx.cloud.database();
       console.log('193-193 that.data.sourceInfoList: ', that.data.sourceInfoList);
       db.collection('timeline').add({
         data: {
           //  fileIDs: this.data.fileIDs,
           sourceInfoList: that.data.sourceInfoList,
           timenick: app.getNowFormatDate(),
           createTime: db.serverDate(),
           desc: that.data.desc,
           type: 'video',
           //  vedioes: this.data.vedioList,
         },
         success: res => {
           wx.hideLoading();
           wx.showToast({
             title: '发布视频成功',
           });
           console.log('136-136 发布视频成功', res);
           wx.switchTab({
             url: '/pages/index/index',
             success: function (e) { 
              var page = getCurrentPages().pop(); 
              if (page == undefined || page == null) return; 
              page.onLoad(); 
              }
           });
         },
         fail: err => {
           wx.hideLoading();
           wx.showToast({
             icon: 'none',
             title: '网络不给力...',
           });
           console.log('147-147 发布失败, err: ', err);
         }
       });
     });
   }

 })