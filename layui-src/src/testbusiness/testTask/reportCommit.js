//储存试验任务id,页面各处都需要使用
var testTaskId = GetQueryString("taskId");
//储存默认报告编号,用于回传时确认用户是否改动过编号
var defaultSn;
//储存任务根目录id,用于报告上传时作为参数使用
var taskDefaultFolderId;
//储存选中的文件id(逗号分隔),提交报告时需要上传
var attachmentIds = '';
//储存报告id,如果是提交确认的方式进来的话
var reportId = GetQueryString("reportId");
console.log('reportId', reportId)
var isSureCommit = false;
var layer = null, form = null;


//初始化各项信息
$(document).ready(function () {
  layui.use(['layer', 'element', 'form'], function () {
    layer = layui.layer;
    form = layui.form;
    var element = layui.element;
    console.log('form')
    console.dir(form)
    setTimeout('initPageInfo()', 150);
  })
  //这里延后50ms执行是为了等待layUI加载模块
})
console.log('11111')
console.dir(form)

//------------------------------------页面初始化--------------------------------------

function initPageInfo() {
  testTaskId = GetQueryString("taskId");
  reportId = GetQueryString("reportId");
  console.log('reportId222', reportId)
  var reportType = $('#reportTypeDiv input[name="reportType"]:checked ').val();
  if (reportId != null && reportId.length > 0) {
    isSureCommit = true;
    initPageInfoByReportId();
  } else {
    isSureCommit = false;
    initPageInfoByReportType();
  }
}

//没有传报告id 时的初始化方法
function initPageInfoByReportType() {
  testTaskId = GetQueryString("taskId");
  reportId = GetQueryString("reportId");
  console.log('reportId333', reportId)
  var reportType = $('#reportTypeDiv input[name="reportType"]:checked ').val();
  attachmentIds = '';
  var tipsIndex;
  $.ajax({
    type: "POST",
    async: false,
    url: "testTaskReportController.do?getAllInfoForReportPage",
    data: {
      'testTaskId': testTaskId,
      'reportId': '',
      'reportType': reportType
    },
    dataType: "json",
    beforeSend: function () {
      tipsIndex = layer.load(0, {
        shade: 0.2
      });
      // tipsIndex = SHOW_LOAD_LAYER('正在执行...');
    },
    success: function (data) {
      console.log(data);
      if (data.success) { //类型.龄期.编号是可能已存在的(确认提交的情况下,所以给放在一起在前面处理)
        var isExistReport = false;
        //初始化类型
        if (data.attributes.report != null) { //结果带有report对象的说明存在这个类型的报告,给予提示并加载默认数据
          isExistReport = true;
          reportId = data.attributes.report.id;
          //显示提示语句 TODO
          var recorder = data.attributes.commitRecord.createName;
          var reportTypeName = reportType == "formal" ? "正式报告" : "临时报告";
          layer.msg('当前任务已由' + recorder + '提交' + reportTypeName + ',本次提交将合并您和' + recorder + '提交的报告！');
        }

        //初始化龄期
        $("#ageRadioDiv").html('');
        if (data.attributes.listPeriod == null || data.attributes.listPeriod.length < 1) {
          //隐藏龄期部分
          $("#ageDiv").hide();
        }
        $.each(data.attributes.listPeriod, function (index, period) {
          var ageInput = '<input type="radio" class="ageRdo" name="age" lay-filter="age" value="' + period.ageDay + '" title="' + period.ageDay;
          if (index == data.attributes.listPeriod.length - 1) {
            ageInput += '（正式报告）"';
            if (!isExistReport) {
              //当前是正常新增
              if (reportType == 'formal') {
                ageInput += ' checked ';
              }
            }
          } else {
            ageInput += '" ';
          }
          //当前类型后台存在报告,选中默认龄期
          if (isExistReport && data.attributes.reportPeriod != null &&
            period.ageDay == data.attributes.reportPeriod.hitekAgeDay) {
            //亲你其他的选中,并选中当前
            $(".ageRdo").removeAttr("checked");
            ageInput += 'checked >';
          } else {
            ageInput += ' >';
          }
          $("#ageRadioDiv").append(ageInput);
        })
        if (reportType == 'formal') {
          $(".ageRdo").removeAttr("checked");
          var ageRadios = $("#ageRadioDiv").children(".ageRdo");
          $(ageRadios[ageRadios.length - 1]).attr("checked", "checked");
        }

        //初始化编号
        $("#reportCodeInput").val(data.attributes.snStr);
        $("#reportCodeHidden").val(data.attributes.snStr);
        defaultSn = data.attributes.snStr;
        //初始化人员
        writePersonTopage(data);
        //初始化结论
        writeVerdictToPage(data);
        //初始化附件
        if (data.attributes.attachments != null && data.attributes.attachments.length > 0) {
          var attachmentNameHtml = '';
          $.each(data.attributes.attachments, function (index, value) {
            attachmentIds += value.id + ',';
            attachmentNameHtml += value.name + '<br/>';
          });
          $("#attachmentA").html(attachmentNameHtml);
          attachmentIds = removeEndSymbol(attachmentIds, ',');
          console.log(attachmentIds);
        } else {
          $("#attachmentA").html('暂无附件');
        }
        //初始化任务的根目录地址
        taskDefaultFolderId = data.attributes.taskRootFolderId;
        //layUI重新渲染
        console.dir(form)
        form.render();
      } else {
        layer.msg(data.msg);
      }
      layer.close(tipsIndex);
    }
  });
}

function initPageInfoByReportId() {
  testTaskId = GetQueryString("taskId");
  reportId = GetQueryString("reportId");
  attachmentIds = '';
  var tipsIndex;
  $.ajax({
    type: "POST",
    async: false,
    url: "testTaskReportController.do?getAllInfoForReportPage",
    data: {
      'testTaskId': testTaskId,
      'reportId': reportId,
      'reportType': ''
    },
    dataType: "json",
    beforeSend: function () {
      tipsIndex = layer.load(0, {
        shade: 0.2
      });
      // tipsIndex = SHOW_LOAD_LAYER('正在执行...');
    },
    success: function (data) {
      console.log(data);
      if (data.success) { //类型.龄期.编号是可能已存在的(确认提交的情况下,所以给放在一起在前面处理)
        var isExistReport = false;
        var reportType = "formal";
        //初始化类型
        if (data.attributes.report != null) { //结果带有report对象的是确认提交,不可修改其类型
          isExistReport = true;
          if (data.attributes.report.reportType == 'formal') {
            reportType = "formal";
            $("#temporaryReport").attr("disabled", "disabled");
            $("#formalReport").attr("checked", "checked");
            $("#ageDiv").hide();
            showFormalReportInfo();
          } else if (data.attributes.report.reportType == 'temporary') {
            reportType = "temporary";
            $("#formalReport").attr("disabled", "disabled");
            $("#temporaryReport").attr("checked", "checked");
            $("#ageDiv").show();
            showTemporaryReportInfo();
          }
        }

        //初始化龄期
        if (data.attributes.listPeriod == null || data.attributes.listPeriod.length < 1) {
          //隐藏龄期部分
          $("#ageDiv").hide();
        }
        $("#ageRadioDiv").html('');
        $.each(data.attributes.listPeriod, function (index, period) {
          var ageInput = '<input type="radio" class="ageRdo" name="age" lay-filter="age" value="' + period.ageDay + '" title="' + period.ageDay;
          if (index == data.attributes.listPeriod.length - 1) {
            ageInput += '（正式报告）"';
            if (isExistReport) {
              //如果当前是确认报告
              if (reportType == "temporary") {
                //当前是龄期报告,禁用最后一个龄期的选中
                ageInput += ' disabled="disabled" ';
              }
            } else {
              //当前是正常新增
              ageInput += ' checked ';
            }
          } else {
            ageInput += '" ';
          }
          //当前是确认报告,默认选中龄期
          if (isExistReport && data.attributes.reportPeriod != null &&
            period.ageDay == data.attributes.reportPeriod.hitekAgeDay) {
            //亲你其他的选中,并选中当前
            $(".ageRdo").removeAttr("checked");
            ageInput += 'checked >';
          } else {
            ageInput += ' >';
          }
          $("#ageRadioDiv").append(ageInput);
        })

        //初始化编号
        $("#reportCodeInput").val(data.attributes.snStr);
        $("#reportCodeHidden").val(data.attributes.snStr);
        defaultSn = data.attributes.snStr;
        //初始化人员
        writePersonTopage(data);
        //初始化结论
        writeVerdictToPage(data);
        //初始化附件
        if (data.attributes.attachments != null && data.attributes.attachments.length > 0) {
          var attachmentNameHtml = '';
          $.each(data.attributes.attachments, function (index, value) {
            attachmentIds += value.id + ',';
            attachmentNameHtml += value.name + '<br/>';
          });
          $("#attachmentA").html(attachmentNameHtml);
          attachmentIds = removeEndSymbol(attachmentIds, ',');
          console.log(attachmentIds);
        } else {
          $("#attachmentA").html('暂无附件');
        }
        //初始化任务的根目录地址
        taskDefaultFolderId = data.attributes.taskRootFolderId;
        //layUI重新渲染
        form.render();
      } else {
        layer.msg(data.msg);
      }
      layer.close(tipsIndex);
    }
  });
}
//页面初始化时,将ajax取回来的结论信息组装写入页面指定位置
function writeVerdictToPage(data) {
  //是否合格
  var isQualified = data.attributes.verdict[0].isQualified;
  var qualifiedHtml;
  if (isQualified) {
    if (isQualified == 0) {
      qualifiedHtml = '<input type="radio" name="judge" value="0" title="不合格" checked>';
    } else if (isQualified == 1) {
      qualifiedHtml = '<input type="radio" name="judge" value="1" title="合格" checked>';
    } else {
      qualifiedHtml = '<input type="radio" name="judge" value="1" title="不做判定" checked disabled>';
    }
  } else {
    qualifiedHtml = '<input type="radio" name="judge" value="1" title="没有填写" checked disabled>';
  }
  $("#qualifiedDiv").html(qualifiedHtml);
  //检测结论
  var testVerdict = data.attributes.verdict[0].testVerdict;
  if (testVerdict) {
    $("#testVerdictInput").val(testVerdict);
  } else {
    $("#testVerdictInput").val('没有填写');
  }
  //检测备注
  var vardictRemark = data.attributes.verdict[0].vardictRemark;
  if (vardictRemark) {
    $("#vardictRemarkInput").val(vardictRemark);
  } else {
    $("#vardictRemarkInput").val('没有填写');
  }
}
//页面初始化时,将ajax取回来的人员信息组装并写入页面指定位置
function writePersonTopage(data) {
  var testPerson = '';
  var recheckPerson = '';
  var auditPerson = '';
  var approver = '';
  $.each(data.attributes.listPerson, function (index, person) {
    switch (person.type) {
      //这里没有2的原因是因为页面不显示报告编写人
      case '0':
        testPerson += person.realname + '；';
        break;
      case '1':
        recheckPerson += person.realname + '；';
        break;
      case '3':
        auditPerson += person.realname + '；';
        break;
      case '4':
        approver += person.realname + '；';
        break;
      default:
        break;
    }
  })
  var personHtml = '<input type="text" name="person" placeholder="' + removeEndSymbol(testPerson, '；') + '" style="width:260px;border:none;" class="layui-input" readonly>';
  $("#testPersonInnerDiv").html(personHtml);
  personHtml = '<input type="text" name="person" placeholder="' + removeEndSymbol(recheckPerson, '；') + '" style="width:260px;border:none;" class="layui-input" readonly>';
  $("#recheckPersonInnerDiv").html(personHtml);
  personHtml = '<input type="text" name="person" placeholder="' + removeEndSymbol(auditPerson, '；') + '" style="width:260px;border:none;" class="layui-input" readonly>';
  $("#auditPersonInnerDiv").html(personHtml);
  personHtml = '<input type="text" name="person" placeholder="' + removeEndSymbol(approver, '；') + '" style="width:260px;border:none;" class="layui-input" readonly>';
  $("#approverInnerDiv").html(personHtml);
}

//------------------------------------页面业务操作--------------------------------------

//类型切换方法
function reportTypeChange() {
  testTaskId = GetQueryString("taskId");
  reportId = GetQueryString("reportId");
  var reportType = $('#reportTypeDiv input[name="reportType"]:checked ').val();
  attachmentIds = '';
  var tipsIndex;
  $.ajax({
    type: "POST",
    async: false,
    url: "testTaskReportController.do?getAllInfoForReportPage",
    data: {
      'testTaskId': testTaskId,
      'reportId': '',
      'reportType': reportType
    },
    dataType: "json",
    beforeSend: function () {
      tipsIndex = layer.load(0, {
        shade: 0.2
      });
      // tipsIndex = SHOW_LOAD_LAYER('正在执行...');
    },
    success: function (data) {
      console.log(data);
      if (data.success) { //类型.龄期.编号是可能已存在的(确认提交的情况下,所以给放在一起在前面处理)
        var isExistReport = false;
        //初始化类型
        if (data.attributes.report != null) { //结果带有report对象的说明存在这个类型的报告,给予提示并加载默认数据
          isExistReport = true;
          reportId = data.attributes.report.id;
          //显示提示语句 TODO
          var recorder = data.attributes.commitRecord.createName;
          var reportTypeName = reportType == "formal" ? "正式报告" : "临时报告";
          layer.msg('当前任务已由' + recorder + '提交' + reportTypeName + ',本次提交将合并您和' + recorder + '提交的报告！');
        }

        //初始化龄期选中
        if (data.attributes.reportPeriod != null) {
          $('#ageRadioDiv input[value=' + data.attributes.reportPeriod.hitekAgeDay + ']').attr("checked", "checked");
        }

        //初始化编号
        $("#reportCodeInput").val(data.attributes.snStr);
        $("#reportCodeHidden").val(data.attributes.snStr);
        defaultSn = data.attributes.snStr;
        //初始化人员
        writePersonTopage(data);
        //初始化结论
        writeVerdictToPage(data);
        //初始化附件
        if (data.attributes.attachments != null && data.attributes.attachments.length > 0) {
          var attachmentNameHtml = '';
          $.each(data.attributes.attachments, function (index, value) {
            attachmentIds += value.id + ',';
            attachmentNameHtml += value.name + '<br/>';
          });
          $("#attachmentA").html(attachmentNameHtml);
          attachmentIds = removeEndSymbol(attachmentIds, ',');
          console.log(attachmentIds);
        } else {
          $("#attachmentA").html('暂无附件');
        }
        //初始化任务的根目录地址
        taskDefaultFolderId = data.attributes.taskRootFolderId;
        //layUI重新渲染
        form.render();
      } else {
        layer.msg(data.msg);
      }
      layer.close(tipsIndex);
    }
  });
}


//重新分配
var allotWindowIndex;

function goReAssignPage() {
  var testTaskId = GetQueryString("taskId");
  var url = basePath + '/assignedTaskController.do?goReAssignPage&from=reportPage&testTaskId=' + testTaskId;
  allotWindowIndex = layer.open({
    skin: 'layui-layer-molv',
    maxmin: false,
    type: 2,
    title: '任务分配',
    content: url,
    btn: ['确定', '关闭'],
    area: ['80%', '90%'],
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
function closeAssignWindow() {
  layer.close(allotWindowIndex);
  initPageInfo();
}

//文件上传请求成功后请求后台将文件和目录和任务绑定关系
function addAttachmentToTask(commonAttachmentIds) {
  $.ajax({
    type: "POST",
    async: false,
    url: "testTaskAttachmentController.do?doAdd",
    data: {
      'testTaskId': testTaskId,
      'folderId': taskDefaultFolderId,
      'commonAttachmentIds': commonAttachmentIds,
      'fileUseType': '1'
    },
    dataType: "json",
    success: function (data) {
      if (data.success) {
        //layer.msg('操作成功');
      } else {
        layer.msg(data.msg);
      }
    }
  })
}

//打开文件重新选择弹窗
var attachmentIndex;

function goAttachmentChoosePage() {
  var url = 'testTaskReportController.do?goAttachmentChoosePage&testTaskId=' + testTaskId;
  attachmentIndex = layerCreateWindow('选择文件', url, ['确认', '取消'], ['80%', '98%'], '', '', '', 'commitChoose');
}
//文件选择页面调用,传入选中的datagrid行对象,解析得到选中的文件
function reciveCheckedFile(rows) {
  if (rows.length > 0) {
    var html = '';
    attachmentIds = '';
    $.each(rows, function (index, row) {
      html += row.name + '<br/>'
      attachmentIds += row.id + ','
    });
    $("#attachmentA").html(html);
    attachmentIds = removeEndSymbol(attachmentIds, ',');
    console.log(attachmentIds);
  }
  layer.close(attachmentIndex);
}
var fristConfirm = true;
// 点击生成编号
function reportSnNumberFun() {
  console.log('点击生成编号')
  submitReport('testTaskReportController.do?doSaveReport', true)
}

//最终提交本页面的报告信息
function submitReport(snUrl, isOpen) {
  //页面缓存已有的变量	testTaskId,reportId,defaultSn,attachmentIds
  //只差 报告类型-龄期-提交意见，其中报告类型和龄期在layui的监听里面写，页面变量缓存，提交意见即时取
  var commitOpinion = $("#commitOpinion").val();
  var nowReportSn = $("#reportCodeInput").val();
  var reportType = $('#reportTypeDiv input[name="reportType"]:checked ').val();
  var ageDate = $('#ageRadioDiv input[name="age"]:checked ').val();
  var fileIdArr = attachmentIds.split(',');
  var jsonObj = {
    'reportId': reportId,
    'testTaskId': testTaskId,
    'isFormalReport': reportType,
    'ageDay': ageDate,
    'reportSn': nowReportSn,
    'defaultSn': defaultSn,
    'attachmentIds': fileIdArr,
    'reportOpinion': commitOpinion
  };
  console.log('jsonObj submit', jsonObj)
  var jsonStr = JSON.stringify(jsonObj)
  console.log(jsonStr);
  var url = snUrl || "testTaskReportController.do?doSubmitReport";
  console.log('fristConfirm', fristConfirm)
  if (fristConfirm) {
    console.log('if', fristConfirm)
    fristConfirm = !fristConfirm;
    ajaxRequestByJsonStr(url, jsonStr, submitReportCallback, true, true, isOpen);
  }
}

// 报告确认 - 不同意
function submitReportDisagree() {
  var url = "testTaskReportController.do?doSubmitReportDisagree";
  var commitOpinion = $("#commitOpinion").val();
  var dataJson = {
    'reportId': reportId,
    'comment': commitOpinion
  };
  ajaxRequest(url, dataJson, submitReportCallback, true, false);
}

function submitReportCallback(resData, isOpen) {
  console.log('isClose', isOpen, typeof isOpen)
  console.log("resData", resData);
  if (resData && resData.success) {
    reportId = resData.obj.reportId;
    var attId = resData.obj.attId; // testTaskAttachment.id
    var sysCompanyCode = resData.obj.sysCompanyCode;
    // invokeLocalExe(reportId, attId, sysCompanyCode);

    console.info('invokeLocalExe end');
    if (isOpen) {
      $('input[name="reportSn"]').val(resData.obj.reportSn);
      fristConfirm = !fristConfirm;
    } else {
      parent.closeReportWindow();
      parent.invokeLocalExe(reportId, attId, sysCompanyCode, attachmentIds, testTaskId);
    }
    /* parent.getReportCode();// 局部刷新提交状态
        window.parent.location.reload(); 
	    parent.layer.msg("操作成功", {icon:6});
		console.log('506',resData)  */
  } else {
    parent.layer.msg("操作失败", {
      icon: 5
    });
    fristConfirm = !fristConfirm;
  }
}

/**
 * 调用本地程序
 * 20181110 weiheng
 */
function invokeLocalExe(reportId, attId, sysCompanyCode) {

  console.info("invokeLocalExe");
  // 1、检测上传的报告是否含有UDR - attachmentIds
  var isContainUdr = false; // 默认没有上传UDR报告
  $.ajax({
    url: "udrController.do?isContainUdr",
    async: false // 同步请求
    ,
    data: {
      'attachmentIds': attachmentIds
    },
    dataType: 'json',
    type: 'post',
    success: function (res) {
      if (res.success) {
        console.log('524', res)
        isContainUdr = true;
      }
    }
  });
  //console.info("isContainUdr", isContainUdr);
  if (!isContainUdr) {
    return;
  }

  // 2、根据任务ID获取样品
  var testObjectId = "";
  $.ajax({
    url: "testObjectController.do?getTestObjectId",
    async: false // 同步请求
    ,
    data: {
      'testTaskId': testTaskId
    },
    dataType: 'json',
    type: 'post',
    success: function (res) {
      if (res.success) {
        testObjectId = res.obj;
        console.log('544', res)
      }
    }
  });

  var reportCode = $("#reportCodeInput").val(); // 报告编码
  var paramString = '&testObjectId=' + testObjectId;
  paramString += '&testTaskId=' + testTaskId;
  paramString += '&reportId=' + reportId; // 报告ID
  paramString += '&attId=' + attId; // 任务附件ID

  var recordUdrUrl = basePath; // 打开udr记录模板 - 打印成pdf记录
  recordUdrUrl += '/udrController.do?openUdrRecordTemplate&printNow=1';
  recordUdrUrl += paramString;

  var reportUdrUrl = basePath; // 打开udr报告模板 - 打印成pdf报告
  reportUdrUrl += '/udrController.do?openUdrReportTemplate&printNow=1';
  reportUdrUrl += paramString;
  console.info("invokeLocal-url-recordUdrUrl", recordUdrUrl);
  console.info("invokeLocal-url-reportUdrUrl", reportUdrUrl);

  var base64 = new Base64();
  var recordHref = "hitek-udr://" + base64.encode("open-url\n" + recordUdrUrl);
  var reportHref = "hitek-udr://" + base64.encode("open-url\n" + reportUdrUrl);
  $("#openUdrRecord").attr("href", recordHref);
  $("#openUdrRecord")[0].click(function () {
    console.log('1111')
  });
  $("#openUdrReport").attr("href", reportHref);
  $("#openUdrReport")[0].click(function () {
    console.log('2222')
  });
  console.log('完成')

  parent.layer.msg("操作成功", {
    icon: 6
  });
  parent.closeReportWindow();
  parent.getReportCode(); // 局部刷新提交状态
  window.parent.location.reload();

}

//-------------------------------页面本地各种触发事件----------------------------

//点击修改报告编号出发的事件
function preModifyReportCode() {
  $("#reportCodeADiv").hide();
  $("#reportCodeInput").removeAttr("readonly");
  $("#reportCodeInput").css("border", "1px solid");
  $("#reportCodeBtnDiv").show();
}
//确定修改报告编号
function sureModifyReportCode() {
  var nowCode = $("#reportCodeInput").val();
  $("#reportCodeHidden").val(nowCode);
  $("#reportCodeInput").attr("readonly", "readonly");
  $("#reportCodeInput").css("border", "none");
  $("#reportCodeBtnDiv").hide();
  $("#reportCodeADiv").show();
}
//取消修改报告编号
function cancelModifyReportCode() {
  var defaultCode = $("#reportCodeHidden").val();
  $("#reportCodeInput").val(defaultCode);
  $("#reportCodeInput").attr("readonly", "readonly");
  $("#reportCodeInput").css("border", "none");
  $("#reportCodeBtnDiv").hide();
  $("#reportCodeADiv").show();
}

//展示正式报告需要展示的信息
function showFormalReportInfo() {
  $($(".ageRdo")[$(".ageRdo").length - 1]).attr("checked", "checked");
  form.render('radio');
  $("#auditPersonDiv").show();
  $("#approverDiv").show();
  $("#reAllotPersonDiv").show();
}
//展示临时报告需要展示的信息
function showTemporaryReportInfo() {
  $("#auditPersonDiv").hide();
  $("#approverDiv").hide();
  $("#reAllotPersonDiv").hide();
}

//获取地址栏参数的方法
function GetQueryString(name) {
  var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
  var r = window.location.search.substr(1).match(reg);
  //console.log(window.location.search)
  if (r != null) return unescape(r[2]);
  return null;
}

//处理字符串尾端指定符号,不传入符号默认移除逗号
function removeEndSymbol(str, symbol) {
  if (!symbol) {
    symbol = ',';
  }
  if (str.charAt(str.length - 1) == symbol) {
    return str.substring(0, str.length - 1);
  }
  return str;
}