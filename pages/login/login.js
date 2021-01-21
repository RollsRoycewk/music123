// pages/login/login.js
import request from '../../utils/request.js';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    phone:"",
    password:""
  },
  //用于收集用户输入数据的函数
  handleChange(event) {
    // 前端收集数据
    // console.log(event.target.dataset.type)
    let type = event.target.dataset.type;
    let value = event.detail.value;
    // 前端表单验证
    if (value.trim()) {
      this.setData({
        [type]: value
      })
    }else{
      wx.showToast({
        title:"用户名或密码格式不正确",
        icon:'none'
      })
    }
    // 后端表单验证
    // console.log("change")
  },
  //用于发送登录请求的函数
  async handleLogin(){
    let {phone,password} = this.data;
    let result = await request('/login/cellphone',{
      phone,
      password,
      isLogin:true
    });
    /*
    登录接口
    用户名错误->状态为400
    密码错误  ->状态为502
    登陆成功  ->状态为200
     */
    // console.log('result',result)
    if (result.code===400){
      wx.showToast({
        title: '用户名错误',
        icon:"none"
      })
    } else if (result.code === 502) {
      wx.showToast({
        title: '密码错误',
        icon: "none"
      })
    }else if(result.code===200){
      wx.showToast({
        title: '登陆成功,即将跳转',
        icon: "success",
        success() {
          wx.setStorage({
            key:"userinfo",
            data: JSON.stringify(result.profile),
            success(){
              console.log('存储成功')
            }
          })
          wx.switchTab({
            url: '/pages/personal/personal'
          })
        }
      })
    }
  },
  // handleChange1(event) {
  //   console.log(event.target.dataset.type)
  //   this.setData({
  //     password: event.detail.value
  //   })
  //   // console.log("change")
  // },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
    
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})