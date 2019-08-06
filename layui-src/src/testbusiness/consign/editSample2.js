$(function () {
  // 绑定各种按钮
  initEvents();
  // 初始化资质
  initQualificationType();

  //通过本地存储初始化表单
  storeTool.renderContent('consign-editSample');

  //显示样品树
  initBigCategory();

  //显示附加费用
  initAdditionalFees();
  // 检测参数table
  initRequirements();

  initReferConsignedSampleDataDataGrid();


});

//改变龄期信息初始条数
function changeperiod(e) {
  var ischecked = e.checked
  var count = $(e).parent().parent().find('.countNumber').val();
  //.next('.countNumber').val();
  //var count=$('#countNumber').val();
  //alert(ischecked+'次数:'+count)
  if (ischecked == true) {
    if (count > 0) {
      $('#periods tbody').html('');
      for (var i = 0; i < count; i++) {
        //alert(i)
        $('.btn-4-add-period').click();
      }
    }
  }
}
/**
* 绑定各种按钮
*/
function initEvents() {
  $(".btn-4-add-standard").click(function () {
    var paramTr = $('#params').find('tr.data');	// 样品参数ID - testParam
    var paramIds = [];
    paramTr.find('input:checked').each(function () {
      paramIds.push($(this).data('id'));
    });

    var url = "baseStandardNewController.do?consignStandardList&sampleId=" + currentSample.id
      + "&testParamIds=" + paramIds;
    layer.open({
      type: 2,
      title: '选择规程',
      offset: 'auto',
      skin: 'layui-layer-molv',
      content: url,
      closeBtn: 0,
      btn: ['确定', '取消'],
      area: ['940px', '90%'],
      btn1: function (index, layero) {
        //console.log('弹出框', index, layero)
        var iframeWin = window[layero.find('iframe')[0]['name']];
        iframeWin.saveData(true);
      },
      btn2: function () {
        layer.close();
      },
    });
  });

  /**
   * 创建打包参数
   */
  $('.btn-4-add-group').click(function () {
    var paramTr = $('#params').find('tr.data');
    var paramIds = [];
    paramTr.find('input:checked').each(function () {
      paramIds.push($(this).data('id'));
    });
    if (paramIds.length == 0) {
      tip('请选择需要打包的试验参数');
      return;
    }
    layer.prompt({
      title: '请填写打包参数名称',
      skin: 'layui-layer-molv layui-layer-prompt'
    }, function (val, index) {
      ajaxSubmitResponseJSON({
        url: 'testParamController.do?doSaveTestParamGroup',
        data: {
          name: val,
          ids: paramIds.join(',')
        },
        success: function (data) {
          tip(data.msg);
          if (data.success) {
            getParamGroups();
          }
          layer.close(index);
        }
      });
    });
  });
  /**
   * 快速收取打包参数
   */
  $('#groups').change(function () {

    var params = $('#params');
    params.find('input:checkbox').prop('checked', false);

    var option = $(this).find('option:selected');
    var paramIds = option.data('params');
    if (paramIds) {
      var paramIdAry = paramIds.split(',');
      var paramGroup = [];
      params.find('tbody tr.data input:checkbox').each(function () {
        if ($.inArray($(this).data('id'), paramIdAry) >= 0) {
          paramGroup.push($(this));
        }
      });
      for (var i = 0; i < paramGroup.length; i++) {
        $(paramGroup[i]).prop('checked', true);
      }
    }
    calcGroupAmounts();
    getTestOtherInfo();
    initRequirements();
  });

  /**
   * 录入其他材料，不用做试验，纯粹是个记录
   * 弹出一个手动录入框，输入样品 ，厂家等信息
   */
  $('.btn-4-record-material').click(function () {


    //判断该样品是否要做试验，实质是给样品打个标记
    layer.open({
      type: 2,
      title: '录入收样信息',
      skin: 'layui-layer-molv',
      content: 'consignController.do?goRecordSample',
      btn: ['确定', '取消'],
      area: ['95%', '95%'],
      closeBtn: 0,
      yes: function (index, layero) {
        // 把选中的样品 和 参数 加入到父页面中来
        //通过接口找到样品
        var iframeWin = window[layero.find('iframe')[0]['name']];
        var jsonData = iframeWin.echoReferConsignedSample();
        var existSubObjs = $("#referConsignedSampleDataDataGrid").datagrid('getData');
        existSubObjs.total = existSubObjs.total + 1;
        existSubObjs.rows.push(jsonData);
        $("#referConsignedSampleDataDataGrid").datagrid('loadData', existSubObjs);
        layer.close(index);
      }
    });
  });
  /**
   *删除其他材料
   */
  $('.btn-4-delete-material').click(function () {
    //删除功能，通过datagrid('deleteRow',index)来做。摒弃原来的操作dom
    var materialRows = $("#referConsignedSampleDataDataGrid").datagrid('getSelections');
    if (materialRows.length == 0) {
      tip('请选择要删除的材料');
      return;
    }

    var index = layer.open({
      title: '删除提示',
      content: '确认删除选中材料？',
      icon: 3,
      btn: ['确定', '取消'],
      yes: function () {
        var materialIds = [];
        for (var i = materialRows.length - 1; i >= 0; i--) {
          var materialId = $("#referConsignedSampleDataDataGrid").datagrid('getRowIndex', materialRows[i]);
          $("#referConsignedSampleDataDataGrid").datagrid('deleteRow', materialId);
        }
        layer.close(index);
      }
    });
  });
  /**
   * 添加子试验的样品，需要服用样品选择界面，看起来会怪怪的，像套娃一样，一个套一个
   */
  $('.btn-4-add-material').click(function () {
    //参数未选择，提示
    var params = $('#params input:checked');
    if (!params || params.length == 0) {
      tip('请选择试验参数');
      return;
    }
    //参数json
    var params = buildTestParams();
    var paramString = '';
    $.each(params, function (value, index) {
      paramString += index.testParamId;
      paramString += ","
    })
    //资质和大类
    var qualificationType = $('#qualificationType').val();
    var bigCategory = BIG_CATEGORY.tree('getSelected');
    var index = layer.open({
      type: 2,
      title: '添加收样信息',
      skin: 'layui-layer-molv',
      content: 'consignController.do?goEditSample&sampleId=' + currentSample.id + 'params=' + paramString + "&qualificationType=" + qualificationType + "&bigCategoryId=" + bigCategory.id + "&bigCategoryText=" + bigCategory.text,
      btn: ['确定', '取消'],
      area: ['95%', '95%'],
      closeBtn: 0,
      yes: function (index, layero) {
        // 把选中的样品 和 参数 加入到父页面中来
        //通过接口找到样品
        var iframeWin = window[layero.find('iframe')[0]['name']];
        var referConsignedSampleData = iframeWin.echoReferConsignedSample();
        var datagridJson = {};
        datagridJson.total = referConsignedSampleData.length;
        datagridJson.rows = referConsignedSampleData;

        var existSubObjs = $("#referConsignedSampleDataDataGrid").datagrid('getData');
        datagridJson.total = datagridJson.total + existSubObjs.total;
        datagridJson.rows = datagridJson.rows.concat(existSubObjs.rows);
        console.log("datagridJson", datagridJson);
        $("#referConsignedSampleDataDataGrid").datagrid('loadData', datagridJson);
        layer.close(index);
      }
    });

  });
  /**
   * 引用已委托原材料
   */
  $('.btn-4-quote-material').click(function () {
    var title = '引用已委托原材料';
    var url = 'consignController.do?goReferConsignedSample';
    layer.open({
      type: 2,
      title: title,
      content: url,
      btn: ['确定', '取消'],
      area: ['80%', '95%'],
      yes: function (index, layero) {
        var iframeWin = window[layero.find('iframe')[0]['name']];
        var referConsignedSampleData = iframeWin.buildReferConsignedSample();

        //datagrid 传来的 select字段数据是 ，带斜杠的json字符串，我们要处理下，在这里
        $.each(referConsignedSampleData, function (i, n) {
          var jsonStr = n.meta;
          var json = JSON.parse(jsonStr);
          json.importSample = 1;	// 标记为引用的样品，不在样品主页面显示，不参与计费
          n.meta = json;
        });
        //console.log(JSON.stringify(value))
        var datagridJson = {};
        datagridJson.total = referConsignedSampleData.length;
        datagridJson.rows = referConsignedSampleData;

        var existSubObjs = $("#referConsignedSampleDataDataGrid").datagrid('getData');
        datagridJson.total = datagridJson.total + existSubObjs.total;
        datagridJson.rows = datagridJson.rows.concat(existSubObjs.rows);
        $("#referConsignedSampleDataDataGrid").datagrid('loadData', datagridJson);
        layer.close(index);
      }
    });
  });
  /**
   * 资质过滤分类
   */
  $('#qualificationType').change(function () {
    console.log('选择分类')
    initBigCategory();
  });

  $('.btn-4-add-period').click(function () {
    $('#periods tbody').append(createPeriod());
  });

  $('.btn-4-delete-period').click(function () {
    var delRows = $('#periods tbody').find('tr input:checked');
    if (delRows && delRows.length > 0) {
      var index = layer.open({
        title: '删除提示',
        content: '确认删除选中临期？',
        icon: 3,
        btn: ['确定', '取消'],
        yes: function () {
          for (var i = 0; i < delRows.length; i++) {
            var delRow = delRows[i];
            $(delRow).closest('tr').remove();
          }
          layer.close(index);
        }
      });
    }
  });

  /**
   * 新增附加费用 按钮事件
   */
  $('.btn-4-add-additionalFee').click(function () {
    var url = 'additionalFeeController.do?edit';
    layer.open({
      type: 2,
      skin: 'layui-layer-molv',
      title: '新增',
      content: url,
      maxmin: false,
      btn: ['保存', '取消'],
      area: ['500px', '400px'],
      yes: function (index, layero) {
        var body = layer.getChildFrame('body', index);
        $(body).find('.btn-4-submit').trigger('click');
        return false;
      }
    });
  });

  /**
   * 删除附加费用按钮事件
   */
  $('.btn-4-delete-additionalFee').click(function () {
    var delRows = [];
    $('#additionalFees tbody').find('input:checked').each(function () {
      delRows.push($(this).data('id'));
    });

    if (delRows && delRows.length > 0) {

      var ids = delRows.join(',');
      var index = layer.open({
        title: '删除提示',
        content: '确认删除选中附加费用？',
        icon: 3,
        btn: ['确定', '取消'],
        yes: function () {

          ajaxSubmitResponseJSON({
            url: 'additionalFeeController.do?doDel',
            data: {
              "id": ids
            },
            success: function (data) {
              if (data.success) {
                reloadDataGrid2();
                layer.close(index);
              }
            }
          });
        }
      });
    }

  });

  /**
   * 最上方查询按钮：通过输入的项目名称/样品名称/参数名称，检索
   * @author weiheng 20180425
   */
  $('#searchByTestParamName').click(function () {
    searchBigCategoryByCondition();
  });

  // 查询条件为空时，重置大类的下拉列表
  $('#searchCondition').keyup(function () {
    var paramName = $('#searchCondition').val();
    if (paramName != '' || $.trim(paramName) != '') {
      return;
    }
    if (selectedBigCategoryDom) {
      selectedBigCategoryDom.attr("selected", true);
      // 移除空
      $("#qualificationType option[id='searchResultsOption']").remove();
      initBigCategory();
    }
  });

  // 监听回车按钮，触发查询事件
  $('#searchCondition').keypress(function (event) {
    if (event.keyCode == "13") {
      searchBigCategoryByCondition();
    }
  })

  // 选择事件
  $("#qualificationType").change(function () {
    var selectedId = $(this).find("option:selected").attr("id");
    if (selectedId == 'searchResultsOption') return;
    if ($("#searchResultsOption")) {
      $("#qualificationType option[id='searchResultsOption']").remove();
    }
  });

}
function initMainTestInfo() {
  var params = GetQueryString('params'); //主试验选择的参数，根据这个参数，取得子试验的样品
  var sampleId = GetQueryString('sampleId');	// 关联测试样品
  if (params) {
    //样品树
    SAMPLE = $('#sample').tree({
      url: 'testSampleController.do?getSampleComboTreeByTestParams&testParamIds=' + params + "&includeChildTestItem=true",
      lines: true,
      onLoadSuccess: function () {
        /*回显样品*/
        var node = SAMPLE.tree('find', ECHO_SAMPLE_ID);
        if (node) {
          SAMPLE.tree('select', node.target);
        } else if (sampleId) {
          node = SAMPLE.tree('find', sampleId);
          if (node) SAMPLE.tree('select', node.target);
        }
      },
      onSelect: function () {
        $('#description').val(currentSample.attributes.description);// 样品描述 
        $("#testSampleDisplayName").val(currentSample.attributes.displayName);// 样品名称回写到样品辅助信息
        createTestParams();
        isCoagulateTest();
        initRequirements();
        getTestOtherInfo();
      }
    });
  }
}
/**
* 初始化资质
* 从后台取得 单位资质列表
* 如果 是添加的子试验，那么 这个资质是固定的，包括后面的自定义大类
*/
function initQualificationType() {
  //查询传入静态参数的方法
  var selected = GetQueryString('qualificationType');
  var qualificationType = $('#qualificationType');
  if (!selected) {
    selected = $(qualificationType).data('selected');
  }
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
  qualificationType.html(htm);
  //如果传入的参数带了资质的话，需要初始化这个值
  var qualificationTypeExist = GetQueryString('qualificationType');
  $(qualificationType).val(qualificationTypeExist);
}

/**
* 大类树
*/
var BIG_CATEGORY;
/**
* 样品树
*/
var SAMPLE;

/**
*初始化大类自定义大类树型结构数据
*/
function initBigCategory() {
  console.log('初始化大类自定义大类树型结构数据')
  var data = getEchoData();
  console.log('data', data)
  var qualificationType;
  if (data.bigCategory) {
    qualificationType = data.bigCategory.qualificationType.id;
  }
  if (!qualificationType) {
    qualificationType = $('#qualificationType').val();
  }
  console.log('qualificationType', qualificationType)
  var url = 'bigCategoryController.do?comboTreeSync';
  url += '&qualificationType.id=' + qualificationType;
  BIG_CATEGORY = $('#bigCategory').tree({
    url: url,
    lines: true,
    onLoadSuccess: function () {
      if (data.bigCategory) {
        echoData(data);
        var node = BIG_CATEGORY.tree('find', data.bigCategory.id);
        BIG_CATEGORY.tree('select', node.target);
      } else {
        var datas = storeTool.fetchFunc('consign-editSample');
        //获取资质分类id，并请求样品列表树
        for (var i = datas.length; i >= 0; i--) {
          if (!!datas[i] && !!datas[i]['#bigCategory .tree-node-selected'] && !!datas[i]['#bigCategory .tree-node-selected']['node-id']) {
            var nodeid = datas[i]['#bigCategory .tree-node-selected']['node-id'];
            /*initSampleById(nodeid);
            $("#bigCategory .tree-node[node-id='"+nodeid+"']").addClass('tree-node-selected');*/
            var node = BIG_CATEGORY.tree('find', nodeid);
            BIG_CATEGORY.tree('select', node.target);
          }
        }
      }
      var bigCategoryId = GetQueryString('bigCategoryId');
      if (bigCategoryId) { // 子试验的情况，有bigCategory
        //删除非主试验大类的其他大类，并选中
        var node = BIG_CATEGORY.tree('find', bigCategoryId);
        BIG_CATEGORY.tree('select', node.target);
      }
    },
    onSelect: function () {
      initSample();
      getParamGroups();
    }
  });
  //初始化 主试验传来的信息
  // 链接信息如果包含了 大类 ，则只能用这个大类

}

/**
* 通过搜索的名称 - 初始化大类自定义大类树型结构数据
* @author weiheng 20180426
*/
var selectedBigCategoryDom;// 记录查询前选中的大类
function initBigCategoryBySearch(name) {

  selectedBigCategoryDom = $("#qualificationType").find("option:selected");
  var url = 'bigCategoryController.do?comboTreeSyncByName';
  url += '&name=' + encodeURI(encodeURI(name));

  BIG_CATEGORY = $('#bigCategory').tree({
    url: url,
    lines: true,
    onLoadSuccess: function (node, data) {
      if (data.length > 0) {
        //echoData(data);
        var node = BIG_CATEGORY.tree('find', data[0].id);
        BIG_CATEGORY.tree('select', node.target);

        // 资质大类下拉选项置空（查询出的结果可能横跨N个大类）
        $("#qualificationType").append("<option id='searchResultsOption' selected='true' >查询结果</option>");

      } else {
        var datas = storeTool.fetchFunc('consign-editSample');
        //获取资质分类id，并请求样品列表树
        for (var i = datas.length; i >= 0; i--) {
          if (!!datas[i] && !!datas[i]['#bigCategory .tree-node-selected'] && !!datas[i]['#bigCategory .tree-node-selected']['node-id']) {
            var nodeid = datas[i]['#bigCategory .tree-node-selected']['node-id'];
            /*initSampleById(nodeid);
            $("#bigCategory .tree-node[node-id='"+nodeid+"']").addClass('tree-node-selected');*/
            var node = BIG_CATEGORY.tree('find', nodeid);
            BIG_CATEGORY.tree('select', node.target);
          }
        }
      }
      /*var bigCategoryId = GetQueryString('bigCategoryId'); 
      if(bigCategoryId){ // 子试验的情况，有bigCategory
        //删除非主试验大类的其他大类，并选中
         var node = BIG_CATEGORY.tree('find', bigCategoryId);
         BIG_CATEGORY.tree('select', node.target);
      }*/
    },
    onSelect: function () {
      initSample();
      getParamGroups();
    }
  });
  //初始化 主试验传来的信息
  // 链接信息如果包含了 大类 ，则只能用这个大类

}

var testObject;	// 父页面传过来的样品
function getEchoData() {

  var bigCategoryId = GetQueryString('bigCategoryId');	// 是否属于关联样品页？
  var result = {};
  if (bigCategoryId) {	// 关联样品加载
    console.log('if 关联样品加载')
    var url = "bigCategoryController.do?getById&id=" + bigCategoryId;
    ajaxSubmitResponseJSON({
      url: url,
      success: function (data) {
        console.log('data', data)
        result.bigCategory = data;
      }
    });
  } else {	// 样品主页面加载
    console.log('else 样品主页面加载')
    var objectString = sessionStorage.getItem('TEST_OBJECT');
    if (objectString) {
      sessionStorage.removeItem("TEST_OBJECT");
      var object = eval('(' + objectString + ')');
      testObject = object;
      console.log('testObject', testObject)
      result.object = object;
      console.info("object", object);
      var paramId = object.testParams[0].testParamId;
      var url = 'bigCategoryController.do?getBigCategoryByTestParam';
      url += '&testParamId=' + paramId;
      ajaxSubmitResponseJSON({
        url: url,
        success: function (data) {
          console.log('data', data)
          result.bigCategory = data;
        }
      });
    }
  }

  return result;
}

/**
* 初始化收样样品树
*/
var ECHO_SAMPLE_ID = '';
var currentSample;

//记录辅助信息input框的id，用于下面本地存储
var assistInputArr = [], assistValueArr = [];

//用于传递规格参数的字符串，可转json
var standardAttrs = '', standardAttrFlag = false;

$(function () {
  $('#testObjectAttributes').find('input[id]:not(".no-store")').each(function (index, ele) {
    assistInputArr.push('#' + $(ele).attr('id'));
  });
  $('#choose-attr').click(function () {
    var url = 'webpage/com/hitek/testbusiness/consign/attrDiv.jsp';
    var attrsStr = "";
    if (!standardAttrFlag || $('#params').find('input[type="checkbox"]:checked').length <= 0) {
      tip('请选择参数');
      return;
    } else if (!standardAttrs || standardAttrs == "[]") {
      attrsStr = encodeURI(encodeURI('[{"name":"自定义规格","value":[]}]'));
    } else {
      attrsStr = encodeURI(encodeURI(standardAttrs));
    }
    layer.open({
      type: 2,
      skin: 'layui-layer-molv',
      title: '选择规格型号',
      content: url + '?attrs=' + attrsStr,
      btn: ['确定', '取消'],
      area: ['300px', '60%'],
      yes: function (index, layero) {
        var dom = layer.getChildFrame('body', index);
        var standardArr = [];
        $(dom).find('.editable-select.es-input').each(function (index, ele) {
          if ($(ele).val() == "") {
            tip('请输入' + $(ele).closest('td.value').prev('.td-label').text());
            standardArr = [];

            //终止循环
            return false;
          }
          standardArr.push($(ele).val());
        });
        if (standardArr.length > 0) {
          var standardStr = standardArr.join('-');
          $('#standard').val(standardStr);
          $('#standard-cont').text(standardStr);
          layer.close(index);
        }
      }
    });
  });
});


function initSample() {
  //如果url的链接中有 关于参数的值，就说明这页面是子试验的，不用加载样品
  var params = GetQueryString('params'); //主试验选择的参数，根据这个参数，取得子试验的样品
  if (params) {
    //初始化主试验信息
    initMainTestInfo();
    return;
  }
  var node = BIG_CATEGORY.tree('getSelected');
  var url = 'testSampleController.do?getSampleComboTreeByBigCategory';
  if (node) {
    url += '&bigCategoryId=' + node.id;
  }
  //console.info("getSampleComboTree", url);
  SAMPLE = $('#sample').tree({
    url: url,
    lines: true,
    onLoadSuccess: function () {
      /*回显样品*/
      var node = SAMPLE.tree('find', ECHO_SAMPLE_ID);
      if (node) {
        SAMPLE.tree('select', node.target);
      }
    },
    onSelect: function () {
      //本地存取样品辅助信息数据

      //第一次选择，不存储也不清空
      if (!currentSample) {

      }
      //点击自己，不存储也不清空
      else if (currentSample.id === SAMPLE.tree('getSelected').id) {

      }
      //点击的其他样品，切换
      else {

        //保存当前样品的辅助信息
        storeTool.storeFunc('assistArgs_' + currentSample.id, ['value'], assistInputArr);

        //判断当前选中是否已存储
        var storageName = "";
        for (key in localStorage) {
          if (key.indexOf(SAMPLE.tree('getSelected').id) >= 0) {
            storageName = "assistArgs_" + SAMPLE.tree('getSelected').id;
            break;
          }
          storageName = "";
        }
        //有存储，渲染
        if (storageName && storageName != "") {
          storeTool.renderContent(storageName);
        }
        //无存储，清空
        else {
          for (var i = assistInputArr.length - 1; i >= 0; i--) {
            $(assistInputArr[i]).val('');
          }
        }
      }

      //把当前选中的样品赋值给历史纪录，用于下一轮操作
      currentSample = SAMPLE.tree('getSelected');

      /*var cateName = $('#qualificationType option[value="'+$('#qualificationType').val()+'"]').text();
      var cateSelects=[],sampleSelects=[];
      
      //调用递归方法获取tree-node节点
      var cateSelects = findPath($('#bigCategory .tree-node.tree-node-selected'),[]);
      var sampleSelects = findPath($('#sample .tree-node.tree-node-selected'),[]);
      
      //拼接分类和样品的层级结构字符串，因为子节点在前，父节点在后，所以从arr.length-1开始遍历
      var cateString = "",sampleString = "";
      for(var i = cateSelects.length-1;i>=0;i--){
        cateString+=$(cateSelects[i]).find('.tree-title').text();
        if(i>0){
          cateString+="->";
        }
      }
      for(var i = sampleSelects.length-1;i>=0;i--){
        sampleString+=$(sampleSelects[i]).find('.tree-title').text();
        if(i>0){
          sampleString+="->";
        }
      }
      
      //拼接显示样品辅助信息的规格型号
      $('#standard').val(cateName+' | '+cateString+' | '+sampleString);*/
      $('#description').val(currentSample.attributes.description);// 样品描述 
      $("#testSampleDisplayName").val(currentSample.attributes.displayName);// 样品名称回写到样品辅助信息
      createTestParams();
      isCoagulateTest();
      initRequirements();
      getTestOtherInfo();
    }
  });
}

/*
* 递归获取节点的父级节点，直到最顶层
* 返回的节点数组，元素的顺序为，子节点在前，父节点在后
* */
function findPath(treeNode, nodeArr) {
  //记录当前节点
  nodeArr.push(treeNode);
  //如果当前节点没有.tree-node父节点，递归结束，返回节点数组
  if (treeNode.closest('ul').prev('div.tree-node').length <= 0) {
    return nodeArr;
  }
  //递归父节点
  return findPath(treeNode.closest('ul').prev('div.tree-node').eq(0), nodeArr);
}

function initSampleById(id) {
  var url = 'testSampleController.do?getSampleComboTreeByBigCategory&bigCategoryId=' + id;
  SAMPLE = $('#sample').tree({
    url: url,
    lines: true,
    onLoadSuccess: function () {
      //回显样品
      var node = SAMPLE.tree('find', ECHO_SAMPLE_ID);
      if (node) {
        SAMPLE.tree('select', node.target);
      }
    },
    onSelect: function () {

      $('#description').val(currentSample.attributes.description);// 样品描述 
      $("#testSampleDisplayName").val(currentSample.attributes.displayName);// 样品名称回写到样品辅助信息
      createTestParams();
      isCoagulateTest();
      initRequirements();
      getTestOtherInfo();
    }
  });
}

/**
* 根据测试参数名，查询样品
* @author weiheng 20180425
*/
function initSampleByTestParamName(name) {
  var url = 'testSampleController.do?getSampleComboTreeByTestParamName&testParamName=' + name;
  SAMPLE = $('#sample').tree({
    url: url,
    lines: true,
    onLoadSuccess: function () {
      //回显样品
      var node = SAMPLE.tree('find', ECHO_SAMPLE_ID);
      if (node) {
        SAMPLE.tree('select', node.target);
      }
    },
    onSelect: function () {
      $('#description').val(currentSample.attributes.description);// 样品描述 
      $("#testSampleDisplayName").val(currentSample.attributes.displayName);// 样品名称回写到样品辅助信息
      createTestParams();
      isCoagulateTest();
      initRequirements();
      getTestOtherInfo();
    }
  });
}

var tableColumns = 9;
/**
*点击选择大类时，获取大类参数
*/
var ECHO_TEST_PARAMS = [];

/**
* 创建检测参数table数据
*/
function createTestParams() {
  var params = $('#params');
  var htm = '';
  var bigCategory = BIG_CATEGORY.tree('getSelected');
  var sample = SAMPLE.tree('getSelected');
  console.log('sample', sample)
  ajaxSubmitResponseJSON({
    url: 'testParamController.do?getTestParamByTestSample',
    data: {
      "sampleId": (sample ? sample.id : ''),
      'bigCategoryId': (bigCategory ? bigCategory.id : '')
    },
    success: function (data) {

      var paramIds = [];
      var paramCountAry = [];
      for (var ctr = 0; ctr < ECHO_TEST_PARAMS.length; ctr++) {
        paramIds.push(ECHO_TEST_PARAMS[ctr].testParamId);
        paramCountAry.push(ECHO_TEST_PARAMS[ctr].count);
      }

      if (data && data.length > 0) {
        for (var i = 0; i < data.length; i++) {

          var row = data[i];
          // noinspection JSUnresolvedVariable
          var shareIdentity = row.sharePriceIdentity;

          var groupTitle = '<div>';
          // noinspection JSUnresolvedVariable
          groupTitle += '<strong>以下试验参数共用单价（￥' + row.sharePrice + '） - ' + shareIdentity + '</strong>';
          if (!shareIdentity) {
            groupTitle = '<strong>非共用单价试验参数</strong>';
          }

          groupTitle += '<span style="float: right">';
          groupTitle += '<strong>本组费用合计：￥<span class="group-fees">0</span></strong>';
          groupTitle += '</span>';

          groupTitle += '</div>';


          htm += '<tr class="group' + i + ' title" style="height: 28px;">';
          htm += '<td colspan="' + tableColumns + '">' + groupTitle + '</td>';
          htm += '</tr>';

          var params = row.testParams;
          for (var j = 0; j < params.length; j++) {
            var param = params[j];
            htm += '<tr class="group' + i + ' data' + (shareIdentity ? ' share' : '') + '">';
            htm += '<td name="testItemId" style="display: none;">' + param.testItemId + '</td>';
            var index = $.inArray(param.id, paramIds);

            htm += '<td name="paramId" class="value" style="text-align: center;">';
            htm += '<input type="checkbox" onclick=changeperiod(this) data-id="' + param.id + '" data-group="' + i + '"';
            htm += (index >= 0 ? 'checked' : '') + '>';
            htm += '</td>';
            htm += '<td name="paramName" class="value">' + param.displayName + '</td>';
            htm += '<td name="paramRemark" class="value">' + param.remark + '</td>';
            htm += '<td name="paramQualification" class="value" style="display:none;">' + param.supports + '</td>';	// 检测资质

            // 拼装评定依据和标准
            var useStandards = params[j].useStandards;
            var displayBasis = "", displayStandards = "";
            for (var k = 0; k < useStandards.length; k++) {
              if (useStandards[k].baseStandardUseType == '1') {
                if (displayBasis.length > 1) displayBasis += "</br>";
                displayBasis += useStandards[k].baseStandardName + "(" + useStandards[k].publishCode + ")";
              } else if (useStandards[k].baseStandardUseType == '2') {
                if (displayStandards.length > 1) displayStandards += "</br>";
                displayStandards += useStandards[k].baseStandardName + "(" + useStandards[k].publishCode + ")";
              } else if (useStandards[k].baseStandardUseType == '3') {
                if (displayBasis.length > 1) displayBasis += "</br>";
                displayBasis += useStandards[k].baseStandardName + "(" + useStandards[k].publishCode + ")";
                if (displayStandards.length > 1) displayStandards += "</br>";
                displayStandards += useStandards[k].baseStandardName + "(" + useStandards[k].publishCode + ")";
              }
            }
            htm += '<td name="paramBasis" class="value">' + displayBasis + '</td>';	// 试验依据
            htm += '<td name="paramStandard" class="value">' + displayStandards + '</td>';	// 评定标准

            // noinspection JSUnresolvedVariable
            htm += '<td name="paramPrice" class="value" style="width: 80px;">' + createPriceComponents(param.prices) + '</td>';
            htm += '<td name="paramAmount" class="value" style="width: 50px;">';
            htm += '<input class="countNumber" style="width: 50px; padding-left: 20px;" value="' + (index >= 0 ? paramCountAry[index] : 1) + '">';
            htm += '</td>';
            htm += '<td name="paramSubtotal" class="value"></td>';
            htm += '</tr>';
          }
        }
      }
    }
  });
  params.find('tbody').html(htm);
  applyTestParamSamplePrice();
  calcSubAmounts();
  bindTestParamCheckboxClick();
  bindTestParamPriceChange();
  bindTestParamCountChange();
}

/**
*构建计数数量微调器
*/
function createPriceComponents(prices) {
  var htm = '<select style="width: 80px; border: 0">';
  if (prices && prices.length > 0) {
    for (var i = 0; i < prices.length; i++) {
      var priceO = prices[i];
      htm += '<option value="' + priceO.id + '"';
      htm += 'data-price="' + priceO.type + '"';
      htm += 'data-sample="' + (priceO.testSampleId ? priceO.testSampleId : '') + '"';
      htm += 'class="price' + priceO.type;
      if (priceO.type == '0') {
        htm += ' sample' + priceO.testSampleId + '"';
        htm += ' style="display:none;"';
      } else if (priceO.type == '3') {
        htm += '" style="display:none;"';
      }
      htm += '">';
      htm += priceO.price;
      htm += '</option>';
    }
  }
  htm += '</select>';
  return htm;
}

/**
*计算参数默认小计金额
*/
function calcSubAmounts() {
  $('#params').find('tbody tr.data').each(function () {
    var price = $(this).find('select option:selected').text();
    var count = $(this).find('td[name="paramAmount"]').find('input').val();
    var subAmount = parseInt(count) * parseFloat(price);
    if (!subAmount) {
      subAmount = 0;
    }
    $(this).find('td[name="paramSubtotal"]').text(subAmount);
  });
  calcGroupAmounts();
}

function calcGroupAmounts() {
  var object = {};

  $('#params').find('tr.data').each(function () {
    var groupNo = $(this).find('input:checkbox').data('group');
    var groupValue = object[groupNo];
    if (!groupValue) {
      groupValue = [];
      object[groupNo] = groupValue;
    }
    groupValue.push($(this));
  });

  for (var key in object) {

    var paramTrs = $(object[key]);
    var groupAmount = 0;

    /*计算每个试验参数分组的费用总金额*/
    paramTrs.each(function () {
      var checkbox = $(this).find('input:checkbox');
      var groupNo = checkbox.data('group');
      if (checkbox.prop('checked')) {
        var count = $(this).find('td[name="paramAmount"]').find('input').val();
        var price = $(this).find('select option:selected').length > 0 ? $(this).find('select option:selected').text() : 0;
        groupAmount += (parseInt(count) * parseFloat(price));
      }
      $('.title.group' + groupNo).find('.group-fees').html(groupAmount);
    });

    var isShareGroup = $(paramTrs[0]).hasClass('share');
    /*如果试验参数分组是共价组，则从新处理一次费用总金额*/
    if (isShareGroup) {
      var groupNo = '';
      var maxCount = 0;
      var sharePrice = 0;
      var checkedLen = 0;
      paramTrs.each(function () {
        var checkbox = $(this).find('input:checkbox');
        groupNo = checkbox.data('group');
        if (checkbox.prop('checked')) {
          checkedLen++;
          sharePrice = $(this).find('select option[data-price=3]').text();
          var subCount = $(this).find('td[name="paramAmount"]').find('input').val();
          maxCount = (maxCount > subCount ? maxCount : subCount);
        }
      });
      if (checkedLen >= 2 && groupNo >= 0) {
        $('.title.group' + groupNo).find('.group-fees').html(parseInt(maxCount) * parseFloat(sharePrice));
      }
    }
  }
}

function getParamGroups() {
  var node = BIG_CATEGORY.tree('getSelected');
  var url = 'testParamController.do?getTestParamGroups';
  if (node) {
    url += '&bigCategoryId=' + node.id;
  }
  ajaxSubmitResponseJSON({
    url: url,
    success: function (data) {
      var htm = '';
      var groups = $('#groups');
      var selected = groups.val();
      if (data.success) {
        var rows = data.obj;
        if (rows && rows.length > 0) {
          for (var i = 0; i < rows.length; i++) {
            var row = rows[i];
            var select = '';
            if (row.id == selected) {
              select = 'selected';
            }
            htm += '<option value="' + row.id + '"' + select + ' data-params="' + row.testParamIds + '">' + row.name + '</option>';
          }
        }
      }
      groups.find('option[value != ""]').remove();
      groups.append(htm);
    }
  });
}

/**
*绑定试验参数checkbox点击事件
*/
function bindTestParamCheckboxClick() {
  $('#params tbody input:checkbox').click(function () {
    calcGroupAmounts();
    initRequirements();
    isCoagulateTest();
    getTestOtherInfo();
  });
}

/**
* 试验参数单价发生改变时，重新计算参数费用小计金额
*/
function bindTestParamPriceChange() {
  $('#params tbody select')
    .change(function () {
      calcSubAmounts();
    });
}

function bindTestParamCountChange() {
  var orgValue = '';
  $('#params tbody')
    .find('tr.data')
    .find('td[name="paramAmount"]')
    .find('input')
    .focus(function () {
      orgValue = $(this).val();
    })
    .keyup(function () {
      var value = $(this).val();
      if (/^[1-9]\d*$/.test(value)) {
        orgValue = value;
      } else {
        $(this).val(orgValue);
      }
    })
    .blur(function () {
      calcSubAmounts();
    });
}

function isCoagulateTest() {
  var itemIds = [];
  $('#params tbody').find('input:checked').each(function () {
    var tr = $(this).closest('tr');
    var itemId = tr.find('td[name="testItemId"]').text();
    if ($.inArray(itemId, itemIds) == -1) {
      itemIds.push(itemId);
    }
  });
  if (itemIds.length == 0) {
    $('#formingDate').closest('tr').hide();
    $('#hours').closest('tr').hide();
    return;
  }
  ajaxSubmitResponseJSON({
    url: 'testParamController.do?getIsCoagulateTest',
    data: {
      testItemIds: itemIds.join(',')
    },
    success: function (data) {
      if (data.success && data.obj) {
        $('#formingDate').closest('tr').show();
        $('#hours').closest('tr').show();
      }
    }
  });
}
/**
 * 检测参数table
 */
function initRequirements() {
  var itemIds = [];
  var paramIds = [];

  //循环试验参数列表的每一行
  $('#params tbody').find('input:checked').each(function () {
    var tr = $(this).closest('tr');
    var itemId = tr.find('td[name="testItemId"]').text();

    //选中的参数列表id不存在与Ids数组时，添加
    if ($.inArray(itemId, itemIds) == -1) {
      itemIds.push(itemId);
    }
    paramIds.push($(this).data('id'));
  });
  var queryParams = {
    testItemIds: itemIds.join(','),
    testParamIds: paramIds.join(',')
  };
  $('#requirements').datagrid({
    url: 'testParamController.do?getRequirements',
    fit: true,
    nowrap: false,
    fitColumns: true,
    pagination: false,
    queryParams: queryParams,
    columns: [[
      {
        title: '收样要求名称', field: 'title', align: 'right', width: 80,
        formatter: function (value) {
          return '<span style="line-height: 18px;">' + value + '</span>';
        }
      }, {
        title: '收样要求内容', field: 'text', width: 180,
        formatter: function (value) {
          var htm = '<span style="line-height: 18px;">';
          if (value) {
            //分割样品要求字符串为数组，并进行排序和去重，
            var valueAry = $.unique(value.split('\r'));

            for (var i = 0; i < valueAry.length; i++) {
              htm += valueAry[i] + '<br>';
            }
          } else {
            htm += '满足正常收样即可';
          }
          htm += '</span>';
          return htm;
        }
      }
    ]]
  });
}

/**
* 检查试验参数是否按样品设置了单价，
* 如果试验参数按样品设置了单单价，则显示样品单价和子价格，默认选中样品单价，
* 否则显示通用单价和子价格，选中通用单价
*/
function applyTestParamSamplePrice() {
  var params = $('#params');
  var paramTRs = params.find('tr.data');
  var sample = SAMPLE.tree('getSelected');
  for (var i = 0; i < paramTRs.length; i++) {
    var select = $(paramTRs[i]).find('select');
    select.find('option').hide();
    select.find('.price2').show();

    var price = select.find('.price1');
    var samplePrice = select.find('.price0.sample' + (sample ? sample.id : ''));
    if (samplePrice && samplePrice.length > 0) {
      price = $(samplePrice[0]);
    }
    price.show();
    price.prop('selected', true);
  }
}

/**
*加载样品辅助信息
*/
function getTestOtherInfo() {
  var itemIds = [];
  $('#params tbody').find('input:checked').each(function () {
    var tr = $(this).closest('tr');
    var itemId = tr.find('td[name="testItemId"]').text();
    if ($.inArray(itemId, itemIds) == -1) {
      itemIds.push(itemId);
    }
  });
  var sample = SAMPLE.tree('getSelected');
  if (itemIds.length == 0 && (!sample || sample.length == 0)) {
    $('#testObjectAttributes').find('.dy').remove();
    return;
  }
  ajaxSubmitResponseJSON({
    url: 'testParamController.do?getTestOtherInfo',
    data: {
      testItemIds: itemIds.join(','),
      sampleId: sample.id
    },
    success: function (data) {

      //console.info("getTestOtherInfo", data);
      var htm = '';
      if (data && data.length > 0) {
        htm += createFormComponents(data);
      }
      var specificObj = [];

      for (var i = 0; i < data.length; i++) {	// 遍历所有的样品辅助信息（hitek数据中心返回的）
        var fieldName = data[i] && data[i].systemFieldName ? data[i].systemFieldName : '';
        var orderNo = data[i] && data[i].orderNo ? data[i].orderNo : 1;
        /**
         * 我补个注释，方面后面的兄弟理解 - 20181219 weiheng
         * 取hitek返回的系统字段，系统字段里含有型号、规格、等级、标号的，
         * 在页面上取对应用户输入的值，按hitek返回的顺序号做拼接
         */
        if (fieldName.indexOf("型号") >= 0 || fieldName.indexOf("规格") >= 0 || fieldName.indexOf("标号") >= 0 || fieldName.indexOf("等级") >= 0) {
          //循环每个规格型号的value值，可以是数组（对应多个可选的值），也可以为空或者undefined（对应空字符串）
          if (data[i].value && data[i].value instanceof Array && data[i].value.length > 0) {
            specificObj.push({ name: data[i].systemFieldName, value: data[i].value, order: orderNo });
          } else {
            specificObj.push({ name: data[i].systemFieldName, value: '', order: orderNo });
          }
        }
        standardAttrFlag = true;
      }
      standardAttrs = JSON.stringify(specificObj);

      $('#testObjectAttributes').find('.dy').remove();
      // $('#testObjectAttributes').append(htm);
      $('#testObjectAttributesR').html(htm);
    }
  });
}

// noinspection SpellCheckingInspection
/**
* 构建收样辅助信息form表单元素
*/
var ECHO_OTHER_INFOS;

function createFormComponents(rows) {
  var htm = '';
  var attributeIds = [];
  var attributeValues = [];
  if (ECHO_OTHER_INFOS && ECHO_OTHER_INFOS.length > 0) {
    for (var i = 0; i < ECHO_OTHER_INFOS.length; i++) {
      attributeIds.push(ECHO_OTHER_INFOS[i].attributeId);
      attributeValues.push(ECHO_OTHER_INFOS[i].value);
    }
  }
  for (var j = 0; j < rows.length; j++) {

    // 跳过型号、规格、等级、标号，由页面规格型号字段统一输入
    var sysField = rows[j].systemFieldName;
    if (sysField == '型号' || sysField == '规格' || sysField == '等级' || sysField == '标号') continue;

    var row = rows[j];
    htm += '<tr class="dy"' + (row.infoType == 2 ? 'style="display:none;"' : '') + '>';
    htm += '<td class="td-label"><label for="' + row.id + '">' + row.displayName + '：</label></td>';

    var value;
    var dataType = row.dataType;
    htm += '<td class="value">';
    if (dataType == 2) { //时间类型
      value = $('input[name=' + row.id + ']').val();
      if (!value && $.inArray(row.id, attributeIds) >= 0) {
        value = attributeValues[$.inArray(row.id, attributeIds)];
      }
      htm += '<input id="' + row.id + '" class="Wdate" style="height: 28px; border: 0" name="' + row.id + '" ';
      htm += 'onclick="WdatePicker({dateFmt:\'yyyy-MM-dd\'})"';
      htm += 'data-datatype="' + dataType + '"';
      htm += 'data-infotype="' + row.infoType + '"';
      htm += 'data-sysname="' + row.systemFieldName + '"';
      htm += 'data-attrname="' + row.displayName + '"';
      htm += 'value="' + (value ? value : '') + '">';
    } else if (dataType == 5) { //下拉框类型
      value = $('select[name=' + row.id + ']').val();
      if (!value && $.inArray(row.id, attributeIds) >= 0) {
        value = attributeValues[$.inArray(row.id, attributeIds)];
      }
      htm += '<select id="' + row.id + '" name="' + row.id + '" style="height: 28px; width:100%; border: 0"';
      htm += 'data-datatype="' + dataType + '"';
      htm += 'data-infotype="' + row.infoType + '"';
      htm += 'data-sysname="' + row.systemFieldName + '"';
      htm += 'data-attrname="' + row.displayName + '">';
      // noinspection JSUnresolvedVariable
      var listValue = row.listValue;
      var values = listValue.split(';');
      for (var k = 0; k < values.length; k++) {
        htm += '<option value="' + values[k] + '"' + (values[k] == value ? "selected" : "") + '>' + values[k] + '</option>';
      }
      htm += '</select>';
    } else { //输入框类型
      value = $('input[name=' + row.id + ']').val();
      if (!value && $.inArray(row.id, attributeIds) >= 0) {
        value = attributeValues[$.inArray(row.id, attributeIds)];
      }
      htm += '<input id="' + row.id + '" name="' + row.id + '"';
      htm += 'style="height: 28px;"';
      htm += 'data-datatype="' + dataType + '"';
      htm += 'data-infotype="' + row.infoType + '"';
      htm += 'data-sysname="' + row.systemFieldName + '"';
      htm += 'data-attrname="' + row.displayName + '"';
      htm += 'value="' + (value ? value : '') + '" onblur="onTestOtherInfo(this)">';
    }
    htm += '</td>';

    htm += '</tr>';
  }
  return htm;
}
//输入样品辅助信息时，当失去焦点的动作
//用于校验批号的唯一性
function onTestOtherInfo(obj) {
  var id = $(obj).attr('id');
  var dataAttr = $(obj).data('attrname');
  if (dataAttr == "批号") {		//批号，需要到后端取教研唯一性
    ajaxSubmitResponseJSON({
      url: 'testObjectController.do?uniqueSN',
      data: {
        value: $(obj).val() ? $(obj).val() : ''
      },
      success: function (data) {
        if (data.success) {
          layer.tips('批号可以使用', '#' + id, {
            tips: [1, '#3595CC'],
            time: 2000
          });
        } else {
          layer.tips('批号不可以使用', '#' + id, {
            tips: [1, '#8f0911'],
            time: 2000
          });
        }
      }
    });
  }
}
/*---------------------构建收样信息相关方法----------------------*/

/**
 * 是否根据计价数量生成样品对象
 * @return boolean
 * 20181227 - weiheng
 */
function isCreateTestSampleByParamNum() {

  var res = false;
  var testObjects = [];
  // 获取系统参数：是否根据计价数量生成样品对象
  var createSampleByParamNum = ajaxRequestSync('tSBusinessParamController.do?getBusinessParam', { 'key': 'ACCEPT_SAMPLE_25' });
  if (createSampleByParamNum == 'Y') {
    res = true;
  }
  return res;
}

// noinspection JSUnusedGlobalSymbols
/**
*构建收样信息，收样信息构建结果是样品对象
*/
function createTestObject() {

  var selected = SAMPLE.tree('getSelected');
  if (!selected) {
    tip('请选择试验检测对象');
    return;
  }

  var params = $('#params input:checked');
  if (!params || params.length == 0) {
    tip('请选择试验参数');
    return;
  }

  var testObjects = [];	// 样品数组
  var flag = isCreateTestSampleByParamNum();
  var testParams = buildTestParams();

  console.info("testParams", testParams);
  if (flag) {

    // 根据计价参数数量生成样品数量
    var sampleNum = 0;	// 生成样品数量
    for (var i = 0; i < testParams.length; i++) {
      if (parseInt(testParams[i].count) > sampleNum) {
        sampleNum = parseInt(testParams[i].count);
      }
    }
    // 生成样品
    for (var i = 0; i < sampleNum; i++) {
      var testObject = {};
      // 处理样品参数
      var tempParams = [];
      for (var j = 0; j < testParams.length; j++) {
        if (testParams[j].count == "0") {
          continue;
        }
        testParams[j].count = (parseInt(testParams[j].count) - 1) + "";	// 自减
        var tempParam = JSON.parse(JSON.stringify(testParams[j]));// 克隆一个对象
        tempParam.count = "1";	// 按计价参数数量生成样品，每个样品的参数数量必定是1
        tempParams.push(tempParam);
      }
      testObject.testParams = tempParams;
      packagingTestObjectInfo(selected, testObject);	// 样品其他信息
      testObjects.push(testObject);
    }
  } else {
    var testObject = {};
    testObject.testParams = testParams;
    packagingTestObjectInfo(selected, testObject);
    testObjects.push(testObject);
  }
  return testObjects;
}

/**
* 构建试验参数json对象字符串
*/
function buildTestParams() {
  var result = [];
  var params = $('#params input:checked');
  //console.info("params", params);
  for (var i = 0; i < params.length; i++) {
    var testParamO = {};

    /*试验参数id*/
    var param = $(params[i]);
    testParamO.testParamId = param.data('id');
    if (!testParamO.testParamId) { // 
      continue;
    }

    var tr = param.closest('tr');
    /*计价数量*/
    testParamO.count = tr.find('td[name="paramAmount"]').find('input').val();

    /*试验参数所选参数单价id*/
    testParamO.priceType = tr.find('select option:selected').data('price');
    testParamO.priceId = tr.find('select option:selected').attr('value');
    /*试验参数单价，该属性用着界面显示单价用，实际单价由后台计算获得*/
    testParamO.price = tr.find('select option:selected').text();

    /*试验参数名称*/
    testParamO.testParamDisplayName = tr.find('td[name="paramName"]').text();
    /*试验参数资质*/
    testParamO.qualificationType = tr.find('td[name="paramQualification"]').text();
    testParamO.remark = tr.find('td[name="paramRemark"]').text(); // 备注
    testParamO.basis = tr.find('td[name="paramBasis"]').text(); // 试验依据
    testParamO.standard = tr.find('td[name="paramStandard"]').text(); // 试验依据
    result.push(testParamO);
  }
  return result;
}

/**
 * 封装样品信息
 * 20181227 - weiheng
 */
function packagingTestObjectInfo(selected, testObject) {

  console.log('packagingTestObjectInfo')

  $('#additionalFees').find('tbody input:checked');
  testObject.testSampleId = selected.id;
  testObject.testSampleName = selected.text;
  testObject.testSampleDisplayName = selected.attributes.displayName;
  testObject.testSampleLevelName = selected.attributes.sampleLevelName;
  $.extend(testObject, buildTestObjectAttributes());
  //testObject.referSample = buildReferConsignedSample();
  testObject.otherInfos = buildTestObjectOtherInfos(); // 动态从hitek获取的系统参数
  testObject.otherMaterials = buildReferConsignedSample(selected.id); //已经被引用样品替代
  testObject.additionalFees = buildAdditionalFees();
  testObject.periods = buildPeriods();
  testObject.level = getSampleLevel(); // 委托页面用于显示的，样品层级
}

/**
* 构建样品信息
*/
function buildTestObjectAttributes() {
  var result = {};
  var container = $('#testObjectAttributes');
  var containerB = $('#testObjectAttributesB');
  var containerArr = [container, containerB];

  for (var i = 0; i < containerArr.length; i++) {
    var attributes = containerArr[i].find('tbody tr[class!=dy]');
    var inputs = attributes.find('input');
    $(inputs).each(function () {
      var key = $(this).attr('name');
      if (key) {
        result[key] = $(this).val();
      }
    });
    var textareas = attributes.find('textarea');
    $(textareas).each(function () {
      var key = $(this).attr('name');
      if (key) {
        result[key] = $(this).val();
      }
    });
  }
  return result;
}

/**
*构建收样辅助信息
*/
function buildTestObjectOtherInfos() {
  var result = [];
  var container = $('#testObjectAttributesR');
  var others = container.find('tbody tr.dy');
  var inputs = others.find('input');
  $(inputs).each(function () {
    var testObjectOtherInfo = {};
    testObjectOtherInfo.attributeId = $(this).attr('name') ? $(this).attr('name') : '';
    testObjectOtherInfo.name = $(this).data('attrname') ? $(this).data('attrname') : '';
    testObjectOtherInfo.value = $(this).val() ? $(this).val() : '';
    testObjectOtherInfo.infoType = $(this).data('infotype') ? $(this).data('infotype') : '';
    testObjectOtherInfo.dataType = $(this).data('datatype') ? $(this).data('datatype') : '';
    testObjectOtherInfo.systemFieldName = $(this).data('sysname') ? $(this).data('sysname') : '';
    result.push(testObjectOtherInfo);
  });
  var selects = others.find('select');
  $(selects).each(function () {
    var testObjectOtherInfo = {};
    testObjectOtherInfo.attributeId = $(this).attr('name') ? $(this).attr('name') : '';
    testObjectOtherInfo.name = $(this).data('attrname') ? $(this).data('attrname') : '';
    testObjectOtherInfo.value = $(this).val() ? $(this).val() : '';
    testObjectOtherInfo.infoType = $(this).data('infotype') ? $(this).data('infotype') : '';
    testObjectOtherInfo.dataType = $(this).data('datatype') ? $(this).data('datatype') : '';
    testObjectOtherInfo.systemFieldName = $(this).data('sysname') ? $(this).data('sysname') : '';
    result.push(testObjectOtherInfo);
  });
  return result;
}

function buildOtherMaterials() {
  var otherMaterials = [];
  var rows = $('#otherMaterials').find('tbody tr');
  if (rows && rows.length > 0) {
    for (var i = 0; i < rows.length; i++) {
      var otherMaterial = {};
      var row = $(rows[i]);
      otherMaterial.name = row.find('input.material-name').val();
      otherMaterial.code = row.find('input.material-code').val();
      otherMaterial.mark = row.find('input.material-mark').val();
      otherMaterial.standard = row.find('input.material-standard').val();
      otherMaterial.criterion = row.find('input.material-criterion').val();
      otherMaterial.forUse = row.find('input.material-for-use').val();
      otherMaterial.manufacturer = row.find('input.material-manufacturer').val();
      otherMaterial.batchNumber = row.find('input.material-batch-number').val();
      otherMaterial.quantity = row.find('input.material-quantity').val();
      otherMaterials.push(otherMaterial);
    }
  }
  return otherMaterials;
}

function buildPeriods() {
  var periods = [];
  var rows = $('#periods').find('tbody tr');
  if (rows && rows.length > 0) {
    for (var i = 0; i < rows.length; i++) {
      var period = {};
      var row = $(rows[i]);
      period.periodCode = row.find('input.period-code').val();
      period.formingDate = row.find('input.forming-date').val();
      period.days = row.find('input.days').val();
      period.mark = row.find('input.mark').val();
      periods.push(period);
    }
  }
  return periods;
}

function buildAdditionalFees() {
  var additionalFees = [];
  var rows = $('#additionalFees').find('tbody tr input:checked');
  if (rows && rows.length > 0) {
    for (var i = 0; i < rows.length; i++) {
      var fee = {};
      var row = $(rows[i]);
      fee.id = row.data('id');
      fee.name = row.closest('tr').find('.name').text();
      fee.price = row.closest('tr').find('.price').text();
      fee.count = row.closest('tr').find('input.count').val();
      additionalFees.push(fee);
    }
  }
  return additionalFees;
}

/*---------------------构建收样信息相关方法----------------------*/

/*-------------------------回显数据相关方法-----------------------*/
/**
* 修改回显数据
*/
function echoData(data) {
  if (data.object && data.bigCategory) { //大类的名字不能为空
    var object = data.object;

    $('#qualificationType').val(data.bigCategory.qualificationType.id);// 从大类中取得 自定义单位大类，并显示

    ECHO_SAMPLE_ID = object.testSampleId;
    ECHO_TEST_PARAMS = object.testParams;
    ECHO_OTHER_INFOS = object.otherInfos;
    ECHO_ADDITIONAL_FEES = object.additionalFees;

    echoTestObjectAttributes(object);
    initAdditionalFees();
    echoOtherMaterials(object);
    echoPeriods(object);
  }
}

/**
*修改回显样品信息
*/
function echoTestObjectAttributes(testObject) {
  console.log('echoTestObjectAttributes')
  var container = $('#testObjectAttributes');//收样辅组信息
  var attributes = container.find('tbody tr[class!=dy]');
  attributes.find('input').each(function () {
    var eleName = $(this).attr('name');
    $(this).val(testObject[eleName]);
  });
  attributes.find('textarea').each(function () {
    var eleName = $(this).attr('name');
    $(this).val(testObject[eleName]);
  });
  attributes.find('#standard-cont').text($('#standard').val());
}

/**
* 修改回显其他材料
* @parameters testObject   主样品，包含了子样品的
*/
function echoOtherMaterials(testObject) {
  console.log('echoOtherMaterials')
  var otherMaterials = testObject.otherMaterials;
  var arrData = [];

  if (otherMaterials && otherMaterials.length > 0) {
    var htm = '';
    for (var i = 0; i < otherMaterials.length; i++) {
      /*     htm += createOtherMaterial(otherMaterials[i]);*/
      var jsonData = regularObj2SubObject(otherMaterials[i]);
      arrData.push(jsonData);
    }
    var datagridJson = {};
    datagridJson.total = arrData.length;
    datagridJson.rows = arrData;
    // zhanghong 父样品子样品显示
    // $("#referConsignedSampleDataDataGrid").datagrid('loadData', datagridJson);
    console.log('1725')
  }

}

function echoPeriods(testObject) {
  console.log('echoPeriods')
  var periods = testObject.periods;
  if (periods && periods.length > 0) {
    var htm = '';
    for (var i = 0; i < periods.length; i++) {
      htm += createPeriod(periods[i]);
    }
    $('#periods tbody').html(htm);
  }
}

/**
*创建其他材料tr
*/
function createOtherMaterial(row) {
  var htm = '';
  htm += '<tr style="height: 28px;">';
  htm += '<td style="width: 35px; text-align: center;"><input type="checkbox" style="width: 35px;"></td>';
  htm += '<td class="value" style="display: none;"><input class="material-mark" value="' + (row ? row.mark : '') + '"></td>';
  htm += '<td class="value"><input class="material-name" value="' + (row ? row.name : '') + '"></td>';
  htm += '<td class="value"><input class="material-code" value="' + (row ? row.code : '') + '"></td>';
  htm += '<td class="value"><input class="material-standard" value="' + (row ? row.standard : '') + '"></td>';
  htm += '<td class="value"><input class="material-criterion" value="' + (row ? row.criterion : '') + '"></td>';
  htm += '<td class="value"><input class="material-for-use" value="' + (row ? row.forUse : '') + '"></td>';
  htm += '<td class="value"><input class="material-manufacturer" value="' + (row ? row.manufacturer : '') + '"></td>';
  htm += '<td class="value"><input class="material-batch-number" value="' + (row ? row.batchNumber : '') + '"></td>';
  htm += '<td class="value"><input class="material-quantity" value="' + (row ? row.quantity : '') + '"></td>';
  htm += '</tr>';
  return htm;
}

function createPeriod(row) {
  var htm = '';
  htm += '<tr style="height: 28px;">';
  htm += '<td style="width: 35px; text-align: center;"><input type="checkbox" style="width: 35px;"></td>';
  htm += '<td class="value" style="display: none;"><input class="mark" value="' + (row ? row.mark : '') + '"></td>';
  htm += '<td class="value"><input style="width: 100%;" class="period-code" value="' + ((row && row.periodCode) ? row.periodCode : '') + '"></td>';
  htm += '<td class="value"><input style="width: 100%; border: 0" class="forming-date Wdate"';
  htm += 'value="' + (row ? row.formingDate : '') + '" onclick="WdatePicker({dateFmt:\'yyyy-MM-dd\'})"></td>';
  htm += '<td class="value"><input style="width: 100%;" class="days" value="' + (row ? row.days : '') + '"></td>';
  htm += '</tr>';
  return htm;
}

var ECHO_ADDITIONAL_FEES;

function initAdditionalFees() {
  var paramIds = [];
  $('#params tbody').find('input:checked').each(function () {
    paramIds.push($(this).data('id'));
  });
  ajaxSubmitResponseJSON({
    url: 'additionalFeeController.do?getAdditionalFees',
    data: {
      testParamIds: paramIds.join(',')
    },
    success: function (data) {
      var htm = '';
      var rows = data.rows;
      if (rows && rows.length > 0) {
        var i;
        var additionalFeeIds = [];
        var additionalFeeCountAry = [];
        if (ECHO_ADDITIONAL_FEES && ECHO_ADDITIONAL_FEES.length > 0) {
          for (i = 0; i < ECHO_ADDITIONAL_FEES.length; i++) {
            additionalFeeIds.push(ECHO_ADDITIONAL_FEES[i].id);
            additionalFeeCountAry.push(ECHO_ADDITIONAL_FEES[i].count);
          }
        }
        for (i = 0; i < rows.length; i++) {
          var row = rows[i];
          htm += '<tr style="height: 28px;">';

          var index = $.inArray(row.id, additionalFeeIds);

          htm += '<td style="width: 35px; text-align: center;" class="value">';
          htm += '<input type="checkbox" data-id="' + row.id + '" ' + (index >= 0 ? 'checked' : '') + '>';
          htm += '</td>';

          htm += '<td class="value"><span class="name">' + row.name + '</span></td>';
          htm += '<td class="value"><span class="price">' + row.price + '</span></td>';
          // noinspection JSUnresolvedVariable
          htm += '<td class="value" style="width: 80px;">' + row.priceUnit + '</td>';
          htm += '<td class="value">';
          htm += '<input class="count" style="width: 80px;" value="' + (index >= 0 ? additionalFeeCountAry[index] : 1) + '">';
          htm += '</td>';
          // noinspection JSUnresolvedVariable
          htm += '<td class="value">' + row.remark + '</td>';
          htm += '</tr>';
        }
      }
      $('#additionalFees tbody').html(htm);
    }
  });
}

/**
* 检查是否配合比
*/
function checkIfPHB() {
  var selectedBigCategory = $("#bigCategory .tree-node-selected").closest("ul").prev().text();
  if (selectedBigCategory == "配合比") {
    return true;
  } else {
    return false;
  }
}

/**
* 初始化引用已委托样品的展示table
*/
function initReferConsignedSampleDataDataGrid() {
  console.log('initReferConsignedSampleDataDataGrid')
  //委托主页面给与的数据格式，和子样品页面返回的数据格式不一致
  // 导致了两种解析，也不想去改了，先就这样吧 - 20190103 weiheng
  var datagrid = $('#referConsignedSampleDataDataGrid').datagrid({
    url: null,
    fit: true,
    fitColumns: false,
    rownumbers: true,
    columns: [[
      { title: "ID", field: "id", checkbox: true },  //注意这里的id是
      { title: "样品ID", field: "testObjectId", hidden: true, width: 100 }, //只有引用样品 ， 和要做试验的样品才有，只是单纯的录入，不做试验的那种没有ID
      { title: "委托ID", field: "consignId", hidden: true, width: 100 }, //应用的样品才有
      { title: "样品名称", field: "testSampleDisplayName", width: 100 },
      {
        title: "规格型号", field: "standard", width: 100, formatter: function (value, row, index) {
          console.log('规格型号', value)
          var v = row.meta ? row.meta.standard : value;
          return v;
        }
      },
      { title: "样品编号", field: "testObjectCode", width: 100 },
      {
        title: "试样数量", field: "quantity", width: 100, formatter: function (value, row, index) {
          return row.meta ? getOtherInfoValue(row, '试样数量') : value;
        }
      },
      {
        title: "代表数量", field: "representNum", width: 100, formatter: function (value, row, index) {
          return row.meta ? getOtherInfoValue(row, '代表数量') : value;
          //return getOtherInfoValue(row, '代表数量');
        }
      },
      {
        title: "生产厂家", field: "manufacturer", width: 100, formatter: function (value, row, index) {
          return row.meta ? getOtherInfoValue(row, '生产厂家') : value;
        }
      },
      {
        title: "生产产地", field: "manufactureLocation", width: 100, formatter: function (value, row, index) {
          return row.meta ? getOtherInfoValue(row, '生产产地') : value;
        }
      },
      {
        title: "生产日期", field: "manufactureDate", width: 100, formatter: function (value, row, index) {
          return row.meta ? getOtherInfoValue(row, '生产日期') : value;
        }
      },
      {
        title: "出厂日期", field: "ccrq", width: 100, formatter: function (value, row, index) {
          return row.meta ? getOtherInfoValue(row, '出厂日期') : value;
        }
      },
      {
        title: "批号", field: "batchNumber", width: 100, formatter: function (value, row, index) {
          return row.meta ? getOtherInfoValue(row, '批号') : value;
        }
      },
      { title: "委托编号", field: "consignCode", width: 100 }, //应用的样品才有
      { title: "报告编号", field: "reportCode", width: 100 },
      {
        title: "取样地点", field: "samplingPlace", width: 100, formatter: function (value, row, index) {
          return row.meta ? row.meta.samplingPlace : value;
        }
      },
      {
        title: "推荐掺量", field: "recommendedDosage", width: 100, formatter: function (value, row, index) {
          return row.meta ? getOtherInfoValue(row, '推荐掺量') : value;
        }
      },
      {
        title: "用量kg/m³", field: "dosage", width: 100, formatter: function (value, row, index) {
          return row.meta ? getOtherInfoValue(row, '用量kg/m³') : value;
        }
      },
      {
        title: "单位比", field: "unitRatio", width: 100, formatter: function (value, row, index) {
          return row.meta ? getOtherInfoValue(row, '单位比') : value;
        }
      },
      {
        title: "样品描述", field: "description", width: 100, formatter: function (value, row, index) {
          return row.meta ? row.meta.description : value;
        }
      },
      {
        title: "备注", field: "remark", width: 100, formatter: function (value, row, index) {
          return row.meta ? row.meta.remark : value;
        }
      },
      //{title: '是否做试验', field: 'isCompletedTest', align: 'center', formatter: oneZero2CN,width:100} //如果不要求做试验，则勾选
      //是否需要做试验，复选框
    ]],
    //加载完成事件
    onLoadSuccess: function (data) {
      console.log('1893 data', data)
    },

  });
  if (testObject) {	// 编辑操作
    var referObjects = testObject.otherMaterials;
    console.log('referObjects', referObjects)
    var existSubObjs = $('#referConsignedSampleDataDataGrid').datagrid('getData');
    console.info("existSubObjs4444", existSubObjs);
    existSubObjs.total = referObjects.length;
    existSubObjs.rows = referObjects;
    console.info("existSubObjs11111", existSubObjs);
    $('#referConsignedSampleDataDataGrid').datagrid('loadData', existSubObjs);
  }
}


/**
 * 获取需要回显的值
 * 20181226 - weiheng
 */
function getOtherInfoValue(row, key) {
  var arr = row.meta.otherInfos;
  var res = '';
  for (var i = 0; i < arr.length; i++) {
    if (arr[i].name = key) {
      res = arr[i].value;
      break;
    }
  }
  return res;
}

function oneZero2CN(value, row) {
  return '<input type="checkbox" ' + (value == 1 ? 'checked' : '') + ' data-id="' + row.id + '" disabled="disabled">';
}
function GetQueryString(name) {
  var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
  var r = window.location.search.substr(1).match(reg);
  if (r != null) return unescape(r[2]);
  return null;
}
/**
* 该方法有2个地方在用
* 1、引用样品生成的时候
* 2、结束编辑样品，返回主界面
* 该方法返回的是收样样品的集合。
* @param sampleId; 父级样品的  sampleId，只有综合试验的时候用的到
*/
function buildReferConsignedSample(sampleId) {
  console.log('sampleId', sampleId)
  //取得dataGrid 中的数据，该数据是引用样品也面回传过来的。
  var referSamples = $("#referConsignedSampleDataDataGrid").datagrid('getData');
  console.log('referSamples', referSamples)
  console.dir(referSamples)
  var result = [];
  if (referSamples.total > 0) {
    console.log('referSamples.rows', referSamples.rows)
    console.log(JSON.stringify(referSamples.rows))
    for (var i = 0; i < referSamples.rows.length; i++) {
      console.log(referSamples.rows[i].meta);  //假设Table中有列名number  
      // 清晰的标识出，该样品的父样品是啥。referSamples.rows[i].meta 是取得子样品的最原始数据
      if (referSamples.rows[i].meta) {
        if (!referSamples.rows[i].meta.parentSampleId) {
          referSamples.rows[i].meta.parentSampleId = sampleId;
          result.push(referSamples.rows[i].meta);
        }
      }
    }
  }
  console.log(result)
  return result;

}
/**
*     回显子试验的样品 到样品编辑界面
*/
function echoReferConsignedSample() {
  var selected = createTestObject(); //子试验的样品对象
  var jsonData = regularObj2SubObject(selected);
  return jsonData;
}
function regularObj2SubObject(regularObj) {
  var arrData = [];
  for (var i = 0; i < regularObj.length; i++) {
    var jsonData = {};
    jsonData.id = regularObj[i].id; //这是引用对象的ID
    jsonData.consignCode = regularObj[i].consignCode; //委托编号，创建的委托，该数据为空
    jsonData.testObjectCode = regularObj[i].testObjectCode; //样品编号，创建的委托，该数据为空
    jsonData.testSampleDisplayName = regularObj[i].testSampleDisplayName; //样品显示名称
    jsonData.testObjectParams = buildTestParamsString(regularObj[i]); //样品收样参数
    jsonData.standard = buildObjectAttributeString(regularObj[i], "规格型号");
    jsonData.quantity = buildObjectAttributeString(regularObj[i], "试样数量");
    //jsonData.dbpl=buildObjectAttributeString(selected,"代表批量");
    jsonData.manufacturer = buildObjectAttributeString(regularObj[i], "生产厂家");
    jsonData.manufactureLocation = buildObjectAttributeString(regularObj[i], "生产产地");
    jsonData.manufactureDate = buildObjectAttributeString(regularObj[i], "生产日期");
    //jsonData.ccrq=buildObjectAttributeString(selected,"出厂日期");
    jsonData.batchNumber = buildObjectAttributeString(regularObj[i], "批号");
    jsonData.remark = regularObj[i].remark;
    //判断该样品是否要做试验，实质是给样品打个标记
    jsonData.meta = regularObj[i]; //这才是真正的样品信息，上面的那些信息，仅仅用于显示
    arrData.push(jsonData);
  }
  return arrData;
}
function buildTestParamsString(selected) {
  var result = "";
  for (var i = 0; i < selected.testParams.length; i++) {
    result += selected.testParams[i].testParamDisplayName;
    result += ",";
  }
  return result;
}
function buildObjectAttributeString(selected, attrName) {
  var info = selected.otherInfos;
  for (var i = 0; i < info.length; i++) {
    if (info[i].name == attrName) {
      return info[i].value;
    }
  }
  return "";
}
function storeSamples() {
  storeTool.storeFunc('consign-editSample', ['value', 'node-id'], ['#qualificationType', '#bigCategory .tree-node-selected', '#sample .tree-node-selected']);
}
function reloadDataGrid2(goFirstPage) {
  initAdditionalFees();
}

/**
* 通过查询条件，检索大类
* @author weiheng 
*/
function searchBigCategoryByCondition() {
  var paramName = $('#searchCondition').val();
  // 非空校验
  if (paramName == '' || $.trim(paramName) == '') {
    jQuery.messager.alert('提示', '查询参数不能为空');
    return;
  }
  //initSampleByTestParamName(paramName);
  // 查询
  initBigCategoryBySearch(paramName);
}

//样品参数全选功能，卡
$(document).on('click', '.checkAll', function () {
  if (!($('.checkAll').attr('checked'))) {
    $('#params tr>td input:checked').trigger('click');
  } else {
    $('#params tr>td input:not(:checked)').trigger('click');
  }

});

/***
* 获取样品层级：如 [钢筋-热轧带肋钢筋-HRB400]
* 20181219 - weiheng
*/
function getSampleLevel() {

  if (!currentSample) {
    currentSample = SAMPLE.tree('getSelected');
  }
  var level = currentSample.text;
  var parentNode = currentSample;
  var flag = true;
  while (flag) {
    parentNode = SAMPLE.tree('getParent', parentNode.target);
    if (parentNode) {	// 如果有父节点
      level = parentNode.text + "-" + level;
    } else {
      flag = false;
    }
  }
  return "[" + level + "]";
}

/***
*   同步请求数据
*   20181227 - weiheng
*/
function ajaxRequestSync(url, dataJson) {
  var returnValue;
  $.ajax({    // 发起同步请求
    url: url
    , async: false
    , data: dataJson
    , dataType: 'json'
    , type: 'post'
    , beforeSend: function () {
    }
    , success: function (res) {
      if (res.success) {
        returnValue = res.obj;
      }
    }
  });
  return returnValue;
}