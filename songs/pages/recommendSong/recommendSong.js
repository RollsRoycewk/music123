// pages/recommendSong/recommendSong.js
import request from '../../../utils/request.js';
import PubSub from 'pubsub-js';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    month:"",
    day:"",
    recommendList:[],
    currentIndex:null
  },
  // 用于跳转详情页面
  toSong(event){
    let { id, index} = event.currentTarget.dataset;
    // console.log('id',id);
    this.setData({
      currentIndex: index
    })
    wx.navigateTo({
      url: '/songs/pages/song/song?songId=' + id
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    // console.log(new Date().getDate())
    // console.log(new Date().getMonth()+1)
    //获取当前最新时间,并更新到状态中
    this.setData({
      day: new Date().getDate(),
      month: new Date().getMonth() + 1
    })
    if(!wx.getStorageSync('cookies')){
      wx.showModal({
        title:"请先登录",
        content:"该功能需要登录帐号",
        cancelText:"回到首页",
        confirmText:"去登陆",
        success(res){
          if(res.confirm){
            wx.redirectTo({
              url: '/pages/login/login',
            })
          }else{
            wx.navigateBack();
          }
          // console.log(res)
        }
      })
    }
    let result = await request('/recommend/songs');
    // console.log(result)
    this.setData({
      recommendList: result.recommend
    })
    //订阅方需要接收数据,并且执行一定的逻辑,数据类型应该是一个函数
    PubSub.subscribe("switchSong",(msg,data)=>{
      //回调函数的第一个参数是消息名称,第二个参数才是传过来的数据
      // console.log(msg, data)
      let { currentIndex, recommendList } = this.data;
      // console.log("当前歌曲id", recommendList[currentIndex])
      if(data==="next"){
        if(currentIndex===recommendList.length-1){
          currentIndex=0
        } else {
          currentIndex++;
        }
      } else {
        if(currentIndex===0){
          currentIndex = recommendList.length - 1
        } else {
          currentIndex--;
        }
      }
      // 更新当前歌曲所在下标,防止播放界面切换歌曲出现BUG
      this.setData({ currentIndex})
      // console.log("对应歌曲id", recommendList[currentIndex])
      //将对应歌曲id发送给song页面
      PubSub.publish('changeAudioId', recommendList[currentIndex].id);
    })
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