const app = getApp()
const db = wx.cloud.database()
const _ = db.command

Page({
  data: {
    currentPhoto: false,
    folderIndex: -1,
    folders: [],
    filesOrigin: [],
    filesNew: [],
    newfiles_url: [],
    index: ''
  },

  // 获取原相册的的内容
  onLoad(options) {
    this.setData({
      folderIndex: options.id,
      filesOrigin: app.globalData.allData.folders[options.id].files
    })
  },

  // 提交表单
  formSubmit(e) {
    wx.showLoading({ title: '加载中' })
    // 并发上传文件
    const uploadTasks = this.data.filesNew.map(item => this.uploadFile(item.src))
    Promise.all(uploadTasks).then(result => {
      console.log("result的值",result)
      console.log("e的值是啥",e)
      this.addFiles(result,e.detail.value.desc)
      wx.hideLoading()
    }).catch(() => {
      wx.hideLoading()
      wx.showToast({ title: '文件上传错误', icon: 'error' })
    })
  },

  // 选择文件
  chooseMessageFile: function () {
    const items = this.data.filesNew
    wx.chooseMessageFile({
      count: 5,
      success: res => {
        console.log('选择文件之后的res',res)
        let tempFilePaths = res.tempFiles
        for (const tempFilePath of tempFilePaths) {
          items.push({
            src: tempFilePath.path,
            name: tempFilePath.name
          })
        }
        this.setData({ filesNew: items })
        console.log('选择文件之后的items', this.data.filesNew)
      }
    })
  },

  // 上传文件
  uploadFile(filePath) {
    const cloudPath = `cloudbase/${Date.now()}-${Math.floor(Math.random(0, 1) * 1000)}` + filePath.match(/\.[^.]+?$/)
    return wx.cloud.uploadFile({   
      cloudPath,filePath
    })
  },

  // 预览文件
  previewImage(e) {
    const current = e.target.dataset.src
    const files = this.data.filesNew.map(file => file.src)

    wx.previewImage({
      current: current.src,
      urls: files
    })
  },

  // 删除文件
  cancel(e) {
    const index = e.currentTarget.dataset.index
    const files = this.data.filesNew.filter((p, idx) => idx !== index)

    this.setData({
      filesNew: files
    })
  },

  // 添加文件信息到数据库
  addFiles(files,comment) {
    const oldFiles = app.globalData.allData.folders[this.data.folderIndex].files
    const name = this.data.filesNew.map(file => file.name)
    console.log('name的值',name)
    const folderFiles = files.map((file,index) => ({
      fileID: file.fileID,
      comments: comment,
      name:name[index]
    }))
    console.log("folderFiles", folderFiles)

    // 合并老文件的数组和新文件的数组
    app.globalData.allData.folders[this.data.folderIndex].files = [...oldFiles, ...folderFiles]

    db.collection('user').doc(app.globalData.id).update({
      data: {
        folders: db.command.set(app.globalData.allData.folders)
      }
    }).then(result => {
      console.log("写入成功", result)
      wx.navigateBack()
    }
    )
  }
})
