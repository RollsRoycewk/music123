// pages/video/video.js
import request from '../../utils/request.js';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    videoGroup:[],
    id:null,
    trigger:false,
    videoList:[],
    vid: ""
  },
  //用于切换image组件与video组件的函数
  handleTrigger(event){
    // console.log('handleTrigger');
    let vid = event.target.id;
    // console.log(vid)
    this.setData({ vid });
    // 生成当前图片对应视频的videoContext
    let videoContext = wx.createVideoContext(vid);
    //通过videoContext的play方法,控制视频播放
    // videoContext.play();
  },
  //用于监视视频的播放状态
  handlePlay(event){
    //记录当前正在播放的视频的id->vid
    let vid = event.target.id;
    this.videoContext &&vid!==this.data.vid&& this.videoContext.pause();
    this.setData({ vid });
    //停止上一个视频的播放
    //1.拿到上一个视频的videoContext上下文对象
    this.videoContext = wx.createVideoContext(vid);

    // 延迟两秒钟后暂停该视频
    // let videoContext = wx.createVideoContext(vid);
    // setTimeout(videoContext.pause,10000);
    // console.log(event)
    // console.log('playing')
  },
  // 用于测试video的api
  // handleVideoPlay(){
  //   let videoContext = wx.createVideoContext("video211E83DAB8C02930915FF114B0458F5F")
  //   videoContext.pause()
  // },
  // 用于响应用户的上拉触底加载更多功能
  scrollToLower(){
    let datas;
    setTimeout(()=>{
      this.setData({
        videoList: [...this.data.videoList, ...this.data.videoList]
      })
    },2000);
    console.log('scrollToLower')
  },
  // 用于响应用户的下拉刷新效果
  pullUpdate(){
    // console.log('pullUpdate')
    this.getVideoList(this.data.id);
  },
  // 用于控制导航条内部下边框的显示
  changeId(event){
    let {id} = event.currentTarget.dataset
    // console.log(id)
    this.setData({
      id
    })
    this.getVideoList(id);
  },

  //用于请求视频列表数据
  async getVideoList(id){
    wx.showLoading({
      title:"加载中,请稍等"
    })
    this.setData({videoList:[]})
    let videoListData = await request("/video/group", { id });
    setTimeout(wx.hideLoading,2000)
    // wx.hideLoading();
    this.setData({
      videoList: videoListData.datas,
      trigger:false
    })
    // console.log(videoListData)
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    let result = await request('/video/group/list');
    // console.log(result);
    let id = result.data[0].id;
    this.setData({
      id,
      videoGroup:result.data.slice(0,14)
    })
    this.getVideoList(id);
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
    //在app.json->window->enablePullDownRefresh:true->开启所有页面的下拉刷新功能
    console.log(111)
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (shareObj) {
    // console.log('onShareAppMessage')
    console.log(shareObj)
    // 1.通过传入的实参内部的from属性进行判断,区分分享的来源
    // button代表button组件,menu代表右上角分享
    if(shareObj.from==="button"){
      let { title,imageurl } = shareObj.target.dataset;
      console.log('我是通过button分享的')
      //通过return一个配置对象,配置分享的内容
      return {
        title,
        path:"/pages/video/video",
        imageUrl:imageurl
      }
    } else if (shareObj.from === "menu") {
      console.log('我是通过右上角转发分享的')
    }
  }
})