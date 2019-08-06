
/**
 * 文件上传通用弹窗组件：调用会弹窗进行文件选择和上传,支持失败重传,需要指定目录
 * 
 * 使用方法:
 * 1.页面加载本js
 * 2.调用goUploadPage(folderId)方法,folderId必传
 * 3.调用页提供uploadCallBack(tsAttachments)方法以便回调,回调时传入数据demo如下:
 * [{id: "4028822065a21b7a0165a2614134002a", businessKey: null, subclassname: null, attachmenttitle: "RTX截图未命名.jpg", realpath: "http://192.168.2.4:8801/fileShare/A03/images/2018/28c50135-8f3f-4e9b-8723-2cb958f1e2a1.jpg"},{...}]
 * */


// 跳转文件上传页面
var uploadWindowIndex, deletes, download;
function goUploadPage(folderId, deleteFiles, downloadFiles) {
  deletes = deleteFiles, download = downloadFiles
  var url = 'uploadController.do?goLayuiUploadPage&folderId=' + folderId;
  uploadWindowIndex = layerCreateWindow('文件上传', url, ['确定', '取消'], ['80%', '90%'], '', '', '', 'uploadResult');
}

//上传窗口回调
function uploadFinish(tsAttachments) {
  // tsAttachments.length > 0 ? uploadCallBack(tsAttachments) : ''
  uploadCallBack(tsAttachments)
  layer.close(uploadWindowIndex);
}
// 删除文件
function deleteFiles(delId) {
  console.log('delId',delId)
  //调用文本面
  var fnType = typeof (deletes);
  if (fnType == "function") {
    var fnType = typeof (deletes);
    window.deletes = deletes;
    window.deletes(delId);
  }
  else if (fnType == "string") {
    if (window[deletes]) {
      window[deletes](delId);
    }

  }

}
// 下载文件
function downloadFiles(delId) {
  var fnType = typeof (download);
  if (fnType == "function") {
    var fnType = typeof (download);
    window.download = download;
    window.download(delId);
  }
  else if (fnType == "string") {
    if (window[download]) {
      window[download](delId);
    }

  }
}











/**
 * layer创建添加或编辑窗口
 *
 * @param title 字符串
 * @param url 字符串
 * @param btnsArr 数组
 * @param areaArr 数组
 * @param callBackName 字符串 父容器中的方法名，点击确定时调用
 * @param childBtnName 字符串 点击确定，触发子容器中对应parentBtnName按钮的点击事件
 * @param type 整数 1代表内容加载本地dom数据，2代表加载远程数据
 * @param childFuncName 字符串 点击确定，调用子容器中的同名方法
 * 
 * @return int 返回打开窗口的index值，可用于父容器回调函数关闭弹窗
 */
function layerCreateWindow(title, url, btnArr, areaArr, childBtnName, callBackName, type, childFuncName) {
  if (layer) {
    var index = layer.open({
      skin: 'layui-layer-molv',
      maxmin: false,
      type: type ? type : 2,
      title: title,
      content: url,
      btn: btnArr,
      area: areaArr,
      yes: function (index, layero) { 
        var body = layer.getChildFrame('body', index);
        var iframeWin = window[layero.find('iframe')[0]['name']];
        if (childBtnName) {
          $(body).find(childBtnName).trigger('click');
        } else {
          $(body).find('#btn_sub').trigger('click');
        }

        if (callBackName) {

          var fnType = typeof (callBackName);

          //参数callBackName类型为function，则直接调用
          if (fnType == "function") {
            callBackName();
          }
          //参数callBackName类型为string，则调用同名方法
          else if (fnType == "string") {
            if (window[callBackName]) {
              window[callBackName]();
            }
          }
        }

        //调用子容器的方法
        if (childFuncName) {
          var fnType = typeof (childFuncName);

          if (fnType == "function") {
            iframeWin.childFuncName = childFuncName;
            iframeWin.childFuncName();
          }
          else if (fnType == "string") {
            if (iframeWin[childFuncName]) {
              iframeWin[childFuncName]();
            }
          }
        }
      }
    });
    return typeof (index) == 'number' ? index : 0;
  } else {
    createwindow(title, url, areaArr[0], areaArr[1]);
    return 0;
  }
}

/**
 * 创建添加或编辑窗口
 *
 * @param title
 * @param addurl
 * @param saveurl
 */
function createwindow(title, addurl, width, height) {
  width = width ? width : 700;
  height = height ? height : 400;
  if (width == "100%" || height == "100%") {
    width = window.top.document.body.offsetWidth;
    height = window.top.document.body.offsetHeight - 90;
  }
  //--author：JueYue---------date：20140427---------for：弹出bug修改,设置了zindex()函数
  if (typeof (windowapi) == 'undefined') {
    $.dialog({
      content: 'url:' + addurl,
      lock: true,
      zIndex: getzIndex(),
      width: width,
      height: height,
      title: title,
      opacity: 0.3,
      cache: false,
      ok: function () {
        iframe = this.iframe.contentWindow;
        saveObj();
        return false;
      },
      cancelVal: '关闭',
      cancel: true /*为true等价于function(){}*/,
    });
  } else {
    W.$.dialog({
      content: 'url:' + addurl,
      lock: true,
      width: width,
      zIndex: getzIndex(),
      height: height,
      parent: windowapi,
      title: title,
      opacity: 0.3,
      cache: false,
      ok: function () {
        iframe = this.iframe.contentWindow;
        saveObj();
        return false;
      },
      cancelVal: '关闭',
      cancel: true /*为true等价于function(){}*/
    });
  }
  //--author：JueYue---------date：20140427---------for：弹出bug修改,设置了zindex()函数
}

/**
 * 设置 window的 zIndex
 * @param flag true: 不增量(因为 tip提示经常使用 zIndex, 所以如果是 tip的话 ,则不增量)
 * @returns
 */
function getzIndex(flag) {
  var zindexNumber = getCookie("ZINDEXNUMBER");
  if (zindexNumber == null) {
    zindexNumber = 2010;
    setCookie("ZINDEXNUMBER", zindexNumber);
    //zindexNumber = 1980;
  } else {
    if (zindexNumber < 2010) {
      zindexNumber = 2010;
    }
    var n = flag ? zindexNumber : parseInt(zindexNumber) + parseInt(10);
    setCookie("ZINDEXNUMBER", n);
  }
  return zindexNumber;
}

/* 设置 cookie  */
function setCookie(c_name, value, expiredays) {
  var exdate = new Date();
  exdate.setDate(exdate.getDate() + expiredays);
  document.cookie = c_name + "=" + escape(value) + ((expiredays == null) ? "" : ";expires=" + exdate.toGMTString());
}

/*获取Cookie值*/
function getCookie(c_name) {
  if (document.cookie.length > 0) {
    c_start = document.cookie.indexOf(c_name + "=")
    if (c_start != -1) {
      c_start = c_start + c_name.length + 1
      c_end = document.cookie.indexOf(";", c_start)
      if (c_end == -1)
        c_end = document.cookie.length
      return unescape(document.cookie.substring(c_start, c_end))
    }
  }
  return ""
}

/**
 * 执行保存
 *
 * @param url
 * @param gridname
 */
function saveObj() {
  //alert($('#btn_sub', iframe.document).parent().find('#isSubmit').val());
  $('#btn_sub', iframe.document).parent().find("#isSubmit").val("false");
  $('#btn_sub', iframe.document).click();
}