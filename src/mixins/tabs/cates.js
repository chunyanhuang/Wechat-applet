import wepy from 'wepy'

export default class extends wepy.mixin {
  data = {
    //分类数据
    cateList: [],
    // 默认被激活的项
    active: 0,
    // 当前屏幕可用高度
    wh: 0,
    // 所有的二级分类数据
    secondCate: []
  }

  onLoad(){
    this.getWindowHeight()
    this.getCateList()
  }

  methods = {
    onChange(e){
      // e.detail 是点击项的索引
      console.log(e.detail)
      // 点击的一级分类的二级分类数据
      this.secondCate = this.cateList[e.detail].children
      console.log(this.secondCate)
    },
    // 点击时跳转到商品列表页面，同时把上皮 分类的cid传递过去
    goGoodsList(cid){
      console.log(cid)
      wepy.navigateTo({
        url: '/pages/goods_list?cid=' + cid
      })
    }
  }

  // 获取屏幕高度
  async getWindowHeight(){
    const res = await wepy.getSystemInfo();
    console.log(res)

    if(res.errMsg === 'getSystemInfo:ok') {
      this.wh = res.windowHeight
      this.$apply()
    }
  }

  // 获取分类数据
  async getCateList(){
    const {data:res} = await wepy.get('/categories')

    if(res.meta.status != 200) {
      return wepy.baseToast()
    }

    this.cateList = res.message
    // 页面初次加载时
    this.secondCate = res.message[0].children
    this.$apply()
    console.log(this.cateList)
  }
}