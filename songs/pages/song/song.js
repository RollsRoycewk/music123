// pages/song/song.js
import request from '../../../utils/request.js';
import PubSub from 'pubsub-js';
import moment from 'moment';
let appInstance = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isplaying:false,
    songId:null,
    songObj:{},
    musicUrl: "",
    currentTime: 0,
    durationTime: 0,
    // currentTime:"00:00",
    // durationTime:"--:--",
    currentWidth:"0"
  },
  //用户点击播放按钮的回调函数
  async handlePlay() {
    this.setData({
      isplaying: !this.data.isplaying,
    })
    // 发送请求获取歌曲音频URL
    if (!this.data.musicUrl) {
      await this.getMusicUrl();
    }
    // console.log('paused',backgroundAudioManager.paused);
    // paused是只读属性,false是正在播放,true代表已停止或者暂停
    // paused值在首次读取时,一定是undefined
    //pause是方法,调用它可以暂停音频
    // if (backgroundAudioManager.paused || typeof backgroundAudioManager.paused === "undefined") {
    //   backgroundAudioManager.src = this.data.musicUrl;
    //   backgroundAudioManager.title = this.data.songObj.name;
    // } else {
    //   backgroundAudioManager.pause();
    // }
    this.changeAudioPlay();
    // this.setData({
    //   isplaying: !this.data.isplaying
    // })
  },
  //专门用于控制音频的播放和暂停
  changeAudioPlay(){
    /*需求:当上一首歌处于播放状态时，如果再次进入的页面的歌曲与正在播放的歌曲是同一首歌，
          就让当前页面进入播放状态
      拆分需求:
          问题一:如何知道上一首歌是哪一首
            缓存上一首歌的id
          问题二:如何知道上一首歌是否处于播放状态
            缓存上一首歌的播放状态
          问题三:如何知道用户进入该页面
            当onLoad触发时
          问题四:如何知道当前页面歌曲与上一首歌是否是同一首歌
            将上一首歌的id与当前展示页面的歌曲id进行对比
          问题五:如何让页面C3效果进入播放状态
            将data中的isplaying属性改为true
    */
    // let backgroundAudioManager = wx.getBackgroundAudioManager();
    let { isplaying, musicUrl, songObj, songId} =this.data;
    if (isplaying) {
      this.backgroundAudioManager.src = musicUrl;
      this.backgroundAudioManager.title = songObj.name;

      // 问题一: 如何知道上一首歌是哪一首
      appInstance.globalData.musicId = songId;
      // 问题二: 如何知道上一首歌是否处于播放状态
      appInstance.globalData.playState = true;
    } else {
      this.backgroundAudioManager.pause();

      // 问题一: 如何知道上一首歌是哪一首
      // but当代码能够进入这个判断,说明你歌曲已经处于播放状态,在播放时候已经存储过musicId
      // appInstance.globalData.musicId = songId;
      // 问题二: 如何知道上一首歌是否处于播放状态
      appInstance.globalData.playState = false;
    }
  },
  // 专门用于绑定音频相关监听
  addAudioListener(){
    /*需求:当歌曲处于播放状态,页面的C3效果变为播放
	        当歌曲处于暂停状态,页面C3效果变为暂停
      拆分需求:
        问题一:怎么知道背景音频处于什么状态
        解决:给背景音频绑定事件监听
        问题二:如何把页面的C3效果变为播放
        解决:将isplaying属性改为true
     */
    // let backgroundAudioManager = wx.getBackgroundAudioManager();
    // 绑定背景音频的播放事件
    // 虽然写法与addEventListener相似,都是函数调用,传入回调函数
    // 但是他只会是最后一个回调函数生效
    this.backgroundAudioManager.onPlay(() => {
      //问题:如果当前这首歌与上一首歌不是同一首,this不对
      console.log('play')
      if (appInstance.globalData.musicId===this.data.songId){
        this.setData({
          isplaying: true
        })
      }
      appInstance.globalData.playState = true;
    })
    // backgroundAudioManager.onPlay(() => {
    //   console.log('play1')
    //   this.setData({
    //     isplaying: true
    //   })
    // })
    // 绑定背景音频的暂停事件
    this.backgroundAudioManager.onPause(() => {
      if (appInstance.globalData.musicId === this.data.songId) {
        this.setData({
          isplaying: false
        })
      }
      appInstance.globalData.playState = false;
    })
    // 绑定背景音频的停止事件
    this.backgroundAudioManager.onStop(() => {
      if (appInstance.globalData.musicId === this.data.songId) {
        this.setData({
          isplaying: false
        })
      }
      appInstance.globalData.playState = false;
    })
    // 当背景音频时间更新时会触发
    this.backgroundAudioManager.onTimeUpdate(()=>{
      // console.log(this.backgroundAudioManager.currentTime)
      let { currentTime } = this.backgroundAudioManager;
      let { dt } = this.data.songObj;
      let scale = currentTime * 100000 / dt;
      // currentTime = moment(currentTime*1000).format("mm:ss")
      // console.log("scale",scale)
      // console.log("currentTime", currentTime)
      this.setData({
        currentTime,
        currentWidth: scale
      })
    })
    // 当歌曲自动播放结束时会触发
    this.backgroundAudioManager.startTime=178;
    this.backgroundAudioManager.onEnded(()=>{
      // console.log('onEnded');
      //切换播放下一首歌曲
      PubSub.publish('switchSong',"next");
    })
  },
  // 用户处理用户切换歌曲的操作
  switchSong(event){
    //通过id得知用户当前点击的按钮
    let { id } = event.currentTarget;
    // console.log(event.currentTarget)
    // console.log('switchSong')
    //发布方只需要将数据传递给订阅方,所以数据类型应该是任意类型
    PubSub.publish('switchSong',id);
  },
  // 专门用于获取歌曲详细信息
  async getMusicDetail(){

    //1.请求数据
    let result = await request('/song/detail', { ids: this.data.songId });
    // console.log(result)
    // console.log('2');

    //2.保存至data中
    // console.log(moment(result.songs[0].dt).format("mm:ss"))
    console.log(result.songs[0].dt)
    this.setData({
      songObj: result.songs[0],
      durationTime: result.songs[0].dt
      // durationTime: moment(result.songs[0].dt).format("mm:ss")
    })

    wx.setNavigationBarTitle({
      title: this.data.songObj.name
    })

    return Promise.resolve();
  },
  // 专门用于获取歌曲音频URL
  async getMusicUrl(){
    let musicUrlData = await request('/song/url', { id: this.data.songId });
    this.setData({
      musicUrl: musicUrlData.data[0].url
    })
    return Promise.resolve()
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    // 1.跳转页面时,通过query传参,对url进行拼接
    // 2.在onLoad中的形参options中,可以或得到所有的query键值对
    // console.log(options.songId);
    let {songId} = options;
    this.setData({
      songId
    })

    // 发送请求,获取歌曲详细信息
    await this.getMusicDetail();
    // setTimeout(()=>{console.log(result)},1000);
    // console.log('1');
    // 问题三: 如何知道用户进入该页面
    // 当onLoad触发时
    // 问题四: 如何知道当前页面歌曲与上一首歌是否是同一首歌
    // 将上一首歌的id与当前展示页面的歌曲id进行对比
    // 问题五: 如何让页面C3效果进入播放状态
    // 将data中的isplaying属性改为true
    let {musicId,playState} = appInstance.globalData;
    if (playState&&musicId === songId){
        this.setData({
          isplaying:true
        })
    }

    this.backgroundAudioManager = wx.getBackgroundAudioManager();
    this.addAudioListener();

    PubSub.subscribe('changeAudioId', async (msg, songId) => {
      console.log(msg, songId)
      this.setData({songId});
      // 请求歌曲详细信息,用于展示图片和歌曲名称
      await this.getMusicDetail();
      // 请求歌曲音频URL,为播放歌曲做准备
      await this.getMusicUrl();
      // 用于播放音频（但是他播放的是当前data中存放的musicUrl）
      this.changeAudioPlay();
    })

    // setInterval(()=>{
    //   console.log(this.backgroundAudioManager.currentTime)
    //   this.setData({
    //     currentTime: this.backgroundAudioManager.currentTime
    //   })
    // },1000)

    // console.log(musicUrlData)
    //3.动态渲染

    // let songObj=JSON.parse(options.songObj);
    // console.log('songObj', songObj)

    // 尝试修改appInstance中的数据
    // appInstance.globalData.msg = "我是修改之后的数据"
    // appInstance.data={};
    // appInstance.data.msg = "我是data中的数据"
    // 尝试读取全局唯一实例appInstance中的数据
    // console.log("msg", appInstance)
    // console.log("msg", appInstance.globalData.msg)

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