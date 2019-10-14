import wepy from 'wepy'

export default class extends wepy.mixin {
    data = {
        // 收货地址
        addressInfo: null,
        // 购物车所有选中的商品的列表
        cart:[],
        // 当前的登录状态
        islogin: false
    }

    // 订单页面加载期间读取收货地址
    onLoad(){
        this.addressInfo = wepy.getStorageSync('address') || null;

        // 过滤勾选的商品形成新数组
        const newArr = this.$parent.globalData.cart.filter(x=>x.ischeck)
        console.log(newArr)
        this.cart = newArr
    }

    methods = {
        // 选择收货地址
        // wepy.chooseAddress() 异步函数
        async chooseAddress(){
            const res = await wepy.chooseAddress().catch(err=>err)
            console.log(res)

            // 选择收货地址失败
            if(res.errMsg !== 'chooseAddress:ok') {
                return
            }

            this.addressInfo = res;
            wepy.setStorageSync('address', res);
            this.$apply()
        },

        // 获取用户信息
        async getUserInfo(userInfo){
            // 用户信息获取失败
            if(userInfo.detail.errMsg !== 'getUserInfo:ok') {
                return wepy.baseToast('获取用户信息失败')
            }
            console.log(userInfo)
            // 用户信息获取成功就获取登录凭证
            const loginRes = await wepy.login()
            console.log(loginRes)
            if(loginRes.errMsg !== 'login:ok') {
               return wepy.baseToast('微信登录凭证获取失败')
            }

           // 登录的参数
           const loginParams = {
               code: loginRes.code,
               encryptedData: userInfo.detail.encryptedData,
               iv: userInfo.detail.iv,
               rawData: userInfo.detail.rawData,
               signature: userInfo.detail.signature
           }
           // 发起登录请求
           const {data: res} = await wepy.post('/users/wxlogin', loginParams)
        
           console.log(res)
           if(res.meta.status !== 200) {
               return wepy.baseToast('微信登录失败')
           }

           // 登录成功
           wepy.setStroageSync('token', res.message.token)
           this.islogin = true;
           this.$apply()
           
        },

        // 支付订单
        async onSubmit(){
            // 订单总金额不能为0
            if(this.amount <= 0) {
                return wepy.baseToast('订单金额不能为0')
            }
            // 收货地址不能为空
            if(this.addressStr.length <= 0) {
                return wepy.baseToast('请选择收货地址')
            }

            // 1、创建订单
            const {data:createResult} = await wepy.post('/my/orders/create', {
                // 订单金额 元
                order_price: '0.01',
                consignee_addr: this.addressStr,
                // 接收字符串
                order_detail: JSON.stringify(this.cart),
                goods: this.cart.map(x=>{
                    return {
                        goods_id: x.id,
                        goods_number: x.count,
                        goods_price: x.price
                    }
                })
            })

            // 创建订单失败
            if(createResult.meta.status !== 200) {
                return wepy.baseToast('创建订单失败')
            }

            // 创建订单成功 orderInfo订单信息
            const orderInfo = createResult.message
            console.log(orderInfo)

            // 2.生成预支付订单
            // order_number  订单编号
            const {data: orderResult} = await wepy.post('/my/orders/req_unifiedorder', {
                order_number: orderInfo.order_number
            })

            // 生成预支付订单失败
            if(orderResult.meat.status !== 200) {
                return wepy.baseToast('生成预支付订单失败')
            }

            // 走支付流程
            // 3. 调用微信支付的API: wepy.requestPayment
            const payReault = await wepy.requestPayment(orderResult.message.pay).catch(err=>err)

            // 用户取消了支付
            if(payReault.errMsg === 'requestPayment:fail cancel') {
                return wepy.baseToast('您已经取消了支付')
            }

            // 用户完成了支付的流程
            // 4. 检查用户支付的结果
            const {data: payCheckResult} = await wepy.post('/my/orders/chkOrder', {
                order_number: orderInfo.order_number
            })

            if(payCheckResult.meta.status !== 200) {
                return wepy.baseToast('订单支付失败')
            }

            // 5. 提示用户支付成功
            wepy.showToast({
                title: '支付成功'
            })

            // 6. 跳转到订单列表页面
            wepy.navigateTo({
                url: '/pages/orderlist'
            })
        }
    }

    

    computed = {
        isHaveAddress(){
            if(this.addressInfo === null) {
                return false
            }
            return true;
        },

        // 收货地址
        addressStr(){
            if(this.addressInfo === null) {
              return ''
            }

            return this.addressInfo.provinceName + this.addressInfo.cityName + this.addressInfo.countyName + this.addressInfo.detailInfo
        },

        // 当前订单总价格
        amount(){
            let total=0;
            this.cart.forEach(x=>{
                total += x.price * 100 * x.count
            })

            return total
        }
    }
}