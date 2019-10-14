import wepy from 'wepy'

export  default class extends wepy.mixin {
    data = {
        // 搜索框中的默认内容
        value: '',
        // 搜索内容列表
        suggestList: [],
        // 搜索历史列表
        kwList: []
    }

    onLoad(){
        const kwList = wx.getStorageSync('kw') || [];
        this.kwList = kwList;
        console.log(kwList)
    }

    methods = {
        // 搜索关键词发生变化触发
        onChange(e){
            console.log(e.detail)
            this.value = e.detail.trim()
            if(e.detail.trim().length <= 0) {
                this.suggestList = []
                return
            }
            // 发送请求获取搜索的数据
            this.getSuggestList(e.detail)
        },
        // 触发了搜索
        onSearch(e){
            // e.detail 当前输入框的最新值
            const kw = e.detail.trim();
            console.log(e.detail)
            if(kw.length <= 0) {
                return
            }

            if(this.kwList.indexOf(kw) === -1) {
                this.kwList.unshift(kw)
            }
            // 跳转之前将信息存储
            this.kwList = this.kwList.slice(0,10)
            wepy.setStorageSync('kw', this.kwList)

            // 点击回车跳转到上皮列表页
            wepy.navigateTo({
                url: '/pages/goods_list?query=' + kw
            })
        },
        // 取消时
        onCancel(){
            this.suggestList = []
        },

        // 点击搜索列表项跳转
        goGoodsDetail(goods_id){
            wepy.navigateTo({
                url: '/pages/goods_detail/main?goods_id=' + goods_id 
            })
        },

        // 点击每个tag 跳转到相应的列表
        goGoodsList(query){
            wepy.navigateTo({
                url: '/pages/goods_list?query=' + query
            })
        },

        //  清楚搜索历史
        clearHistory(){
            this.kwList = [];
            wepy.setStorageSync('kw', [])
        }
    }

    // 计算属性
    computed = {
        // true 展示搜索历史区域
        // false 展示搜索列表区
        isShowHistory() {
            if(this.value.length <= 0) {
                return true 
            }
            return false
        }
    }

    // 获取搜索数据
    async getSuggestList(searchStr){
      const { data: res } = await wepy.get('/goods/qsearch', { query: searchStr } )

        console.log(res)
      // 请求失败
      if(res.meta.status !== 200) {
         return wepy.baseToast()
      }

      // 请求成功
      this.suggestList = res.message
      this.$apply()
    }
}