// pages/personal/personal.js
import request from '../../utils/request.js';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    moveDistance:0,
    moveTransition:"none",
    playList:null,
    userinfo:{}
  },
  toLogin(){
    // 如果用户已有昵称(登陆过才有),就不能跳转login页面
    if(this.data.userinfo.nickname)return;
    wx.navigateTo({
      url: '/pages/login/login'
    })
  },
  //用于处理cover-container的手指按下事件
  handleStart(event) { 
    this.startY = event.touches[0].clientY;
    this.setData({
      moveTransition:"none"
    })
    // console.log(startY);
    // console.log('handleStart');
  },
  //用于处理cover-container的手指移动事件
  handleMove(event) {
    this.moveY = event.touches[0].clientY;
    let moveDistance = Math.floor(this.moveY-this.startY);
    // console.log(moveDistance);
    if (moveDistance <= 0) return;
    if (moveDistance >= 80)return ;
    this.setData({
      moveDistance
    })
    // console.log('handleMove');
  },
  //用于处理cover-container的手指抬起事件
  handleEnd(){
    this.setData({
      moveDistance:0,
      moveTransition:"transform 1s linear"
    })
  },

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
  onShow: async function () {
    //由于我们跳转login页面使用的是wx.navigateTo,所以personal页面不会被卸载
    //如果获取Storage和发送请求的逻辑写在onLoad内部,onLoad只会执行一次
    //用户如果开启小程序时没有登录,就无法成功获取数据
    let userinfo = JSON.parse(wx.getStorageSync("userinfo")||"{}");
    // console.log(userinfo)
    if (userinfo) {
      //如果Storage中有用户信息,才更新
      this.setData({
        userinfo
      });
      //如果Storage中有用户信息,就获取对应的userId去发送请求,获取用户最近播放记录
      let result = await request('/user/record',{type:1,uid:userinfo.userId});
      console.log(result)
      this.setData({
        playList:result.weekData
      })
    }
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