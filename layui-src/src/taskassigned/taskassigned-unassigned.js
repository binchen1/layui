
/**初始化数据**/
$(document).ready(function () {

  initDatagrid();
  beCallSoOpenConsignWindow();//其他页面调用传入taskid的情况下直接打开任务分配子窗口
  commonQryKeyDown();
  qryOverdueMsg();
});

//查询龄期临近和超期未分配的样品数量
function qryOverdueMsg() {
  $.ajax({
    type: "POST",
    url: "unAssignedTaskController.do?qryOverdueMsg",
    data: "",
    dataType: "json",
    success: function (data) {
      if (data.success) {
        $("#day1").html(data.attributes.howLangToAge);
        $("#count1").html(data.attributes.countPeriod);//临期样品数量
        $("#day2").html(data.attributes.overDate);
        $("#count2").html(data.attributes.countNotAssign);//超期未分配样品数量
        if (data.attributes.countPeriod > 0 || data.attributes.countNotAssign > 0) {
          $("#overdueDiv").show();
          setInterval("changeColorRandom('overdueA')", 500);
        }
      } else {
        layer.msg(data.msg);
        $("#overdueDiv").hide();
      }
    }
  });
}

//随机替换元素颜色(不重复)
var nowColor = "red";
function changeColorRandom(domId) {
  var color = ['red', 'green', 'black'];
  var newColor = color[parseInt(Math.random() * color.length)];
  while (newColor == nowColor) {
    newColor = color[parseInt(Math.random() * color.length)];
  }
  $("#" + domId).css('color', newColor);
  nowColor = newColor;
}

//查询龄期临近和超过指定时间没有分配完成的样品信息
function qryListOverdue() {
  var queryParams = { qryType: "overdue" };
  reloadDataGrid(true, queryParams);
}

//快速查询
function quickSearch() {
  var queryParams = $('#commonQueryForm').serializeJSON();
  reloadDataGrid(true, queryParams);
}
function commonQryKeyDown() {
  //快速查询input框绑定的回车事件
  $('#commonQueryForm input').bind('keypress', function (event) {
    if (event.keyCode == "13") {
      quickSearch();
      return;
    }
  });
}

//初始化表单数据
var dataGrid;
function initDatagrid() {
  var url = 'unAssignedTaskController.do?datagrid';
  dataGrid = $('#taskList').datagrid({
    idField: 'sampleId',
    url: url,
    pagination: true,
    singleSelect: false,
    fit: true,
    fitColumns: true,
    scrollbarSize: 0,
    sortName: 'consign_date',
    sortOrder: 'asc',
    columns: [[
      { field: 'consignId', title: '委托ID', hidden: true },
      { field: 'workFlowTaskId', title: '流程任务ID', hidden: true },
      { field: 'sampleId', title: '样品id', checkbox: true, width: 100 },
      { field: 'status', title: '标志', width: 57,
    	  formatter: function (value, row){
    		  if(value == '2'){
    			  return '<strong style="color:red;" title="退回重新流转的样品">&nbsp;退</strong>';
    		  }
    	  }
      },
      { field: 'test_sample_display_name', title: '样品名称', width: 200 },
      { field: 'test_object_code', title: '样品编号', sortable: true, width: 150 },
      { field: 'standard', title: '规格型号', width: 200 },
      { field: 'partAndUse', title: '工程部位/用途', width: 250 },
      {
        field: 'consign_date', title: '委托日期', sortable: true,
        formatter: function (value, row) { 
          var html = ''
          if ('***' === value) {
            html += '***'
          } else {
            html += (value ? new Date().format('yyyy-MM-dd', value) : '');
          }

          return html;
        },
        width: 150
      },
      {
        field: 'require_report_date', title: '要求报告日期',
        formatter: function (value, row) {
          return value ? new Date().format('yyyy-MM-dd', value) : '';
        },
        width: 150
      },
      {
        field: 'opt', title: '操作', width: 100,
        formatter: function (value, row) {
          console.log("查看详情");
          var infoButton = '<a href="#" onclick="goDetail(\'' + row.consignId + '\')" class="ace_button"><i class="fa fa-book"></i></a>';
          return infoButton;
        }
      }
    ]],
    onClickRow: function (rowIndex, rowData) {
      rowid = rowData.id;
      gridname = 'taskList';
    },
    onDblClickRow: function (index, row) {
      console.log("双击事件");
      $('#taskList').datagrid('checkRow', index);
      batchAssignTask();
    },
    //bind数据成功设置列宽度
    onLoadSuccess: function (data) {
      console.log("加载完成");
    }
  });

  $('#taskList').datagrid('getPager').pagination({
    beforePageText: '',
    afterPageText: '/{pages}',
    displayMsg: '{from}-{to}共 {total}条',
    showPageList: true,
    showRefresh: true
  });

  $('#taskList').datagrid('getPager').pagination({
    onBeforeRefresh: function (pageNumber, pageSize) {
      $(this).pagination('loading');
      $(this).pagination('loaded');
    }
  });

};

//适配表格宽度的函数
function fixWidth(percent) {
  return document.documentElement.clientWidth * percent; //这里你可以自己做调整
}


//打开批量分配任务窗口
var allotWindowIndex;
function batchAssignTask() {
  var rowsData = $('#taskList').datagrid('getSelections');
  var url = basePath + '/unAssignedTaskController.do?goAllotByObjectPage';
  if (rowsData.length == 0) {
    tip('请选择要分配的任务');
    return;
  }else if(rowsData.length == 1){
	  //选中一条的时候,判断其之前是否有分配过,按之前的分配方式打开页面
	  var taskAssignType = rowsData[0].taskAssignType;
	  if(taskAssignType == '1'){		  
		  url = basePath + '/unAssignedTaskController.do?goAllotByParamPage';
	  }
  }
  allotWindowIndex = layerCreateWindow('任务分配', url, ['确定', '关闭'], ['80%', '100%'], '', '', '', 'submitAssign');
}

//关闭分配任务弹窗的方法,这个方法是在分配任务子页面上调用的,勿删
function closeAssignWindow() {
  layer.msg("操作成功");
  layer.close(allotWindowIndex);
  reloadDataGrid(false);
}

//回退流程
function backProcess() {
  var testObjectId = getSelectedObjectId();
  if(!testObjectId || testObjectId.length<1){
	  return ;
  }
  showRollbackPage('taskAssign',testObjectId);
}
//回退后的回调函数,刷新列表数据
function rollbackCallBack(){
	var queryParams = $('#commonQueryForm').serializeJSON();
	reloadDataGrid(false, queryParams);
}

//查看委托详情
function goDetail(id) {
  var url = '委托详情页正在规划中,你点击的委托ID:' + id;
  layerCreateWindow('委托详情', url, ['确定', '关闭'], ['30%', '30%'], "", "", "1");
}


//其他页面通过url传参的方式调用该页面时,如果带有任务id,默认打开任务分配子窗口
function beCallSoOpenConsignWindow() {
  //这里这样写可能是为了其他页面跳转分配任务时,直接在地址后面带参数到该页面,就可以打开分配子页面吧
  var id = GetQueryString("id");
  if (id != null && id != "") {
    var taskId = GetQueryString("taskId");
    var url = "taskAssignedController.do?goTaskAssigned&consignId=" + id + "&taskId=" + taskId;
    layerCreateWindow('分配人员', url, ['确定', '关闭'], ['80%', '100%']);
  }
}
//获取地址栏参数的方法
function GetQueryString(name) {
  var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
  var r = window.location.search.substr(1).match(reg);
  console.log(window.location.search)
  if (r != null) return unescape(r[2]);
  return null;
}


//----------------datagrid辅助js--------------

/**重载datagrid*/
function reloadDataGrid(goFirstPage, queryParams) {
  dataGrid.treegrid('uncheckAll');
  dataGrid.treegrid('clearChecked');
  if (goFirstPage) {
    /*从第一页开始显示*/
    dataGrid.datagrid('load', queryParams);
  } else {
    /*停留在当前页面*/
    dataGrid.datagrid('reload', queryParams);
  }
}

//获取选中的
function getSelectedObjectId() {
  var rows = getSelectRows();
  if (rows.length != 1) {
    tip("请选择一个样品");
    return;
  }
  var testObjectId = rows[0].sampleId;
  return testObjectId;
}
//获取选中行(提供给弹窗子页面使用的重要方法,勿删)
function getSelectRows() {
  return $('#taskList').datagrid('getChecked');
}
//获取全部的选中数据
function gettaskListSelections(field) {
  var ids = [];
  var rows = $('#taskList').datagrid('getSelections');
  for (var i = 0; i < rows.length; i++) {
    ids.push(rows[i][field]);
  }
  ids.join(',');
  return ids
}

//获取已选数据
function gettaskListSelected(field) {
  return getSelected(field);
}
function getSelected(field) {
  var row = $('#' + gridname).datagrid('getSelected');
  if (row != null) {
    value = row[field];
  } else {
    value = '';
  }
  return value;
}
