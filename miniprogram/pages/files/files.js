const app = getApp()
const db = wx.cloud.database()
const _ = db.command
Page({

  // 相册 ID
  albumId: undefined,
  folderId:undefined,
  // 页面的初始数据
  data: {
    folderIndex: '',
    files: [],
    fileIds: [],
    realUrls:[],
  },

  onLoad(options) {
    this.folderId = options.id
    console.log(options)
  },

  onShow() {
    this.getFiles()
  },

  addfile(e) {
    wx.navigateTo({
      url: '/pages/files/add?id=' + this.folderId,
    })
  },

  // 获取文件夹中的数据
  async getFiles() {
    const userinfo = await db.collection('user').doc(app.globalData.id).get()
    console.log(userinfo)
    const folders = userinfo.data.folders
    const files = folders[this.folderId].files
    app.globalData.allData.folders[this.folderId].files = files

    // 获取文件列表
    const fileList = files.map(file => file.fileID)

    // 根据文件列表拉取文件的真实地址
    const fileIds = []
    const realUrlsRes = await wx.cloud.getTempFileURL({ fileList })
    const realUrls = realUrlsRes.fileList.map(file => {
      fileIds.push(file.fileID)
      return file.tempFileURL
    })
    this.setData({
      folderIndex: this.folderId,
      files,
      realUrls: realUrls,
    })
  },

  // 长按事件
  longpress(e) {
    const fileIndex = e.currentTarget.dataset.index
    const realurl=this.data.realUrls[fileIndex]
    wx.setClipboardData({
      data:realurl,
      success(res) {
        wx.getClipboardData({
          success(res) {
            console.log(res.data) 
          }
        })
      }
    })

  },
})
