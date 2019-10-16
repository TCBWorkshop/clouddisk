// 获取应用实例
const app = getApp()
const db = wx.cloud.database()
const _ = db.command

Page({
  isLoaded: false,
  data: {
    albums: [],
    inputValue: '',
    dialogShow: false,
    buttons: [{ text: '取消' }, { text: '确定' }],
    error: ''
  },

  // 应用初始化检查登录态
  onLoad() {
    this.checkUser()
  },

  // onShow 的时候获取相册列表
  onShow() {
    if (this.isLoaded) {
      this.getAlbums()
    }
  },

  // 检查是否有用户
  async checkUser() {
    const user = await db.collection('user').get()

    // 如果没有用户，跳转到登录页面登录
    if (!user.data.length) {
      app.globalData.hasUser = false

      return wx.switchTab({ url: '/pages/user/user' })
    }

    const userinfo = user.data[0]
    app.globalData.hasUser = true
    app.globalData.id = userinfo._id
    app.globalData.nickName = userinfo.nickName
    app.globalData.allData.albums = userinfo.albums

    // 从用户信息中获取相册
    this.getAlbums(userinfo.albums)
  },

  // 获取相册列表
  async getAlbums(albumsParam) {
    const albums = albumsParam || app.globalData.allData.albums

    for (const album of albums) {
      if (!album) {
        continue
      }

      // 拿第一张照片作为相册封面
      if (album.photos.length) {
        const fileID = album.photos[0].fileID
        // 获取封面的真实链接
        const { fileList } = await wx.cloud.getTempFileURL({ fileList: [fileID] })
        album.coverURL = fileList[0].tempFileURL
        continue
      }else{
        album.coverURL = "https://tcb-1251009918.cos.ap-guangzhou.myqcloud.com/demo/default-cover.png"
      }
    }

    this.setData({ albums })
    this.isLoaded = true
  },

  addalbum(e) {
    this.setData({
      dialogShow: true,
    })
  },

  keyInput(e) {
    this.setData({ inputValue: e.detail.value })
  },

  async formSubmit(e) {
    if (e.detail.index == 1) {
      let albumName = this.data.inputValue
      if (!!albumName) {
        app.globalData.allData.albums.push({ albumName: albumName, photos: [] })
        let result = await db.collection('user').doc(app.globalData.id).update({
          data: { 
            albums: _.set(app.globalData.allData.albums), 
            folders: _.set(app.globalData.allData.folders) 
            }
        })
        this.setData({
          dialogShow: false,
        })
        wx.reLaunch({
          url: '/pages/album/album'
        })
      } else {
        this.setData({
          error: '相册名不能为空'
        })
      }
    } else {
      this.setData({
        dialogShow: false,
      })
    }

  },

})
