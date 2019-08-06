
	//获得根目录
	var strFullPath = window.document.location.href;
	var strPath = window.document.location.pathname;
	var pos = strFullPath.indexOf(strPath);
	var prePath = strFullPath.substring(0, pos);
	var postPath = strPath.substring(0, strPath.substr(1).indexOf('/') + 1);
	var path = prePath;
	var directPath = strFullPath.substring(0, strFullPath.lastIndexOf("/") + 1);
	var basePath = prePath + postPath;
	
    // 为数组新增删除元素的方法
    Array.prototype.removeByValue = function(val) {
	  for(var i=0; i<this.length; i++) {
	    if(this[i] == val) {
	      this.splice(i, 1);
	      break;
	    }
	  }
	}
	
	/**
	* 为easyui的输入框 textbox 绑定回车事件
	* inputId 输入框ID
	* targetId 回车触发点击事件的按钮ID
	*/
	function enterEvent(inputId, targetId){
	
		//项目名称自动转换为大写
	   $('#'+inputId).textbox('textbox').bind('keyup', function(event) {
	                var tempValue = $(this).val();
	                if(event.keyCode == 13) {
	                	$("#"+targetId).click();
					}
	   });
	
	};
	
	//--------------------------工具方法-----------------------------

	//获取地址栏参数的方法
	function GetQueryString(name) {
	    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
	    var r = window.location.search.substr(1).match(reg);
	    console.log(window.location.search)
	    if (r != null) return unescape(r[2]);
	    return null;
	}
	//处理字符串尾端指定符号,不传入符号默认移除逗号
	function removeEndSymbol(str,symbol){
	    if(!symbol){
	        symbol = ',';
	    }
	    if(str.charAt(str.length-1) == symbol){
	        return str.substring(0, str.length-1);
	    }
	    return str;
	}