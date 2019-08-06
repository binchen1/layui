$(function () {
  initEvents();
  funCode('', funCodeComplete);
});

function funCodeComplete(isShow) {
  if (isShow) {
    initDataGrid();
  }
}
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
  // $('.btn-4-reset').click(function () {
  //     $("#queryParam").textbox('setValue','');
  //     reloadDataGrid(true);
  // });

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
    htm += '<tr>';
    htm += '<td>' + row.testSampleDisplayName + '（' + row.testSampleName + '）</td>';
    htm += '<td>' + row.testObjectCode + '</td>';	// 样品编号
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
  console.log('initDataGrid type', type)
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
        var days = deadLineReport.getTime() - nowDate.getTime();
        var diffDay = parseFloat(days / (1000 * 60 * 60 * 24));
        if (diffDay < 2 && diffDay > 0) {	// 还差2天斗要交报告老
          return '<span style="color:red;">' + value + '</span>';
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
  // 数据类型：1.检测中，2.复核中，3.报告审批中，4.报告已审批
  columns.push({
    title: '操作', field: 'opt', nowrap: true, width: 80, fixed: true,
    formatter: function (value, row) {
      console.log('操作', type, row)
      var s = '';
      s += '<a href="#" title="查看详情" style="display:none"  data-funCode="taskReviewGoTaskDetail"  class="layui-btn layui-btn-sm"  onclick=\'goDetail("' + row.id + '","' + row.rid + '", 1 )\'><i class="iconfont icon-detail"></i></a>';
      if (type === '1' || type === '3') {
        s += '<a style="margin-left:10px;display:none" title="撤回"  data-funCode="doReviewRevoke" href="#" class="layui-btn layui-btn-sm btn-4-detail" onclick=\'revoke("' + row.id + '","' + row.rid + '")\'><i class="iconfont icon-undo1"></i></a>';
      }
      return s;
    }
  });
  // 加载datagrid列表
  dataGrid = $('#testingDataTable').datagrid({
    url: 'testTaskController.do?datagrid&dataType=2&type=' + type,
    pagination: true,
    toolbar: '#toolbar,#toolbar2',
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
      console.log('onLoadSuccess', data)
      /*修正展开详情按钮样式问题*/
      var expandDiv = $('span.datagrid-row-expander').parent('div');
      $(expandDiv).css('height', '25px');
      // 勿删，此方法来源common.js
      if (data.rows.length > 0) {
        funCode('taskReviewGoTaskDetail,doReviewRevoke');
      }
      // 展开按钮上下居中
      $('.datagrid-row-expand').parent().css('height', '16px');
    },
    onDblClickRow: function (index, row) {
      bindDbclickEvent(index, 1);
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

// 跳转试验详情页面  readType = 1 复核 、2 审核 、 3 批准 、 4 已批准    
function goDetail(id, reportId, readType) {
  var url = 'testTaskController.do?goTestTaskDetail&id=' + id;
  url += "&readType=" + readType;
  url += "&reportId=" + reportId;
  window.open(url, '任务详情');
}

// 撤回复核信息
function revoke(id, reportId) {

  var url = 'testTaskReviewController.do?doReviewRevoke';
  var dataJson = { 'id': id, 'reportId': reportId };

  $.ajax({
    url: url
    , data: dataJson
    , dataType: 'json'
    , type: 'post'
    , beforeSend: function () {
    }
    , success: function (res) {

      var msg = "操作失败";
      if (res.success) {
        msg = '撤回成功';
      }
      $.messager.alert('提示', msg);
    }
  });

}
