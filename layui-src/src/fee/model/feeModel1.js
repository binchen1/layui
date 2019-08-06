
function GetQueryString(name) {
  var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
  var r = window.location.search.substr(1).match(reg);
  if (r != null) return unescape(r[2]); return null;
}
//初始化下标 保留注释勿删 zhanghong
function resetTrNum(tableId) {
  // $tbody = $("#" + tableId + "");
  // $tbody.find('>tr').each(function (i) {
  //   $(':input, select,button,a', this).each(function () {
  //     var $this = $(this), name = $this.attr('name'), id = $this.attr('id'), onclick_str = $this.attr('onclick'), val = $this.val();
  //     if (name != null) {
  //       if (name.indexOf("#index#") >= 0) {
  //         $this.attr("name", name.replace('#index#', i));
  //       } else {
  //         var s = name.indexOf("[");
  //         var e = name.indexOf("]");
  //         var new_name = name.substring(s + 1, e);
  //         $this.attr("name", name.replace(new_name, i));
  //       }
  //     }
  //     if (id != null) {
  //       if (id.indexOf("#index#") >= 0) {
  //         $this.attr("id", id.replace('#index#', i));
  //       } else {
  //         var s = id.indexOf("[");
  //         var e = id.indexOf("]");
  //         var new_id = id.substring(s + 1, e);
  //         $this.attr("id", id.replace(new_id, i));
  //       }
  //     }
  //     if (onclick_str != null) {
  //       if (onclick_str.indexOf("#index#") >= 0) {
  //         $this.attr("onclick", onclick_str.replace(/#index#/g, i));
  //       } else {
  //       }
  //     }
  //   });
  //   $(this).find('div[name=\'xh\']').html(i + 1);
  // });
}
//通用弹出式文件上传 保留注释勿删 zhanghong
function commonUpload(callback, inputId) {
  // $.dialog({
  //   content: "url:systemController.do?commonUpload",
  //   lock: true,
  //   title: "文件上传",
  //   zIndex: 2100,
  //   width: 700,
  //   height: 200,
  //   parent: windowapi,
  //   cache: false,
  //   ok: function () {
  //     var iframe = this.iframe.contentWindow;
  //     iframe.uploadCallback(callback, inputId);
  //     return true;
  //   },
  //   cancelVal: '关闭',
  //   cancel: function () {
  //   }
  // });
}
//通用弹出式文件上传-回调 保留注释勿删 zhanghong
function commonUploadDefaultCallBack(url, name, inputId) {
  // $("#" + inputId + "_href").attr('href', url).html('下载');
  // $("#" + inputId).val(url);
}
function browseImages(inputId, Img) {// 图片管理器，可多个上传共用
}
function browseFiles(inputId, file) {// 文件管理器，可多个上传共用
}
// 保留注释勿删 zhanghong
function decode(value, id) {//value传入值,id接受值
  // var last = value.lastIndexOf("/");
  // var filename = value.substring(last + 1, value.length);
  // $("#" + id).text(decodeURIComponent(filename));
}



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
      area: ['80%', '80%'],
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
      area: ['80%', '80%'],
      btn3: function () {
        layer.close();
      },
    });
  }
};
// 保留注释勿删 zhanghong
function goAddFeeItem(feeId, objectId, objectType, width, height, offset) {

  // if (objectType == 'FeeContract') {
  //   layer.msg('合同不支持新增收费！', { icon: 2 });
  //   return;
  // }
  // var url = "chargeController.do?goAddFee&feeId=" + feeId + "&objectId=" + objectId + "&objectType=" + objectType;
  // var index = layer.open({
  //   type: 2,
  //   title: "新增收费",
  //   skin: 'layui-layer-molv',
  //   content: url,
  //   closeBtn: 0,
  //   btn: ['确定', '取消'],
  //   area: ['80%', '90%'],
  //   btn1: function () {
  //     var body = layer.getChildFrame('body', index);
  //   },
  //   btn2: function () {
  //     layer.close();
  //   },
  // });
}

/**
 * Jeecg Excel 导出
 * 代入查询条件
 */
function JeecgExcelExport(url, datagridId) {
  var queryParams = $('#' + datagridId).datagrid('options').queryParams;
  $('#' + datagridId + 'tb').find('*').each(function () {
    queryParams[$(this).attr('name')] = $(this).val();
  });
  var params = '&';
  $.each(queryParams, function (key, val) {
    params += '&' + key + '=' + val;
  });
  var fields = '&field=';
  $.each($('#' + datagridId).datagrid('options').columns[0], function (i, val) {
    if (val.field != 'opt') {
      fields += val.field + ',';
    }
  });
  window.location.href = url + encodeURI(fields + params);
}


/** 未收费 */

var InitObj = {
  formLayerM: null, // form对象 
  defaultUrl: basePath + '/feeModelController.do?datagrid&field=id,unitId,bpmStatus,createName,createBy,updateName,updateBy,sysOrgCode,sysCompanyCode,createDate,updateDate,feeOrigin,feeTotal,feePaid,status,paymentCompany,consignUnitName,objectType,objectId,sn&status=',
  searchType: 1, // 导出数据时区分查询条件：1.普通查询   2.高级查询
  searchShow: true, // 普通搜索
  searchSwitch: null, // 搜素按钮
  senior: null, // 高级搜素
  ordinary: null, // 普通搜索
  storage: null,
  dataGrid: null, // 数据table
  dic: new Object(),//数据字典的集合
  status: GetQueryString('status'),
  init: function (form, laydate) {
    this.formLayerM = form;
    this.searchSwitch = $('#searchSwitch')  // 搜素按钮
    this.senior = $('.senior')  // 高级搜素
    this.ordinary = $('.ordinary')  // 普通搜索
    // 高级查询与普通查询切换
    this.styleLayout();
    this.dateRender(laydate)
    console.log('status', this.status)
    /**初始化数据字典，和权限**/
    var _list = [];
    _list.push("@bpm_status@");
    _list.push("@feeStatus@");
    _list.push("t_s_depart@id@departname");
    _list.push("@feeType@");

    var json = new Object();//临时对象
    json["list"] = JSON.stringify(_list);
    json["author"] = "402882105ebd052e015ebd095c240001";
    $.ajax({
      url: basePath + '/systemController.do?getDictContent',
      data: json,
      dataType: "json",
      type: "POST",
      contentType: "application/x-www-form-urlencoded",
      success: function (responseJSON) {
        var that = InitObj
        that.dic = responseJSON.attributes;
        console.log('responseJSON', responseJSON)
        // 默认未收费
        that.initDataGrid(that.columnsFun('3'));
      }
    });
  },

  dateRender: function (laydate) {
    laydate.render({
      elem: '#consignDate'
      , range: '~'
      , format: 'yyyy-MM-dd'
      , trigger: 'click'
    })
    laydate.render({
      elem: '#TransferSucTime'
      , range: '~'
      , format: 'yyyy-MM-dd'
      , trigger: 'click'
    })
  },
  // 打印
  printAll: function () {
    console.log('点击了打印')
  },
  // 打印费用明细
  printDetail: function (event) {
    //打印报告领取单
    var arr = InitObj.dataGrid.datagrid('getSelections');
    if (arr.length != 1) {
      // tip('请选择一条记录!');
      btnTipMsg(event, '请选择一条记录!')
      return;
    }
    window.open('udrController.do?openUdrCommonTemplate&&objectId=' + arr[0].objectId + '&&type=feeDetailTable');
  },
  /**
 * 费用详细页面跳转
 * weiheng 20180702
 */
  goDetail: function (feeId, objectId, objectType, event, width, height, offset) {
    layui.stope(event)
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
        btn1: function () {
          layer.close(index);
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
          layer.close(index);
        },
        btn3: function () {
          layer.close(index);
        },
      });
    } else {
      console.info("url", url);
      var index = layer.open({
        type: 2,
        title: '费用详情',
        offset: offset,
        skin: 'layui-layer-molv',
        content: url,
        closeBtn: 0,
        btn: ['关闭'],
        area: [width, height],
        btn1: function () {
          layer.close(index);
        },
      });
    }
  },
  getSelectRows: function () {
    return $('#feeModelList').datagrid('getSelections');
  },

  /**
* 未收费批量收费
*/
  doBitchFee: function (event) {

    //取得选中的所有费用
    var selectItems = this.getSelectRows();
    // if (selectItems.length <= 0) {
    //   layer.confirm('请勾选费用', { title: "错误", btn: ['确定'] }, function (index) {
    //     layer.close(index);
    //   });
    // }


    // if (selectItems.length == 1 && selectItems[0].objectType == 'FeeContract') {
    //   title = "合同收费";
    // }
    this.updateWithId(event, 'feeModelController.do?goUpdate', 'feeModelList', 870, 600);
  },
  updateWithId: function (event, url, id, width, height, isRestful) {
    var title = "委托收费";
    var rowsData = $('#' + id).datagrid('getSelections');
    if (!rowsData || rowsData.length == 0) {
      // tip('请选择编辑项目');
      btnTipMsg(event, '请选择编辑项目')
      return;
    }
    if (rowsData.length == 1 && rowsData[0].objectType == 'FeeContract') {
      title = "合同收费";
    }
    console.log(rowsData[0].objectType)

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
    console.log('title', title)
    if ('3' === this.status) {
      this.dbClick(title, url);
    } else {
      this.dbAllClick(title, url)
    }
  },
  // 批量选择
  doBitchSelect: function () {

    var row = $("#feeModelList").datagrid("getSelected");

    var data = $("#feeModelList").datagrid("getData");
    var rows = data.rows;

    if (row == null) {

      // 未选择，智能选择与第一条委托，单位相同的数据
      var unitId = "";
      for (var i = 0; i < rows.length; i++) {
        if (rows[i].objectType == 'FeeConsign' && unitId == "") {
          unitId = rows[i].unitId;
          var index = $("#feeModelList").datagrid("getRowIndex", rows[i]);
          $("#feeModelList").datagrid("selectRow", index);
        } else if (rows[i].objectType == 'FeeConsign' && rows[i].unitId == unitId) {
          var index = $("#feeModelList").datagrid("getRowIndex", rows[i]);
          $("#feeModelList").datagrid("selectRow", index);
        }
      }

    } else {	// 已选择了一个

      // 合同不允许多选（当前已勾选了一个合同）
      if (row.objectType == 'FeeContract') {
        tip('合同不能批量选择！');
        return;
      }

      var unitId = row.unitId;
      for (var i = 0; i < rows.length; i++) {
        if (rows[i].unitId == unitId && rows[i].objectType == 'FeeConsign') {	// 委托单位相同
          var index = $("#feeModelList").datagrid("getRowIndex", rows[i]);
          $("#feeModelList").datagrid("selectRow", index);
        }
      }

    }
  },
  /**
* 批量新增收费(额外的收费)
*/
  doNewCharge: function (event) {
    //取得选中的所有需要新增收费的项目（一个或者多个）
    var rows = $("#feeModelList").datagrid("getSelections");
    if (rows.length == 0) {
      // layer.open({
      //   type: 0,
      //   content: '请选择一项收费项目'
      // });
      btnTipMsg(event, '请选择一项收费项目')
      return;
    } else if (rows.length > 1) {
      // layer.open({
      //   type: 0,
      //   content: '暂不支持批量新增'
      // });
      btnTipMsg(event, '暂不支持批量新增')
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
    InitObj.goNewCharge('新增收费', 'chargeController.do?goAddFee', 'feeModelList', '60%', '80%');
  },
  goNewCharge: function (title, url, id, width, height, isRestful) {
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
  },
  //导出
  ExportXls: function () {
    var queryParams = $('#feeModelList').datagrid('options').queryParams;
    $('#feeModelListtb').find('*').each(function () {
      //console.info($(this).attr('name')+"====="+$(this).val())
      queryParams[$(this).attr('name')] = $(this).val();
    });
    // var status = GetQueryString('status');
    /* console.info(queryParams);
    console.info(status); */
    JeecgExcelExport("feeModelController.do?exportXls&status=" + this.status, "feeModelList");
  },
  /**
  *  未收费  鼠标双击datagrid数据进入收费页面
  */
  dbClick: function (title, url) {
    console.log('title', title, url)
    var index = layer.open({
      type: 2,
      title: title,
      skin: 'layui-layer-molv',
      content: url,
      closeBtn: 0,
      btn: ['计费调整', '确定', '取消'],
      area: ['80%', '90%'],
      btn1: function () {
        var body = layer.getChildFrame('body', index);
        $(body).find('#recaculation').trigger('click');
      },
      btn2: function () {
        var body = layer.getChildFrame('body', index);
        $(body).find('#btn_sub').trigger('click');
        layer.close(index);
        return false;
      },
      btn4: function () {
        layer.close();
      },
    });
  },
  /**
 *  部分收费或全部 鼠标双击datagrid数据进入收费页面
 */
  dbAllClick: function (title, url) {
    console.log('title', title, url)
    var index = layer.open({
      type: 2,
      title: title,
      skin: 'layui-layer-molv',
      content: url,
      closeBtn: 0,
      btn: ['提交', '保存', '取消'],
      area: ['80%', '90%'],
      btn1: function () {
        var body = layer.getChildFrame('body', index);
        $(body).find('#isSubmit').val('1');
        $(body).find('#btn_sub').trigger('click');
      },
      btn2: function () {
        var body = layer.getChildFrame('body', index);
        $(body).find('#btn_sub').trigger('click');
      },

      btn3: function () {
        layer.close();
      },
    });
  },
  // 查询时间分开始结束存放
  dateStartEnd: function (queryParams, dataString) {
    if (queryParams[dataString]) {
      var DateArr = queryParams[dataString].split(' ~ ')
      queryParams['min' + dataString] = DateArr[0];
      queryParams['max' + dataString] = DateArr[1];
    } else {
      queryParams['min' + dataString] = '';
      queryParams['max' + dataString] = '';
    }
    return queryParams;
  },
  // 高级查询
  seniorQuickSearch: function () {
    var queryParams = $('#commonQueryForm').serializeJSON();//表单参数
    delete queryParams['paymentCompany'];
    queryParams = this.dateStartEnd(queryParams, 'ConsignDate')
    queryParams = this.dateStartEnd(queryParams, 'TransferSucTime')
    delete queryParams['ConsignDate'];
    delete queryParams['TransferSucTime'];
    this.queryParams = queryParams;
    this.reloadDataGrid(true, queryParams);
  },
  // 普通查询
  quickSearch: function () {
    var condition = $("input[name='paymentCompany']").val();
    var queryParams = { 'paymentCompany': condition };
    this.reloadDataGrid(true, queryParams);
  },
  commonQryKeyDown: function () {
    //快速查询input框绑定的回车事件
    $('#commonQueryForm input').bind('keypress', function (event) {
      var that = InitObj;
      var theEvent = event || window.event;
      var code = theEvent.keyCode || theEvent.which || theEvent.charCode;
      if (code === 13) {
        if (that.searchShow) {
          that.quickSearch()
        } else {
          that.seniorQuickSearch()
        }
        return false;
      }
    });
  },
  // 重载datagrid
  reloadDataGrid: function (goFirstPage, queryParams) {
    console.log('queryParams', queryParams)
    if (goFirstPage) {
      /*从第一页开始显示*/
      this.dataGrid.datagrid('load', queryParams);
    } else {
      /*停留在当前页面*/
      this.dataGrid.datagrid('reload', queryParams);
    }
  },
  // 各tabs展示数据
  columnsFun: function (num) {
    var columns = [];
    var that = this;
    this.status = num;
    console.log('this.status', this.status)
    columns.push({ field: 'id', title: '主键', width: 120, hidden: true, sortable: true })
    columns.push({
      field: 'bpmStatus', title: '流程状态', width: 120, hidden: true, sortable: true, formatter: function (value, rec, index) {
        if (value) {
          var valArray = value.split(',');
          var item = that.dic['bpm_status'];
          if (valArray.length > 1) {
            var checkboxValue = '';
            for (var k = 0; k < valArray.length; k++) {
              for (var h = 0; h < item.length; h++) {
                if (valArray[k] == item[h].typecode) {
                  checkboxValue = checkboxValue + item[h].typename + ',';
                }
              }
            }
            return checkboxValue.substring(0, checkboxValue.length - 1);
          } else {
            for (var c = 0; c < item.length; c++) {
              if (value == item[c].typecode) {
                return item[c].typename;
              }
            }
          }
        } else {
          return '';
        }
      }
    })

    columns.push({ field: 'createName', title: '创建人名称', width: 120, hidden: true })

    columns.push({ field: 'createBy', title: '创建人登录名称', width: 120, hidden: true })

    columns.push({ field: 'updateName', title: '更新人名称', width: 120, hidden: true })

    columns.push({ field: 'updateBy', title: '更新人登录名称', width: 120, hidden: true })

    columns.push({ field: 'sysOrgCode', title: '所属部门', width: 120, hidden: true })

    columns.push({ field: 'sysCompanyCode', title: '所属公司', width: 120, hidden: true })
    columns.push({ field: 'sn', title: '编号', width: 120, hidden: false })

    columns.push({ field: 'consignUnitName', title: '委托单位', width: 300, sortable: true })


    columns.push({
      field: 'updateDate', title: '更新日期', width: 120, hidden: true, sortable: true, formatter: function (value, rec, index) {
        return value ? new Date(value).Format("yyyy-MM-dd") : ''
      }
    })

    columns.push({
      field: 'status', title: '状态', width: 80, sortable: true, hidden: true, formatter: function (value, rec, index) {
        if (value) {
          var valArray = value.split(',');
          var item = that.dic['feeStatus'];
          if (valArray.length > 1) {
            var checkboxValue = '';
            for (var k = 0; k < valArray.length; k++) {
              for (var h = 0; h < item.length; h++) {
                if (valArray[k] == item[h].typecode) {
                  checkboxValue = checkboxValue + item[h].typename + ',';
                }
              }
            }
            return checkboxValue.substring(0, checkboxValue.length - 1);
          } else {
            for (var c = 0; c < item.length; c++) {
              if (value == item[c].typecode) {
                return item[c].typename;
              }
            }
          }
        } else {
          return ''
        }
      }
    })

    if ('1' !== this.status) {

      columns.push({ field: 'feeTotal', title: '应缴费用', width: 120, sortable: true })
    }

    columns.push({ field: 'feePaid', title: '已缴费用', width: 120, hidden: true, sortable: true })
    if ('3' !== this.status) {
      columns.push({ field: 'feeTotal', title: '待缴费用', width: 120, sortable: true })
    }

    columns.push({
      field: 'objectType', title: '缴费类型', width: 100, hidden: true, sortable: true, formatter: function (value, rec, index) {
        if (value) {
          var valArray = value.split(',');
          var item = that.dic['feeType'];
          if (valArray.length > 1) {
            var checkboxValue = '';
            for (var k = 0; k < valArray.length; k++) {
              for (var h = 0; h < item.length; h++) {
                if (valArray[k] == item[h].typecode) {
                  checkboxValue = checkboxValue + item[h].typename + ',';
                }
              }
            }
            return checkboxValue.substring(0, checkboxValue.length - 1);
          } else {
            for (var c = 0; c < item.length; c++) {
              if (value == item[c].typecode) {
                return item[c].typename;
              }
            }
          }
        } else {
          return '';
        }
      }
    })
    columns.push({
      field: 'createDate', title: '生成日期', width: 80, hidden: false, sortable: true, formatter: function (value, rec, index) {
        return value ? new Date(value).Format("yyyy-MM-dd") : ''
      }
    })
    if ('1' === this.status) {
      columns.push({
        field: 'paidDate', title: '收费日期', width: 80, hidden: false, sortable: true, formatter: function (value, rec, index) {
          return value ? new Date(value).Format("yyyy-MM-dd") : ''
        }
      })
    }

    columns.push({ field: 'objectId', title: '关联对象', width: 120, hidden: true })
    columns.push({
      field: 'opt', title: '操作', width: 100, formatter: function (value, rec, index) {
        if (!rec.id) {
          return '';
        }
        var btns = '';
        btns += '<button title="查看详情" class="layui-btn layui-btn-sm" onclick="InitObj.goDetail(&quot;'
          + rec.id + '&quot;, &quot;' + rec.objectId + '&quot;, &quot;' + rec.objectType + '&quot;, event)"><i class="layui-icon">&#xe705;</i></button>';
        // if (this.status == '3') {
        //   href += '<a href="#"  onclick=\'InitObj.goDetail("' + rec.id + '", "' + rec.objectId + '", "' + rec.objectType + '", "80%", "90%", "auto")\'>  <i title="查看详情" class=" fa fa-list-alt"></i> ';
        //   href += "</a>&nbsp;";

        // }
        console.log('4.	列表按钮，取消【撤回】，增加【计费调整】，费用类型为委托费用的才显示【计费调整】')
        // var buttons = that.dic['buttons'];
        // if (buttons)
        //   for (var i = 0; i < buttons.length; i++) {
        //     href += "<a href='#'   class='ace_button'  onclick=doPpp('func','" + index + "')>  <i class=' fa fa-wrench'></i>";
        //     href += buttons[i].buttonName + "</a>&nbsp;";
        //   }
        return btns;
      }
    })
    return [columns];
  },
  // 弹出提示信息，展示支付详情
  showFeeRecordDetail: function (index) {
    console.log('showFeeRecordDetail', index)
    var that = InitObj
    // var feeModelList = $("#feeModelList").datagrid("getData");
    var feeModelList = that.dataGrid.datagrid("getData");
    var row = feeModelList.rows[index];
    var consignUnitName = row.consignUnitName;
    var feeTotal = row.feeTotal;
    var objectType = row.objectType;
    var id = row.id;
    var msg = "<p>委托单位：" + consignUnitName + "</p>";
    $.get(basePath + "/feeModelController.do?doQueryFeeExtend", { id: id }, function (data) {
      var jsonobj = eval("(" + data + ")");
      if (objectType == 'FeeContract') {
        msg += "<p>合同类型：" + jsonobj.contractType + "</p>";
        msg += "<p>合同名称：" + jsonobj.contractName + "</p>";
      } else if (objectType == 'FeeConsign') {
        msg += "<p>合计金额：" + row.feeOrigin + "</p>";
        msg += "<p>优惠金额：" + (parseFloat(row.feeOrigin) - parseFloat(row.feeTotal)).toFixed(2) + "</p>";
        msg += "<p>委托金额：" + row.feeTotal + "</p>";
        //TODO 现在下委托时还不能关联合同，暂时不能显示委托的合同 20180709
      }
      tipIndex = layer.tips(msg, '#mouseOverDom', { tips: 1, time: 20000 });
    }
    );
  },
  /**初始化列，easyui的datagrid方法，去的数据**/
  initDataGrid: function (columns) {
    this.storage = $.localStorage;
    if (!this.storage) { this.storage = $.cookieStorage }
    var currentMouseOverDom = null;	// 当前鼠标移动到的对象
    var tipMsgSetTimeOut;
    var that = this;
    this.dataGrid = $('#feeModelList').datagrid({
      idField: 'id',
      url: this.defaultUrl + this.status,
      // url: basePath + '/feeModelController.do?datagrid&field=id,unitId,bpmStatus,createName,createBy,updateName,updateBy,sysOrgCode,sysCompanyCode,createDate,updateDate,feeOrigin,feeTotal,feePaid,status,paymentCompany,consignUnitName,objectType,objectId,sn&status=' + this.status,
      fit: true,
      loadMsg: " 数据加载中... ",
      pageSize: 10,
      pagination: true,
      pageList: [10, 20, 30],
      sortOrder: 'desc',
      sortName: 'createDate',
      rownumbers: true,
      singleSelect: false,
      fitColumns: true,
      scrollbarSize: 0,
      showFooter: true, // 定义是否显示行的底部。
      striped: true,
      showFooter: true,
      frozenColumns: [[{
        field: 'ck',
        checkbox: 'true'
      },
      ]],
      columns: columns,
      onLoadSuccess: function (data) {
        console.log('738 data', data)
        console.log('738 data', data.rows[0].id)
        getPagerFun('#feeModelList')
        that.dataGrid.datagrid("clearSelections");
        if (!false) {
          if (data.total && data.rows.length == 0) {
            var grid = $('#feeModelList');
            var curr = grid.datagrid('getPager').data("pagination").options.pageNumber;
            grid.datagrid({
              pageNumber: (curr - 1)
            });
          }
        }


        $(".datagrid-row").on("mouseover mouseout", function () {
          console.log('1111')
          if (event.type == "mouseover") {
            clearTimeout(tipMsgSetTimeOut);	// 清空，重新计时
            // 当前鼠标移动到的页面DOM对象
            if (currentMouseOverDom != null) {
              $(currentMouseOverDom).removeAttr("id");
            }
            currentMouseOverDom = document.elementFromPoint(event.pageX, event.pageY);
            $(currentMouseOverDom).attr("id", "mouseOverDom");

            //console.info($("#mouseOverDom")); 
            var attrValue = $(this).attr("datagrid-row-index");
            tipMsgSetTimeOut = setTimeout("InitObj.showFeeRecordDetail(" + attrValue + ")", 1500);	// 1.5秒倒计时

          } else if (event.type == "mouseout") {
            if (currentMouseOverDom != null) {
              $(currentMouseOverDom).removeAttr("id");
              currentMouseOverDom = null;
            }
            clearTimeout(tipMsgSetTimeOut);	// 清空
            layer.close(tipIndex);
          }

        });
      },
      onSelect: function (rowIndex, rowData) {
        if ('1' !== that.status) {
          var rows = that.dataGrid.datagrid("getSelections");
          if (rows.length > 0) {// 多选时需做判断

            var consignUnit;
            for (var i = 0; i < rows.length; i++) {

              // 委托单位不一致，不允许多选
              if (i == 0) {
                consignUnit = rows[i].unitId;
              } else {
                var temp = rows[i].unitId;
                if (consignUnit != temp) {
                  that.dataGrid.datagrid("unselectRow", rowIndex);
                  layer.msg('您所选的数据，包含多个单位，不能批量收费，请重新选择！', { icon: 2 });
                  break;
                }
              }

              var type = rows[i].objectType;
              // 合同费用不允许多选（取消当前选中的这一行）
              if (type == 'FeeContract' && rows.length > 1) {
                that.dataGrid.datagrid("unselectRow", rowIndex);
                that.dataGrid.datagrid("uncheckRow", rowIndex);
                layer.msg('系统不支持对合同批量收费，请重新选择！', { icon: 2 });
                break;
              }
            }
          }
        }
      },
      onDblClickRow: function (index, row) {
        //layerCreateWindow('编辑','feeModelController.do?goUpdate&id='+row.id,['保存','关闭'],['80%','90%']);
        console.log(row)
        if ('3' === row.status) { //未收费
          that.dbClick('委托收费', 'feeModelController.do?goUpdate&id=' + row.id);
        } else if ('2' === row.status) { //部分收费
          that.dbAllClick('委托收费', 'feeModelController.do?goUpdate&id=' + row.id)
        } else { // 已结清
          layerOpenFun('委托收费详情', 'feeModelController.do?goUpdate&id=' + row.id, [], ['80%', '90%']);
        }

      },
    });
    try {
      that.restoreheader();
    } catch (ex) { }
  },
  restoreheader: function () {
    var cols = storage.get('feeModelListhiddenColumns');
    if (!cols) return;
    for (var i = 0; i < cols.length; i++) {
      try {
        if (cols.visible != false) this.dataGrid.datagrid((cols[i].hidden == true ? 'hideColumn' : 'showColumn'), cols[i].field);
      } catch (e) { }
    }
  },

  // 样式布局控制
  styleLayout: function () {
    this.searchSwitch.click(function () {
      var that = InitObj;
      if (that.searchShow) {
        that.searchType = 2;
        that.senior.show();
        that.ordinary.hide();
        that.searchShow = !that.searchShow;
        $(this).find('.l-btn-text').text("切换到普通查询"); //移除
        that.seniorQuickSearch();
      } else {
        that.searchType = 1;
        that.senior.hide();
        that.ordinary.show();
        that.searchShow = !that.searchShow;
        $(this).find('.l-btn-text').text("切换到高级查询"); // 追加样式
        that.quickSearch();
      }
      that.formLayerM.render();
    })
  }
}


var tipIndex;

// 保留注释勿删 zhanghong
function reloadTable() {
  // try {
  //   $('#' + gridname).datagrid('reload');
  //   $('#' + gridname).treegrid('reload');
  // }
  // catch (e) { }
}
function reloadfeeModelList() {
  // $('#feeModelList').datagrid('reload');
}
function getfeeModelListSelected(field) {
  // return getSelected(field);
}
function getSelected(field) {
  // var row = $('#' + gridname).datagrid('getSelected');
  // if (row != null) {
  //   value = row[field];
  // } else {
  //   value = '';
  // }
  // return value;
}
function getfeeModelListSelections(field) {
  // var ids = [];
  // var rows = $('#feeModelList').datagrid('getSelections');
  // for (var i = 0; i < rows.length; i++) {
  //   ids.push(rows[i][field]);
  // }
  // ids.join(',');
  // return ids
}

// 保留注释勿删 zhanghong
function saveHeader() {
  // var columnsFields = null;
  // var easyextends = false;
  // try {
  //   columnsFields = $('#feeModelList').datagrid('getColumns');
  //   easyextends = true;
  // } catch (e) {
  //   columnsFields = $('#feeModelList').datagrid('getColumnFields');
  // }
  // var cols = storage.get('feeModelListhiddenColumns');
  // var init = true;
  // if (cols) {
  //   init = false;
  // }
  // var hiddencolumns = [];
  // for (var i = 0; i < columnsFields.length; i++) {
  //   if (easyextends) {
  //     hiddencolumns.push({
  //       field: columnsFields[i].field,
  //       hidden: columnsFields[i].hidden
  //     });
  //   } else {
  //     var columsDetail = $('#feeModelList').datagrid("getColumnOption", columnsFields[i]);
  //     if (init) {
  //       hiddencolumns.push({
  //         field: columsDetail.field,
  //         hidden: columsDetail.hidden,
  //         visible: (columsDetail.hidden == true ? false : true)
  //       });
  //     } else {
  //       for (var j = 0; j < cols.length; j++) {
  //         if (cols[j].field == columsDetail.field) {
  //           hiddencolumns.push({
  //             field: columsDetail.field,
  //             hidden: columsDetail.hidden,
  //             visible: cols[j].visible
  //           });
  //         }
  //       }
  //     }
  //   }
  // }
  // storage.set('feeModelListhiddenColumns', JSON.stringify(hiddencolumns));
}
// 保留注释勿删 zhanghong
function isShowBut() {
  // var isShowSearchId = $('#isShowSearchId').val();
  // if (isShowSearchId == "true") {
  //   $("#searchColums").hide();
  //   $('#isShowSearchId').val("false");
  //   $('#columsShow').remove("src");
  //   $('#columsShow').attr("src", "plug-in/easyui/themes/default/images/accordion_expand.png");
  // } else {
  //   $("#searchColums").show();
  //   $('#isShowSearchId').val("true");
  //   $('#columsShow').remove("src");
  //   $('#columsShow').attr("src", "plug-in/easyui/themes/default/images/accordion_collapse.png");
  // }
}
// 保留注释勿删 zhanghong
function resetheader() {
  // var cols = storage.get('feeModelListhiddenColumns');
  // if (!cols) return;
  // for (var i = 0; i < cols.length; i++) {
  //   try {
  //     $('#feeModelList').datagrid((cols.visible == false ? 'hideColumn' : 'showColumn'), cols[i].field);
  //   } catch (e) { }
  // }
}
/**查询函数已被 替代 */
function feeModelListsearch() {

}
// 保留注释勿删 zhanghong
function dosearch(params) {
  // var jsonparams = $.parseJSON(params);
  // $('#feeModelList').datagrid({
  //   url: basePath + '/feeModelController.do?datagrid&field=id,unitId,bpmStatus,createName,createBy,updateName,updateBy,sysOrgCode,sysCompanyCode,createDate,updateDate,feeOrigin,feeTotal,feePaid,status,paymentCompany,consignUnitName,objectType,objectId,',
  //   queryParams: jsonparams
  // });
}
function feeModelListsearchbox(value, name) {
  // var queryParams = $('#feeModelList').datagrid('options').queryParams;
  // queryParams[name] = value;
  // queryParams.searchfield = name;
  // $('#feeModelList').datagrid('reload');
}
// $('#feeModelListsearchbox').searchbox({
//   searcher: function (value, name) {
//     feeModelListsearchbox(value, name);
//   },
//   menu: '#feeModelListmm',
//   prompt: '请输入查询关键字'
// });
function EnterPress(e) {
  // var e = e || window.event;
  // if (e.keyCode == 13) {
  //   feeModelListsearch();
  // }
}
/**重置 已替代 */
function searchReset(name) {
  // $("#" + name + "tb").find(":input").val("");
  // var queryParams = $('#feeModelList').datagrid('options').queryParams;

  // $('#feeModelListtb').find('*').each(function () {
  //   queryParams[$(this).attr('name')] = $(this).val();
  // });
  // queryParams['query'] = 'true';

  // var status = GetQueryString('status');
  // $('#feeModelList').datagrid({
  //   url: basePath + '/feeModelController.do?datagrid&field=id,unitId,bpmStatus,createName,createBy,updateName,updateBy,sysOrgCode,sysCompanyCode,createDate,updateDate,feeOrigin,feeTotal,feePaid,status,paymentCompany,consignUnitName,objectType,objectId,sn&status=' + status,
  //   pageNumber: 1
  // });
}



/**
* 流程回退  -- 20190112 弃用， goRollbackPage代替
* weiheng 20180705 
*/
// 保留注释勿删 zhanghong
function doBackProcess() {

  // //取得选中的所有费用
  // var selectItems = getSelectRows();
  // if (selectItems.length <= 0) {
  //   layer.confirm('请勾选费用', { title: "错误", btn: ['确定'] }, function (index) {
  //     layer.close(index);
  //   });
  //   return;
  // }

  // var consignIds = "";
  // for (var i = 0; i < selectItems.length; i++) {
  //   if (selectItems[i].objectType != "FeeConsign") {	// 委托费用
  //     continue;
  //   }
  //   if (i == 0) {
  //     consignIds += selectItems[i].objectId;
  //   } else {
  //     consignIds += "," + selectItems[i].objectId;
  //   }
  // }

  // $.ajax({
  //   url: basePath + '/feeModelController.do?doBackProcess',
  //   data: { "consignIds": consignIds },
  //   dataType: "json",
  //   type: "POST",
  //   success: function (response) {
  //     tip(response.msg);
  //     $("#feeModelList").datagrid('reload');
  //   }
  // });
}

/**
* 撤销流程，既把已经提交的流程回退到当前节点，、
* 注意不允许跨步骤撤销，那样的话会引起混乱
*/
// 保留注释勿删 zhanghong
function revoke(id) {
  console.log('revoke')
  // $.ajax({
  //   url: basePath + '/feeModelController.do?doRevoke',
  //   data: { "id": id, "taskName": "fee" },
  //   dataType: "json",
  //   type: "POST",
  //   contentType: "application/x-www-form-urlencoded",
  //   //traditional: true,  
  //   success: function (response) {
  //     tip(response.msg);
  //     $("#feeModelList").datagrid('reload');
  //   }
  // });
}





function testReloadPage() {
  // document.location = "http://www.baidu.com";
}
function szqm(id) {
  // createwindow('审核', 'feeModelController.do?doCheck&id=' + id);
}
function addNewPage(id) {
  // addOneTab("TAB方式添加", "feeModelController.do?addTab&type=table&id=" + id);
}


/**
 * 添加事件打开窗口,带默认第二层 id的
 * @param title 编辑框标题
 * @param addurl//目标页面地址
 */
function addWithId(title, addurl, gname, width, height) {
  console.log('addWithId')
  // createActivitiWindow(title, addurl, width, height);
}


//导入
function ImportXls() {
  // openuploadwin('Excel导入', 'feeModelController.do?upload', "feeModel");
}



//模板下载
function ExportXlsByT() {
  // JeecgExcelExport("feeModelController.do?exportXlsByT", "feeModel");
}
/**
 * 获取表格对象
 * @return 表格对象
 */
function getDataGrid() {
  // var datagrid = $('#' + gridname);
  // return datagrid;
}



