$(function () {
  initDataGrid();
  initEvents();
  // common.js里的此函数是获取按钮或功能权限的 勿删
  funCode()
});

function reloadDataGrid(goFirstPage) {

  var queryParams = {};
  queryParams['quickQryParam'] = encodeURI($('#queryParam').val());
  if (goFirstPage) {
    /*从第一页开始显示*/
    dataGrid.datagrid('load', queryParams);
  } else {
    /*停留在当前页面*/
    dataGrid.datagrid('reload', queryParams);
  }
}

function initEvents() {
  $('.btn-4-search').click(function () {
    reloadDataGrid(true);
  });
  /* $('.btn-4-reset').click(function () {
       $("#queryParam").textbox('setValue','');
       reloadDataGrid(true);
   }); */

  // 为 queryParam 条件输入框绑定  回车 事件
  $('#queryParam').bind('keypress', function (event) {
    var tempValue = $(this).val();
    if (event.keyCode == 13) {
      reloadDataGrid(true);
      return false;
    }
  });
}

function createDetailView(rowData) {
  var htm = '<div style="padding: 3px 3px 3px 0;">';
  htm += '<table class="detail-table">';

  htm += '<tr>';
  htm += '<th style="width: 150px;">样品名称</th>';
  htm += '<th style="width: 150px;">样品编号</th>';
  htm += '<th style="width: 150px;">规格型号</th>';
  htm += '<th style="width: 150px;">工程部位用途</th>';
  htm += '<th style="width: 300px;">试验参数</th>';
  htm += '<th>备注</th>';
  htm += '</tr>';

  // noinspection JSUnresolvedVariable
  var rows = rowData.testObjects;
  for (var i = 0; i < rows.length; i++) {
    var row = rows[i];
    var testObjCodee = "";
    if(row.testObjectCode && row.testObjectCode.length>0){
    	testObjCodee = row.testObjectCode;
    }
    htm += '<tr>';
    htm += '<td>' + row.testSampleDisplayName + '（' + row.testSampleName + '）</td>';
    htm += '<td>' + testObjCodee + '</td>';	// 样品编号
    htm += '<td>' + row.standard + '</td>';
    htm += '<td>' + row.projectPartAndUse + '</td>';	// 工程部位用途
    htm += '<td>';
    // noinspection JSUnresolvedVariable
    var params = row.testObjectParams;
    var paramsHtm = '';
    for (var j = 0; j < params.length; j++) {
      var param = params[j];
      // noinspection JSUnresolvedVariable
      if (param.isDeleted == 0) {
        paramsHtm += param.testParamDisplayName + '，';
      }
    }
    if (paramsHtm) {
      paramsHtm = paramsHtm.substring(0, paramsHtm.length - 1);
    }
    htm += paramsHtm;
    htm += '</td>';

    htm += '<td>' + row.remark + '</td>';
    htm += '</tr>';
  }
  htm += '</table>';
  htm += '</div>';
  return htm;
}


var dataGrid;
function initDataGrid() {

  var type = $("input[name='dataType']").val();	// 数据类型：1.检测中，2.复核中，3.报告审批中，4.报告已审批
  // 定义数据列
  var columns = [];
  columns.push({ title: "", field: "id", checkbox: true, width: 40 });
  columns.push({
    title: "状态", field: "status",
    formatter: function (value, row) {

      var valueCN = '';
      if (row.agePeriod) {
        var agePeriodArr = row.agePeriod.split(',');
        // 龄期标记
        for (var i = 0; i < agePeriodArr.length; i++) {
          if (agePeriodArr[i] == '1') {	// 龄期即将到期，提醒
            valueCN += '&nbsp;<span title="即将到期" style="color:blue;">龄</span>';
          } else if (agePeriodArr[i] == '2') {	// 已超期
            valueCN += '&nbsp;<span title="已过期" style="color:red;">龄</span>';
          } else if (agePeriodArr[i] == '3') {	// 已到期，今天就是龄期试验的日期
            valueCN += '&nbsp;<span title="已到期" style="color:green;">龄</span>';
          }
        }
      }
      // 任务标记
      if (value == '50') {
        valueCN += '&nbsp;<span title="任务退回" style="color:red;">退</span>';
      }
      return valueCN;
    }, width: 130
  });
  columns.push({ title: "任务编号", field: "testTaskCode", width: 130 });
  columns.push({ title: "记录编号", field: "testRecordCode", width: 130 });
  columns.push({ title: "样品编号", field: "testObjectCode", width: 130 });
  if (type == '2' || type == '3' || type == '4') {
    columns.push({ title: "报告编号", field: "reportCode", width: 130 });
  }
  columns.push({ title: "样品名称", field: "testSamepleDisplayName", width: 130 });
  columns.push({
    title: "要求报告时间", field: "requireReportDate", width: 130,
    formatter: function (value, row) {
      if (value) {
        var deadLineReport = new Date(value.replace(/-/g, "/"));
        var nowDate = new Date();
        var days = nowDate.getTime() - deadLineReport.getTime();
        var diffDay = parseFloat(days / (1000 * 60 * 60 * 24));
        if(type == '1'){	//实验检测tab
        	if (diffDay > 2) {	// 已经超过要求报告时间两天
            	return '<span style="color:red;">' + value + '</span>';
            }else{
            	return '<span>' + value + '</span>';
            }
        }else{		//其他tab
        	return '<span>' + value + '</span>';
        }
      }
    }
  });
  if (type == '3' || type == '4') {
    columns.push({ title: "报告提交时间", field: "submitDate", width: 130 });
  }
  columns.push({ title: "检测人员", field: "testUser", width: 130 });
  // TODO 这个是UDR报告填写的时候录入，后续要看看，目前为空
  columns.push({ title: "检测时间", field: "testTime", width: 130 });
  columns.push({ title: "报告编写", field: "reportEditor", width: 130 });// 编写人
  columns.push({ title: "复核", field: "reportReconfirm", width: 130 });// 报告复核人
  if (type == '3' || type == '4') {
    columns.push({ title: "审核", field: "reportAudit", width: 130 });
    columns.push({ title: "批准", field: "reportApproved", width: 130 });
  }
  if (type == '2' || type == '3') {	// 报告审批中、报告已批准
    columns.push({
      title: '操作', field: 'opt', nowrap: true, width: 120, fixed: true,
      formatter: function (value, row) {
        var s = '';
        s += '<a href="#" title="查看详情" style="display:none" data-funCode="goTesttaskInfo"  class="layui-btn layui-btn-sm"  onclick=\'goDetail("' + row.id + '" )\'><i class="iconfont icon-detail"></i></a>';
        s += '<a style="margin-left:10px;" title="撤回" href="#" class="layui-btn layui-btn-sm btn-4-detail" onclick="revoke(\'' + row.id + '\')"><i class="iconfont icon-undo1"></i></a>';
        return s;
      }
    });
  } else {	// 试验检测中、复核确认中
    columns.push({
      title: '操作', field: 'opt', nowrap: true, width: 80, fixed: true,
      formatter: function (value, row) {
        var s = '<a href="#" title="查看详情" style="display:none" data-funCode="goTesttaskInfo"  class="layui-btn layui-btn-sm"  onclick=\'goDetail("' + row.id + '" )\'><i class="iconfont icon-detail"></i></a>';
        return s;
      }
    });
  }


  // 加载datagrid列表
  dataGrid = $('#testingDataTable').datagrid({
    url: 'testTaskController.do?datagrid&type=' + type,
    pagination: true,
    toolbar: '#toolbar, #toolbar2',
    fit: true,
    fitColumns: true,
    scrollbarSize: 0,
    sortName: 'createDate',
    sortOrder: 'desc',
    columns: [columns],
    view: detailview,
    loadMsg: loadMsgDatagrid,
    detailFormatter: function (rowIndex, rowData) {
      return createDetailView(rowData);
    },
    onLoadSuccess: function (data) {
      /*修正展开详情按钮样式问题*/
      var expandDiv = $('span.datagrid-row-expander').parent('div');
      $(expandDiv).css('height', '25px');
      // common.js里的此函数是获取按钮或功能权限的 勿删
      funCode();
      // 展开按钮上下居中
      $('.datagrid-row-expand').parent().css('height','16px');
    },
    onDblClickRow: function (index, row) {
      console.dir($(this).find('[data-funCode="goTesttaskInfo"]'))
      goDetail(row.id)
      // bindDbclickEvent(index,1);
    }
  });

  // 处理分页样式
  var p = $('#testingDataTable').datagrid('getPager');
  $(p).pagination({
    pageSize: 10,//每页显示的记录条数，默认为10  
    pageList: [10, 20, 30],//可以设置每页记录条数的列表  
    beforePageText: '第',//页数文本框前显示的汉字  
    afterPageText: '页    共 {pages} 页',
    //displayMsg: '当前显示 {from} - {to} 条记录   共 {total} 条记录',
    displayMsg: '{from} - {to} 共 {total} 条',
  });
}

function goDetail(id) {
  var url = 'testTaskController.do?goTestTaskDetail&id=' + id;
  var btn = $('[data-funCode="goTesttaskInfo"]')[0];
  if($(btn).is(':hidden')){
    layerAlertFun('您没有查看详情的权限，请添加')
  }else{
    window.open(url)
  }
  /*parent.$('#testDetailDialog').dialog({
      title: '试验详情',
      width: '100%',
      height: '100%',
      closed: false,
      cache: false,
      href: url,
      modal: true
  });*/
}

/**
* 打印空表 - 打印空记录集
* weiheng 20190321
*/ 
function printEmptyRecord() {
  var rows = $('#testingDataTable').datagrid('getSelections');
  if (rows.length == 0) {
    btnTipMsg(event, '请勾选一条数据记录')
    return;
  }
  // 批量打印浏览器内存溢出、导致崩溃，改成一次只打印一个（和老板ilis一样）
  /*for (var i = 0; i < rows.length; i++) {
    printUdrNullDataTemplate(rows[i].id, rows[i].testObjectId);
  }*/
  var testTaskIdArr = [], testObjectIdArr = [];
  for (var i = 0; i < rows.length; i++) {
	  testTaskIdArr.push(rows[i].id);
	  testObjectIdArr.push(rows[i].testObjectId);
    //printUdrNullDataTemplate(rows[i].id, rows[i].testObjectId);
  }
  var udrPrint = new UdrPrint(testTaskIdArr, testObjectIdArr);
  udrPrint.printStart();
  
}