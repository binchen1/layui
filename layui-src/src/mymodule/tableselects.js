
//定义模块
layui.define(['table'], function(exports){

  var form = layui.form; //只有执行了这一步，部分表单元素才会自动修饰成功
  var $ = layui.$;
  var table=layui.table

  var obj = {
      trIndex:'', 
      hello: function(str){
        // alert('Hello '+ (str||'mymod'));
        layer.msg('加载中...'+(str||'mymod'))
      },
      resultDownFun: function(a, e){
        console.log(a)
        console.log(e)
        // table中 下拉选择
        this.closeTipsFun();
        var id = $(a).attr('data-index'); value = Number(e.target.tabIndex);
        console.log(id,value)
        if (value !== -1) { //选中数据不等于-1 就更改数据，数组index与行号数相同
          console.log(tableData)
          tableData.data[id].wealth = value; //根据行号更改数据的值，行号与数组号一一对应
          tableIns.reload({ data: tableData.data })
        }
      },
      closeTipsFun: function() {
        layer.close(layer.tips()); this.trIndex = ''
      },
      selectDemoFun(obj) {  // select 下拉事件处理函数
        console.log(obj)
        var arr = ['财富', '权利', '智慧']
        var lowerTrIndex = parseInt(obj.tr[0].dataset.index) + ''; //获取本次行号
        console.log(lowerTrIndex,this.trIndex)
        if (this.trIndex === lowerTrIndex) { // 连续两次两次点击行号相同，关闭tips,并把行号置为空
          console.log('if')
          this.closeTipsFun();
          return ''
        } else { // 打开tips选择
          console.log('else')
          trIndex = lowerTrIndex;
          var innerHtml = '  <dl  style="display:block"  data-index=' + lowerTrIndex 
          + 'onclick=this.resultDownFun(this,event)> '
          innerHtml += '    <dd tabindex="0">财富 </dd> '
          innerHtml += '    <dd tabindex="1">权利</dd> '
          innerHtml += '    <dd tabindex="2">智慧</dd> '
          innerHtml += '  </dl> '
          return innerHtml
          
        }
  
      }

  }
  console.log('61',obj)
  //输出模块
  exports('tableselects', obj);
});

