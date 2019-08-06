//初始化页面信息
// $(document).ready(function () {
//   initFile();
//   initButtonStatus();
//   setTimeout(function () {
//     getSelectedFolderId();
//   }, 1000)
// })
var layer;
$(function () {
  layui.use(['layer', 'element', 'laydate', 'form'], function () {
    layer = layui.layer;
    var element = layui.element;
    var laydate = layui.laydate;
    var form = layui.form;
    initFile();
    initButtonStatus();
    setTimeout(function () {
      getSelectedFolderId();
    }, 1000)
    //选完文件后不自动上传
  })
})
// 任务主页面传递的任务ID，key是id，udr报告页面传递的任务id，key是testTaskId，现在将该页面引用到任务和udr报告中使用 - 20190626 weiheng
var testTaskId = GetQueryString('id') || GetQueryString('testTaskId');
var checkedFolderId = '';
var selectedFileType = '';

//获取选中的目录id,如果选中的是文件,获取文件所在目录id
function getSelectedFolderId() {
  var row = $('#fileTreegrid').treegrid('getSelected');
  console.log('getSelectedFolderId', row)
  if (row != null) {
    if (row.type == 'file') {
      checkedFolderId = row._parentId;
    } else if (row.type == 'folder') {
      checkedFolderId = row.id;
    }
  }
  return checkedFolderId;
}


//----------------------目录和文件的增删改------------------------

//新增目录
function addFolder() {
  //获取当前选中节点,取得要创建目录的父级目录id
  var folderId = getSelectedFolderId();

  //弹窗输入目录名称
  top.layer.prompt({ title: '请输入目录名称' }, function (val, index) {
    //保存并刷新目录树
    var tipsIndex;
    $.ajax({
      type: "POST",
      async: false,
      url: "testTaskAttachmentFolderController.do?doAdd",
      data: {
        'parent.id': folderId,
        'name': val,
        'testTask.id': testTaskId,
      },
      dataType: "json",
      beforeSend: function () {
        tipsIndex = layer.load(0, { shade: 0.2 });
      },
      success: function (data) {
        layer.close(tipsIndex);
        if (data) {
          top.layer.msg(data.msg);
          top.layer.close(tipsIndex);
        } else {
          top.layer.msg('添加失败');
          top.layer.close(tipsIndex);
        }
      }
    });
    $('#fileTreegrid').treegrid('reload');
    top.layer.close(index);
  });
}

//修改目录或文件(文件要支持选择类型)
var modifyWindow;
function modifyFileOrFolder() {
  var row = $('#fileTreegrid').treegrid('getSelected');
  if (row.type == 'file') {
    //修改文件
    var url = 'testTaskAttachmentController.do?goModifyTaskAttachmentPage&testTaskId=' + testTaskId;
    url += '&id=' + row.id;
    modifyWindow = layerCreateWindow('文件属性修改', url, ['确定', '取消'], ['360px', '66%'], '', '', '', 'commitModify');
  } else if (row.type == 'folder') {
    //修改目录(名称)
    layer.prompt({ title: '请输入目录名称', value: row.name }, function (val, index) {
      modifyFolder(row.id, val);
      layer.close(index);
      $('#fileTreegrid').treegrid('reload');
    })
  }
}
function closeModifyWindow() {
  $('#fileTreegrid').treegrid('reload');
  layer.close(modifyWindow);
}
//修改目录
function modifyFolder(id, name) {
  var tipsIndex;
  $.ajax({
    type: "POST",
    async: false,
    url: "testTaskAttachmentFolderController.do?doUpdate",
    data: {
      'id': id,
      'name': name
    },
    dataType: "json",
    beforeSend: function () {
      tipsIndex = layer.load(0, { shade: 0.2 });
    },
    success: function (data) {
      if (data) {
        layer.msg(data.msg);
        layer.close(tipsIndex);
      } else {
        layer.msg('修改失败');
        layer.close(tipsIndex);
      }
    }
  });
}

//删除目录或文件
function deleteFileOrFolder() {
  //testTaskAttachmentController.do?doDelete
  //testTaskAttachmentFolderController.do?doDelete
  //取当前选中的行,区分是文件还是目录
  var row = $('#fileTreegrid').treegrid('getSelected');
  if (row.type == 'file') {
    layer.confirm('确认删除该附件吗', { icon: 3, title: '提示' }, function (index) {
      delFolderOrFile('file', row.id, row.sourceType);
      layer.close(index);
    });
  } else if (row.type == 'folder') {
    layer.confirm('如果该目录下存在文件，所有文件会被自动移动到上层目录，确认删除文件目录？', { icon: 3, title: '提示' }, function (index) {
      delFolderOrFile('folder', row.id);
      layer.close(index);
    });
  }
}
//删除目录或文件
function delFolderOrFile(type, id, sourceType) {
  var tipsIndex;
  var url = '';
  if (type == 'file') {
    url = "testTaskAttachmentController.do?doDelete";
  } else if (type == 'folder') {
    url = "testTaskAttachmentFolderController.do?doDelete";
  }
  $.ajax({
    type: "POST",
    async: false,
    url: url,
    data: { 'id': id },
    dataType: "json",
    beforeSend: function () {
      tipsIndex = layer.load(0, { shade: 0.2 });
    },
    success: function (data) {
      if (data.success) {
        if (type == 'file' && sourceType == '0') {
          $("#recoverBtn").show();
        }
        layer.msg('删除成功');
      } else {
        layer.msg(data.msg);
      }
      layer.close(tipsIndex);
      $('#fileTreegrid').treegrid('reload');
    }
  });
}

//恢复系统文件
function recoverSysFile() {
  var url = "testTaskAttachmentController.do?recoverSysFile";
  $.ajax({
    type: "POST",
    async: false,
    url: url,
    data: { 'testTaskId': testTaskId },
    dataType: "json",
    beforeSend: function () {
      tipsIndex = layer.load(0, { shade: 0.2 });
    },
    success: function (data) {
      if (data.success) {
        $("#recoverBtn").hide();
        layer.msg('恢复成功');
      } else {
        layer.msg(data.msg);
      }
      layer.close(tipsIndex);
      $('#fileTreegrid').treegrid('reload');
    }
  });
}


//--------------------------文件上传-----------------------------

//调上传前的准备
function preUpload() {
  //目录判断
  var folderId = getSelectedFolderId();
  if (!folderId || folderId.length < 1) {
    layer.msg('请选择目录');
    return;
  }
  //选择类型
  var url = 'testTaskAttachmentController.do?goUseTypeChoosePage&testTaskId=' + testTaskId;
  layerCreateWindow('选择文件类型', url, ['确定', '取消'], ['260px', '300px'], '', '', '', 'commitChoice');
}

//文件类型选择窗口的回调
function finishChooseFileType(selectedType) {
  selectedFileType = selectedType;
  console.log(selectedFileType);
  //调上传窗口,这里调用的是/webpage/com/hitek/common/upload//fileUpload.js中的通用上传组件方法
  goUploadPage(checkedFolderId);
}

//上传完毕的回调
function uploadCallBack(tsAttachments) {
  console.log(tsAttachments);
  var commonAttachmentIds = '';
  for (var i = 0; i < tsAttachments.length; i++) {
    commonAttachmentIds += tsAttachments[i].id + ',';
  }
  console.log(commonAttachmentIds);
  addAttachmentToTask(removeEndSymbol(commonAttachmentIds));
  $('#fileTreegrid').treegrid('reload');
}

//文件上传请求成功后请求后台将文件和目录和任务绑定关系
function addAttachmentToTask(commonAttachmentIds) {
  $.ajax({
    type: "POST",
    async: false,
    url: "testTaskAttachmentController.do?doAdd",
    data: {
      'testTaskId': testTaskId,
      'folderId': checkedFolderId,
      'fileUseType': selectedFileType,
      'commonAttachmentIds': commonAttachmentIds
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



//--------------------------数据查询展示-----------------------------

//查询确定是否显示[恢复系统文件]和[重新生成报告]按钮
function initButtonStatus() {
  $.ajax({
    type: "POST",
    async: false,
    url: "testTaskAttachmentController.do?buttonShowStatus",
    data: { 'testTaskId': testTaskId },
    dataType: "json",
    success: function (data) {
      if (data.success) {
        var attrs = data.attributes;
        if (attrs.recoverButton) {
          $("#recoverBtn").show();
        }
        if (attrs.reCreateButton) {
          $("#reCreateBtn").show();
        }
      } else {
        layer.msg(data.msg);
      }
    }
  })
}

//初始化附件列表
function initFile() {

  $('#fileTreegrid').treegrid({
    pagination: false,
    singleSelect: true,
    loadMsg: "数据加载中...",
    idField: 'id',
    treeField: 'name',
    toolbar: '#tb',
    fit: true,
    fitColumns: true, //设置为 true，则会自动扩大或缩小列的尺寸以适应网格的宽度并且防止水平滚动。
    url: 'testTaskAttachmentController.do?getTestTaskFileTree&testTaskId=' + testTaskId,
    columns: [[
      { field: '_parentId', title: '目录id', hidden: true },
      { field: 'type', title: '目录/文件', hidden: true },
      { field: 'iconCls', title: 'iconCls', hidden: true },
      {
        field: 'name', title: '名称', width: 150,
        formatter: function (value, row) {
          if (row.type == 'file') {
            if (row.sourceType == '0') {
              var sysMark = '<span style="color:#A020F0">[系统]</span>';
              value = sysMark + value;
            }
            if (row.fileUrl.length > 0) {
              var html = '<a title="' + value + '" href="' + row.fileUrl + '" target="_blank" style="text-decoration:underline;">' + value + '</a>';
              return html;
            } else {
              //类型是file,又没有url的只能是UDR
              var html = '<a href="javascript:void(0);" onclick="openUDRFile(\'' + testTaskId + '\', \'' + row.id + '\')" target="_blank" style="text-decoration:underline;">' + value + '</a>';
              return html;
            }
          }
          return value;
        }
      },
      {
        field: 'useType', title: '文件类型', width: 80,
        formatter: function (value, row) {
          if (value == '1') { return '报告文件'; }
          if (value == '2') { return '记录文件'; }
          if (value == '3') { return '附件'; }
          return value;
        }
      },
      { field: 'uploadDate', title: '上传时间', width: 80 },
      {
        field: 'operate', title: '操作', width: 70, align: 'center',
        formatter: function (value, row) {
          //					if(row.type == 'file'){
          var btns = '<button title="编辑" id="editFileAttr" class="layui-btn layui-btn-sm" onclick="modifyFileOrFolder()"><i class="layui-icon">&#xe642;</i></button>';
          btns += '<button title="删除" id="delFile" onclick="deleteFileOrFolder()" class="layui-btn layui-btn-sm"><i class="layui-icon">&#xe640;</i></button>';
          var operateButton = '<div id="' + row.id + 'btn" class="rowBtns" style="display:none;">' + btns + '</div>'
          //'<i id="editFileAttr" title="编辑" onclick="modifyFileOrFolder()" class="layui-icon layui-btn layui-btn-sm layui-btn-normal">&#xe642;</i>'+
          //'<i id="delFile" title="删除" onclick="deleteFileOrFolder()" class="layui-icon layui-btn layui-btn-sm layui-btn-warm">&#xe640;</i>'+
          //	'</div>';
          return operateButton;
          //					}
        }
      }
    ]],
    //行单击事件
    onClickRow: function (row, a, b) {
      console.log('onClickRow')
      //显示该行的修改/删除按钮
      $(".rowBtns").hide();
      var btnId = row.id + "btn";
      $("#" + btnId).show();
      //缓存目前选中行的目录id
      getSelectedFolderId();
    },
    onLoadSuccess: function () {
      console.log('onLoadSuccess')
      //处理没有子节点的父节点的图片为目录图标,去掉子节点多余的一个tree-file类
      $("span[class='tree-icon tree-file tree-folder']").attr("class", "tree-icon tree-folder");
      $("span[class='tree-icon tree-file tree-file']").attr("class", "tree-icon tree-file");
      //遍历全部文件找到UDR并选中
      var rows = $('#fileTreegrid').treegrid('getData');
      checkUdr(rows[0]);
      getSelectedFolderId();
      hideOperation();
    }
  });
  // 处理分页样式
  var pager = $('#fileTreegrid').datagrid('getPager');
  $(pager).pagination({
    showPageList: false,//隐藏分页标签
    pageSize: 10,//每页显示的记录条数，默认为10  
    pageList: [5, 10, 20],//可以设置每页记录条数的列表  
    beforePageText: '第',//页数文本框前显示的汉字  
    afterPageText: '页 共{pages}页',
    //displayMsg: '当前显示 {from} - {to} 条记录   共 {total} 条记录'
    displayMsg: '{from} - {to} 共 {total} 条',
  });

}
//递归处理,找到UDR并选中
function checkUdr(row) {
  if (!row.children) {
    return;
  }
  $.each(row.children, function (index, childRow) {
    if (childRow.type == 'folder') {
      checkUdr(childRow);
    } else if (childRow.type == 'file' && childRow.name == 'UDR模板') {
      $('#fileTreegrid').treegrid("select", childRow.id);
      var btnId = childRow.id + "btn";
      $("#" + btnId).show();
    }
  });
}
/**
* 打开UDR模板
*/
function openUDRFile(testTaskId, testTaskAttachmentId) {
  var url = 'testTaskController.do?goTestTaskUdrContainer';
  url += '&id=' + testTaskId;
  url += '&testTaskAttachmentId=' + testTaskAttachmentId;
  window.open(url, '试验数据录入');
}

/**
 * 隐藏操作按钮
 * 20180920 weiheng
 */
function hideOperation() {

  var readType = GetQueryString("readType");	// readOnly等于1，不允许修改
  if (readType != undefined) {
    // 隐藏所有的操作按钮
    $("#editFileAttr, #delFile").each(function () {
      $(this).hide();
    });
  }
}

//--------------------------工具方法-----------------------------

//获取地址栏参数的方法
function GetQueryString(name) {
  var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
  var r = window.location.search.substr(1).match(reg);
  console.log(window.location.search)
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