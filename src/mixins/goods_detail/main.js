import wepy from 'wepy'

export default class extends wepy.mixin {
    data = {
        // 商品id
        goods_id: '',
        // 商品详情
        goodsInfo: {},
        // 收货地址
        addressInfo: null
    }
    onLoad(options) {
        console.log('okk')
        console.log(options, 'ok')
        this.goods_id = options.goods_id;
        
        // 获取商品详情
        this.getGoodsInfo()
        
    }

    methods = {
        preview(current){
          wepy.previewImage({
              urls: this.goodsInfo.pics.map(x => x.pics_big),
              current: current
          })
        },

        async chooseAddress(){
            const res = await wepy.chooseAddress().catch(err => err);

            console.log(res)

            if(res.errMsg !== 'chooseAddress:ok') {
                return wepy.baseToast('获取收货地址')
            }

            this.addressInfo = res
            wepy.setStorageSync('address', res)
            this.$apply()
        },
        // 加入购物车
        addToCart(){
            //    console.log(this.goodsInfo)
            console.log(this.$parent.globalData)
            this.$parent.addGoodsToCart(this.goodsInfo)
            wepy.showToast({
                title: '已加入购物车',
                icon: 'success'
            })
        }
    }


    computed = {
        addressStr(){
            if(this.addressInfo === null) {
                return '请选择收货地址'
            }
            const addr = this.addressInfo
            const str = addr.provinceName + addr.cityName + addr.countyName + addr.detailInfo
            return str
        },
        
        // 所有已经勾选的商品数量
        total(){
            return this.$parent.globalData.total
        }
    }

    // 获取商品详情
    async getGoodsInfo(){
        const { data: res } = await wepy.get('/goods/detail', {
            goods_id: this.goods_id
        })

        console.log(res)
        if(res.meta.status !== 200) {
            return wepy.baseToast()
        }

        this.goodsInfo = res.message
        this.$apply()
    }
}