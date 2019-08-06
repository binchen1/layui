
$(function () {
  //判断是不是修改委托
  var isUpdateConsign = false, isDetailPage = false,
    uitlocalS, isCompleteTip = false;

  if (window.location.search.split('&id=')[1] && window.location.search.split('&id=')[1].length > 0) {
    isUpdateConsign = true;
  }
  if (window.location.search.split('&detail=')[1] && window.location.search.split('&detail=')[1].length > 0) {
    isDetailPage = true;
  }
  if (window.location.search.split('&isCompleteTip=')[1] && window.location.search.split('&isCompleteTip=')[1].length > 0) {
    isCompleteTip = true;
  }
  var isTaskRedirect = $("input[name='isTaskRedirect']").val();
  if (isTaskRedirect) {
    funCode('modifyBlindSampleParam', '', funCodeCallback);
    ajaxRequest('tSBusinessParamController.do?getBusinessParam', { 'key': 'TEST_DETECTION_39' }, goBlindSampleHtml, true);
  } else {
    $('#blindSample').hide();
  }
  // 控制是否盲样显示
  function funCodeCallback(res, objParam) {
    if (res.obj && res.obj.length > 0) {
      $.each(res.obj, function (i, v) {
        if (objParam.codes === v.functioncode) {
          $('#blindSample').show();
        }
      })
    }
  }

  showMore(); // 展开更多信息
  showTips();
  hideFoldingBtn();
  initQualificationType();
  initConsignUnit();
  initCheckType();
  initSnType();
  initDateElements();
  echoTestObjects();
  initAccessory();
  // 是否显示合同计费信息
  initTotalFee();

  //新增委托时才加载数据
  if (!isUpdateConsign) {
    // console.log('处理新增')
    //加载表单数据
    // storeTool.renderContent('consign-edit');
    storeTool ? storeTool.renderContent('consign-edit-project') : '';
    // 加载委托单位，工程项目，送样人员
    uitlocalS = renderContent('consignUnit-project-sampleSender')
    if (uitlocalS) {
      consignUnitFun(uitlocalS.consignUnit, uitlocalS.project, uitlocalS.sampleSender, isUpdateConsign)
    }

    funCode()
  } else {

    detailDisplay()
  }

  // 盲样处理日期控件
  blindData();

  $('#accessoryManage').bind('click', function () {
    goUploadPage('', 'deleteAccessory', 'downloadAccessory');
    // createwindow2("附件管理", "uploadController.do?goUpload",null,null)
  })


  /** 控制功能按钮的显示*/
  function detailDisplay() {
    if (isDetailPage) {
      // console.log('处理详情')
      // 处理报告详情及检测任务
      $('a').hide();
      $('a.show-print').show();
      $("input").attr('readonly', true);
      $("input[name='archiveDate']").attr('disabled', true)
      $(':checkbox').attr('disabled', true);
      $('input:radio:checked').attr('disabled', false).siblings().attr('disabled', true)
      $('a#sampleInfo').show()
      // $('#modalDivWtinfo').show()
      // $('#modalDivFormtable').show()
      $('select').attr('disabled', true);
      $('.Wdate').removeAttr('onclick');
      isCompleteTip ? layerAlertFun('完成委托成功', 6, []) : ''
    } else {
      funCode()
    }
  }

  function createwindow2(title, addurl, width, height) {
    width = width ? width : 700;
    height = height ? height : 400;
    if (width == "100%" || height == "100%") {
      width = window.top.document.body.offsetWidth;
      height = window.top.document.body.offsetHeight - 100;
    }
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
          return true;
        },
        cancelVal: '关闭',
        cancel: true
      });
    } else {
      $.dialog({
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
          return true;
        },
        cancelVal: '关闭',
        cancel: true
      });
    }
  }
  /**
   *保存委托
   */
  $('.btn-4-save').click(function () {
    saveConsign();
  });

  function saveConsign(generateCode) {
    //工程项目和项目人员两个select是通过data-selected值加载选中项，且通过jsp传值。所以单独处理 勿删
    storeTool ? storeTool.storeFunc('consign-edit-project', ['data-selected'], ['#project', '#sampleSender', '#qualificationTypeId', '#snTypeId']) : '';
    storeFunc('consignUnit-project-sampleSender', uitlocalS)
    cleartSessionFunc('consign-editSample-samplingInfo')
    var saveUrl = 'consignController.do?doSave&generateCode=' + generateCode;
    $('#form').attr('action', saveUrl);
    $('#btn-4-submit').click();
  }

  var inputArr = [];
  $('input').each(function (index, ele) {
    //记录数据，排除对委托编号的记录（因为新增时不需要）
    //排除class中包含no-store的input，用于排除指定的input框
    if ($(this).attr('id') != '' && $(this).attr('id') != undefined && $(this).attr('id') != "consignCode" &&
      $(this).attr('id') != "consignId" && !$(this).hasClass('no-store')) {
      inputArr.push('#' + $(this).attr('id'));
    }
  });
  $('select').each(function (index, ele) {
    if ($(this).attr('id') != '' && $(this).attr('id') != undefined) {
      inputArr.push('#' + $(this).attr('id'));
    }
  });

  /**
   *完成委托 zhanghong
   * $("#consignId").val(data.obj.consignId); // 委托ID
   */
  var directComplete = false; // 是否直接点击了完成

  $('.btn-4-complete').click(function () {
    // 先调保存再调完成
    // 添加委托编码校验，是否符合系统预期的生成规则（因为编码可以手动修改）
    $('.btn-4-save').click();
    directComplete = !directComplete;
  });

  // 完成委托
  function completeConsign(index) {
    checkCreditLine();//检查委托单位信用额度是否够用
    index ? layer.close(index) : '';
    //存储表单数据 勿删
    // storeTool.storeFunc('consign-edit', ['value', 'checked'], inputArr);
    //工程项目和项目人员两个select是通过data-selected值加载选中项，且通过jsp传值。所以单独处理 勿删
    // storeTool.storeFunc('consign-edit-project', ['data-selected'], ['#project', '#sampleSender', '#qualificationTypeId', '#snTypeId']);
    // storeFunc('consignUnit-project-sampleSender', uitlocalS)
    // cleartSessionFunc('consign-editSample-samplingInfo')
    // var completeUrl = 'consignController.do?doCompleteByData';
    // $('#form').attr('action', completeUrl);
    // $('#btn-4-submit').click();
    var layerAjaxMaskIndex = '';
    $.ajax({
      url: 'consignController.do?doCompleteById',
      dataType: 'json',
      type: 'post',
      data: {
        id: $("#consignId").val()
      },
      beforeSend: function () {
        layerAjaxMaskIndex = layer.load(2, {
          time: 10 * 1000
        });
      },
      success: function (res) {
        layer.close(layerAjaxMaskIndex)
        tip(res.msg);
        var consignId = $("#consignId").val();
        var consignCode = $('#consignCode').val();
        if (res.success) {
          //完成委托只能查看 先打开再关闭
          var iframe = $("iframe[src='consignController.do?goConsignList']", parent.document);
          if (iframe) {
            iframe[0].contentWindow.InitObj.goDetail(consignId, consignCode, true, true);
          }
          closeCurrentTab();

          // window.location.href = window.location.href+'&detail=detailPage';
          // window.location.reload();
          // // isDetailPage = true
          // // detailDisplay()
        } else {
          directComplete = !directComplete;
        }
      }
    })
  }

  //检查信用额度是否够用
  function checkCreditLine() {
    //1.查询当前单位的信用额度
    var consignUnitId = $("#unitId").val();
    var unitCreditExist = false;
    var unitCreditBanlance = 0;
    $.ajax({
      type: 'post',
      async: false,
      url: 'creditController.do?getCreditByUnitId',
      data: { consignUnitId: consignUnitId },
      dataType: 'json',
      success: function (data) {
        if (data && data.success) {
          if (data.obj) {
            unitCreditExist = true;
            unitCreditBanlance = data.obj.banlance;
          }
        } else if (!data.success) {
          parent.layer.msg(data.msg, { icon: 5 });
        } else {
          parent.layer.msg('查询信用额度失败', { icon: 5 });
        }
      }
    })
    //2.检查当前单位额度是否够本次支付
    if (unitCreditExist) {
      if (unitCreditBanlance <= 0) {
        parent.layer.msg('当前单位挂账额度已用完,本次委托必须收费', { icon: 0 })
      } else {
        var feeTotal = $('#feeTotal').val(); //最终核定费用
        if (unitCreditBanlance >= feeTotal) {
          //        		parent.layer.msg("当前委托单位可用挂账额度:"+unitCreditBanlance+"元")
        } else {
          parent.layer.msg('当前单位挂账额度不足,本次委托必须收费', { icon: 0 })
        }
      }
    }
  }

  /**
   * 检查委托编码是否符合生成规则 - 20190221 weiheng
   */
  function checkConsignCode() {
    ajaxSubmitResponseJSON({
      url: 'consignController.do?isExpectedConsignCode',
      async: false,
      data: {
        consignId: $("#consignId").val(),
        consignCode: $('#consignCode').val()
      },
      success: function (data) {
        if (data.success) {
          if (data.obj == false) {
            layer.confirm('委托编码与预期的规则不一致，是否重新生成', {
              btn: ['确定', '取消'],
              btn1: function (index, layero) {
                // 重新生成委托编号
                layer.close(index);
                autoCreateConsignCode(index);
                completeConsign();
              },
              btn2: function (index, layero) {
                layer.close(index);
                completeConsign(index);
              }
            });
          } else {
            completeConsign();
          }
        } else {
          tip(data.msg);
        }
      }
    });
  }

  $('.btn-4-printConsign').click(function () {
    if ("IE" != myBrowser()) { // 这个是 src="plug-in/assets/js/common.js" 里的方法
      //layerAlertFun('请使用IE浏览器或将浏览器设置为兼容模式！', '5', []);
      layer.msg('请使用IE浏览器或将浏览器设置为兼容模式！', { icon: 5 });
      return;
    }
    saveConsign('2');
  });

  function printConsignInfo() {
    var consignCode = $("#consignCode").val().replace(/ /g, '');
    if (consignCode == '') {
      $.ajax({ // 打印委托单以前自动生成委托编号
        url: 'consignController.do?useSnImmediately',
        async: false,
        data: {
          consignId: $("#consignId").val()
        },
        dataType: 'json',
        success: function (data) {
          if (data.success == true) {
            var consignCode = data.obj;
            $("#consignCode").val(consignCode);
            printConsign();
          }
        }
      });
    } else {
      printConsign();
    }
  }

  // 打印委托单
  function printConsign() {
    var consignId = $("#consignId").val();
    /*var rand = Math.random();
    var udrIframe = $("<iframe id='udriframe" + rand + "' name='udriframe" + rand + "' width='0' height='0' frameborder='none' src=''></iframe>");
    $("body").append(udrIframe);
    udrIframe.attr('src', 'udrController.do?openUdrCommonTemplate&objectId=' + consignId + '&type=printConsign');*/
    //alert("print");
    var udrCommonPrint = UdrCommonPrint([consignId], 'printConsign');
    udrCommonPrint.printStart();
  }

  // 这里没有引入 layuiCommon.jsp，而是把该方法copy了出来 -> 因为出现样式冲突
  // 后面可以单独把UDR的打印JS封装成一个文件进行引用
  var UdrCommonPrint = function (ids, templateType) {
    var obj = new Object();
    obj.ids = ids;
    obj.length = ids.length;
    obj.printIndex = 0; // 打印的对象索引
    obj.printStatus = 0; // 默认未打印/打印中 ， 1.打印完成， 2.打印异常
    obj.printUdr = function () {
      var objectId = obj.ids[obj.printIndex];
      $("#udrIframe").attr('src', 'udrController.do?openUdrCommonTemplate&objectId=' + objectId + '&type=' + templateType);
      //window.open('udrController.do?openUdrCommonTemplate&objectId=' + objectId + '&type=' + templateType, '_blank');
    };
    obj.checkPrintStatus = function () { // 发送心跳、检测是否打印完成
      var interval = setInterval(function () {
        tipMsgAndStopInterval(obj, interval); // 若未完成、未抛异常，则持续等待
      }, 1000);
    };
    obj.printStart = function () { // 调用这个方法就可以了

      if ("IE" != myBrowser()) {    // 这个是 src="plug-in/assets/js/common.js" 里的方法
        layerAlertFun('请使用IE浏览器或将浏览器设置为兼容模式！', '5', []);
        return;
      }
      obj.printUdr();
      obj.checkPrintStatus();
    };
    return obj;
  }

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

      buildCustomAttributes(curform);
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

        var generateCode = data.obj.generateCode;	// 是否调用生成编码方法
        if (generateCode == '1') {
          autoCreateConsignCode();
        } else if (generateCode == '2') {	// 保存后执行打印操作
          printConsignInfo();
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

        if (directComplete) { // 直接点击的完成，先保存再完成
          checkConsignCode();
        } else {
          layer.close(beforeSubmitIndex);
          tip(data.msg);
        }


      } else {
        tip(data.msg);
        directComplete = !directComplete;
        // layer.close(loadIndex);
        layer.close(beforeSubmitIndex);
      }
    }
  });


  function openTabs(id, name, url) {
    window.parent.addTabs({
      "id": id,
      "title": name,
      "close": false,
      "url": url
    });
  }
  //如果是简易模式收样且从试验录入界面打开的委托
  function showTips() {
    var isTaskRedirect = $("input[name='isTaskRedirect']").val();
    var isSimpleModel = $("input[name='isSimpleModel']").val();
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
  $('.btn-4-add-copy').click(function () {
    var checkobject = $("#receiveTestObjects input:checked");
    checkobject.each(function (i, it) {
      var copyobject = $(it).parent().parent().html();
      $('#receiveTestObjects tbody').append('<tr>' + copyobject + '</tr>')
    });

    // 重新计算费用
    getTotalFee();
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
    sessionStorage.removeItem('TEST_OBJECT');
    createPopWindow('添加收样信息');
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
        storeFunc('consignUnit-project-sampleSender', uitlocalS)
        consignUnitFun(consignUnit, project, sampleSender, isUpdateConsign, index);

      }
    });
  });
  // 获取工程项目对应的见证人信息
  function saveProjectFun(projectId) {
    $.ajax({
      url: 'consignController.do?getLastSaveDataForProject',
      data: {
        projectId: projectId
      },
      type: 'POST',
      dataType: 'json',
      success: function (res) {
        if (res.success) {
          // 见证人、证件、电话、单位、传真
          $('input[name="witness"]').val(res.obj.defaultWitness.witness);
          $('input[name="witnessLicenseNumber"]').val(res.obj.defaultWitness.witnessLicenseNumber);
          $('input[name="witnessPhone"]').val(res.obj.defaultWitness.witnessPhone);
          $('input[name="witnessUnitName"]').val(res.obj.defaultWitness.witnessUnitName);
          $('input[name="fax"]').val(res.obj.defaultFax);
        }
      }
    })
  }

  function consignUnitFun(consignUnit, project, sampleSender, isUpdateConsign, index) {
    saveProjectFun(project.id)
    initConsignUnit();
    // console.log("----------------------------------");
    if (consignUnit) {
      var consignUnitContainer = $('#unitId');
      var paymentCompany = $('#paymentCompany');
      consignUnitContainer.val(consignUnit.id);
      paymentCompany.val(consignUnit.name);
      consignUnitChanged(paymentCompany);
      //设置资质
      setGualificationType(consignUnit.qualificationTypeId);
      !isUpdateConsign ? $('#sampleSendUnitName').val(consignUnit.name) : ''
      var paymentUnitName = consignUnit.payUnitName || consignUnit.name
      $('#paymentUnitName').val(paymentUnitName);
      consignUnitContainer.trigger('change');
      getUseableContract();
      //检查选定委托单位的剩余信用额度 lilf 2019-4-26 16:08:56
      checkCreditLine();
    }
    if (project) {
      var projectContainer = $('#project');
      /*如果这种实现方式存在概率性，可以采用设置#project select的data-selected值方式*/
      //设置工程项目value值
      projectContainer.val(project.id);
      //设置用于展示工程项目的input的值
      $('#project').change(function () {
        var option = $(this).find('option:selected');
        $(this).attr('data-selected', project.id);
        // $('#project-show').val(project.name);
        if ('--请选择--' !== option.html()) {
          $('#project-show').val(option.html());
        } else {
          paymentCompany.val('')
        }
      });
      $('#projectTenderName').val(project.name);
      $('#witnessUnitName').val(project.witnessUnitName);
      projectContainer.trigger('change');
    }
    if (sampleSender) {
      var samplerSenderContainer = $('#sampleSender');
      samplerSenderContainer.val(sampleSender.id);
      $('#sampleSender').change(function () {
        var option = $(this).find('option:selected');
        $(this).attr('data-selected', sampleSender.id);
        if ($(option).data('name')) {
          $('#sampleSenderName').val($(option).data('name'));
        } else {
          paymentCompany.val('')
        }
        $('#sampleSenderPhone').val($(option).data('phone'));
      })
      samplerSenderContainer.trigger('change');
    }
    if (index) {
      layer.close(index)
      storeTool ? storeTool.storeFunc('consign-edit-project', ['data-selected'], ['#project', '#sampleSender', '#qualificationTypeId', '#snTypeId']) : '';
    }
  }

  function setGualificationType(qualificationTypeId) {
    $('#qualificationTypeId').val(qualificationTypeId)
  }

  $('.btn-4-pop-select-project').click(function () {
    var consignUnitContainer = $('#consignUnit');
    var url = 'projectController.do?list';
    layer.open({
      type: 2,
      title: '选择工程项目',
      skin: 'mylayui-layer-molv',
      content: url,
      btn: ['确定', '取消'],
      area: ['80%', '90%'],
      yes: function (index, layero) {
        loadConsignUnitProjects(consignUnitContainer);
        var iframeWin = window[layero.find('iframe')[0]['name']];
        var row = iframeWin.dataGrid.datagrid('getSelected');
        if (row) {
          var projectContainer = $('#project');
          projectContainer.val(row.id);
          projectContainer.trigger('change');
        }
        layer.close(index);
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

  // 自动创建委托编号
  function autoCreateConsignCode(index) {
    index ? layer.close(index) : '';
    var url = 'consignController.do?useSnImmediately';
    ajaxSubmitResponseJSON({
      url: url,
      async: false,
      data: {
        consignId: $("#consignId").val()
      },
      success: function (data) {
        if (data.success) {
          $('#consignCode').val(data.obj);
        } else {
          tip(data.msg);
        }
      }
    });
  }
  $('.btn-4-generate-code').click(function () {
    saveConsign('1');
    /***
     * 委托是否保存
     * 该委托是否已有编码
    // 若委托编码已生成，则直接返回，结束方法
    if ($("#consignId").val()) {
      var consignCodeContainer = $('#consignCode');
      var consignCode = consignCodeContainer.val();
      if (consignCode) {
        return;
      }
      autoCreateConsignCode();
    } else {
      tip('生成编码前需要先保存委托');
    }*/
  });

  // 按单价计费
  $("#chargeByPrice").click(function () {
    console.log('按单价计费')
    $("#contractId").val("");
    $("#chargeContract").css("display", "none");
    $("#chargeContractSelect").css("display", "none");
    if (!isDetailPage) {
      recalculateTestParamPriceByContract();
    }
  });

  // 按合同计费
  $("#chargeByContract").click(function () {
    console.log('chargeByContract')
    // 获取合同
    getUseableContract(); // 获取合同
    var len = contracts.length;
    console.log('contracts', contracts)
    if (len == 1) {
      $("#chargeContract").css("display", "inline-block");
      var contract = contracts[0];
      $('.fee-box #chargeContract').html(contract.name)
      $("#contractId").val(contract.id);
      $('#fee-box-middle input').val(contract.id)
      recalculateTestParamPriceByContract();
    } else if (len > 1) {
      $("#chargeContract").css("display", "inline-block");
      $("#chargeContractSelect").css("display", "inline-block");
    }
    var contractId = $('#chargeContract').siblings('input').val();
    if (contractId) {
      console.log('if 793', contractId)
      for (var i = 0; i < contracts.length; i++) {
        if (contractId === contracts[i].id) {
          feeContractCallback(contracts[i]);
          break;
        }
      }
    } else {
      console.log('else 801', contractId)
    }
  });
  /**更多 */
  moreFun(isUpdateConsign, isDetailPage)

});
$(window).unload(function () {
  //这里面写在关闭页面时，要调用的事件
  cleartSessionFunc('consign-editSample-samplingInfo')
})

// 试验检测过来 盲样切换显示内容
function goBlindSampleHtml(res, param) {
  var blindSampleEle = $('#blindSample .blind-sample-span');
  var blindSampleBtnEle = $('#blindSample .blind-sample-btn u');
  if (res.success) {
    if ('Y' === res.obj) {
      blindSampleEle.html('已盲样');
      blindSampleBtnEle.html('关闭盲样');
      if (param) {
        window.location.reload();
      }
    } else {
      blindSampleEle.html('未盲样');
      blindSampleBtnEle.html('启用盲样');
      if (param) {
        window.location.reload();
      }
    }
  }
}
// 试验检测过来 页面盲样切换
function goBlindSampleFun() {
  var blindSampleEleHtml = $('#blindSample .blind-sample-span').html();
  // var blindSampleEleHtml=blindSampleEle.html()
  var values = 'N';
  if ('已盲样' === blindSampleEleHtml) {
    values = 'N';
  } else {
    values = 'Y';
  }
  var dataJson = { 'key': 'TEST_DETECTION_39', 'value': values }
  ajaxRequest('tSBusinessParamController.do?updateBusinessParam', dataJson, goBlindSampleHtml, true, true, 'click');
}
/**
 * 更多
 */
function resetPanel(numstr) {
  var windowH = $(window).height();
  numstr = parseFloat(numstr)
  $('#p1').panel('resize', {
    height: numstr
  });
  $('#p2').panel('resize', {
    height: windowH - (numstr + 30),
    top: (numstr + 30)
  });
  // $("#p1").animate({ height: numstr }, 1000);
  // $("#p2").animate({ height: windowH - (numstr + 30), top: (numstr + 30) }, 1000);
}

function moreFun(isUpdateConsign, isDetailPage) {
  if (isUpdateConsign) {
    isDetailPage ? resetPanel('224') : resetPanel('324');
  } else {
    resetPanel('462')
  }
  $('.btn-4-show-more').click(function () {
    var rows = $('#receiveTestObjects tbody tr');
    var state = $(this).data('state');
    var trs = $('tr.dy');
    if (state == 0) {
      $(this).data('state', 1);
      trs.show();
      $(this).children("span").children("span").removeClass("icon-more");
      $(this).children("span").children("span").addClass("icon-little")
      $("#wtinfo").animate({
        scrollTop: 175
      }, 1000); //100为滚动条的位置，1000为滚动的时延
      if (!rows || rows.length == 0) {
        resetPanel('462')
      }
    } else {
      $(this).data('state', 0);
      $(this).attr("icon", "icon-more");
      $(this).children("span").children("span").removeClass("icon-little");
      $(this).children("span").children("span").addClass("icon-more")
      trs.hide();
      resetPanel('324')
    }
  });
}

/** 全局变量 */
// 保存文件已上传的文件
var filesObj = {
  files: []
};
var testParamIds = ""; // 已选的收样参数ID
//是否配合比
var ifPHB = false;
var contracts = []; //子页面需要的合同集合

// 附件上传完毕的回调
function uploadCallBack(res) {
  $.each(res, function (i, accessory) {
    addToForm(accessory)
  })
}

/**
 * 隐藏easyui-layout折叠按钮
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
 * 初始化委托单位select组件
 */
function initConsignUnit() {
  var consignUnit = $('#consignUnit');
  var selected = $(consignUnit).data('selected');
  var htm = '<option value="" data-tender="">--请选择--</option>';
  ajaxSubmitResponseJSON({
    url: 'consignUnitController.do?getAll',
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
          htm += '<option value="' + data[i].id + '" data-tender="';
          htm += data[i].projectTenderName + '" ' + selectAttribute + '>' + data[i].name + '</option>';
        }
      }
    }
  });
  $(consignUnit).html(htm);
  $(consignUnit).change();
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
 *构建客户自定义委托属性
 */
function buildCustomAttributes(curform) {
  var customAttributes = [];
  $('.customAttributes').find('input').each(function () {
    var customAttribute = {};
    customAttribute.attributeId = $(this).attr('name');
    customAttribute.attributeValue = $(this).val();
    customAttributes.push(customAttribute);
  });
  $(curform).find('input[name=customAttributes]').val(JSON.stringify(customAttributes));
}

/**
 *构建收样信息
 */
function buildTestObjectInfo(curform) {
  var receiveTestObjects = [];
  var rows = $('#receiveTestObjects tbody tr');
  // console.log('构建收样信息', rows)
  if (!rows || rows.length == 0) {
    tip('请添加收样信息');
    return false;
  }
  for (var i = 0; i < rows.length; i++) {
    var row = $(rows[i]);
    var meta = row.find('input').data('meta');
    console.log('meta', meta)
    receiveTestObjects.push(JSON.parse(new Base64().decode(meta)));
  }
  $(curform).find('input[name=metaData]').val(JSON.stringify(receiveTestObjects));
  return true;
}

/**
 *  回显样品
 *  主、子试验的显示方式有区别
 */
function echoTestObjects() {
  //取得全部样品的元数据,注意这里的元数据是保存在委托表中的meta元数据，存成什么样子取出来就是什么，没有做加工
  var testObjects = $('#testObjects').text();
  showTestObjects(testObjects);
  getUseableContract();
}

// 回显样品信息
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
  console.log('applyAddOrUpdateTestObject 1171', testObject)
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
  htm += '</td>';

  var additionFeesAmount = 0;
  var additionFees = testObject.additionalFees;
  if (additionFees && additionFees.length > 0) {
    for (var j = 0; j < additionFees.length; j++) {
      var additionFee = additionFees[j];
      additionFeesAmount += (parseInt(additionFee.count) * parseFloat(additionFee.price));
    }
  }
  var fee = getTestObjectFees(testObject); //添加了一个工程项目的参数，用于查询合同
  htm += '<td billingItem="1" class="value">' + (fee + additionFeesAmount) + '</td>';

  htm += '<td class="value">';

  htm += '<a id="sampleInfo" style="display:none" class="easyui-linkbutton btn-4-sample-detail" icon="icon-redo" plain="true">查看样品详情</a>';


  htm += '<a  class="easyui-linkbutton btn-4-sample-update" icon="icon-edit" plain="true">修改</a>';

  htm += '<a class="easyui-linkbutton btn-4-sample-delete" icon="icon-remove" plain="true">删除</a>';

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
  $('.easyui-linkbutton').linkbutton();
  // $("a[name='reload']").linkbutton({
  //   plain: true,
  //   iconCls: 'icon-reload'
  // });
  /*计算费用*/
  //calcTestFees(fee);
  /*绑定更新按钮事件*/
  // bindUpdateBtnClick();
  /*绑定删除按钮事件*/
  // bindDeleteBtnClick();
}

function calcTestFees(fee) {
  //取得原来的值，再加上他
  var current = $('#feeTotal').val();
  var sumFeeCurrent = $('#sumFee').text();
  var total = Number(current) + Number(fee);
  var sumFeeTotal = Number(sumFeeCurrent) + Number(fee);
  $('#feeTotal').val(total);
  $('#sumFee').text(sumFeeTotal + " 元");
  $('#manualFeeTotal').val(total);
  if (0 === sumFeeTotal) {
    $('#fee-box').hide()
    $('#feeTotal').val(0);
  }
}

function FeesOnChange(obj) {
  //取得原来的值，再加上他
  var current = $(obj).val();
  $('#manualFeeTotal').val(current);
}

function getTestObjectFees(testObject) {
  var testObjectFees = 0;
  var projectId = $("#project").data('selected');
  ajaxSubmitResponseJSON({
    url: 'consignController.do?getTestObjectFees',
    data: {
      metaData: '[' + JSON.stringify(testObject) + ']',
      projectId: projectId,
      contractId: $("#contractId").val()
    },
    success: function (data) {
      testObjectFees = data.obj;
    }
  });
  return testObjectFees;
}


function bindUpdateBtnClick() { }

$(document).on('click', '.btn-4-sample-update', function () {
  $(this).closest('table').find('tr').removeClass('active');
  var tr = $(this).closest('tr');
  tr.addClass('active');
  var meta = tr.find('input').data('meta');
  sessionStorage.setItem("TEST_OBJECT", new Base64().decode(meta));
  createPopWindow('修改收样信息');
})
// 查看详情
$(document).on('click', '.btn-4-sample-detail', function () {
  $(this).closest('table').find('tr').removeClass('active');
  var tr = $(this).closest('tr');
  tr.addClass('active');
  var meta = tr.find('input').data('meta');
  sessionStorage.setItem("TEST_OBJECT", new Base64().decode(meta));
  createPopWindow('查看收样信息');

})

$(document).on('click', '.btn-4-sample-delete', function () {
  var th = $(this);
  var index = layer.open({
    title: '删除提示',
    content: '确认删除？',
    icon: 7,
    btn: ['确定', '取消'],
    yes: function () {
      $(th).closest('tr').remove();
      layer.close(index);
      var fee = th.parent().prev().html();
      calcTestFees(Number(fee) * (-1));
    }
  });
})

/**
 * 收样信息列表删除按钮事件
 */
function bindDeleteBtnClick() { }

/**
 * 委托单位select组件改变事件
 */
function consignUnitChanged(thisO) {
  applyInputTextWhenConsignUnitChanged(thisO);
  loadConsignUnitProjects(thisO);
  loadConsignUnitSampleSenders(thisO);
  inintProjectPanderName($("#paymentCompany").val());
}

/**
 *选择委托单位后，为委托部分信息填写默认值
 */
function applyInputTextWhenConsignUnitChanged(o) {
  var thisO = $(o);
  var newConsignUnitId = thisO.val();
  /* var newConsignUnitText = thisO.find('option:selected').text();
   if (!newConsignUnitId) {
       newConsignUnitText = '';
   }*/
  var newConsignUnitText = thisO.val();
  $('#inspectionUnitName').val(newConsignUnitText);

  var tender = thisO.find('option:selected').data('tender');
  $('#projectTenderName').val(tender);
}

/**
 *选择委托单位后，为项目标段填写默认值
 */
function inintProjectPanderName(name) {
  name = encodeURIComponent(name)
  $.ajax({
    url: "consignUnitController.do?getByCosignUnitName&consignUnitName=" + name,
    /*contentType : 'application/json;charset=utf-8',*/
    /*data:{consignUnitName:name},*/
    dataType: 'json',
    success: function (data) {
      $("#projectTenderName").val(data.obj.projectTenderName)
    }
  })


}
/**
 *加载委托单位绑定的工程项目信息
 */
function loadConsignUnitProjects(o) {
  o = $(o);
  //  xingyue 20180202修改 将o.val()改为 $("#unitId").val()，都是获取公司id
  var newConsignUnitId = $("#unitId").val();
  var project = $('#project');
  var projectShow = $('#project-show');
  var selected = project.data('selected');

  var htm = '<option value="">--请选择--</option>';
  if (newConsignUnitId) {
    ajaxSubmitResponseJSON({
      url: 'consignUnitController.do?getConsignUnitProjects',
      data: {
        'id': newConsignUnitId
      },
      success: function (data) {
        var rows = data.rows;
        if (rows && rows.length > 0) {
          for (var i = 0; i < rows.length; i++) {
            var row = rows[i];
            var selectAttribute = '';
            if (selected == row.id) {
              projectShow.val(row.name);
              selectAttribute = 'selected';
            }
            htm += '<option value="' + row.id + '" ' + selectAttribute + '>' + row.name + '</option>';
          }
        }
      }
    });
  }
  project.html(htm);

}

/**
 *加载委托单位绑定的送样人员信息
 */
function loadConsignUnitSampleSenders(o) {
  o = $(o);
  //    xingyue 20180202修改 将o.val()改为 $("#unitId").val()，都是获取公司id
  var newConsignUnitId = $("#unitId").val();

  var sampleSender = $('#sampleSender');
  var selected = sampleSender.data('selected');

  var htm = '<option value="">--请选择--</option>';
  if (newConsignUnitId) {
    ajaxSubmitResponseJSON({
      url: 'consignUnitController.do?getConsignUnitSampleSenders',
      data: {
        'id': newConsignUnitId
      },
      success: function (data) {
        var rows = data.rows;
        if (rows && rows.length > 0) {
          for (var i = 0; i < rows.length; i++) {
            var row = rows[i];
            var selectAttribute = '';
            if (selected == row.id) {
              selectAttribute = 'selected';
            }
            htm += '<option value="' + row.id + '" data-name="' + row.name + '"';
            // noinspection JSUnresolvedVariable
            htm += ' data-phone="' + row.contactPhone + '" ' + selectAttribute + '>' + row.name + '</option>';
          }
        }
      }
    });
  }
  sampleSender.html(htm);
}
/**
 * 创建 编辑样品的弹出框
 * 
 * 确认按钮的事件是，把弹出的样品编辑窗的内容 整合成一条样品数据显示在主界面。
 */
function createPopWindow(titles) {
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
    layerOpenFun('consignController.do?goEditSample&detail=detailPage', titles, ['100%', '100%'], []);
    return;
  }
  var qualificationType = $("#qualificationTypeId").val();
  var index = layer.open({
    type: 2,
    title: titles,
    skin: 'mylayui-layer-molv',
    content: 'consignController.do?goEditSample&qualificationType=' + qualificationType + '&isUpdateConsign=' + isUpdateConsign,
    btn: ['确定', '取消'],
    area: ['100%', '100%'],
    closeBtn: 0,
    yes: function (index, layero) {

      var iframeWin = window[layero.find('iframe')[0]['name']];
      /*调用子页面方法，构建检测对象JSON对象*/
      iframeWin.storeSamples();

      //样品弹窗中的样品信息对象
      var testObjects = iframeWin.createTestObject();
      // console.log('收样信息：testObjects', testObjects);

      for (var i = 0; i < testObjects.length; i++) {
        //将信息对象转化为base64格式的meta-data属性值回显在修改委托页
        applyAddOrUpdateTestObject(testObjects[i]);

        /* 这段代码干撒子用的却是没看懂，先注释掉了 - 20181227 weiheng
         * if(!ifPHB){
           ifPHB = iframeWin.checkIfPHB();
        }*/

        //如果有子试验样品，则显示在样品列表中
        //但是只有要做试验的样品，才提交到后台，其他的情况只给用户看看信息而已。
        $("tr[data-parentId='" + testObjects[i].testSampleId + "']").remove();

        for (var j = 0; j < testObjects[i].otherMaterials.length; j++) {
          applyAddOrUpdateTestObject(testObjects[i].otherMaterials[j], testObjects[i]);
        }
      }

      // 重新累加显示总费用
      getTotalFee();
      // 显示合同信息
      initTotalFee()

      // TODO 向服务端请求可用于计费的合同
      // console.info("testParamIds", testParamIds);
      getUseableContract();

      // hideMore();	// 收起委托的更多信息
      // moreFun();	// 收起委托的更多信息
      $(".btn-4-show-more").trigger('click')
      layer.close(index);
    }
  });
}

/**
 * 获取计费合同信息
 * 20190103 - weiheng
 */

function getUseableContract() {
  var unitId = $("#unitId").val(); // 委托单位ID
  var projectId = $("#project").val(); // 工程项目
  var ids = testParamIds.substring(1); // 去掉前面的逗号
  if (unitId && ids) {
    $.ajax({
      url: 'feeContractMainController.do?getUseableContract',
      type: 'POST',
      dataType: 'json',
      data: {
        unitId: unitId,
        testParamIds: ids,
        projectId: projectId
      },
      success: function (result) {
        if (result.success == true) {
          contracts = result.obj;
        }
      }
    });
  }
}
/***计费方式 选择合同 */
function feeContract() {
  var defaultId = $('#fee-box-middle input').val()
  var openUrl = 'consignController.do?goSelectChargeContract&defaultId=' + defaultId;
  layerOpenFun(openUrl, '选择合同', ['80%', '80%'], ['确定', '取消'], 'feeContractCallback', 'openCallback')
}
/***计费方式 选择合同回调 */
function feeContractCallback(res, index) {
  console.log('计费方式 选择合同回调', res)
  if (res) {
    $('.fee-box #chargeContract').html(res.name)
    $('.fee-box-middle input').val(res.id)
    $("#contractId").val(res.id);
    $("#chargeContract").css("display", "inline-block");
    recalculateTestParamPriceByContract();
  }
  index ? layer.close(index) : '';
}

/**
 * 通过合同重新计算收样参数的价格，并渲染到样品列表
 * 20190104 - weiheng
 */
function recalculateTestParamPriceByContract() {
  buildTestObjectInfo('form'); // 构建收样参数信息
  var metaData = $('input[name=metaData]').val(); // 获取收样参数信息（元数据）
  $.ajax({
    url: 'consignController.do?recalculateTestParamPrice',
    type: 'POST',
    dataType: 'json',
    data: {
      metaData: metaData,
      contractId: $("#contractId").val()
    },
    success: function (result) {
      if (result.success == true) {
        var meta = result.obj; // 将该数据重新渲染到页面
        var tbody = $('#receiveTestObjects tbody');
        tbody.html(""); // 清空页面原有样品数据，重新渲染
        showTestObjects(meta);
        getTotalFee(); // 重新计费
      }
    }
  });
}

/**
 * 获取参与计费的试验检测参数的ID
 * 20190103 - weiheng
 */
function getChargeTestParamIdsBySample(testObjects) {

  var testParamIds = '';
  // 样品数量为0，或引用的其他委托的样品 -> 不参与计费
  if (testObjects.length == 0 || testObjects.importSample == 1) {
    return testParamIds;
  }

  for (var i = 0; i < testObjects.length; i++) {
    testParamIds += getChargeTestParamIds(testObjects[i].testParams); // 样品参数ID
    testParamIds += getChargeTestParamIdsBySample(testObjects[i].otherMaterials); // 引用的子样品参数ID
  }
  return testParamIds;
}

/**
 * 获取参与计费的试验检测参数的ID
 * 20190103 - weiheng
 */
function getChargeTestParamIds(testParams) {
  var testParamIds = '';
  for (var i = 0; i < testParams.length; i++) {
    testParamIds += ',' + testParams[i].testParamId
  }
  return testParamIds;
}

/**
 * 重新获取总费用显示
 * 20181226 - weiheng
 */
function getTotalFee() {
  var total = 0.0;
  $("#receiveTestObjects").find("td[billingItem='1']").each(function () {
    var fee = $(this).text();
    total += parseFloat(fee);
  });
  $("#feeTotal").val(total);
  $('#manualFeeTotal').val(total);
  $('#sumFee').text(total + " 元");
}
/**
 * 初始化委托费用的显示
 * 20190102 - weiheng
 */
function initTotalFee() {
  var fee = $('#manualFeeTotal').val();
  $("#feeTotal").val(fee);
  $('#sumFee').text(fee + " 元");
  if (fee && parseInt(fee) != 0) { // 如果委托费用不为0，则显示费用信息
    $("#fee-box").css("display", "block");
  }


  var contractId = $("#contractId").val();
  if (contractId != "") {
    $("#chargeByContract").attr("checked", "checked");
    $("#chargeContract, #chargeContractSelect").css("display", "inline-block");
  }

}

function closeCurrentTab() {
  window.parent.closeCurrentWin();
}


function refreshConsignTabAndCloseCurrentTab() {
  window.parent.refreshMainTab();
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

function changePost(id) {
  $.ajax({
    url: 'tSPostFormsController.do?getPostFormById',
    type: 'POST',
    dataType: 'json',
    data: {
      postFormId: id
    },
    success: function (result) {
      if (result.success == true) {
        $('#postFormName').val(result.obj.name)
      }
    }
  })
}
$(function () {
  //初始化邮寄信息
  initPost();
})

function initPost() {
  var postFormId = $('#postFormId').val();
  if (postFormId) {
    changePost(postFormId);
  }
}

function addToForm(accessory) {
  var $accessoryIds = $("#accessoryIds");
  var newVal = '';
  var oldVal = $accessoryIds.val();
  if (oldVal == '' || oldVal == null || typeof (oldVal) == 'undefined') {
    oldVal == '';
    newVal = accessory.id;
  } else {
    newVal = oldVal + "," + accessory.id;
  }
  $accessoryIds.val(newVal);
  addAccessoryToTable(accessory);
}

//初始化附件管理
function initAccessory() {
  var consignId = $('#consignId').val();
  if (consignId) {
    $.ajax({
      url: 'consignController.do?getAttachment',
      dataType: 'json',
      data: {
        id: consignId
      },
      success: function (res) {
        if (res.obj != null) {
          $.each(res.obj, function (i, accessory) {
            addAccessoryToTable(accessory)
          })
        }
      }
    })
  }

}

function addAccessoryToTable(accessory) {
  var $span = $("#accessoryManageDiv"),
    spanhtml = '';
  var str = accessory.realpath;
  var num = str.lastIndexOf('.')
  var strs = str.slice(num);
  var temp = strs.substring(1);

  if (temp == 'png' || temp == 'jpg') {
    spanhtml += '<img class="' + accessory.id + '" src=\'' + accessory.realpath + '\' width=\'70px\' height=\'50px\'/>'
  } else {
    spanhtml += '<span class="' + accessory.id + '">' + accessory.attachmenttitle + ' &emsp;</span>'

  }
  $span.append(spanhtml)

  filesObj.files.push({
    'id': accessory.id,
    'realpath': accessory.realpath || '',
    'attachmenttitle': accessory.attachmenttitle || ''
  })
}

function downloadAccessory(accessoryId) {
  window.open("uploadController.do?download&accessoryId=" + accessoryId);
}

function deleteAccessory(accessoryId) {
  $.ajax({
    type: "post",
    asyn: true,
    url: "consignController.do?deleteAccessoryByIds",
    contentType: "application/x-www-form-urlencoded",
    data: {
      accessoryIds: accessoryId
    },
    success: function (data) {
      data = JSON.parse(data);
      if (data.success) {
        deleteAccessoryToTable(accessoryId);
      }
    }
  });
}

function deleteAccessoryToTable(accessoryId) {
  $('#accessoryManageDiv').find('.' + accessoryId).remove()
}
/**
 * 展开更多信息
 * 20181218 - weiheng
 */
function showMore() {
  var moreDom = $(".btn-4-show-more");
  var trs = $('tr.dy');
  moreDom.data('state', 1);
  trs.show();
  moreDom.children("span").children("span").removeClass("icon-more");
  moreDom.children("span").children("span").addClass("icon-little")
  $("#wtinfo").animate({
    scrollTop: 0
  }, 1000); //100为滚动条的位置，1000为滚动的时延

}
/**
 * 隐藏更多信息
 * 20181218 - weiheng
 */
function hideMore() {
  var moreDom = $(".btn-4-show-more");
  var trs = $('tr.dy');
  moreDom.data('state', 0);
  moreDom.attr("icon", "icon-more");
  moreDom.children("span").children("span").removeClass("icon-little");
  moreDom.children("span").children("span").addClass("icon-more")
  trs.hide();
}

/**
 * 对日期显示进行盲样处理
 * 日期控件不支持  ***  的显示，直接干掉，同时后台为日期置空
 * 20190315 - weiheng
 */
function blindData() {
  if ($("#isblind").val() == 'true') {
    $("#consignDate").removeClass("Wdate").val("***");
    $("#sampleSendDate").removeClass("Wdate").val("***");
  }
};