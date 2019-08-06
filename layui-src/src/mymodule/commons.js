

//定义模块
layui.define(['form'], function(exports){

  var form = layui.form; //只有执行了这一步，部分表单元素才会自动修饰成功
  var $ = layui.$;

  var obj = {
      changeParentPlace: function () {
        return new Promise(function(resolve, reject){
        $.ajax({
            url: './demo1.json',
            type:'get',
            dataType:'json',
            success:function (data) {
              // console.log(data)
                // form.render('select'); //刷新select选择框渲染
                resolve(data);
            },
            error: function(error){
                reject(error)
            }
        })
      })
      }
  }
  //输出模块
  exports('common', obj);
});