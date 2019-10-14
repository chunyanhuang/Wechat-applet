import wepy from 'wepy'

export default class extends wepy.mixin {
    data = {
       // 查询关键词
       query: '',
       // 商品分类
       cid: '',
       // 页码
       pagenum: 1,
       // 每页显示的数据
       pagesize: 10,
       // 商品列表
       goodslist:[],
       // 总数
       total:0,
       // 数据加载完
       isover: false,
       // 表示当前数据是否在请求
       isloading: false
    }
    // 将查询参数传递过来啦
    onLoad(options) {
        console.log(options)
        this.query = options.query || ''
        this.cid = options.cid || ''
        this.getGoodsList()
    }

    methods = {
        // 点击跳转到商品详情
        goGoodsDetail(goods_id){
            wepy.navigateTo({
                url: '/pages/goods_detail/main?goods_id=' + goods_id
            })
        }
    }

    // 获取商品列表
    async getGoodsList(cb) {
        this.isloading = true;
        const {data: res} = await wepy.get('/goods/search', {
            query: this.query,
            cid: this.cid,
            pagenum: this.pagenum,
            pagesize: this.pagesize
        })

        console.log(res)
        if(res.meta.status !== 200) {
            return wepy.baseToast()
        }

        this.goodslist = [...this.goodslist, ...res.message.goods];
        this.total = res.message.total;
        this.isloading = false;
        this.$apply()
        // 有回调才调用
        cb && cb()
    }

    // 触底
    onReachBottom(){
        // 若正在请求，则直接return
        if(this.isloading) {
            return 
        }
        if(this.pagenum * this.pagesize >= this.total) {
            this.isover = true;
            return
        }
        console.log('触底了')
        this.pagenum++
        this.getGoodsList()
    }

    // 下拉刷新
    onPullDownRefresh() {
        // 下拉刷新
        this.pagenum = 1;
        this.total = 0;
        this.goodslist = [];
        this.isover = this.isloading = false;
        this.getGoodsList(()=>{
            // 停止下拉刷新
            wepy.stopPullDownRefresh()
        })
        

    }
}
