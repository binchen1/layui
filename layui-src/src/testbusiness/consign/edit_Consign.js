
/**
 * 委托信息类
 */
function CreateConsignInfoContext(param) {
  var con = new Object();
  //判断是不是修改委托
  con.isUpdateConsign = false;
  //是否是展示详情页面
  con.isDetailPage = false;
  //本地存储对象
  con.uitlocalS = false;
  //是否是完成委托提示
  con.isCompleteTip = false;
  //是否是由试验录入界面跳转的
  con.isTaskRedirect = $("input[name='isTaskRedirect']").val();
  // 是否直接点击了完成
  con.directComplete = false;
  //从URL中 初始化对象属性
  if (param.id !== undefined) {
      con.isUpdateConsign = true;
  }
  if (param.detail !== undefined) {
      con.isDetailPage = true;
  }
  if (param.isCompleteTip !== undefined) {
      con.isCompleteTip = true;
      //如果存在完成提示，则提示完成委托成功！      
      con.isCompleteTip ? layerAlertFun('完成委托成功', 6, []) : ''
  }


  /**
   *构建客户自定义委托属性
   */
  con.buildCustomAttributes = function (curform) {
      var customAttributes = [];
      $('.customAttributes').find('input').each(function () {
          var customAttribute = {};
          customAttribute.attributeId = $(this).attr('name');
          customAttribute.attributeValue = $(this).val();
          customAttributes.push(customAttribute);
      });
      $(curform).find('input[name=customAttributes]').val(JSON.stringify(customAttributes));
  };

  con.setConsignUnit = function (consignUnit) {
      if (consignUnit) {
          var consignUnitContainer = $('#unitId');
          var paymentCompany = $('#paymentCompany');
          consignUnitContainer.val(consignUnit.id);
          paymentCompany.val(consignUnit.name);
          consign.consignUnitChanged(paymentCompany);
          //设置    资质
          if (!con.isUpdateConsign) {
              $('#qualificationTypeId').val(consignUnit.qualificationTypeId)
              $('#sampleSendUnitName').val(consignUnit.name);
          }
          var paymentUnitName = consignUnit.payUnitName || consignUnit.name
          $('#paymentUnitName').val(paymentUnitName);
          consignUnitContainer.trigger('change');
          fee.getUseableContract();
          //检查选定委托单位的剩余信用额度    lilf 2019-4-26 16:08:56
          fee.checkCreditLine();
      }
  };
  con.setProject = function (project) {
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
  };
  con.setSampleSender = function (sampleSender) {
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
  };
  //设置委托单位、项目、送样人信息
  con.setConsignUnitFun = function (consignUnit, project, sampleSender, closeindex) {
      //保存项目信息方法
      saveProjectFun(project.id)
      //设置委托单位
      con.setConsignUnit(consignUnit);
      //设置工程项目
      con.setProject(project);
      //设置送样人
      con.setSampleSender(sampleSender);
      //关闭回调
      if (closeindex) {
          layer.close(closeindex)
          storeTool ? storeTool.storeFunc('consign-edit-project', ['data-selected'], ['#project', '#sampleSender', '#qualificationTypeId', '#snTypeId']) : '';
      }
  }




  /**
   * 委托单位select组件改变事件
   */
  con.consignUnitChanged = function (thisO) {
      consignUnitChanged_SetInputText(thisO);
      consignUnitChanged_loadProjects(thisO);
      consignUnitChanged_loadSampleSenders(thisO);
      consignUnitChanged_LoadProjectPanderName($("#paymentCompany").val());
  }

  /**
   *选择委托单位后，为委托部分信息填写默认值
   */
  function consignUnitChanged_SetInputText(o) {
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
  function consignUnitChanged_LoadProjectPanderName(name) {
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
  function consignUnitChanged_loadProjects(o) {
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
  function consignUnitChanged_loadSampleSenders(o) {
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

  //保存委托方法
  //generateCode 可选的值 ：1 2 空
  con.saveConsign = function (generateCode) {
    console.log('generateCode zh',generateCode)
      //工程项目和项目人员两个select是通过data-selected值加载选中项，且通过jsp传值。所以单独处理 勿删
      storeTool ? storeTool.storeFunc('consign-edit-project', ['data-selected'], ['#project', '#sampleSender', '#qualificationTypeId', '#snTypeId']) : '';
      storeFunc('consignUnit-project-sampleSender', con.uitlocalS)
      cleartSessionFunc('consign-editSample-samplingInfo')
      var saveUrl = 'consignController.do?doSave&generateCode=' + generateCode;
      $('#form').attr('action', saveUrl);
      $('#btn-4-submit').click();
  };
  // 完成委托方法
  con.completeConsign = function (index) {
      fee.checkCreditLine();//检查委托单位信用额度是否够用
      index ? layer.close(index) : '';
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
                    console.log('wancheng',iframe[0].contentWindow)
                      iframe[0].contentWindow.InitObj.goDetail(consignId, consignCode, true, true);
                  }
                  closeCurrentTab();
              } else {
                  con.directComplete = !con.directComplete;
              }
          }
      })
  };
  // 自动创建委托编号
  con.autoCreateConsignCode = function (index) {
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

  /**
   * 检查委托编码是否符合生成规则 - 20190221 weiheng
   */
  con.checkConsignCode = function () {
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
                              con.completeConsign();
                          },
                          btn2: function (index, layero) {
                              layer.close(index);
                              con.completeConsign(index);
                          }
                      });
                  } else {
                      con.completeConsign();
                  }
              } else {
                  tip(data.msg);
              }
          }
      });
  }
  return con;

};

// 根据项目ID获取工程项目对应的见证人     信息
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
//工具栏参数
function UrlSearch() {
  var name, value;
  var str = location.href; //取得整个地址栏
  var num = str.indexOf("?")
  str = str.substr(num + 1); //取得所有参数   stringvar.substr(start [, length ]

  var arr = str.split("&"); //各个参数放到数组里
  for (var i = 0; i < arr.length; i++) {
      num = arr[i].indexOf("=");
      if (num > 0) {
          name = arr[i].substring(0, num);
          value = arr[i].substr(num + 1);
          this[name] = value;
      }
  }
}
//初始化url参数对象   
var param = new UrlSearch();
window.consign = CreateConsignInfoContext(param);