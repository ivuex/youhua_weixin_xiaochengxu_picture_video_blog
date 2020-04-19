/**
 * 编程小石头
 * 微信：2501902696
 */
let app = getApp();
Page({
    data: {
        dataList: []
    },
    onLoad() {
        let that = this;
        wx.cloud.database().collection('timeline')
            .orderBy('createTime', 'desc') //按发布视频排序
            .get({
                success(res) {
                    console.log("请求成功", res)
                    that.setData({
                        dataList: res.data
                    })
                },
                fail(res) {
                    console.log("请求失败", res)
                }
            })
    },
    // 预览图片
    preview: function (event) {
        let dataListIndex = parseInt(event.currentTarget.dataset.data_list_index);
        let sourceInfoListIdx = parseInt(event.currentTarget.dataset.source_info_list_idx)
        console.log('30-30 sourceInfoListIdx: ', sourceInfoListIdx);
        console.log('29-29 datListIndex: ', dataListIndex);
        console.log('30-30 this.data.dataList: ', this.data.dataList);
        var type = this.data.dataList[dataListIndex].type;
        console.log('33-33 type: ', type, 'this.data.dataList[dataListIndex]: ', this.data.dataList[dataListIndex]);
        var sourceInfoList = this.data.dataList[dataListIndex].sourceInfoList;
        // console.log('32-32', sourceInfoList, this.data.dataList[sourceInfoListIndex], this.data.dataList[0]); 
        if (type == 'picture') {
            var firstImageUrl = sourceInfoList[sourceInfoListIdx].cloudThumbUrl;
            var imageUrls = sourceInfoList.map(item => item.cloudThumbUrl);
            console.log("29-29 第一张图片", firstImageUrl)
            console.log("30-30 图片s", imageUrls)
            wx.previewImage({
                //当前显示图片
                current: firstImageUrl,
                //所有图片
                urls: imageUrls,
            })
        } else if(type == 'video'){
            var cloudVideoUrl = sourceInfoList[sourceInfoListIdx].cloudVideoUrl;
            wx.reLaunch({
              url: '/pages/videoplay/videoplay?cloudVideoUrl='+cloudVideoUrl,
            })
        } else{
            console.error('48-48 unknown type got: ', type);
        }
    },

})