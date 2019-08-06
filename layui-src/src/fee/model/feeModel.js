
function reloadfeeModelList() {

  InitObj.reloadDataGrid(true)
}
/***
* 跳转统一的流程退回页面 - weiheng 20190112
*/
function goRollbackPage() {
  InitObj.goShowRollbackPage()
}
// 退回执行完后的回调函数 勿删
function rollbackCallBack() {
  InitObj.reloadDataGrid(false)
}
var InitObj = {
  formLayerM: null, // form对象 
  defaultUrl: basePath + '/feeModelController.do?datagrid&field=id,unitId,bpmStatus,createName,createBy,updateName,updateBy,sysOrgCode,sysCompanyCode,createDate,updateDate,feeOrigin,feeTotal,feePaid,status,paymentCompany,consignUnitName,objectType,objectId,sn,paidDate',
  searchType: 1, // 导出数据时区分查询条件：1.普通查询   2.高级查询
  searchShow: true, // 普通搜索
  searchSwitch: null, // 搜素按钮
  senior: null, // 高级搜素
  ordinary: null, // 普通搜索
  storage: null,
  dataGrid: null, // 数据table
  btnGoRollback: null, // 退回按钮 
  btnDoBitchFee: null, // 收费按钮
  tipIndex: '', // 收费按钮
  // isDoubleClick: true, // 双击重新刷新页面 显示分页组件
  status: GetQueryString('status'),
  init: function (form, laydate) {
    this.formLayerM = form;
    this.searchSwitch = $('#searchSwitch')  // 搜素按钮
    this.senior = $('.senior')  // 高级搜素
    this.ordinary = $('.ordinary')  // 普通搜索
    this.btnGoRollback = $('.btn_goRollback') // 退回按钮 
    this.btnDoBitchFee = $('.btn_doBitchFee') // 收费按钮
    /** common.js中引入函数, 勿删 getPagerFun() funCode() getTableHeight()*/

    // 高级查询与普通查询切换
    this.styleLayout();
    this.commonQryKeyDown();
    this.dateRender(laydate)
    /**初始化数据字典，和权限**/
    // 先查权限是否显示按钮，再加载table为了正常显示分页组件
    this.isBtnFun('3')
  },

  dateRender: function (laydate) {
    laydate.render({
      elem: '#CreateDate'
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
  /** 退回 */
  goShowRollbackPage: function () {
    var rowsData = this.dataGrid.datagrid('getSelections');
    if (rowsData.length !== 1) {
      btnTipMsg(event, '请选择一条数据');
      return;
    }
    if (rowsData[0].status != "3") {
      btnTipMsg(event, '只支持未交费的退回操作');
      return;
    }
    if ('FeeConsign' !== rowsData[0].objectType) {
      btnTipMsg(event, '只能选择委托类型为“委托费用”的数据');
      return;
    }
    showRollbackPage('fee', rowsData[0].id)
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
  /** 重新计费 */
  goRecaculation: function (feeId) {
    var openUrl = "feeModelController.do?goRecaculation&feeIds=" + feeId;
    layerOpenFun(openUrl, '重新计费', ['80%', '80%'], ['确定', '取消'], '', 'noOpenCallback', '', '#submitBtn')
  },
  /**
 * 费用详细页面跳转
 * weiheng 20180702
 */
  goDetail: function (feeId, objectId, objectType, event, width, height, offset) {
    console.log('feeId', feeId)
    console.log('objectId', objectId)
    event ? layui.stope(event) : ''
    var url = basePath + '/feeModelController.do?goConsignFeeDetail&id=' + feeId;
    //console.info(objectType);
    if (objectType == 'FeeContract') {// 合同页不需要打印费用明细、费用通知单
      var index = layer.open({
        type: 2,
        title: '费用详情',
        offset: offset,
        skin: 'mylayui-layer-molv',
        content: url,
        closeBtn: 0,
        btn: ['关闭'],
        area: ['80%', '80%'],
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
        skin: 'mylayui-layer-molv',
        content: url,
        closeBtn: 0,
        btn: ['打印收费明细', '打印收费通知单', '关闭'],
        area: ['80%', '80%'],
        btn1: function () {
          window.open('udrController.do?openUdrCommonTemplate&&objectId=' + objectId + '&&type=feeDetailTable');
        },
        btn2: function () {
          window.open('udrController.do?openUdrCommonTemplate&&objectId=' + objectId + '&&type=TestPaymentNotice');
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
        skin: 'mylayui-layer-molv',
        content: url,
        closeBtn: 0,
        btn: ['关闭'],
        area: ['80%', '80%'],
        btn1: function () {
          layer.close(index);
        },
      });
    }
  },


  /**
* 未收费批量收费
*/
  doBitchFee: function (event) {
    this.updateWithId(event, 'feeModelController.do?goUpdate');
  },
  updateWithId: function (event, url, id, isRestful) {
    var title = "委托收费"
    var rowsData = this.dataGrid.datagrid('getSelections');
    if (!rowsData || rowsData.length == 0) {
      // tip('请选择编辑项目');
      btnTipMsg(event, '请选择待收费记录')
      return;
    }
    if (rowsData.length == 1 && rowsData[0].objectType == 'FeeContract') {
      title = "合同收费";
    }

    var feeid = "";
    if (rowsData.length > 1) {
      for (var i = 0; i < rowsData.length; i++) {
        if (i == 0) {
          consignUnit = rowsData[i].unitId;
          feeid += rowsData[i].id + ",";
        } else {
          var temp = rowsData[i].unitId;
          if (consignUnit != temp) {
            layer.msg('您所选的数据，包含多个单位，不能批量收费，请重新选择！', { icon: 2 });
            return;
          }
          feeid += rowsData[i].id + ",";
        }
      }
      feeid = feeid.slice(0, -1);
    } else {
      feeid = rowsData[0].id;
    }

    if (isRestful != 'undefined' && isRestful) {
      url += '/' + rowsData[0].id;
    } else {
      url += '&id=' + feeid;
    }
    if ('3' === this.status && rowsData[0].objectType !== 'FeeContract') {
      this.dbClick(title, url, ['计费调整', '确定', '取消']);
    } else {
      this.dbAllClick(title, url, ['确定', '取消'])
    }
  },
  // 批量选择
  doBitchSelect: function (event) {
    var that = InitObj
    var row = that.dataGrid.datagrid("getSelected");
    var data = that.dataGrid.datagrid("getData");
    var rows = data.rows;
    if (row == null) {
      // 未选择，智能选择与第一条委托，单位相同的数据
      var unitId = "";
      for (var i = 0; i < rows.length; i++) {
        if (rows[i].objectType == 'FeeConsign' && unitId == "") {
          unitId = rows[i].unitId;
          var index = that.dataGrid.datagrid("getRowIndex", rows[i]);
          that.dataGrid.datagrid("selectRow", index);
        } else if (rows[i].objectType == 'FeeConsign' && rows[i].unitId == unitId) {
          var index = that.dataGrid.datagrid("getRowIndex", rows[i]);
          that.dataGrid.datagrid("selectRow", index);
        }
      }

    } else {	// 已选择了一个

      // 合同不允许多选（当前已勾选了一个合同）
      // FeeReType:报告重打费用,FeeConsign:委托费用,FeeContract:合同费用,FeeUpdateReport:报告修改报告,FeeOther:其他费用
      if (row.objectType == 'FeeContract') {
        // tip('合同不能批量选择！');
        btnTipMsg(event, '合同不能批量选择！')
        return;
      }
      var unitId = row.unitId, objectType = row.objectType
      console.log('unitId', unitId)
      console.log('objectType', objectType)
      for (var i = 0; i < rows.length; i++) {
        if (rows[i].unitId == unitId && rows[i].objectType == objectType) {	// 委托单位相同
          console.log('if', rows[i].objectType)
          var index = that.dataGrid.datagrid("getRowIndex", rows[i]);
          that.dataGrid.datagrid("selectRow", index);
        } else {
          console.log('else', rows[i].objectType)
        }
      }

    }
  },
  /**
* 批量新增收费(额外的收费)
*/
  doNewCharge: function (event) {
    //取得选中的所有需要新增收费的项目（一个或者多个）
    var that = InitObj
    var rows = that.dataGrid.datagrid("getSelections");
    if (rows.length == 0) {
      btnTipMsg(event, '请选择一项收费项目')
      return;
    } else if (rows.length > 1) {
      btnTipMsg(event, '新增收费不支持多条收费数据，请选择一条数据或不选数据！')
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
    InitObj.goNewCharge('新增收费', 'chargeController.do?goAddFee', 'feeModelList', '60%', '80%');
  },
  addRepayment: function (event) {
    layerOpenFun('creditRepaymentController.do?goCreditRepayment', '新增回款登记', ['75%', '90%'], ['确定', '取消']);
  },
  goNewCharge: function (title, url, id, width, height, isRestful) {
    var rowsData = this.dataGrid.datagrid('getSelections');
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
      skin: 'mylayui-layer-molv',
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
    $('#tb').find('*').each(function () {
      queryParams[$(this).attr('name')] = $(this).val();
    });
    var params = '&';
    $.each(queryParams, function (key, val) {
      params += '&' + key + '=' + val;
    });
    var fields = '&field=';
    $.each($('#feeModelList').datagrid('options').columns[0], function (i, val) {
      if (val.field != 'opt') {
        fields += val.field + ',';
      }
    });
    // window.location.href = 'feeModelController.do?exportXls&status=' + this.status + encodeURI(fields + params);
    window.location.href = 'feeModelController.do?exportXls&status=' + this.status + encodeURI(params);
    // JeecgExcelExport("feeModelController.do?exportXls&status=" + this.status, "feeModelList");
  },
  /**
  *  未收费  鼠标双击datagrid数据进入收费页面
  */
  dbClick: function (title, url, btnArr) {
    var index = layer.open({
      type: 2,
      title: title,
      skin: 'mylayui-layer-molv',
      content: url,
      closeBtn: 0,
      // btn: ['计费调整', '确定', '取消'],
      btn: btnArr,
      area: ['80%', '90%'],
      btn1: function () {
        var body = layer.getChildFrame('body', index);
        $(body).find('#recaculation').trigger('click');
        return false;
      },
      btn2: function () {
        var body = layer.getChildFrame('body', index);
        $(body).find('#btn_sub').trigger('click');
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
  dbAllClick: function (title, url, btnArr) {
    var index = layer.open({
      type: 2,
      title: title,
      skin: 'mylayui-layer-molv',
      content: url,
      closeBtn: 0,
      btn: btnArr,
      area: ['80%', '90%'],
      // btn1: function () {
      //   // var body = layer.getChildFrame('body', index);
      //   // $(body).find('#isSubmit').val('1');
      //   // $(body).find('#btn_sub').trigger('click');
      //   // return false;
      // },
      btn1: function () {
        var body = layer.getChildFrame('body', index);
        $(body).find('#btn_sub').trigger('click');
        return false;
      },
      btn2: function () {
        layer.close();
      },
    });
  },
  layerCreateWindow: function (title, url) {
    var index = layer.open({
      type: 2,
      title: title,
      skin: 'mylayui-layer-molv',
      content: url,
      closeBtn: 0,
      btn: ['取消'],
      area: ['80%', '90%'],
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
    console.log('queryParams', queryParams)
    delete queryParams['queryCondition'];
    if (!isDateStartEnd(queryParams['CreateDate'])) {
      $('#CreateDate').val('');
      queryParams['CreateDate'] = '';
    }
    if (!isDateStartEnd(queryParams['TransferSucTime'])) {
      $('#TransferSucTime').val('');
      queryParams['TransferSucTime'] = '';
    }
    queryParams = this.dateStartEnd(queryParams, 'TransferSucTime')
    queryParams = this.dateStartEnd(queryParams, 'CreateDate')
    delete queryParams['TransferSucTime'];
    delete queryParams['CreateDate'];

    this.queryParams = queryParams;
    this.reloadDataGrid(true, queryParams);
  },
  // 普通查询
  quickSearch: function () {
    var condition = $("input[name='queryCondition']").val();
    var queryParams = { 'queryCondition': condition };
    this.queryParams = queryParams;
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
    console.info('reloadDataGrid')
    if (goFirstPage) {
      /*从第一页开始显示*/
      this.dataGrid.datagrid('load', queryParams);
    } else {
      /*停留在当前页面*/
      this.dataGrid.datagrid('reload', queryParams);
    }
  },
  // 各tabs展示数据
  columnsFun: function () {
    var that = this;
    var columns = [];
    columns.push({ title: "id", field: "id", checkbox: true });
    columns.push({ title: "编号", field: "sn", width: 80 });
    columns.push({ title: "委托单位", field: "consignUnitName", width: 160 });
    columns.push({
      title: '费用类型', field: 'objectType', width: 80, formatter: function (value, row, index) {
        var v = '费用类型字段未定义';
        if (value == 'FeeReType') {
          v = '报告重打费用';
        } else if (value == 'FeeConsign') {
          v = '委托费用';
        } else if (value == 'FeeContract') {
          v = '合同费用';
        } else if (value == 'FeeUpdateReport') {
          v = '报告修改报告';
        } else if (value == 'FeeOther') {
          v = '其他费用';
        }
        return v;
      }
    })
    if ('1' !== this.status) {
      columns.push({ title: '应缴费用', field: 'feeTotal', width: 50, formatter: this.applyMoneyAttribute })
    }
    if ('3' !== this.status) {
      columns.push({ title: '已缴费用', field: 'feePaid', width: 50, formatter: this.applyMoneyAttribute })
      columns.push({
        title: '待缴费用', field: 'needPay', width: 50, formatter: function (value, row, index) {
          var values = (parseFloat(row.feeTotal) - parseFloat(row.feePaid)).toFixed(2);
          return formatMoney(getFloatStr(values), 2, '￥ ');
        }
      })
    }

    columns.push({
      title: '费用生成日期', field: 'createDate', width: 60, formatter: function (value, row, index) {
        return value ? new Date(value).Format("yyyy-MM-dd") : ''
      }
    })
    if ('3' !== this.status) {
      columns.push({
        title: '收费日期', field: 'paidDate', width: 60, formatter: function (value, row, index) {
          return value ? new Date(value).Format("yyyy-MM-dd") : ''
        }
      })
    }
    columns.push({
      title: '操作', field: 'opt', width: 80, formatter: function (value, row, index) {
        var btns = '';
        if (row.id) {
          btns += '<button title="查看详情" style="display: none" data-funCode="goFeeDetail" class="layui-btn layui-btn-sm" onclick="InitObj.goDetail(&quot;'
            + row.id + '&quot;, &quot;' + row.objectId + '&quot;, &quot;' + row.objectType + '&quot;, event)"><i class="iconfont icon-detail"></i></button>';
          if (row.objectType == 'FeeConsign') {
            btns += '<button title="计费调整" style="display: none" data-funCode="feeChange" class="layui-btn layui-btn-sm" onclick="InitObj.goRecaculation(&quot;'
              + row.id + '&quot;, &quot;' + row.objectId + '&quot;, &quot;' + row.objectType + '&quot;, event)"><i class="iconfont icon-edit"></i></button>';
            // console.log('4.	列表按钮，取消【撤回】，增加【计费调整】，费用类型为委托费用的才显示【计费调整】')
          }
        }

        return btns;
      }
    })
    return [columns];
  },
  applyMoneyAttribute: function (value) {
    return formatMoney(getFloatStr(value), 2, '￥ ');
  },
  // 弹出提示信息，展示支付详情
  showFeeRecordDetail: function (index, offsetX) {
    var that = InitObj
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
      that.tipIndex = layer.tips(msg, '#mouseOverDom', { tips: 1, time: 20000, skin: 'tips-msg' });
      $('.tips-msg').css({ 'left': offsetX })
    }
    );
  },
  isBtnFun: function (num) {
    this.status = num;
    var codes = 'goAddFee,feeRollback,batchSelectFee,feeExportXls,newFeeDetail';
    if ('1' === this.status) {
      this.btnDoBitchFee.hide();
      this.btnGoRollback.hide();
      codes = 'batchSelectFee,feeExportXls,newFeeDetail';
    } else if ('2' === this.status) {
      this.btnGoRollback.hide();
      codes = 'goAddFee,batchSelectFee,feeExportXls,newFeeDetail';
    } else {
      this.btnDoBitchFee.show();
      this.btnGoRollback.show();
    }
    funCode(codes, this.funCodeComplete);
  },
  funCodeComplete: function (isShow) {
    var that = InitObj;
    if (isShow) {
      that.initDataGrid(that.columnsFun());
    }
  },
  /**初始化列，easyui的datagrid方法，去的数据**/

  initDataGrid: function (columns) {
    var that = this;
    var currentMouseOverDom = null;	// 当前鼠标移动到的对象
    var tipMsgSetTimeOut;
    this.dataGrid = $('#feeModelList').datagrid({
      url: this.defaultUrl + '&status=' + this.status,
      pagination: true, //设置为 true，则在数据网格（datagrid）底部显示分页工具栏。
      singleSelect: false, // 只允许选中一行
      toolbar: '#tb',
      fit: true,
      fitColumns: true, //设置为 true，则会自动扩大或缩小列的尺寸以适应网格的宽度并且防止水平滚动。
      scrollbarSize: 0,
      sortName: 'experience', // 报告时间
      sortOrder: 'desc', // 倒序，降序 asc desc
      loadMsg: loadMsgDatagrid,
      columns: columns,
      //加载完成事件
      onLoadSuccess: function (data) {
        console.log('data', data)
        // 调分页 文本显示 common.js函数
        getPagerFun('#feeModelList')
        // that.isBtnFun()
        if (data.rows.length > 0) {
          funCode('goFeeDetail,feeChange')
        }

        $(".datagrid-row").on("mouseover mouseout", function () {
          if (event.type == "mouseover") {
            clearTimeout(tipMsgSetTimeOut);	// 清空，重新计时
            // 当前鼠标移动到的页面DOM对象
            if (currentMouseOverDom != null) {
              $(currentMouseOverDom).removeAttr("id");
            }
            currentMouseOverDom = document.elementFromPoint(event.pageX, event.pageY);
            $(currentMouseOverDom).attr("id", "mouseOverDom");
            var offsetX = (event.pageX - 20)
            var attrValue = $(this).attr("datagrid-row-index");
            tipMsgSetTimeOut = setTimeout("InitObj.showFeeRecordDetail(" + attrValue + "," + offsetX + " )", 1500);	// 1.5秒倒计时

          } else if (event.type == "mouseout") {
            if (currentMouseOverDom != null) {
              $(currentMouseOverDom).removeAttr("id");
              currentMouseOverDom = null;
            }
            clearTimeout(tipMsgSetTimeOut);	// 清空
            layer.close(that.tipIndex);
          }

        });

      },
      onSelect: function (rowIndex, rowData) {
        //当用户单击一个单元格时触发。
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
        // 双击事件,进入任务分配
        // $('#dataGrid').datagrid('checkRow', index);
        // reAssignTask();
        if ('3' === row.status) { //未收费
          that.dbClick('委托收费', 'feeModelController.do?goUpdate&id=' + row.id, ['计费调整', '确定', '取消']);
        } else if ('2' === row.status) { //部分收费
          that.dbAllClick('委托收费', 'feeModelController.do?goUpdate&id=' + row.id, ['确定', '取消']);
        } else { // 已结清
          that.layerCreateWindow('委托收费详情', 'feeModelController.do?goUpdate&id=' + row.id);
        }
      }
    });
  },
  // 高级查询收起按钮
  retractFun: function () {
    if ($('.retract').is(':hidden')) {
      $('#retractIcon').html('<i class="layui-icon layui-icon-up"></i> ')
    } else {
      $('#retractIcon').html('<i class="layui-icon layui-icon-down"></i> ')

    }
    $('.retract').toggle();
    getTableHeight()
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
      } else {
        that.searchType = 1;
        that.senior.hide();
        that.ordinary.show();
        that.searchShow = !that.searchShow;
        $(this).find('.l-btn-text').text("切换到高级查询"); // 追加样式
        $('#retractIcon').html('<i class="layui-icon layui-icon-up"></i>');
      }
      getTableHeight()
      that.formLayerM.render();
    })
  }
}

