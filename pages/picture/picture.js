/**
 * 柚花网络技术工作室
 * qq: 2838309423
 */
let app = getApp();
Page({
    data: {
        sourceInfoList: [],
        desc: ''
    },

    //获取输入内容
    getInput(event) {
        console.log("15-15 文本框中输入的内容", event.detail.value)
        this.setData({
            desc: event.detail.value
        })
    },


    //选择图片
    ChooseImage() {
        wx.chooseImage({
            count: 12 - this.data.sourceInfoList.length, //默认9,我们这里最多选择12张
            sizeType: ['compressed'], //可以指定是原图还是压缩图，默认二者都有
            sourceType: ['album'], //从相册选择
            success: (res) => {
                console.log("29-29 选择图片成功", res)
                var newChoosensourceInfoList = res.tempFilePaths.map(item => ({
                    type: 'picture',
                    tmpThumbUrl: item,
                    cloudThumbUrl: '',
                }));
                this.setData({
                    sourceInfoList: this.data.sourceInfoList.concat(newChoosensourceInfoList)
                });
                console.log("37-37 路径", this.data.sourceInfoList)
            }
        });
    },
    //删除图片
    DeleteImgFromPage(e) {
        wx.showModal({
            title: '要删除这张照片吗？',
            content: '',
            cancelText: '取消',
            confirmText: '确定',
            success: res => {
                if (res.confirm) {
                    this.data.sourceInfoList.splice(e.currentTarget.dataset.index, 1);
                    this.setData({
                        sourceInfoList: this.data.sourceInfoList
                    });
                }
            }
        })
    },

    //上传数据
    publish() {
        let desc = this.data.desc
        let sourceInfoList = this.data.sourceInfoList
        if (!desc || desc.length < 4) {
            wx.showToast({
                icon: "none",
                title: '内容不能少于4个字符',
            })
            return
        }
        if (!sourceInfoList || sourceInfoList.length < 1) {
            wx.showToast({
                icon: "none",
                title: '请选择图片 (^^)'
            })
            return
        }
        wx.showLoading({
            title: '图片正在发布中...',
        })

        const promiseArr = []
        //只能一张张上传 遍历临时的图片数组
        for (let i = 0; i < this.data.sourceInfoList.length; i++) {
            var tmpSourceInfo = this.data.sourceInfoList[i]
            let tmpThumbUrl = tmpSourceInfo['tmpThumbUrl'];
            let suffix = /\.[^.]+$/.exec(tmpThumbUrl)[0]; // 正则表达式，获取文件扩展名
            //在每次上传的时候，就往promiseArr里存一个promise，只有当所有的都返回结果时，才可以继续往下执行
            promiseArr.push(new Promise((resolve, reject) => {
                wx.cloud.uploadFile({
                    cloudPath: new Date().getTime() + suffix,
                    filePath: tmpThumbUrl, // 文件路径
                }).then(res => {
                    // get resource ID
                    var cloudThumbUrl = res.fileID;
                    console.log("上传结果", cloudThumbUrl)
                    return cloudThumbUrl;
                }).then(cloudThumbUrl => {
                    console.log('99-99', cloudThumbUrl);
                    var key = `sourceInfoList[${i}].cloudThumbUrl`;
                    console.log('102-102 key: ', key);
                    this.setData({
                        [key]: cloudThumbUrl,
                    });
                    resolve();
                }, error => {
                    console.log("上传失败", error)
                });
            }))
        }
        //保证所有图片都上传成功
        let db = wx.cloud.database()
        Promise.all(promiseArr).then(res => {
            db.collection('timeline').add({
                data: {
                    sourceInfoList: this.data.sourceInfoList,
                    date: app.getNowFormatDate(),
                    createTime: db.serverDate(),
                    desc: this.data.desc,
                    type: 'picture',
                    // images: this.data.sourceInfoList
                },
                success: res => {
                    wx.hideLoading()
                    wx.showToast({
                        title: '发布图片成功',
                    })
                    console.log('发布图片成功', res)
                    wx.switchTab({
                        url: '/pages/index/index',
                        success: function (e) { 
                         var page = getCurrentPages().pop(); 
                         if (page == undefined || page == null) return; 
                         page.onLoad(); 
                         }
                    })
                },
                fail: err => {
                    wx.hideLoading()
                    wx.showToast({
                        icon: 'none',
                        title: '网络不给力....'
                    })
                    console.error('发布失败', err)
                }
            })
        })
    },
})