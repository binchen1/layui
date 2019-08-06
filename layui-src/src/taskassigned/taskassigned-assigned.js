$(function () {
  initDataGrid();
  initEvents();
  commonQryKeyDown();
});

//快速查询input框绑定的回车事件
function commonQryKeyDown(){
$('#commonQueryForm input').bind('keypress',function(event){  
      if(event.keyCode == "13"){
          reloadDataGrid(true,false);
      }  
  });
}

//显示高级查询
function openSuperQueryDiv(){
$("#commonQueryDiv").hide();
$("#superQueryDiv").show();
}
//显示快速 查询
function openCommonQueryDiv(){
$("#superQueryDiv").hide();
$("#commonQueryDiv").show();
}
//高级查询时删除已选中的人员
function removeThisPerson(th){
var personId = th.title;
$(th).remove();
$("#"+personId).remove();
}
//重置时删除全部已选人员
function delAllPerson(){
$("#qryPerson").html("");
$("#personIdHidden").html("");
}
//高级查询时新增人员
function addPerson(users){
//	users = "魏衡|4028820e62dbb2e40162dbcfca29000b,李鑫|4028829061fa52840161fa54415f0001";
console.log(users);
//需要新增的用户
var userArray = users.split(',');
//已选择的用户
var readyUsers = $("#personIdHidden .personId");
for(var i=0; i<userArray.length; i++){
  var user = userArray[i];
  console.log(user);
  var userName = user.split('|')[0];
  var userId = user.split('|')[1];
  var type = user.split('|')[2];
  if(type != 'USER'){
    continue;
  }
  //检测是否重复选择同一用户
  var isChecked = false;
  for(var j=0; j<readyUsers.length; j++){
    if(readyUsers[j].value == userId){
      isChecked = true;
      console.log("重复选择人员:"+userName);
      break;
    }
  }
  if(!isChecked){
    //写入页面用户名字徽章
    $("#qryPerson").append('<span class="layui-badge layui-bg-gray" title="'+userId+'" onclick="removeThisPerson(this);">'+userName+'<i class="layui-icon">&#x1007;</i></span>');
    //传给后台的用户id值
    $("#personIdHidden").append('<input type="hidden" id="'+userId+'" class="personId" value="'+userId+'"/>');
  }
}
}

//初始化各按钮事件
function initEvents() {
//快速查询提交
  $('.btn-4-search-common').click(function () {
      reloadDataGrid(true,false);
  });
  //高级查询提交
  $('.btn-4-search-super').click(function () {
      reloadDataGrid(true,true);
  });
  //重置高级查询form内容
  $('.btn-4-reset').click(function () {
      $('#superQueryDiv form')[0].reset();
      delAllPerson();
      reloadDataGrid(true,true);
  });
  //获取操作日志
  $('.btn-4-test-log').click(function () {
      var row = dataGrid.datagrid('getSelected');
      if (row) {
          var url = 'experimentalTestingController.do?goCommentsOnly';
          // noinspection JSUnresolvedVariable
          url += '&businessKey=' + row.consignInfo.id;
          layer.open({
              type: 2,
              skin: 'layui-layer-molv',
              title: '检测日志',
              content: url,
              maxmin: false,
              btn: false,
              area: ['900px', '500px']
          });
      }else{
        layer.msg("没有选中数据");
      return;
      }
  });
}


//-----------------------datagrid操作部分----------------------
var dataGrid;
//获取datagrid选中行对象
function getSelectRows(){
var row = $('#dataGrid').datagrid('getChecked');
return row;
}

//任务分配界面查询结果集：由当前用户分配的全部任务，创建者是当前登录用户的记录
function initDataGrid() {
var tipMsgSetTimeOut;//鼠标停留的计时器,停留一段时间弹出详情功能使用
var currentMouseOverDom = null;	// 当前鼠标停留的页面dom对象
  var url = 'assignedTaskController.do?datagrid';
  dataGrid = $('#dataGrid').datagrid({
      url: url,
      pagination: true,
      singleSelect: true,
      toolbar: '.toolbar',
      fit: true,
      fitColumns:true,
      scrollbarSize:0,
      sortName: 'createDate',
      sortOrder: 'desc',
      columns: [[
          {title: "ID", field: "id", checkbox: true,width:120},
          {title: "检测人员", field: "testTaskPersons.name",
              formatter: function (value, row) {
                  var userName = '';
                  $.each(row.testTaskPersons,function(index,value){
                    if(value.type=='0'){//这里指显示检测人员,不显示审核批准等人
                      userName += (value.name+',')
                    }
                  });
                  if(userName.length>1){
                    userName = userName.substring(0,userName.length-1);
                  }
                  return userName;
              },width:130
          },
          /*{title: "委托编号", field: "consignInfo.consignCode",
              formatter: function (value, row) {
                  // noinspection JSUnresolvedVariable
                  return row.consignInfo.consignCode;
              },width:100
          },*/
          {title: "任务编号", field: "testTaskCode",width:130},
          {title: "样品编号", field: "testObjects.testObjectCode",
              formatter: function (value, row) {
                  var sampleCode = '';
                  $.each(row.testObjects,function(index,value){
                    sampleCode += (value.testObjectCode+',')
                  });
                  if(sampleCode.length>1){
                    sampleCode = sampleCode.substring(0,sampleCode.length-1);
                  }
                  return sampleCode;
              },width:130
          },
          {title: "样品名称", field: "testObjects.testSampleDisplayName",
              formatter: function (value, row) {
                  var sampleName = '';
                  $.each(row.testObjects,function(index,value){
                    sampleName += (value.testSampleDisplayName+',')
                  });
                  if(sampleName.length>1){
                    sampleName = sampleName.substring(0,sampleName.length-1);
                  }
                  return sampleName;
              },width:130
          },
          {title: "工程部位/用途", field: "consignInfo.partAndUse",
              formatter: function (value, row) {
                  // noinspection JSUnresolvedVariable
                  return row.consignInfo.projectPartAndUse;
              },width:120
          },
          {title: "要求报告时间", field: "requireCompletedDate",width:120},
          {title: "报告提交时间", field: "reportDate",width:120},
          {title: "任务状态", field: "status",
              formatter: function (value, row) {
                  var valueCN = '';
                  if (value == '10') {
                      valueCN = '待分配';
                  } else if (value == '20') {
                      valueCN = '试验检测进行中';
                  } else if (value == '30') {
                      valueCN = '已完成试验检测';
                  } else if (value == '40') {
                      valueCN = '已提交报告';
                  }
                  return valueCN;
              },width:130
          },
      ]],
      //加载完成事件
      onLoadSuccess: function (data) {
        console.log('data',data)
          //鼠标停留和离开事件
        $(".datagrid-row").on("mouseover mouseout",function(){
        if(event.type == "mouseover"){
        clearTimeout(tipMsgSetTimeOut);	// 清空，重新计时
        // 当前鼠标移动到的页面DOM对象
        if(currentMouseOverDom != null){
          $(currentMouseOverDom).removeAttr("id");
        }
        currentMouseOverDom = document.elementFromPoint(event.pageX,event.pageY);	
        $(currentMouseOverDom).attr("id", "mouseOverDom");
        
        //console.info($("#mouseOverDom")); 
        var attrValue = $(this).attr("datagrid-row-index");
        tipMsgSetTimeOut=setTimeout("showTaskDetailTips("+attrValue+")",1500);	// 1.5秒倒计时
      
      } else if(event.type == "mouseout"){
        if(currentMouseOverDom != null){
          $(currentMouseOverDom).removeAttr("id");
          currentMouseOverDom = null;
        }
        clearTimeout(tipMsgSetTimeOut);	// 清空
        layer.close(tipIndex);
      }
      
      });
      },
      onDblClickRow: function (index, row) {
        //双击事件,进入任务分配
        $('#dataGrid').datagrid('clearSelections');
        $('#dataGrid').datagrid('checkRow', index);
        reAssignTask();
      }
  });
}

/**重载datagrid*/
function reloadDataGrid(goFirstPage,isSuper) {
//快速查询
  var queryParams = $('#commonQueryForm').serializeJSON();
  if(isSuper){
    //高级查询
    queryParams = $('#superQueryForm').serializeJSON();//表单参数
    //如果选了一个及以上的人员,拼接多人员参数
    if($("#personIdHidden .personId").length>0){
      var personIdStr = "";
      $("#personIdHidden .personId").each(function(){
          personIdStr += ($(this).val()+",")
        });
      personIdStr = personIdStr.substring(0,personIdStr.length-1);
      queryParams['personId'] = personIdStr;
    }
    console.log('高级查询参数'+queryParams);
  }
  if (goFirstPage) {
      /*从第一页开始显示*/
      dataGrid.datagrid('load', queryParams);
  } else {
      /*停留在当前页面*/
      dataGrid.datagrid('reload', queryParams);
  }
}

function openTabs(id, name, url) {
  window.parent.addTabs({"id": id, "title": name, "close": false, "url": url});
}

/**重新分配*/
var allotWindowIndex;
function reAssignTask(){
var row = getSelectRows();
if(row==null || row.length<1){
  layer.msg("没有选中数据");
  return;
}
if(row.length>1){
  layer.msg("一次只能重新分配一条任务");
  return;
}
if(row[0].status != '20'){
  layer.msg("只能重新分配试验检测中的任务");
  return;
}
var testTaskId = row[0].id;
var url = basePath + '/assignedTaskController.do?goReAssignPage&testTaskId='+testTaskId;
allotWindowIndex = layer.open({
  skin: 'layui-layer-molv',
  maxmin: false,
      type: 2,
      title: '任务分配',
      content: url,
      btn: [ '确定', '关闭' ],
      area: [ '80%', '100%' ],
      yes: function (index, layero) {
          var body = layer.getChildFrame('body', index);
          var iframeWin = window[layero.find('iframe')[0]['name']];
          
          //调用子容器的方法
          iframeWin.submitAssign();
          //iframeWin[childFuncName]();
      }
  });
}

//关闭分配任务弹窗的方法,这个方法是在分配任务子页面上调用的,勿删
function closeAssignWindow(){
layer.close(allotWindowIndex);
$('#dataGrid').datagrid('reload');
}

var tipIndex;
//弹出提示信息，展示任务详情
function showTaskDetailTips(index){
var taskList = $("#dataGrid").datagrid("getData");
var row = taskList.rows[index];

//人员信息
var userNameStr = '';
var reportPerson = '报告编写:';
var recheckPerson = '复核:';
var auditPerson = '审核:';
var approvePerson = '批准:';
  $.each(row.testTaskPersons,function(index,value){
    console.log(value);
    switch(value.type){
      case '2': reportPerson += (value.name+',');
        break;
      case '1': recheckPerson += (value.name+',');
        break;
      case '3': auditPerson += (value.name+',');
        break;
      case '4': approvePerson += (value.name+',');
        break;
    }
  });
  if(reportPerson.length>5){reportPerson = reportPerson.substring(0,reportPerson.length-1)+'; ';}
  if(recheckPerson.length>3){recheckPerson = recheckPerson.substring(0,recheckPerson.length-1)+'; ';}
  if(auditPerson.length>3){auditPerson = auditPerson.substring(0,auditPerson.length-1)+'; ';}
  if(approvePerson.length>3){approvePerson = approvePerson.substring(0,approvePerson.length-1)+'; ';}
  userNameStr = reportPerson+recheckPerson+auditPerson+approvePerson;
  //委托编号
  var consignCode = row.consignInfo.consignCode;
  //委托单位
  var consignUnit = row.consignInfo.consignUnitName;
  //委托日期
  var consignDate = row.consignInfo.consignDate;
  //规格型号
  var standard = ""
  //检测参数
  var testParams = "";
  $.each(row.testObjects,function(index,value){
    standard += (value.standard+';');
    $.each(value.testObjectParams,function(index,value1){
      testParams += (value1.testParamDisplayName+'、')
    });
  });
  if(standard.length>0){
    standard = standard.substring(0,standard.length-1);
  }
  if(testParams.length>0){
    testParams = testParams.substring(0,testParams.length-1);
  }
  
var msg = "<p>"+userNameStr +"</p>"
    + "<p>规格型号："+standard +"</p>"
    + "<p>委托编号："+consignCode +"</p>"
    + "<p>委托单位："+consignUnit +"</p>"
    + "<p>委托日期："+consignDate +"</p>"
    + "<p>检测参数："+testParams +"</p>";

tipIndex = layer.tips(msg, '#mouseOverDom',  {tips: 1, time: 20000});
}

//查看任务详情
function goDetail(id) {
  var url = 'testTaskController.do?goTestMain&id=' + id;
  var index = layer.open({
      type: 2,
      skin: 'layui-layer-molv',
      title: '试验任务详情',
      content: url,
      maxmin: false,
      btn: false,
      area: ['100%', '100%']
  });
  layer.full(index);
//    layerCreateWindow('试验任务详情',url,false,['100%','100%']);
}


//回退后的回调函数,刷新列表数据
function rollbackCallBack(){
reloadDataGrid(false, false);
}