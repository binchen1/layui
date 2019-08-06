//初始化UI方法
function initialUI() {
  // 直接展开更多信息
  ChangeExpand(0);
  //进入的提示信息封装
  showTips();
  //隐藏折叠按钮
  hideFoldingBtn();
  //初始化资质类型
  initQualificationType();
  //初始化检测类型
  initCheckType();
  //初始化编号类型
  initSnType();
  //初始化日期、时间组件
  initDateElements();
  //显示样品内容
  echoTestObjects();
  //初始化附件内容
  accessory.initAccessory();
  // 是否显示合同计费信息
  fee.initTotalFee();

  //初始化邮寄信息  
  initPost();

  //根据业务权限进行功能按钮的显示隐藏控制
  funCode();
  //修改模式  则是展示处理    
  if (consign.isDetailPage) {
    // 处理报告详情及  检测任务

    //默认隐藏所有的超链接？
    $('a').hide();

    //显示打印按钮
    $('a.show-print').show();

    //显示更多信息按钮
    $('a.btn-4-show-more').show()

    //所有输入框设置为只读
    $("input").attr('readonly', true);
    //时间选择框禁用
    $("input[name='archiveDate']").attr('disabled', true)
    //checkbox 禁用
    $(':checkbox').attr('disabled', true);
    //单选框禁用
    $('input:radio:checked').attr('disabled', false).siblings().attr('disabled', true)

    //显示查看样品详情按钮
    $('a.sampleInfo').show()

    //禁用所有的下拉选择框
    $('select').attr('disabled', true);

    //禁用日期选择
    $('.Wdate').removeAttr('onclick');
  }
}
;

function initialEventBind() {
  /*
   * 注册双击事件,自动触发本区域的按钮的单击事件
   * */
  $(".hasbtn").dblclick(function () {
    $(this).children("a").click();
  });
  $("#accssoryTD").dblclick(function () {
    $("#accessoryManage").click();
  });

  $('#accessoryManage').bind('click', function () {
    goUploadPage('', accessory.deleteAccessory, accessory.downloadAccessory);
  })

  /**
   *保存委托
   */
  $('.btn-4-save').click(function () {
    consign.saveConsign();
  });
  /**
   *完成委托
   */
  $('.btn-4-complete').click(function () {
    // 先调保存再调完成
    // 添加委托编码校验，是否符合系统预期的生成规则（因为编码可以手动修改）
    $('.btn-4-save').click();
    consign.directComplete = !consign.directComplete;
  });

  $('.btn-4-printConsign').click(function () {
    if ("IE" != myBrowser()) { // 这个是 src="plug-in/assets/js/common.js" 里的方法
      //layerAlertFun('请使用IE浏览器或将浏览器设置为兼容模式！', '5', []);
      layer.msg('请使用IE浏览器或将浏览器设置为兼容模式！', {
        icon: 5
      });
      return;
    }
    consign.saveConsign('2');
  });

  $('.btn-4-sampleLable').click(function () {
    var a = this;
    var id = $("input[name='id']").val();
    //获取第一个样品的id
    //取消<a>标签原先的onclick事件,使<a>标签点击后通过href跳转(因为无法用js跳转)^-^    
    window.open('udrController.do?openUdrCommonTemplate&&objectId=' + id + '&&type=sampleLable');
  });
  /**
   *提交表单
   */
  var beforeSubmitIndex = '';
  $('#form').Validform({
    btnSubmit: "#btn-4-submit",
    tiptype: tipType,
    ignoreHidden: true,
    showAllError: false,
    postonce: true,
    ajaxPost: true,
    datatype: {
      "reportPrintNum": function (gets) {
        var reg = /^\d+$/;
        if (gets) {
          if (!reg.test(gets)) {
            return "请填写正整数";
          } else {
            return true;
          }
        } else {
          return true;
        }

      },
      "extractSamplePersonTel": function (gets, obj, curform, regxp) {
        var reg = /^1[34578]\d{9}$/
        if (gets) {
          if (!reg.test(gets)) {
            return '抽样人电话号码有误，请重填'
          }
        }
      },
      "witnessPhone": function (gets, obj, curform, regxp) {
        var reg = /^1[34578]\d{9}$/
        if (gets) {
          if (!reg.test(gets)) {
            return '见证人电话号码有误，请重填'
          }
        }
      }
    },
    beforeCheck: function (curform) {
      //在表单提交执行验证之前执行的函数，curform参数是当前表单对象。
      //这里明确return false的话将不会继续执行验证操作;
      /*处理客户自定义委托信息*/
      // return false;
    },
    beforeSubmit: function (curform) {
      //在验证成功后，表单提交前执行的函数，curform参数是当前表单对象。
      //这里明确return false的话表单将不会提交;

      consign.buildCustomAttributes(curform);

      /*处理收样信息*/
      var result = buildTestObjectInfo(curform)
      if (result) {
        beforeSubmitIndex = layer.load(2, {
          time: 10 * 1000
        });
      }
      return result;
    },
    callback: function (data) {
      if (data.success) {
        var consignCode = data.obj.consignCode; // 委托编号
        $("#consignId").val(data.obj.consignId); // 委托ID
        $("#consignCode").val(consignCode);
        var generateCode = data.obj.generateCode; // 是否调用生成编码方法
        if (generateCode == '1') {
          consign.autoCreateConsignCode();
        } else if (generateCode == '2') { // 保存后执行打印操作
          printer.printConsignInfo();
        }

        // layer.close(loadIndex);
        // zhanghong 2019-01-22
        // var iframe = $("iframe[src='consignController.do?goConsignList']", parent.document);
        // if (iframe) {
        //   iframe[0].contentWindow.InitObj.reloadDataGrid(true);
        // }
        //如果是试验页面跳转来的，要跳转到试验界面
        var isTaskRedirect = $("input[name='isTaskRedirect']").val();
        var isSimpleModel = $("input[name='isSimpleModel']").val();
        var taskId = $("input[name='taskId']").val();
        var testTaskId = $("input[name='testTaskId']").val();
        if (isTaskRedirect && isSimpleModel) {
          openTabs(taskId, '试验数据录入', 'testTaskController.do?goTestMain&taskId=' + taskId + '&id=' + testTaskId);
        }
        // if (data.msg.indexOf('完成') > -1) { //完成委托只能查看 先打开再关闭

        if (consign.directComplete) { // 直接点击的完成，先保存再完成
          consign.checkConsignCode();
        } else {
          layer.close(beforeSubmitIndex);
          tip(data.msg);
        }


      } else {
        tip(data.msg);
        consign.directComplete = !consign.directComplete;
        // layer.close(loadIndex);
        layer.close(beforeSubmitIndex);
      }
    }
  });

  /**
   * 复制样品
   * */
  $('.btn-4-add-copy').click(function () {
    var checkobject = $("#receiveTestObjects input:checked");
    if (checkobject.length > 0) {
      checkobject.each(function (i, it) {
        var copyobject = $(it).parent().parent().html();
        $('#receiveTestObjects tbody').append('<tr>' + copyobject + '</tr>')
      });
      // 重新计算费用
      fee.getTotalFee();
    } else {
      tip('请选择需要复制的"检测样品"');
    }
  })

  /**
   * 工程项目select组件改变事件
   */
  $('#project').change(function () {
    $(this).attr('data-selected', $(this).val());
  });

  /**
   * 收样人员select组件改变事件
   */
  $('#sampleSender').change(function () {
    var option = $(this).find('option:selected');
    $(this).attr('data-selected', $(this).val());
    $('#sampleSenderName').val($(option).data('name'));
    $('#sampleSenderPhone').val($(option).data('phone'));
  });
  /**
   * 添加收样按钮事件
   */
  $('.btn-4-add-sample').click(function () {
    /*新增样品时，为确保数据安全性，手动清除sessionStorage的样品Key*/
    createPopWindow('添加收样信息');
  });
  /**
   * 添加子样品
   */
  $('.btn-4-add-subsample').click(function () {
    /*新增样品时，为确保数据安全性，手动清除sessionStorage的样品Key*/
    var checkobject = $("#receiveTestObjects input:checked");
    console.log('checkobject', checkobject);
    console.log('checkobject.length', checkobject.length);
    if (checkobject.length === 1) {
      createPopWindow('添加子样品');
    } else {
      tip('请选择一条"检测样品"');
    }
  });

  $('.btn-4-pop-select-consignUnit').click(function () {
    var url = 'consignUnitController.do?list&singleSelect=' + true;
    layer.open({
      type: 2,
      title: '选择委托单位',
      skin: 'mylayui-layer-molv',
      content: url,
      btn: ['确定', '取消'],
      area: ['80%', '90%'],
      yes: function (index, layero) {
        var iframeWin = window[layero.find('iframe')[0]['name']];
        var consignUnit = iframeWin.dataGrid.datagrid('getSelected');
        var project = iframeWin.dataGrid1.datagrid('getSelected');
        var sampleSender = iframeWin.dataGrid0.datagrid('getSelected');
        if (!project) {
          tip('请选关联工程项目')
          return false;
        }
        if (!sampleSender) {
          tip('请选关联送样人员')
          return false;
        }
        uitlocalS = {
          'consignUnit': consignUnit,
          'project': project,
          'sampleSender': sampleSender
        }
        //缓存信息
        storeFunc('consignUnit-project-sampleSender', uitlocalS)
        //设置信息
        consign.setConsignUnitFun(consignUnit, project, sampleSender, index);
      }
    });
  });

  /*  邮寄信息弹出*/
  $('.btn-4-report-post').click(function () {
    var consignUnitContainer = $('#consignUnit');
    var url = 'tSPostFormsController.do?list';

    layer.open({
      type: 2,
      title: '邮寄项目',
      skin: 'mylayui-layer-molv',
      content: url,
      btn: ['确定', '取消'],
      area: ['80%', '90%'],
      yes: function (index, layero) {
        var iframeWin = window[layero.find('iframe')[0]['name']];
        var postFormId = iframeWin['getSelectPostId']();
        if (postFormId) {
          $('#postFormId').val(postFormId);
        }
        layer.close(index);

      }
    });
  });
  /**
   * 生成编号
   */
  $('.btn-4-generate-code').click(function () {
    consign.saveConsign('1');
  });
  /**
   * 切换显示更多
   */
  $('.btn-4-show-more').click(function () {
    ChangeExpand();
  });
  // 按单价计费
  $("#chargeByPrice").click(function () {
    console.log('按单价计费')
    $("#contractId").val("");
    $("#chargeContract").css("display", "none");
    $("#chargeContractSelect").css("display", "none");
    if (!consign.isDetailPage) {
      fee.recalculateTestParamPriceByContract();
    }
  });

  // 按合同计费
  $("#chargeByContract").click(function () {
    console.log('chargeByContract合同计费')
    // 获取合同
    fee.getUseableContract(); // 获取合同
    var len = contracts.length;
    console.log('contracts', contracts)
    if (len == 1) {
      $("#chargeContract").css("display", "inline-block");
      var contract = contracts[0];
      $('.fee-box #chargeContract').html(contract.name)
      $("#contractId").val(contract.id);
      $('#fee-box-middle input').val(contract.id)
      fee.recalculateTestParamPriceByContract();
    } else if (len > 1) {
      $("#chargeContract").css("display", "inline-block");
      $("#chargeContractSelect").css("display", "inline-block");
    }
    var contractId = $('#chargeContract').siblings('input').val();
    if (contractId) {
      console.log('if 合同ID 793', contractId)
      for (var i = 0; i < contracts.length; i++) {
        if (contractId === contracts[i].id) {
          feeContractCallback(contracts[i]);
          break;
        }
      }
    } else {
      console.log('else 输出合同ID 801', contractId)
    }
  });

  /**
   * 编辑
   */
  $(document).on('click', '.btn-4-sample-update', function () {
    $(this).closest('table').find('tr').removeClass('active');
    var tr = $(this).closest('tr');
    tr.addClass('active');
    var meta = tr.find('input').data('meta');
    var keyID = "TEST_OBJECT" + Date.parse(new Date());
    console.log(keyID);
    sessionStorage.setItem(keyID, new Base64().decode(meta));
    createPopWindow('修改收样信息', keyID);
  })
  /**
   * 查看详情
   */
  $(document).on('click', '.btn-4-sample-detail', function () {
    $(this).closest('table').find('tr').removeClass('active');
    var tr = $(this).closest('tr');
    tr.addClass('active');
    var meta = tr.find('input').data('meta');
    var keyID = "TEST_OBJECT" + Date.parse(new Date());
    sessionStorage.setItem(keyID, new Base64().decode(meta));
    createPopWindow('查看收样信息', keyID);

  })

  /**
   * 删除选中样品
   */
  $(document).on('click', '.btn-4-sample-delete', function () {
    var th = $(this);
    var index = layer.open({
      title: '删除提示',
      content: '确认删除选中样品？',
      icon: 7,
      btn: ['确定', '取消'],
      yes: function () {
        $(th).closest('tr').remove();
        layer.close(index);
        var fee1 = th.parent().prev().html();
        fee.calcTestFees(Number(fee1) * (-1));
      }
    });
  })
}

/**
 * 显示或者隐藏更多信息
 */
function ChangeExpand(expanded) {
  var moreDom = $(".btn-4-show-more");
  var state = moreDom.data('state');
  console.log("expanded:" + expanded);
  //若传递进来的是0  则会展开，否则会隐藏
  if (expanded == "undefined" && expanded == "undefined") {
    state = 0;
  }
  console.log(state);
  if (expanded == 0) {
    state = 1;
  }
  if (expanded == 1) {
    state = 0;
  }
  var trs = $('tr.dy');

  //如果是0  则展开
  if (state == 0) {
    moreDom.data('state', 1);
    moreDom.children("span").children(".l-btn-icon").addClass("icon-rotate");
    moreDom.children("span").children(".l-btn-text").text("隐藏委托信息");
    trs.show();
  } else {
    //隐藏
    moreDom.data('state', 0);
    //moreDom.attr("icon", "icon-more");
    moreDom.children("span").children(".l-btn-icon").removeClass("icon-rotate");
    moreDom.children("span").children(".l-btn-text").text("更多委托信息");
    trs.hide();
  }
  resetPanel($("#form").height());
}


//如果是简易模式收样且从试验录入界面打开的委托

function showTips() {
  //试验检测任务阶段打开的
  var isTaskRedirect = $("input[name='isTaskRedirect']").val();
  //是简单收样模式
  var isSimpleModel = $("input[name='isSimpleModel']").val();
  //隐藏保存按钮
  if (isTaskRedirect && isSimpleModel) {
    $(".btn-4-save").hide();
    var index = layer.open({
      title: '提示',
      content: '当前委托信息可能不准确，请核对信息！',
      icon: 7,
      btn: ['确定', '取消'],
      yes: function () {
        layer.close(index);
      }
    });
  }
}

function tipType(msg, o, cssctl) {
  if (o.type == 3) {
    var id = $(o.obj).attr('id');
    if (!id) {
      if ($(o.obj).attr('name')) {
        id = $(o.obj).attr('name');
      }
      $(o.obj).attr('id', id);
    }
    layer.tips(msg, '#' + id, {
      tips: [3, '#0FA6D8']
    });
  }
}


/**
 * 隐藏easyui-layout      折叠按钮
 */
function hideFoldingBtn() {
  $('a[class*=layout-button-]').hide();
}


/**
 *初始化资质select组件
 */
function initQualificationType() {
  var qualificationType = $('#qualificationTypeId');
  var selected = $(qualificationType).data('selected');
  var htm = '';
  ajaxSubmitResponseJSON({
    url: 'departVersionController.do?getDefaultQualifications',
    success: function (data) {
      if (data.success) {
        var i;
        var rows = data.obj;
        if (rows && rows.length > 0) {
          if (!selected) {
            for (i = 0; i < rows.length; i++) {
              if (rows[i].isDefault == "1") {
                selected = rows[i].id;
              }
            }
          }
          for (i = 0; i < rows.length; i++) {
            var selectAttribute = '';
            if (selected == rows[i].id) {
              selectAttribute = 'selected';
            }
            htm += '<option value="' + rows[i].id + '" ' + selectAttribute + '>' + rows[i].name + '</option>';
          }
        }
      }
    }
  });
  $(qualificationType).html(htm);
}


/**
 * 初始化检测类型select组件
 */
function initCheckType() {
  var checkType = $('#checkTypeId');
  var selected = $(checkType).data('selected');
  var htm = '';
  ajaxSubmitResponseJSON({
    url: 'checkTypeController.do?getAll',
    success: function (data) {
      if (data && data.length > 0) {
        var i;
        if (!selected) {
          for (i = 0; i < data.length; i++) {
            if (data[i].isDefault == "1") {
              selected = data[i].id;
            }
          }
        }
        for (i = 0; i < data.length; i++) {
          var selectAttribute = '';
          if (selected == data[i].id) {
            selectAttribute = 'selected';
          }
          htm += '<option value="' + data[i].id + '" ' + selectAttribute + '>' + data[i].name + '</option>';
        }
      }
    }
  });
  $(checkType).html(htm);
}


function initSnType() {
  var snType = $('#snTypeId');
  var selected = $(snType).data('selected');
  var htm = '';
  ajaxSubmitResponseJSON({
    url: 'tSnCategoryController.do?getAllSnCategory',
    success: function (data) {
      if (data.success) {
        var i;
        var rows = data.obj;
        if (rows && rows.length > 0) {
          if (!selected) {
            for (i = 0; i < rows.length; i++) {
              if (rows[i].isDefault == "1") {
                selected = rows[i].id;
              }
            }
          }
          for (i = 0; i < rows.length; i++) {
            var selectAttribute = '';
            if (selected == rows[i].id) {
              selectAttribute = 'selected';
            }
            htm += '<option value="' + rows[i].id + '" ' + selectAttribute + '>' + rows[i].name + '</option>';
          }
        }
      }
    }
  });
  $(snType).html(htm);
}


/**
 * 初始化日期组件
 */
function initDateElements() {
  var date = new Date();
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  if ((month + '').length == 1) {
    month = ('0' + month);
  }
  var day = date.getDate();
  if ((day + '').length == 1) {
    day = ('0' + day);
  }
  var dateString = year + '-' + month + '-' + day;

  var consignDate = $('#consignDate');
  var orgConsignDateString = consignDate.val();
  var consignDateString = dateString;
  var maxLen;

  if (orgConsignDateString) {
    maxLen = orgConsignDateString.length > 10 ? 10 : orgConsignDateString.length;
    consignDateString = orgConsignDateString.substring(0, maxLen);
  }
  consignDate.val(consignDateString);

  var sampleSendDate = $('#sampleSendDate');
  var orgSampleSendDateString = sampleSendDate.val();
  var sampleSendDateString = dateString;
  if (orgSampleSendDateString) {
    maxLen = orgSampleSendDateString.length > 10 ? 10 : orgSampleSendDateString.length;
    sampleSendDateString = orgSampleSendDateString.substring(0, maxLen);
  }
  sampleSendDate.val(sampleSendDateString);
  // requireReportDate
  var deadLineReport = $('#requireReportDate')
  var deadLineReportString = deadLineReport.val();
  if (deadLineReportString) {
    var maxLen = deadLineReportString.length > 10 ? 10 : deadLineReportString.length;
    deadLineReport.val(deadLineReportString.substring(0, maxLen))
  }
}


/**
 *  回显样品
 *  主、子试验的显示方式有区别
 */
function echoTestObjects() {
  //取得全部样品的元数据,注意这里的元数据是保存在委托表中的meta元数据，存成什么样子取出来就是什么，没有做加工
  var testObjects = $('#testObjects').text();
  showTestObjects(testObjects);
  fee.getUseableContract();
}


function initPost() {
  var postFormId = $('#postFormId').val();
  if (postFormId) {
    $.ajax({
      url: 'tSPostFormsController.do?getPostFormById',
      type: 'POST',
      dataType: 'json',
      data: {
        postFormId: postFormId
      },
      success: function (result) {
        if (result.success == true) {
          $('#postFormName').val(result.obj.name)
        }
      }
    })
  }
}

/**
 *构建收样信息
 */
function buildTestObjectInfo(curform) {
  var receiveTestObjects = [];
  var rows = $('#receiveTestObjects tbody tr');
  if (!rows || rows.length == 0) {
    tip('尚未添加样品信息，不能生成编号信息，请添加样品。');
    return false;
  }
  for (var i = 0; i < rows.length; i++) {
    var row = $(rows[i]);
    var meta = row.find('input').data('meta');
    receiveTestObjects.push(JSON.parse(new Base64().decode(meta)));
  }
  $(curform).find('input[name=metaData]').val(JSON.stringify(receiveTestObjects));
  return true;
}


/**
 * 回显样品信息
 * @param {回显样品信息} testObjects
 */
function showTestObjects(testObjects) {
  if (testObjects) {
    var objectAry = eval('(' + testObjects + ')'); //转成json
    var parentTestObject;
    for (var i = 0; i < objectAry.length; i++) {
      if (objectAry[i].parentSampleId == null) { //主试验样品
        applyAddOrUpdateTestObject(objectAry[i]); //展示
        parentTestObject = objectAry[i];
      } else {
        applyAddOrUpdateTestObject(objectAry[i], parentTestObject);
      }
    }
  }
}


/**
 * 添加检测对象
 * 把检测对象添加在前端界面，同时记录样品的meta的值
 * @param testObject 单个检测对象json对象
 */
function applyAddOrUpdateTestObject(testObject, parentTestObject) {
  // 判断，如果是引用的其他委托的样品，则不在页面显示，并且不参与费用计算
  if (testObject.importSample == 1) {
    return;
  }

  var htm = '';
  var tbody = $('#receiveTestObjects tbody'); //这是样品table，其中每一行的meta才是真实的样品元数据
  var updateTr = tbody.find('tr.active');
  if (!updateTr || updateTr.length == 0) {
    if (parentTestObject) {
      htm = '<tr data-parentId=' + parentTestObject.testSampleId + '>';
    } else {
      htm = '<tr>';
    }
  }
  htm += '<input type="hidden" data-meta="' + new Base64().encode(JSON.stringify(testObject)) + '">';
  htm += '<td class="value" style="width:40px;"> <input type="checkbox" /> </td>';
  htm += '<td class="value">' + testObject.testSampleDisplayName + testObject.level + '</td>'; //样品的名称
  htm += '<td class="value">' + (testObject.testObjectCode ? testObject.testObjectCode : '未生成编号') + '</td>';
  htm += '<td class="value">' + (testObject.standard ? testObject.standard : '') + '</td>';
  htm += '<td class="value">' + (testObject.projectPartAndUse ? testObject.projectPartAndUse : '') + '</td>'; // 工程部位用途
  htm += '<td class="value">';
  var testParamsArr = testObject.testParams;
  console.log('testParamsArr', testParamsArr)
  if (testParamsArr) {
    for (var i = 0; i < testParamsArr.length; i++) {
      var testParam = testParamsArr[i];
      // 统计所有的计费参数
      if (testParamIds.indexOf(testParam.testParamId) == -1) {
        testParamIds += "," + testParam.testParamId;
      }

      htm += testParam.testParamDisplayName; // 参数名称
      if (testParam.remark && testParam.remark != "") { // 备注不为空
        htm += '（' + testParam.remark + '）';
      }
      htm += '（' + testParam.count + '）'; //参数数量
      if (i != (testParamsArr.length - 1)) {
        htm += '<br>';
      }
    }
  }
  htm += '</td>';

  var additionFeesAmount = 0;
  var additionFees = testObject.additionalFees;
  var paramPrice = testObject.testObjectPrice;
  if (additionFees && additionFees.length > 0) {
    for (var j = 0; j < additionFees.length; j++) {
      var additionFee = additionFees[j];
      // count 字段无输入默认为0 by chenlm at 2019-06-27 16:57:22
      if ('' === additionFee.count) {
        additionFee.count = 0;
      }
      additionFeesAmount += (parseFloat(additionFee.price) * parseInt(additionFee.count));
    }
  }
  // 单价计算改为前端直接返回，合同计算才从后台返回 by chenlm at 2019-06-27 15:58:50
  // var fee1 = fee.getTestObjectFees(testObject); //添加了一个工程项目的参数，用于查询合同
  htm += '<td billingItem="1" class="value">' + (paramPrice + additionFeesAmount) + '</td>';
  htm += '<td class="value">';
  htm += '<a id="sampleInfo" style="display:none" class="easyui-linkbutton btn-4-sample-detail sampleInfo" icon="icon-redo" plain="true">查看样品详情</a>';
  //	htm += '<a  class="easyui-linkbutton btn-4-sample-update" icon="icon-edit" plain="true">修改</a>';
  //	htm += '<a class="easyui-linkbutton btn-4-sample-delete" icon="icon-remove" plain="true">删除</a>';
  htm += '<a title="修改样品信息" class="layui-btn layui-btn-sm btn-4-sample-update" ><i class="iconfont icon-edit"></i></a>';
  htm += '<a title="删除本样品" class="layui-btn layui-btn-sm btn-4-sample-delete" ><i class="iconfont icon-delete"></i></a>';
  htm += '</td>';

  if (!updateTr || updateTr.length == 0) {
    htm += '</tr>';
  }
  if (updateTr && updateTr.length > 0) {
    updateTr.html(htm);
    updateTr.removeClass('active');
  } else {
    tbody.append(htm);
  }
  // zhanghong 2019-01-21
  //$('.easyui-linkbutton').linkbutton();
}


/**
 * 创建 编辑样品的弹出框
 *
 * 确认按钮的事件是，把弹出的样品编辑窗的内容 整合成一条样品数据显示在主界面。
 */
function createPopWindow(titles, testobjecttimeid) {
  var isUpdateConsign = $("input[name='id']").val();

  //删除辅助样品信息的本地存储，防止用户操作后保留了一堆辅助信息，直接关闭浏览器等方式，跳过”确定“、”关闭”按钮的删除操作
  if (storeTool && storeTool.storeCapable) {
    for (key in localStorage) {
      if (key.indexOf('assistArgs_') >= 0) {
        localStorage.removeItem(key);
      }
    }
  }
  var btnArr = ['确定', '取消'];

  if (titles.indexOf('查看') > -1) {
    layerOpenFun('consignController.do?goEditSample&detail=detailPage&testobjectid=' + testobjecttimeid, titles, ['100%', '100%'], []);
    return;
  }
  var qualificationType = $("#qualificationTypeId").val();
  var index = layer.open({
    type: 2,
    title: titles,
    skin: 'mylayui-layer-molv',
    content: 'consignController.do?goEditSample&qualificationType=' + qualificationType + '&isUpdateConsign=' + isUpdateConsign + "&testobjectid=" + testobjecttimeid,
    btn: ['确定', '取消'],
    area: ['100%', '100%'],
    closeBtn: 0,
    yes: function (index, layero) {

      var iframeWin = window[layero.find('iframe')[0]['name']];
      /*调用子页面方法，构建检测对象JSON对象*/
      iframeWin.storeSamples();

      //样品弹窗中的样品信息对象
      var testObjects = iframeWin.createTestObject();

      if (testObjects == null)
        return;
      for (var i = 0; i < testObjects.length; i++) {
        //将信息对象转化为base64格式的meta-data属性值回显在修改委托页
        applyAddOrUpdateTestObject(testObjects[i]);

        /* 这段代码干撒子用的却是没看懂，先注释掉了 - 20181227 weiheng
         * if(!ifPHB){
           ifPHB = iframeWin.checkIfPHB();
        }*/

        //如果有子试验样品，则显示在样品列表中
        //但是只有要做试验的样品，才提交到后台，其他的情况只给用户看看信息而已。
//      $("tr[data-parentId='" + testObjects[i].testSampleId + "']").remove();
//
//        if (!!testObjects[i].otherMaterials) {
//          for (var j = 0; j < testObjects[i].otherMaterials.length; j++) {
//            applyAddOrUpdateTestObject(testObjects[i].otherMaterials[j], testObjects[i]);
//          }
//        }

        //获取关联样品，以子样品的模式添加到列表。zengxb 20190622
        var mater = testObjects[i].otherMaterials;
        if (!!mater && mater.length > 0) {
          for (var j = 0; j < mater.length; j++) {
            applyAddOrUpdateTestObject(mater[j], testObjects[i]);
          }
        }
      }

      // 重新累加显示总费用
      fee.getTotalFee();
      // 显示合同信息
      fee.initTotalFee();

      // TODO 向服务端请求可用于计费的合同
      fee.getUseableContract();

      // hideMore();	// 收起委托的更多信息
      // moreFun();	// 收起委托的更多信息
      // $(".btn-4-show-more").trigger('click')
      layer.close(index);


    }
  });
}