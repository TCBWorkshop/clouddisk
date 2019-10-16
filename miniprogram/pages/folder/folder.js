// 获取应用实例
const app = getApp()
//初始化数据库
const db = wx.cloud.database()
const _ = db.command

Page({
  isLoaded: false,
  data: {
    inputValue: '',
    folders: [],
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
      this.getFolders()
    }
  },

  // 检查是否有用户
  async checkUser() {
    // user collection 设置权限为仅创建者及管理员可读写
    // 这样除了管理员之外，其它用户只能读取到自己的用户信息
    const user = await db.collection('user').get()
    console.log("user对象到底包含什么",user)

    // 如果没有用户，跳转到登录页面登录
    if (!user.data.length) {
      app.globalData.hasUser = false
      return wx.switchTab({ url: '/pages/user/user' })
    }

    const userinfo = user.data[0]
    app.globalData.hasUser = true
    app.globalData.id = userinfo._id
    app.globalData.nickName = userinfo.nickName
    app.globalData.allData.folders = userinfo.folders

    // 从用户信息中获取文件夹
    this.getFolders(userinfo.folders)
  },

  // 获取文件夹列表
  async getFolders(foldersParam) {
    const folders = foldersParam || app.globalData.allData.folders
    for (const folder of folders) {
      if (!folder) {
        continue
      }
    }
    this.setData({ folders })
    this.isLoaded = true
  },

  addfolders(e) {
    this.setData({
      dialogShow: true,
    })
  },

  keyInput(e) {
    this.setData({ inputValue: e.detail.value })
  },

  //新建文件夹
  async formSubmit(e) {
    if(e.detail.index==1){
      let foldersName = this.data.inputValue
      if(!!foldersName){
        app.globalData.allData.folders.push({ foldersName: foldersName, files: [] })
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
          url: '/pages/folder/folder'
        })
      }else{
        this.setData({
          error: '文件夹名不能为空'
        })
      }
    }else{
      this.setData({
        dialogShow: false,
      })
    }

  },
})
