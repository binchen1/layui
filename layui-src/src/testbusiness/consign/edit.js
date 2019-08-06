
//构建当前的委托界面对象
console.log("kb")
//界面加载完成后初始化界面
$(document).ready(function () {
  //初始化界面
  initialUI();
  //初始化事件绑定
  initialEventBind();
  //新增委托时 默认上一次的委     托单位等信息
  if (!consign.isUpdateConsign) {
    //加载表单数据
    // storeTool.renderContent('consign-edit');
    storeTool ? storeTool.renderContent('consign-edit-project') : '';
    // 加载委托单位，工程项目，送样人员
    uitlocalS = renderContent('consignUnit-project-sampleSender')
    if (uitlocalS) {
      //自动继承上一次打开的委托单位、工程项目、送样人信息
      consign.setConsignUnitFun(uitlocalS.consignUnit, uitlocalS.project, uitlocalS.sampleSender)
    }
  }
  //显示更多
  moreFun(consign.isUpdateConsign, consign.isDetailPage);
  console.log("readyComplete");
});

$(window).unload(function () {
  //这里面写在关闭页面时，要调用的事件
  cleartSessionFunc('consign-editSample-samplingInfo')
})

/**
 * 更多
 */
function resetPanel(numstr) {

	  return;
	console.log("numstr")
	console.log(numstr)
	
  numstr = parseFloat(numstr)
  $('#p1').panel('resize', {
    height: (numstr+35)
  });  


		console.log("numstr2")
  $('#p2').panel('resize', {    
    top: (numstr + 65)
  });
  var windowH = $(window).height();
  console.log("xx");
  console.log(windowH);
  numstr = parseFloat(numstr)
  $('#p1').panel('resize', {
    height: numstr
  });
  $('#p2').panel('resize', {
    height: windowH - (numstr + 30),
    top: (numstr + 30)
  });
}

function moreFun(updateModel, detailModel) {
  if(detailModel){
    ChangeExpand(1);
  }else{
    ChangeExpand(0);
  }
  // if (updateModel) {
  //   detailModel ? resetPanel('224') : resetPanel('324');
  // } else {
  //   resetPanel('462')
  // }
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
  $.each(res, function (i, accessory1) {
    accessory.addToForm(accessory1)
  })
}

function bindUpdateBtnClick() { }


/***计费方式 选择合同回调 */
function feeContractCallback(res, index) {
  console.log('计费方式 选择合同回调', res)
  if (res) {
    $('.fee-box #chargeContract').html(res.name)
    $('.fee-box-middle input').val(res.id)
    $("#contractId").val(res.id);
    $("#chargeContract").css("display", "inline-block");
    fee.recalculateTestParamPriceByContract();
  }
  index ? layer.close(index) : '';
}

function closeCurrentTab() {
  window.parent.closeCurrentWin();
}

//使用主页选项卡模式打开
function openTabs(id, name, url) {
  window.parent.addTabs({
    "id": id,
    "title": name,
    "close": false,
    "url": url
  });
}

function setConsignUnit(consignUnit) {
  consign.setConsignUnit(consignUnit);
}


console.log("lfinish");

