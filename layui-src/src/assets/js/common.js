/**公共属性 */
var loadMsgDatagrid = '数据加载中，请等待......';
/** 
 * 分页组件 文本展示
 */
function getPagerFun(tableid) {
  var p = $(tableid).datagrid('getPager');
  $(p).pagination({
    // pageSize: 10,//每页显示的记录条数，默认为10  
    pageList: [10, 20, 30],// 可以设置每页记录条数的列表  
    // links:10,// 可以设置每页记录条数的列表  
    // beforePageText: '第',//页数文本框前显示的汉字  
    // afterPageText: '页    共 {pages} 页',
    // displayMsg: '当前显示 {from} - {to} 条记录   共 {total} 条记录',
    beforePageText: '',//页数文本框前显示的汉字  
    afterPageText: '    / {pages} ',
    displayMsg: ' {from} - {to}    共 {total} 条',
  });
}


function isRefreshFristPage(tableid, data) {
  var options = $(tableid).datagrid('getPager').data("pagination").options;
  var curr = options.pageNumber;
  var total = data.total;
  var max = Math.ceil(total / options.pageSize);
  if (curr !== 1 && curr > max) {
    return true;
  } else {
    return false
  }
}
/** 高级查询切换以及收起时，table高的计算与设置 */
function getTableHeight() {
  var parentH = $('#tableBox').height();
  var fristChildH = $('.tb-box').height();
  var lastChildH = parentH - fristChildH - 35;
  $('#tableBox .datagrid-view').css('height', lastChildH + 'px')
  $('#tableBox .datagrid-body').css('height', (lastChildH - 32) + 'px')
}

/**
 * 时间戳转日期字符串
 * var time1 = new Date(1539014400000).Format("yyyy-MM-dd");
 * var time2 = new Date(1539014400000).Format("yyyy-MM-dd HH:mm:ss"); 
 */
Date.prototype.Format = function (fmt) {
  var o = {
    "M+": this.getMonth() + 1, //月份 
    "d+": this.getDate(), //日 
    "h+": this.getHours(), //小时 
    "m+": this.getMinutes(), //分 
    "s+": this.getSeconds(), //秒 
    "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
    "S": this.getMilliseconds() //毫秒 
  };
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
  }
  for (var k in o) {
    if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
  }
  return fmt;
}
/**
 * 验证是否为日期格式
 */
function isDateStartEnd(strData) {

  var reg = /^(\d+)-(\d{1,2})-(\d{1,2}) ~ (\d+)-(\d{1,2})-(\d{1,2})$/;
  if (strData) {
    if (!reg.test(strData)) {
      console.log('strData if if', strData)
      return false;
    } else {
      console.log('strData if else', strData)
      return true;
    }
  } else {
    console.log('strData else', strData)
    return true;
  }
}

/***
 * 
 *  @param openUrl 将要打开子页面的url
 *  @param title  子页面的title
 *  @param areaArr 子页面的 宽高
 *  @param btnArr 子页面是否实现按钮，按钮的数量内容
 *  @param parentCallName 父页面的回调函数
 *  @param childFuncName 子页面将要触发的函数
 *  @param childBtnName 子页面元素点击
 *  @param offset 子页面弹出位置
 * 
 */

// 弹出框函数
function layerOpenFun(openUrl, title, areaArr, btnArr, parentCallName, childFuncName, type, childBtnName, shadeClose, offset, anim) {
  layer.open({
    type: type ? type : 2,
    title: title,
    skin: 'mylayui-layer-molv',
    area: areaArr,
    btn: btnArr,
    shadeClose: shadeClose || false,
    offset: offset || 'auto',
    anim: anim || '0',
    content: openUrl, //这里content是一个URL，如果你不想让iframe出现滚动条，你还可以content: ['http://sentsin.com', 'no']
    yes: function (index) {
      //当点击‘确定’按钮的时候，获取弹出层返回的值
      var iframeWin = window["layui-layer-iframe" + index], iframeWinRes = '';
      var body = layer.getChildFrame('body', index);
      if (childBtnName) {
        $(body).find(childBtnName).trigger('click');
      } else {
        $(body).find('#btn_sub').trigger('click');
      }
      if (childFuncName) {
        if ('string' === typeof childFuncName) {
          if (iframeWin[childFuncName]) {
            iframeWinRes = iframeWin[childFuncName]();
          }
        } else {
          iframeWin.childFuncName = childFuncName;
          iframeWinRes = iframeWin.childFuncName();
        }
      } else {
        iframeWinRes = iframeWin.InitObj.openCallback();
      }
      if (parentCallName) {
        'string' === typeof parentCallName ? window[parentCallName](iframeWinRes, index) : parentCallName(iframeWinRes, index)
      }
    }
  });
}

// 询问框
function layerConfirmFun(msg, titles, btnArr, yesCallName, yesParam, cancelCallName) {
  layer.confirm(msg, {
    icon: 3,
    btn: btnArr,
    title: titles || '提示'
  }, function (index) {
    if (yesCallName) {
      yesCallName(yesParam, index)
    }
  }, function (index) {
    if (cancelCallName) {
      cancelCallName(index)
    }
  })
}

/**
 * 根据按钮获取权限 callName(funCodeCallback)  可有可无
 * completeCall(funCodeComplete) 可有可无判断是否已经执行完毕 一个页面可能多次调用 funCode
 * */
function funCode(codeHtml, completeCall, callName) {
  var funCodeUrl = 'functionController.do?getUserFunctionByCode';
  var funcodeArr = $("[data-funCode]"), attrs = 'data-funCode';
  var codes = codeHtml || funcodeStrs(funcodeArr, attrs);
  console.log('codes', codes)
  var objParam = { codes: codes, completeCall: completeCall, callName: callName }
  if (codes) {
    ajaxRequest(funCodeUrl, { functionCode: codes }, funCodeAjaxCallback, false, false, objParam)
  } else {
    if (objParam.completeCall) {
      return objParam.completeCall(true);
    }
  }
}
// 获取权限回调
function funCodeAjaxCallback(res, objParam) {
  if (res.success) {
    console.log('if')
    if (objParam.callName) {
      console.log('if if')
      return objParam.callName(res, objParam);
    } else {
      console.log('if else')
      var objParamArr = objParam.codes.split(',');
      if (res.obj && res.obj.length > 0) {
        $.each(res.obj, function (i, v) {
          if (objParam.codes.indexOf(v.functioncode) > -1) {
            $('[data-funCode=' + v.functioncode + ']').show();
          }
        })
        if (objParam.completeCall) {
          return objParam.completeCall(true);
        }
      } else {
        $.each(objParamArr, function (i, v) {
          $('[data-funCode=' + v + ']').hide();
        })
        if (objParam.completeCall) {
          return objParam.completeCall(true);
        }
      }
    }

  }
}
/**
	 * 简单封装一个，我自己用哈。
	 * 注意：如果是同步请求（isAsync = false），则蒙版效果无法实现
	 * @param url 请求地址
	 * @param dataJson 请求参数（json格式）
	 * @param successFunc 请求成功的回调函数，入参是标准的AjaxJson
	 * @param useMask 是否使用蒙版，boolean值
	 * @param isAsync 是否异步，boolean值，默认异步请求
	 * 20180910
	 */
function ajaxRequest(url, dataJson, successFunc, useMask, isAsync, succFuncMyParam) {
  var layerAjaxMaskIndex;
  if (isAsync === undefined) {	// 如果没传这个值，默认就是异步操作
    isAsync = true;
  }
  // 发送请求
  $.ajax({
    url: url
    , async: isAsync
    , data: dataJson
    , dataType: 'json'
    , type: 'post'
    , beforeSend: function () {
      if (useMask) {
        layerAjaxMaskIndex = SHOW_LOAD_LAYER('正在执行...');
      }
    }
    , success: function (res) {
      if (useMask) {
        layer.close(layerAjaxMaskIndex);
      }
      successFunc(res, succFuncMyParam);
    }
  });
}

// 组装权限按钮的 functionCode
function funcodeStrs(funcodeArr, attrs) {
  var strs = ''
  $.each(funcodeArr, function (i, v) {
    if ($(v).attr(attrs)) {
      strs += $(v).attr(attrs) + ','
    }
  })
  return strs.slice(0, -1);
}


// 是否为正整数
function isPositiveInteger(num) {
  if (!(/(^[1-9]\d*$)/.test(num))) {
    return false;
  }
  return true;
}
// 校验手机号
function checkPhone(phone) {
  var phoneTest = phone.trim();
  if (!(/^1[34578]\d{9}$/.test(phoneTest))) {
    return false;
  }
  return true;
}
// 校验手机号和固定电话
function checkTelephone(phone) {
  var phoneTest = phone.trim();
  var reg = /^((\d{8})|(1[34578]\d{9}))$/;
  if (!reg.test(phoneTest)) {
    return false
  }
  return true;
}

/**
 * 点击功能按钮 需要提示时
 * @param {event} event 
 * @param {提示信息} msg 
 */
function btnTipMsg(event, msg) {
  var tipIndex;
  tipIndex = layer.tips('<span style="color:#fff">' + msg + '</span>', $(event.target), {
    tips: 3,
    skin: 'tips-msg',
    time: 20000
  });
  $(event.target).mouseleave(function () {
    setTimeout(function () {
      layer.close(tipIndex)
    }, 500)
  });
}

// 遮罩层    msg(提示信息):'正在处理...'
function SHOW_LOAD_LAYER(msg) {
  return layer.msg(msg, { icon: 16, shade: [0.5, '#f5f5f5'], scrollbar: false, time: 100000 });
}
// 提示框右下角 数据操作是否成功
function layerAlertFun(msg, icon, btnArr, offsets) {
  layer.alert(msg, { icon: icon, btn: btnArr, shade: 0, time: 0, offset: offsets || 'auto' });
}
// 表单验证提示信息
function formTipFun(msg, element, tips) {
  element.focus();
  return layer.tips(msg, element, { tips: tips || 1, skin: 'form-tips-msg' });
}
// 判断浏览器
function myBrowser() {
  var userAgent = navigator.userAgent.toLocaleLowerCase(); //取得浏览器的userAgent字符串
  var isOpera = userAgent.indexOf("opera") > -1;
  if (isOpera) { //判断是否Opera浏览器
    return "opera"
  };
  if (userAgent.indexOf("firefox") > -1) { //判断是否Firefox浏览器
    return "FF";
  };
  if (userAgent.indexOf("chrome") > -1) {
    return "Chrome";
  };
  if (userAgent.indexOf("safari") > -1) { //判断是否Safari浏览器
    return "Safari";
  };
  if (userAgent.indexOf("trident") > -1 || userAgent.indexOf("msie") > -1) { //判断是否IE浏览器
    return "IE";
  };
  return browserType
}
function IEVersion() {
  var userAgent = navigator.userAgent; //取得浏览器的userAgent字符串  
  var isIE = userAgent.indexOf("compatible") > -1 && userAgent.indexOf("MSIE") > -1; //判断是否IE<11浏览器  
  var isEdge = userAgent.indexOf("Edge") > -1 && !isIE; //判断是否IE的Edge浏览器  
  var isIE11 = userAgent.indexOf('Trident') > -1 && userAgent.indexOf("rv:11.0") > -1;
  if (isIE) {
    var reIE = new RegExp("MSIE (\\d+\\.\\d+);");
    reIE.test(userAgent);
    var fIEVersion = parseFloat(RegExp["$1"]);
    if (fIEVersion == 7) {
      return 7;
    } else if (fIEVersion == 8) {
      return 8;
    } else if (fIEVersion == 9) {
      return 9;
    } else if (fIEVersion == 10) {
      return 10;
    } else {
      return 6;//IE版本<=7
    }
  } else if (isEdge) {
    return 'edge';//edge
  } else if (isIE11) {
    return 11; //IE11  
  } else {
    return -1;//不是ie浏览器
  }
}
//检测浏览器可否使用localStorage
function storeCapable() {
  try {
    window.localStorage.setItem('localStorage', 'capable');
    window.localStorage.removeItem('localStorage');
    return true;
  } catch (e) {
    return false;
  }
}

function storeFunc(storageName, datas) {
  if (storeCapable()) {
    datas ? localStorage.setItem(storageName, JSON.stringify(datas)) : ''
  } else {
    layerAlertFun('您的浏览器不支持localStorage', '5', [])
  }
}
function renderContent(storageName) {
  if (storeCapable()) {
    var storageName = localStorage.getItem(storageName), datas = ''
    if (storageName) {
      datas = JSON.parse(storageName)
    }
    return datas
  } else {
    layerAlertFun('您的浏览器不支持localStorage', '5', [])
  }
}
function storeSessionCapable() {
  try {
    window.sessionStorage.setItem('sessionStorage', 'capable');
    window.sessionStorage.removeItem('sessionStorage');
    return true;
  } catch (e) {
    return false;
  }
}
function storeSessionFunc(storageName, datas) {
  if (storeSessionCapable()) {
    datas ? sessionStorage.setItem(storageName, JSON.stringify(datas)) : ''
  } else {
    layerAlertFun('您的浏览器不支持sessionStorage', '5', [])
  }
}
function cleartSessionFunc(storageName) {
  if (storeSessionCapable()) {
    sessionStorage.removeItem(storageName)
  } else {
    layerAlertFun('您的浏览器不支持localStorage', '5', [])
  }

}
function renderContentSession(storageName) {
  var storageName = sessionStorage.getItem(storageName), datas = ''
  if (storageName) {
    datas = JSON.parse(storageName)
  }

  return datas
}
// 获取地址栏参数的方法
function GetQueryString(name) {
  var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
  var r = window.location.search.substr(1).match(reg);
  if (r != null) return unescape(r[2]);
  return null;
}

/*** 排序函数
 *  var data = datas.sort(compare("orderNo"));
 **/
function compare(pro) {
  return function (obj1, obj2) {
    var val1 = Number(obj1[pro]);
    var val2 = Number(obj2[pro]);
    if (val1 > val2) { // 倒序
      return 1;
    } else if (val1 < val2) {
      return -1;
    } else {
      return 0;
    }
  }
}
/**
 * getFloatStr('0000.1');  //0.10  
 * getFloatStr('qwe');       //0.00  
 * getFloatStr('256');       //256.00  
 */
//将传入数据转换为字符串,并清除字符串中非数字与.的字符  
//按数字格式补全字符串  
function getFloatStr(num) {
  num += '';
  num = num.replace(/[^0-9|\.]/g, ''); //清除字符串中的非数字非.字符  
  if (/^0+/) //清除字符串开头的0  
    num = num.replace(/^0+/, '');
  if (!/\./.test(num)) //为整数字符串在末尾添加.00  
    num += '.00';
  if (/^\./.test(num)) //字符以.开头时,在开头添加0  
    num = '0' + num;
  num += '00';        //在字符串末尾补零  
  num = num.match(/\d+\.\d{2}/)[0];
  return num;
};
/** 数字转为货币
 * formatMoney(54321); // $54,321
 * formatMoney(12345, 0, "£ "); // £ 12,345
 * formatMoney(12345, 2, "£ "); // £ 12,345.00
 * formatMoney(12345.232, 2, "£ "); // £ 12,345.23
 */
function formatMoney(number, places, symbol, thousand, decimal) {
  number = number || 0;
  places = !isNaN(places = Math.abs(places)) ? places : 2;
  symbol = symbol !== undefined ? symbol : "$";
  thousand = thousand || ",";
  decimal = decimal || ".";
  var negative = number < 0 ? "-" : "",
    i = parseInt(number = Math.abs(+number || 0).toFixed(places), 10) + "",
    j = (j = i.length) > 3 ? j % 3 : 0;
  return symbol + negative + (j ? i.substr(0, j) + thousand : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousand) + (places ? decimal + Math.abs(number - i).toFixed(places).slice(2) : "");
}

/**
 * 数据字典接口查询
 */

function getListByGroupId(dictGroupId, callName, param) {
  ajaxRequest('dictionaryController.do?getListByGroupId', { 'dictGroupId': dictGroupId }, callName, false, true, param);
}

