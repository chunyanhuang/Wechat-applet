import wepy from 'wepy'

export default class extends wepy.mixin {
    data = {
        // 购物车
        cart: []
    }

    onLoad(){
        // 将全局购物车信息加载到当前页面
        this.cart = this.$parent.globalData.cart
    }

    methods = {
        // 监听商品数量变化
        countChanged(e) {
            // 获取变化后的新值
            const count = e.detail;
            // 自定义属性传递的参数商品的id
            const id = e.target.dataset.id;
            console.log(id, count)
            // 更新商品
            this.$parent.updateGoodsCount(id, count)
        },

        // 改变商品复选框的状态
        statusChanged(e){
            const status = e.detail;
            const id = e.target.dataset.id;
            console.log(status, id)
            this.$parent.updateGoodsStatus(id, status)
        },

        // 删除商品
        close(id){
            console.log(id)
            this.$parent.removeGoodsById(id)
        },

        // 点击全选按钮时
        onFullCheckChanged(e){
            console.log(e.detail)
            this.$parent.updateAllGoodsStatus(e.detail)
        },

        // 提交订单
        SubmitOrder(){
            if(this.amount <= 0) {
                return wepy.baseToast('订单金额不能为空')
            }

            wepy.navigateTo({
                url: '/pages/order'
            })
        }
    }

    computed = {
        isEmpty() {
            if(this.cart.length <= 0) {
                return true
            }
            return false
        },

        // 计算商品总价
        amount(){
            let total = 0;
            this.cart.forEach(x=>{
                if(x.ischeck) {
                    total += x.price * 100 * x.count
                }
            })
            return total 
        },

        // 如果购物车长度 === 购物车中选中的商品的长度  全选按钮的状态跟随所有商品的选中状态
        isFullChecked(){
            // const allCount = this.cart.length;
            // let c = 0;
            // this.cart.forEach(x => {
            //     if(x.ischeck) {
            //         c++
            //     }
            // })
            // return allCount === c

            return this.cart.every(x => x.ischeck)
        },

        
    }
}