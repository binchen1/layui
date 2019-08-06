
//定义模块
layui.define(['form'], function(exports){

  var form = layui.form; //只有执行了这一步，部分表单元素才会自动修饰成功
  var $ = layui.$;

  var obj = {
      hello: function(str){
        // alert('Hello '+ (str||'mymod'));
        layer.msg('加载中...'+(str||'mymod'))
      }
  }
  //输出模块
  exports('hello', obj);
});