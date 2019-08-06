$(function () {
  initDataGrid();
  commonQryKeyDown();
	/**
     * 查询委托
     */
  $('.btn-4-search').click(function () {
    reloadDataGrid(true);
  });
	/**
     * 重置查询表单
     */
  $('.btn-4-reset').click(function () {
    $('.search-box form')[0].reset();
    $('.btn-4-search').trigger('click');
  });
})
/**
 * 引用的样品列表，这里面的的样品每一个都是完成的样品对象
 * 所以样品对象的属性，该有的都该有。
 */
var dataGrid;
var existSubObjs = parent.existSubObjs;
var returnData = [];
// 回车事件添加
function commonQryKeyDown() {
  console.log('1111')
  //快速查询input框绑定的回车事件
  $('#commonQueryForm input').bind('keypress', function (event) {
    console.log(event)
    var theEvent = event || window.event;
    var code = theEvent.keyCode || theEvent.which || theEvent.charCode;
    if (code === 13) {
      reloadDataGrid(true);
      return false;
    }
  });
}
function initDataGrid() {
  console.log('进入页面')
  console.log('existSubObjs', existSubObjs)
  dataGrid = $('#dataGrid').datagrid({
    url: 'testObjectController.do?referConsignedSampleDatagrid',
    pagination: true,
    toolbar: '.toolbar',
    sortName: 'createDate',
    sortOrder: 'desc',
    singleSelect: false,
    fit: true,
    fitColumns: true,
    rownumbers: true,
    scrollbarSize: 18,
    columns: [[
      { title: "ID", field: "id", checkbox: true, width: 30 },  //注意这里的id是
      { title: "样品ID", field: "testObjectId", hidden: true, width: 100 }, //只有引用样品 ， 和要做试验的样品才有，只是单纯的录入，不做试验的那种没有ID
      { title: "委托ID", field: "consignId", hidden: true, width: 100 }, //应用的样品才有
      { title: "引用类型", field: "type", hidden: true, width: 100 },
      { title: "meta", field: "meta", hidden: true },
      { title: "样品名称", field: "testSampleDisplayName", width: 100 },
      { title: "规格型号", field: "standard", width: 100 },
      { title: "样品编号", field: "testObjectCode", width: 100 },
      {
        title: "试样数量", field: "quantity", width: 100, formatter: function (value, row, index) {
          return getOtherInfoValue(row, '代表数量');
        }
      },
      {
        title: "代表数量", field: "representNum", width: 100, formatter: function (value, row, index) {
          return getOtherInfoValue(row, '代表数量');
        }
      },
      {
        title: "生产厂家", field: "manufacturer", width: 100, formatter: function (value, row, index) {
          return getOtherInfoValue(row, '生产厂家');
        }
      },
      {
        title: "生产产地", field: "manufactureLocation", width: 100, formatter: function (value, row, index) {
          return getOtherInfoValue(row, '生产产地');
        }
      },
      {
        title: "生产日期", field: "manufactureDate", width: 100, formatter: function (value, row, index) {
          return getOtherInfoValue(row, '生产日期');
        }
      },
      {
        title: "出厂日期", field: "ccrq", width: 100, formatter: function (value, row, index) {
          return getOtherInfoValue(row, '出厂日期');
        }
      },
      {
        title: "批号", field: "batchNumber", width: 100, formatter: function (value, row, index) {
          return getOtherInfoValue(row, '批号');
        }
      },
      { title: "委托编号", field: "consignCode", width: 100 }, //应用的样品才有
      { title: "报告编号", field: "reportCode", width: 100 },
      {
        title: "取样地点", field: "samplingPlace", width: 100, formatter: function (value, row, index) {
          var meta = JSON.parse(row.meta);
          var v = '';
          if (meta) {
            v = meta.samplingPlace;
          }
          return v;
        }
      },
      {
        title: "推荐掺量", field: "recommendedDosage", width: 100, hidden: true, formatter: function (value, row, index) {
          return getOtherInfoValue(row, '推荐掺量');
        }
      },
      {
        title: "用量kg/m³", field: "dosage", width: 100, hidden: true, formatter: function (value, row, index) {
          return getOtherInfoValue(row, '用量kg/m³');
        }
      },
      {
        title: "单位比", field: "unitRatio", width: 100, hidden: true, formatter: function (value, row, index) {
          return getOtherInfoValue(row, '单位比');
        }
      },
      { title: "样品描述", field: "description", width: 100 },
      { title: "备注", field: "remark", width: 100, hidden: true }

      //是否需要做试验，复选框
    ]],
    // loader: function (param, success, error) {
    //   console.log(param, success, error)
    //   console.log('loderErr')
    //   var opts = $(this).datagrid('options');
    //   if (!opts.url) return false;
    //   $.ajax({
    //     type: opts.method,
    //     url: opts.url,
    //     dataType: 'json',
    //     async: false,
    //     success: function (data) {
    //       if (data.success == false) {
    //         error(data);
    //       } else {
    //         success(data);
    //       }
    //     },
    //     error: function () { 
    //       return error.apply(this, arguments);
    //     }
    //   });
    // },
    onLoadSuccess: function (data) {
      console.log('data', data)
      if (data.rows.length > 0) {
        var selectRowIds = [];
        var selectRows = [];
        if (existSubObjs) {
          var hiddenRows = existSubObjs.rows;
          if (hiddenRows && hiddenRows.length > 0) {
            $.each(hiddenRows, function (i, v) {
              selectRowIds.push(hiddenRows[i].testObjectId);
            })
          }
          for (var i in data.rows) {
            if ($.inArray(data.rows[i].testObjectId, selectRowIds) >= 0) {
              selectRows.push(data.rows[i]);
            }
          }
          $.each(selectRows, function (i, v) {
            dataGrid.datagrid('selectRow', dataGrid.datagrid('getRowIndex', v));
          })
        }
      }
    },

    //双击事件
    onLoadError: function (res) {
      if (!res.success) {
        console.log('err', res)
        return false;
      }
    },
    onClickRow: function (index, row) {

    }
  });
}

/**
 * 获取需要回显的值
 * 20181226 - weiheng
 */
function getOtherInfoValue(row, key) {
  var res = '';
  var meta = JSON.parse(row.meta);
  if (!meta) return res;
  var arr = meta.otherInfos;
  if (arr.length > 0) {
    for (var i = 0; i < arr.length; i++) {
      if (arr[i].name = key) {
        res = arr[i].value;
        break;
      }
    }
  }
  return res;
}

function oneZero2CN(value, row) {
  return '<input type="checkbox" ' + (value == 1 ? 'checked' : '') + ' data-id="' + row.id + '" disabled="disabled">';
}
function reloadDataGrid(goFirstPage) {
  var queryParams = $('.search-box form').serializeJSON();
  console.log('queryParams', queryParams)
  if (goFirstPage) {
    /*从第一页开始显示*/
    dataGrid.datagrid('load', queryParams);
  } else {
    /*停留在当前页面*/
    dataGrid.datagrid('reload', queryParams);
  }
}

function buildReferConsignedSample() {
  // var arrData = [];
  //遍历 引用样品 datagrid，这里的选择器的用法有待 提升，李永强 编写的该段代码。
  //可以直接用 dataGrid.datagrid('getData');方法获得，而且在改变后
	/*$(".datagrid-view2 .datagrid-btable tr.datagrid-row-selected").each(function(i){
		var jsonData={};
		jsonData.testObjectId=$(this).find('td:eq(0) input').val(); //样品ID
		jsonData.consignCode=$(this).find('td:eq(1)').text(); //委托编号 - 新增的委托没有这个编号
		jsonData.testObjectCode=$(this).find('td:eq(2)').text(); //样品编号 - 新增的样品没有这个编号
		jsonData.testSampleDisplayName=$(this).find('td:eq(3)').text();//样品显示名称
		jsonData.testObjectParams=$(this).find('td:eq(4)').text(); //样品收样参数
		jsonData.standard=$(this).find('td:eq(5)').text(); //规格型号
		jsonData.sampleNum=$(this).find('td:eq(6)').text(); //样品数量
		jsonData.dbpl=$(this).find('td:eq(7)').text();//代表批量
		jsonData.sccj=$(this).find('td:eq(8)').text();//生产厂家
		jsonData.sccd=$(this).find('td:eq(9)').text(); //产地
		jsonData.scrq=$(this).find('td:eq(10)').text(); //生产日期
		jsonData.ccrq=$(this).find('td:eq(11)').text();//出厂日期
		jsonData.ph=$(this).find('td:eq(12)').text(); //批号
		jsonData.remark=$(this).find('td:eq(13)').text(); //备注
		arrData.push(jsonData);
  });*/
  var data = dataGrid.datagrid('getSelections');
  //样拼装成一个标准object对象的形式
  return data;
}


