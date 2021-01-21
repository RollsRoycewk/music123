// pages/index/index.js
import request from '../../utils/request.js';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    bannerList:[],
    recommendList:[],
    topList:[]
  },
  toRecommendSong(){
    wx.navigateTo({
      url: '/songs/pages/recommendSong/recommendSong'
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    request("/banner",{type:2})
      .then((res) => {
        this.setData({
          bannerList: res.banners
        })
      })
    request('/personalized', {limit:10})
      .then((res) => {
        this.setData({
          recommendList: res.result
        })
        // console.log(res.result)
      });
    // console.log("result",result);
    let ids=[15,20,21,22];
    let index=0;
    let topList=[];
    while(index<ids.length){
      let res = await request("/top/list",{idx:ids[index++]})
        // .then((res)=>{
      let topData={};
      topData.name=res.playlist.name;
      topData.musicList=res.playlist.tracks.slice(0,3);
      topList.push(topData)
      this.setData({
        // topList:[...this.data.topList,topData]
        topList
      })
        // })
    }
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