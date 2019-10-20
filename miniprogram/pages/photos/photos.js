const app= getApp()
const db = wx.cloud.database()
const _ = db.command
Page({

    // 相册 ID
    albumId: undefined,

    // 页面的初始数据
    data: {
        albumIndex: '',
        photos: [],
        photoIds: []
    },

    onLoad (options) {
        this.albumId = options.id
    },

    onShow () {
        this.getPhotos()
    },

    addphoto(e) {
      wx.navigateTo({
        url: '/pages/photos/add?id=' + this.albumId,
      })
    },

    // 获取相册中的数据
    async getPhotos () {
        // 初始化数据库
        const userinfo = await db.collection('user').doc(app.globalData.id).get()
        const albums = userinfo.data.albums
        const photos = albums[this.albumId].photos

        // 设置全局变量
        app.globalData.allData.albums[this.albumId].photos = photos

        // 获取照片列表
        const fileList = photos.map(photo => photo.fileID)

        // 根据照片列表拉取照片的实际地址
        const photoIds = []
        const realUrlsRes = await wx.cloud.getTempFileURL({ fileList })
        const realUrls = realUrlsRes.fileList.map(file => {
            photoIds.push(file.fileID)
            return file.tempFileURL
        })
        this.setData({
            albumIndex: this.albumId,
            photos: realUrls,
            photoIds
        })
    },

    // 预览图片
    async previewImage (e) {
        // 获取被点击的图片的 index
        const currentIndex = e.currentTarget.dataset.index

        // 获取当前被点击的图片的实际地址
        const currentUrl = this.data.photos[currentIndex]

        wx.previewImage({
            current: currentUrl,
            urls: this.data.photos
        })
    }
})
