

//初始化下标
function resetTrNum(tableId) {
  $tbody = $("#" + tableId + "");
  $tbody.find('>tr').each(function (i) {
    $(':input, select,button,a', this).each(function () {
      var $this = $(this), name = $this.attr('name'), id = $this.attr('id'), onclick_str = $this.attr('onclick'), val = $this.val();
      if (name != null) {
        if (name.indexOf("#index#") >= 0) {
          $this.attr("name", name.replace('#index#', i));
        } else {
          var s = name.indexOf("[");
          var e = name.indexOf("]");
          var new_name = name.substring(s + 1, e);
          $this.attr("name", name.replace(new_name, i));
        }
      }
      if (id != null) {
        if (id.indexOf("#index#") >= 0) {
          $this.attr("id", id.replace('#index#', i));
        } else {
          var s = id.indexOf("[");
          var e = id.indexOf("]");
          var new_id = id.substring(s + 1, e);
          $this.attr("id", id.replace(new_id, i));
        }
      }
      if (onclick_str != null) {
        if (onclick_str.indexOf("#index#") >= 0) {
          $this.attr("onclick", onclick_str.replace(/#index#/g, i));
        } else {
        }
      }
    });
    $(this).find('div[name=\'xh\']').html(i + 1);
  });
}
//通用弹出式文件上传
function commonUpload(callback, inputId) {
  $.dialog({
    content: "url:systemController.do?commonUpload",
    lock: true,
    title: "文件上传",
    zIndex: 2100,
    width: 700,
    height: 200,
    parent: windowapi,
    cache: false,
    ok: function () {
      var iframe = this.iframe.contentWindow;
      iframe.uploadCallback(callback, inputId);
      return true;
    },
    cancelVal: '关闭',
    cancel: function () {
    }
  });
}
//通用弹出式文件上传-回调
function commonUploadDefaultCallBack(url, name, inputId) {
  $("#" + inputId + "_href").attr('href', url).html('下载');
  $("#" + inputId).val(url);
}
function browseImages(inputId, Img) {// 图片管理器，可多个上传共用
}
function browseFiles(inputId, file) {// 文件管理器，可多个上传共用
}
function decode(value, id) {//value传入值,id接受值
  var last = value.lastIndexOf("/");
  var filename = value.substring(last + 1, value.length);
  $("#" + id).text(decodeURIComponent(filename));
}

/**
 * 费用详细页面跳转
 * weiheng 20180702
 */
function goDetail(feeId, objectId, objectType, width, height, offset) {

  var url = basePath + '/feeModelController.do?goConsignFeeDetail&id=' + feeId;
  //console.info(objectType);
  if (objectType == 'FeeContract') {// 合同页不需要打印费用明细、费用通知单
    var index = layer.open({
      type: 2,
      title: '费用详情',
      offset: offset,
      skin: 'layui-layer-molv',
      content: url,
      closeBtn: 0,
      btn: ['关闭'],
      area: [width, height],
      btn3: function () {
        layer.close();
      },
    });
  } else if (objectType == 'FeeConsign') {
    //console.info(url);
    var index = layer.open({
      type: 2,
      title: '费用详情',
      offset: offset,
      skin: 'layui-layer-molv',
      content: url,
      closeBtn: 0,
      btn: ['打印收费明细', '打印收费通知单', '关闭'],
      area: [width, height],
      btn1: function () {
        window.open('udrController.do?openUdrCommonTemplate&&objectId=' + objectId + '&&type=feeDetailTable');
      },
      btn2: function () {
        // TODO
        layer.close();
      },
      btn3: function () {
        layer.close();
      },
    });
  } else {
    var index = layer.open({
      type: 2,
      title: '费用详情',
      offset: offset,
      skin: 'layui-layer-molv',
      content: url,
      closeBtn: 0,
      btn: ['关闭'],
      area: [width, height],
      btn3: function () {
        layer.close();
      },
    });
  }
};

// 在父页面打开
function goDetailInParant(feeId, objectId, objectType, width, height, offset) {
  var url = basePath + '/feeModelController.do?goConsignFeeDetail&id=' + feeId;
  if (objectType == 'FeeConsign') {
    var index = parent.layer.open({
      type: 2,
      title: '费用详情',
      offset: offset,
      skin: 'layui-layer-molv',
      content: url,
      closeBtn: 0,
      btn: ['打印收费明细', '打印收费通知单', '关闭'],
      area: [width, height],
      btn1: function () {
        window.open('udrController.do?openUdrCommonTemplate&&objectId=' + objectId + '&&type=feeDetailTable');
      },
      btn2: function () {
        // TODO 这个还没写哦
        layer.close();
      },
      btn3: function () {
        layer.close();
      },
    });
  } else if (objectType == 'FeeContract') {
    var index = parent.layer.open({
      type: 2,
      title: '费用详情',
      offset: offset,
      skin: 'layui-layer-molv',
      content: url,
      closeBtn: 0,
      btn: ['关闭'],
      area: [width, height],
      btn3: function () {
        layer.close();
      },
    });
  }
};


/**
* 批量新增收费(额外的收费)
*/
function doNewCharge() {
  //取得选中的所有需要新增收费的项目（一个或者多个）
  var rows = $("#feeModelList").datagrid("getSelections");
  if (rows.length == 0) {
    layer.open({
      type: 0,
      content: '请选择一项收费项目'
    });
    return;
  } else if (rows.length > 1) {
    layer.open({
      type: 0,
      content: '暂不支持批量新增'
    });
    return;
  }


  for (var i = 0; i < rows.length; i++) {
    var type = rows[i].objectType;
    // 合同费用不允许新增费用
    if (type == 'FeeContract') {
      layer.msg('合同不支持新增收费！', { icon: 2 });
      return;
    }
  }

  //goNewCharge('新增收费', 'chargeController.do?goNewCharge','feeModelList',870,600);
  goNewCharge('新增收费', 'chargeController.do?goAddFee', 'feeModelList', 470, 460);
}

function goNewCharge(title, url, id, width, height, isRestful) {
  var rowsData = $('#' + id).datagrid('getSelections');
  if (!rowsData || rowsData.length == 0) {
    tip('请选择编辑项目');
    return;
  }

  var feeid = "";
  if (rowsData.length > 1) {
    for (var i = 0; i < rowsData.length; i++) {
      if (i == (rowsData.length - 1)) {
        feeid += rowsData[i].id;
      } else {
        feeid += rowsData[i].id + ",";
      }
    }
  } else {
    feeid = rowsData[0].id;
  }

  if (isRestful != 'undefined' && isRestful) {
    url += '/' + rowsData[0].id;
  } else {
    url += '&id=' + feeid;
  }
  var index = layer.open({
    type: 2,
    title: title,
    skin: 'layui-layer-molv',
    content: url,
    closeBtn: 0,
    btn: ['确定', '取消'],
    area: [width, height],
    btn1: function () {
      var body = layer.getChildFrame('body', index);
      $(body).find('#submitBtn').trigger('click');
    },
    btn2: function () {
      layer.close();
    },
  });
}

function goAddFeeItem(feeId, objectId, objectType, width, height, offset) {

  if (objectType == 'FeeContract') {
    layer.msg('合同不支持新增收费！', { icon: 2 });
    return;
  }
  var url = "chargeController.do?goAddFee&feeId=" + feeId + "&objectId=" + objectId + "&objectType=" + objectType;
  var index = layer.open({
    type: 2,
    title: "新增收费",
    skin: 'layui-layer-molv',
    content: url,
    closeBtn: 0,
    btn: ['确定', '取消'],
    area: ['80%', '90%'],
    btn1: function () {
      var body = layer.getChildFrame('body', index);
    },
    btn2: function () {
      layer.close();
    },
  });
}


/**
* 鼠标双击datagrid数据进入收费页面
*/
function dbClick(title, url) {
  console.log('title', title, url)
  var index = layer.open({
    type: 2,
    title: title,
    skin: 'layui-layer-molv',
    content: url,
    closeBtn: 0,
    btn: ['计费调整', '提交', '保存', '取消'],
    area: ['940px', '530px'],
    btn1: function () {
      var body = layer.getChildFrame('body', index);
      $(body).find('#recaculation').trigger('click');
    },
    btn2: function () {
      var body = layer.getChildFrame('body', index);
      $(body).find('input[name="isSubmit"]').val('1');
      $(body).find('#btn_sub').trigger('click');
      return false;
    },
    btn3: function () {
      var body = layer.getChildFrame('body', index);
      $(body).find('#btn_sub').trigger('click');
      return false;
    },
    btn4: function () {
      layer.close();
    },
  });
}