import wepy from 'wepy'

export default class extends wepy.mixin {
  data = {
    // 轮播图数据
    swiperList: [],
    // 分类数据
    cateItems:[],
    // 楼层数据
    floorData: []
  }

  // 页面生命周期函数
  // 页面一加载时 就请求轮播图数据，分类数据和楼层数据
  onLoad(){
    this.getSwiperData()
    this.getCateItems()
    this.getFloorData()
  }
  onShow(){
    // 渲染购物车角标
    this.$parent.renderCartBadge()
  }

  // 在wepy中，@定义的事件要放到methods中处理
  methods = {
    // 点击楼层中的每一张图片，都跳转到商品的列表页面
    goGoodsList(url){
      wepy.navigateTo({
        url
      })
    }
  }

  // 自定义事件要放到与methods平级的地方
  // 获取轮播图数据
  async getSwiperData(){
    const {data: res} = await wepy.get('/home/swiperdata')
    // const { data: res } = await wepy.request({
    //   url: 'https://www.zhengzhicheng.cn/api/public/v1/home/swiperdata',
    //   method: 'GET',
    //   data: {}
    // })

    console.log(res)
    // return;
    if(res.meta.status != 200) {
      // return console.log('获取数据失败')
      return wepy.baseToast()
    }

    this.swiperList = res.message
    this.$apply();

  }

  // 获取分类相关的数据
  async getCateItems(){
    const {data: res} = await wepy.get('/home/catitems')

    console.log(res)

    if(res.meta.status !=200) {
      return wepy.baseToast()
    }

    this.cateItems = res.message
    this.$apply()
  }

  // 获取楼层数据
  async getFloorData(){
    const {data: res} = await wepy.get('/home/floordata')

    if(res.meta.status != 200) {
      return wepy.baseToast()
    }

    this.floorData = res.message
    this.$apply()
    console.log(this.floorData)
  }

  
}