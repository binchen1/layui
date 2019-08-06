$(function () {
	//判断是不是修改委托
    var isUpdateConsign = false;
    
    if(window.location.search.split('&id=')[1] && window.location.search.split('&id=')[1].length>0){
    	isUpdateConsign = true;
    }
    
	showMore();	// 展开更多信息
	showTips();
    hideFoldingBtn();
    initQualificationType();
    initConsignUnit();
    initCheckType();
    initSnType();
    initDateElements();
    echoTestObjects();
    initAccessory();
    
    getTotalFee();
    
    //新增委托时才加载数据
    if(!isUpdateConsign){
    	//加载表单数据
        storeTool.renderContent('consign-edit');
        storeTool.renderContent('consign-edit-project');
    }
    
    /*//新增委托时，自动添加资质类型，公路综合优先，计量单位其次
    if(!isUpdateConsign){
        $('#qualificationTypeId option').each(function(index,ele){
        	if($(ele).text().indexOf("公路综合")!=-1){
        		$(ele).attr('selected','selected');
        	}else if($(ele).text().indexOf("计量单位")!=-1){
        		$(ele).attr('selected','selected');
        	}
        });
    }*/
    $("#accessoryManage").bind("click",function(){
		createwindow2("附件管理", "uploadController.do?goUpload",null,null)
	})
	function createwindow2(title, addurl, width, height) {
	    width = width ? width : 700;
	    height = height ? height : 400;
	    if (width == "100%" || height == "100%") {
	        width = window.top.document.body.offsetWidth;
	        height = window.top.document.body.offsetHeight - 100;
	    }
	    if (typeof(windowapi) == 'undefined') {
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
        var saveUrl = 'consignController.do?doSave';
        $('#form').attr('action', saveUrl);
        $('#btn-4-submit').click();
    });
    
    var inputArr = [];
    $('input').each(function(index,ele){
    	//记录数据，排除对委托编号的记录（因为新增时不需要）
    	//排除class中包含no-store的input，用于排除指定的input框
    	if($(this).attr('id')!='' && $(this).attr('id')!=undefined && $(this).attr('id')!="consignCode" 
    		&& $(this).attr('id')!="consignId" && !$(this).hasClass('no-store')){
    		inputArr.push('#'+$(this).attr('id'));
    	}
    });
    $('select').each(function(index,ele){
    	if($(this).attr('id')!='' && $(this).attr('id')!=undefined){
    		inputArr.push('#'+$(this).attr('id'));
    	}
    });
    
    /**
     *完成委托
     */
    $('.btn-4-complete').click(function () {
    	
    	//存储表单数据
    	storeTool.storeFunc('consign-edit',['value','checked'],inputArr);
    	
    	//工程项目和项目人员两个select是通过data-selected值加载选中项，且通过jsp传值。所以单独处理
    	storeTool.storeFunc('consign-edit-project',['data-selected'],['#project','#sampleSender','#qualificationTypeId','#snTypeId']);
    	
        var completeUrl = 'consignController.do?doCompleteByData';
        $('#form').attr('action', completeUrl);
        $('#btn-4-submit').click();
    });
    
    $('.btn-4-printConsign').click(function () {
    	var a = this; 
    	var id =  $("input[name='id']").val();
    	//获取第一个样品的id
    			//取消<a>标签原先的onclick事件,使<a>标签点击后通过href跳转(因为无法用js跳转)^-^    
    			window.open( 'udrController.do?openUdrCommonTemplate&&objectId='+id+'&&type=printConsign');    
    		
    	
    });
    $('.btn-4-sampleLable').click(function () {
    	var a = this; 
    	var id =  $("input[name='id']").val();
    	//获取第一个样品的id
    			//取消<a>标签原先的onclick事件,使<a>标签点击后通过href跳转(因为无法用js跳转)^-^    
    			window.open( 'udrController.do?openUdrCommonTemplate&&objectId='+id+'&&type=sampleLable');    
    		
    	
    });
    /**
     *提交表单
     */
    $('#form').Validform({
        btnSubmit: "#btn-4-submit",
        tiptype: tipType,
        ignoreHidden: true,
        showAllError: false,
        postonce: true,
        ajaxPost: true,
        beforeSubmit: function (curform) {
            /*处理客户自定义委托信息*/
            buildCustomAttributes(curform);
            /*处理收样信息*/
            return buildTestObjectInfo(curform);
        },
        callback: function (data) {
            tip(data.msg);
            var loadIndex = layer.load(0, {shade: false});
            if (data.success) {
            	layer.close(loadIndex);
            	//window.parent.refreshMainTab();
            	// add start by weiheng at 20180507
            	//var iframe = $("iframe[src='consignController.do?list']", parent.document);
            	var iframe = $("iframe[src='consignController.do?goConsignList']", parent.document);
            	if(iframe){
            		iframe[0].contentWindow.reloadDataGrid(true);
            	}
            	// add end by weiheng at 20180507
            	
            	//如果是试验页面跳转来的，要跳转到试验界面
            	var isTaskRedirect = $("input[name='isTaskRedirect']").val();
            	var isSimpleModel = $("input[name='isSimpleModel']").val();
            	var taskId = $("input[name='taskId']").val();
            	var testTaskId = $("input[name='testTaskId']").val();
            	if(isTaskRedirect&&isSimpleModel){
            		openTabs(taskId,'试验数据录入','testTaskController.do?goTestMain&taskId='+taskId+'&id='+testTaskId);
            	}
            	closeCurrentTab();
            }else{
            	layer.close(loadIndex);
            }
        }
    });
	function openTabs(id, name, url) {
		window.parent.addTabs({
			"id" : id,
			"title" : name,
			"close" : false,
			"url" : url
		});
	}
  //如果是简易模式收样且从试验录入界面打开的委托
    function showTips(){
    	
    	var isTaskRedirect = $("input[name='isTaskRedirect']").val();
    	var isSimpleModel = $("input[name='isSimpleModel']").val();
    	if(isTaskRedirect&&isSimpleModel){
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
    $('.btn-4-add-copy').click(function(){
    	var checkobject= $("#receiveTestObjects input:checked");
    	checkobject.each(function(i,it){
    		var copyobject= $(it).parent().parent().html();
    		$('#receiveTestObjects tbody').append('<tr>'+copyobject+'</tr>')
    	})
    })
    
    /**
     * 工程项目select组件改变事件
     */
    $('#project').change(function () {
        $(this).attr('data-selected',$(this).val());
    });
    
    /**
     * 收样人员select组件改变事件
     */
    $('#sampleSender').change(function () {
        var option = $(this).find('option:selected');
        $(this).attr('data-selected',$(this).val());
        $('#sampleSenderName').val($(option).data('name'));
        $('#sampleSenderPhone').val($(option).data('phone'));
    });
    /**
     * 添加收样按钮事件
     */
    $('.btn-4-add-sample').click(function () {
        /*新增样品时，为确保数据安全性，手动清除sessionStorage的样品Key*/
        sessionStorage.removeItem('TEST_OBJECT');
        createPopWindow();
    });
    /**
     * 更多
     */
    $('.btn-4-show-more').click(function () {
        var state = $(this).data('state');
        var trs = $('tr.dy');
        if (state == 0) {
            $(this).data('state', 1);
            trs.show();
            $(this).children("span").children("span").removeClass("icon-more");
            $(this).children("span").children("span").addClass("icon-little")
            $("#wtinfo").animate({ scrollTop: 175 }, 1000);//100为滚动条的位置，1000为滚动的时延
        } else {
            $(this).data('state', 0);
            $(this).attr("icon","icon-more");
            $(this).children("span").children("span").removeClass("icon-little");
            $(this).children("span").children("span").addClass("icon-more")
            trs.hide();
        }
        
        // 重置一下见证时间的日期格式（后台传过来含时分秒）
        var witnessDate = $("#witnessDate").val();
        $("#witnessDate").val(witnessDate.split(" ")[0]);
    });
    $('.btn-4-pop-select-consignUnit').click(function () {
        var url = 'consignUnitController.do?list';
        layer.open({
            type: 2,
            title: '选择委托单位',
            skin: 'layui-layer-molv',
            content: url,
            btn: ['确定', '取消'],
            area: ['80%', '90%'],
            yes: function (index, layero) {
                initConsignUnit();
                var iframeWin = window[layero.find('iframe')[0]['name']];
                // noinspection JSUnresolvedVariable
                console.log("----------------------------------");
                var consignUnit = iframeWin.dataGrid.datagrid('getSelected');
                if (consignUnit) {
                    var consignUnitContainer = $('#unitId');
                    var paymentCompany=$('#paymentCompany'); 
                    consignUnitContainer.val(consignUnit.id);
                    paymentCompany.val(consignUnit.name);
                    consignUnitChanged(paymentCompany);
                    //设置资质
                    setGualificationType(consignUnit.qualificationTypeId);
                    $('#sampleSendUnitName').val(consignUnit.name)
                    consignUnitContainer.trigger('change');
                }
                // noinspection JSUnresolvedVariable
                var project = iframeWin.dataGrid1.datagrid('getSelected');
                if (project) {
                    /*如果这种实现方式存在概率性，可以采用设置#project select的data-selected值方式*/
                    var projectContainer = $('#project');
                    var projectShow = $('#project-show');
                    //设置工程项目value值
                    projectContainer.val(project.id);
                    
                    //设置用于展示工程项目的input的值
                    projectShow.val(project.name);
                    
                    $('#projectTenderName').val(project.name);
                    projectContainer.trigger('change');
                }
                // noinspection JSUnresolvedVariable
                var sampleSender = iframeWin.dataGrid0.datagrid('getSelected');
                if (sampleSender) {
                    var samplerSenderContainer = $('#sampleSender');
                    samplerSenderContainer.val(sampleSender.id);
                    samplerSenderContainer.trigger('change');
                }
                layer.close(index);
            }
        });
    });
    function setGualificationType(qualificationTypeId){
    	$('#qualificationTypeId').val(qualificationTypeId)
    	/*$.ajax({
    		url:'consignUnitController.do?getQualification',
    		type:'POST',
    		data:{id:qualificationTypeId},
    		dataType:'json',
    		success:function(data){
    			
    			
    		}
    	})*/
    }
    
    $('.btn-4-pop-select-project').click(function () {
        var consignUnitContainer = $('#consignUnit');
        var url = 'projectController.do?list';
        layer.open({
            type: 2,
            title: '选择工程项目',
            skin: 'layui-layer-molv',
            content: url,
            btn: ['确定', '取消'],
            area: ['80%', '90%'],
            yes: function (index, layero) {
                loadConsignUnitProjects(consignUnitContainer);
                var iframeWin = window[layero.find('iframe')[0]['name']];
                // noinspection JSUnresolvedVariable
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
    		skin: 'layui-layer-molv',
    		content: url,
    		btn: ['确定', '取消'],
    		area: ['80%', '90%'],
    		yes: function (index, layero) {
    			/*loadConsignUnitProjects(consignUnitContainer);
    			var iframeWin = window[layero.find('iframe')[0]['name']];
    			// noinspection JSUnresolvedVariable
    			var row = iframeWin.dataGrid.datagrid('getSelected');
    			if (row) {
    				var projectContainer = $('#project');
    				projectContainer.val(row.id);
    				projectContainer.trigger('change');
    			}*/
    			//alert(getSelectPostId())
    			  var iframeWin = window[layero.find('iframe')[0]['name']];
    			  var postFormId=iframeWin['getSelectPostId']();
    			  if(postFormId){
    				  $('#postFormId').val(postFormId);
    			  }
    			//lixin();
    			//var postId= layero.getSelectPostId();
    			//alert(postId);
    			layer.close(index);
    			
    		}
    	});
    	//layerCreateWindow('邮寄项目',url,['确定', '取消'],['80%', '90%'],'','','')
    });
    
   
    $('.btn-4-generate-code').click(function () {
        var consignCodeContainer = $('#consignCode');
        var consignCode = consignCodeContainer.val();
        if (consignCode) {
            return;
        }
        var url = 'tSnModelController.do?getSN';
        ajaxSubmitResponseJSON({
            url: url,
            data: {
                snCategory: $('#snTypeId').val(),
                type: 'consign'
            },
            success: function (data) {
                if (data.success) {
                    consignCodeContainer.val(data.obj);
                }else{
                	tip(data.msg);
                }
            }
        });
    });
});

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
                    // noinspection JSUnresolvedVariable
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
    if (!rows || rows.length == 0) {
        tip('请添加收样信息');
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
 *  回显样品
 *  主、子试验的显示方式有区别
 */
function echoTestObjects() {
    var testObjects = $('#testObjects').text(); //取得全部样品的元数据,注意这里的元数据是保存在委托表中的meta元数据，存成什么样子取出来就是什么，没有做加工
    //console.info("testObjects", testObjects);
    if (testObjects) {
        var objectAry = eval('(' + testObjects + ')'); //转成json
        var parentTestObject;
        for (var i = 0; i < objectAry.length; i++) {
        	 if(objectAry[i].parentSampleId==null) {//主试验样品
        		 applyAddOrUpdateTestObject(objectAry[i]); //展示
        		 parentTestObject = objectAry[i];
        	 }else{
        		 //applyAddOrUpdateSubTestObject(objectAry[i],parentTestObject); //展示
        		 applyAddOrUpdateTestObject(objectAry[i],parentTestObject);
        		 //subTestObject.push(objectAry[i]);
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
	if(testObject.importSample == 1) {
		return;
	}
	
    var htm = '';
    var tbody = $('#receiveTestObjects tbody'); //这是样品table，其中每一行的meta才是真实的样品元数据
    var updateTr = tbody.find('tr.active');
    if (!updateTr || updateTr.length == 0) {
        if(parentTestObject){
        	htm = '<tr data-parentId='+parentTestObject.testSampleId+'>';
        } else {
        	htm = '<tr>';
        }
    }
    
    htm += '<input type="hidden" data-meta="' + new Base64().encode(JSON.stringify(testObject)) + '">';
    htm +=' <td class="value" style="width:40px;"> <input type="checkbox" /> </td>';
    htm += '<td class="value">' + testObject.testSampleDisplayName + testObject.level + '</td>'; //样品的名称
    htm += '<td class="value">' + (testObject.testObjectCode ? testObject.testObjectCode : '未生成编号') + '</td>';
    htm += '<td class="value">' + (testObject.standard ? testObject.standard : '') + '</td>';
    htm += '<td class="value">' + (testObject.projectPartAndUse ? testObject.projectPartAndUse : '') + '</td>';	// 工程部位用途
    htm += '<td class="value">';
    var testParams = testObject.testParams;
    for (var i = 0; i < testParams.length; i++) {
        var testParam = testParams[i];
        htm += testParam.testParamDisplayName;	// 参数名称
        if(testParam.remark && testParam.remark != "") {	// 备注不为空
        	htm += '（' + testParam.remark + '）';
        }
        htm += '（' + testParam.count + '）';	//参数数量
        if (i != (testParams.length - 1)) {
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
    var fee = getTestObjectFees(testObject);   //添加了一个工程项目的参数，用于查询合同
    htm += '<td billingItem="1" class="value">' + (fee + additionFeesAmount) + '</td>';

    htm += '<td class="value">';

	    htm += '<a class="easyui-linkbutton btn-4-sample-update" icon="icon-edit" plain="true">修改</a>';
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

    $('.easyui-linkbutton').linkbutton();
    /*计算费用*/
    //calcTestFees(fee);
    /*绑定更新按钮事件*/
    bindUpdateBtnClick();
    /*绑定删除按钮事件*/
    bindDeleteBtnClick();
}
/**
 * 主界面中显示子样品信息
 * delete by weiheng at 20181225
function applyAddOrUpdateSubTestObject(testObject,mainTestObject) {
    var htm = '';
    var tbody = $('#receiveTestObjects tbody'); //这是样品table，其中每一行的meta才是真实的样品元数据
    var updateTr = tbody.find('tr.active');

    if (!updateTr || updateTr.length == 0) { //新增一条
        htm = '<tr data-parentId='+mainTestObject.testSampleId+'>';
    }
   //标柱该样品是否仅仅用于显示，而不用于做试验。针对综合试验，有的样品是可以引用的。引用的样品不用做试验
    //判断是否是引用样品的依据，有2点，1:是否含有委托编号  2：是否按要求做试验

    	//判定样品是否要做试验
    	//if()
    htm += '<input type="hidden" data-meta="' + new Base64().encode(JSON.stringify(testObject)) + '">';
    htm +=' <td class="value"> <input type="checkbox"/> </td>';
	htm += '<td class="value">' + testObject.testSampleDisplayName + "（" + testObject.testSampleName + '）</td>';
	htm += '<td class="value">' + (testObject.testObjectCode ? testObject.testObjectCode : '未生成编号') + '</td>';
    htm += '<td class="value">' + (testObject.standard ? testObject.standard : '') + '</td>';
    htm += '<td class="value">' + (testObject.projectPartAndUse ? testObject.projectPartAndUse : '') + '</td>';	// 工程部位用途
    htm += '<td class="value">';
    var testParams = testObject.testParams;
   //console.log("-------------"+JSON.stringify(testObject));
    for (var i = 0; i < testParams.length; i++) {
        var testParam = testParams[i];
        htm += (testParam.testParamDisplayName + '（' + testParam.count + '）'); //参数的名称
        if (i != (testParams.length - 1)) {
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
    //计算费用
    var fee= getTestObjectFees(testObject);
    htm += '<td class="value">' + ( fee+ additionFeesAmount) + '</td>';
    htm += '<td class="value">';
    htm += '</td>';
    if (!updateTr || updateTr.length == 0) {
        htm += '</tr>';
    }
    if (updateTr && updateTr.length > 0) { //如果是更新，则刷新table，如果是添加，则append tr
        updateTr.html(htm);
        updateTr.removeClass('active');
    } else { //检索父节点的位置，再加在他的后面，前提条件是父节点应该存在
        tbody.append(htm);
    }
    $('.easyui-linkbutton').linkbutton();

}*/
function calcTestFees(fee){
	//取得原来的值，再加上他
	var current =  $('#feeTotal').val();
	var total = Number(current)+Number(fee);
	$('#feeTotal').val(total);
	$('#manualFeeTotal').val(total);
}
function FeesOnChange(obj){
	//取得原来的值，再加上他
	var 	current =  $(obj).val();
	$('#manualFeeTotal').val(current);
}
function getTestObjectFees(testObject) {
    var testObjectFees = 0;
   var projectId = $("#project").data('selected');
    ajaxSubmitResponseJSON({
        url: 'consignController.do?getTestObjectFees',
        data: {
            metaData: '[' + JSON.stringify(testObject) + ']',
            projectId:projectId
        },
        success: function (data) {
            testObjectFees = data.obj;
        }
    });
    return testObjectFees;
}


function bindUpdateBtnClick() {
	/*$('.btn-4-sample-update').off('click')
	.on('click', function () {
	    $(this).closest('table').find('tr').removeClass('active');
	    var tr = $(this).closest('tr');
	    tr.addClass('active');
	    var meta = tr.find('input').data('meta');
	    sessionStorage.setItem("TEST_OBJECT", new Base64().decode(meta));
	    createPopWindow();
	});*/
}

$(document).on('click','.btn-4-sample-update',function(){
	$(this).closest('table').find('tr').removeClass('active');
    var tr = $(this).closest('tr');
    tr.addClass('active');
    var meta = tr.find('input').data('meta');
    sessionStorage.setItem("TEST_OBJECT", new Base64().decode(meta));
    createPopWindow();
})

$(document).on('click','.btn-4-sample-delete',function(){
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
             calcTestFees(Number(fee)*(-1));
         }
     });
})

/**
 * 收样信息列表删除按钮事件
 */
function bindDeleteBtnClick() {
/*    $('.btn-4-sample-delete')
        .off('click')
        .on('click', function () {
            var th = $(this);
            var index = layer.open({
                title: '删除提示',
                content: '确认删除？',
                icon: 7,
                btn: ['确定', '取消'],
                yes: function () {
                    $(th).closest('tr').remove();
                    layer.close(index);
                }
            });
        });*/
}

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
    $('#sampleSendUnitName').val(newConsignUnitText);
    $('#paymentUnitName').val(newConsignUnitText);
    $('#inspectionUnitName').val(newConsignUnitText);
    
    var tender = thisO.find('option:selected').data('tender');
    $('#projectTenderName').val(tender);
}

/**
 *选择委托单位后，为项目标段填写默认值
 */
function inintProjectPanderName(name){
	name=encodeURIComponent(name)
	$.ajax({
		url:"consignUnitController.do?getByCosignUnitName&consignUnitName="+name,
		/*contentType : 'application/json;charset=utf-8',*/
		/*data:{consignUnitName:name},*/
		dataType:'json',
        success:function(data){
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
    var newConsignUnitId =  $("#unitId").val();
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
    var newConsignUnitId =  $("#unitId").val();

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

//是否配合比
var ifPHB=false;

/**
 * 创建 编辑样品的弹出框
 * 
 * 确认按钮的事件是，把弹出的样品编辑窗的内容 整合成一条样品数据显示在主界面。
 */
function createPopWindow() {
	
	//删除辅助样品信息的本地存储，防止用户操作后保留了一堆辅助信息，直接关闭浏览器等方式，跳过”确定“、”关闭”按钮的删除操作
	if(storeTool.storeCapable){
		for(key in localStorage){
			if(key.indexOf('assistArgs_') >= 0){
				localStorage.removeItem(key);
			}
		}
	}
	
    var index = layer.open({
        type: 2,
        title: '收样信息',
        skin: 'layui-layer-molv',
        content: 'consignController.do?goEditSample',
        btn: ['确定', '取消'],
        area:['100%','100%'],
        closeBtn: 0,
        yes: function (index, layero) {
        	
            var iframeWin = window[layero.find('iframe')[0]['name']];
            /*调用子页面方法，构建检测对象JSON对象*/
            // noinspection JSUnresolvedFunction
            iframeWin.storeSamples();
            
            //样品弹窗中的样品信息对象
            var testObject = iframeWin.createTestObject();
            
            //console.info("testObject", testObject);
            //将信息对象转化为base64格式的meta-data属性值回显在修改委托页
            applyAddOrUpdateTestObject(testObject);
            
            if(!ifPHB){
            	 ifPHB = iframeWin.checkIfPHB();
            }
            //如果有子试验样品，则显示在样品列表中
            //但是只有要做试验的样品，才提交到后台，其他的情况只给用户看看信息而已。
           // console.log(">>>>"+JSON.stringify(testObject));
            $("tr[data-parentId='"+testObject.testSampleId+"']").remove();
            
            //console.info("testObject", testObject);
            for (var i = 0; i < testObject.otherMaterials.length; i++) {
                //applyAddOrUpdateSubTestObject(testObject.otherMaterials[i],testObject);
                applyAddOrUpdateTestObject(testObject.otherMaterials[i],testObject);
            }
            
            // 重新累加显示总费用
            getTotalFee()
            
            hideMore();	// 收起委托的更多信息
            layer.close(index);
        }
    });
}

/**
 * 重新获取总费用显示
 * 20181226 - weiheng
 */
function getTotalFee(){
	var total = 0.0;
	$("#receiveTestObjects").find("td[billingItem='1']").each(function(){
		var fee = $(this).text();
		total += parseFloat(fee);
	});
	$("#feeTotal").val(total);
}

function closeCurrentTab() {
    //关闭当前tab
/*    var currentTab = $(".J_menuTab.active", window.parent.document);
    currentTab.find("i[class='fa fa-times-circle']").trigger("click"); //触发小红×的点击事件
*/
	window.parent.closeCurrentWin();
	}


function refreshConsignTabAndCloseCurrentTab() {
    /*tabs容器节点*/
    //var menuContainer = $('.J_menuTabs');
   /* var currentTab = $(".J_menuTab.active", window.parent.document);
    var consignTabId = 'consignController.do?list';
    var target = $('.J_iframe[data-id="' + consignTabId + '"]', window.parent.document);
    if (target) {
        var url = target.attr('src');
        //显示loading提示
        var loading = layer.load();
        target.attr('src', url).load(function () {
            layer.close(loading);
            currentTab.find("i[class='fa fa-times-circle']").trigger("click");
        });
    }*/
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

function checkChildBox(e){
	console.log(e);
}
function changePost(id){
	$.ajax({
        url:'tSPostFormsController.do?getPostFormById',		
 		type:'POST',
		dataType:'json',
		data:{postFormId:id},
		success:function(result){
			if(result.success==true){
				$('#postFormName').val(result.obj.name)
			}
		}
	})
}
$(function(){
	//初始化邮寄信息
	initPost();
})
function initPost(){
   var postFormId=$('#postFormId').val();	
	if(postFormId){
		changePost(postFormId);
	}
}
function addToForm(accessory){
	var $accessoryIds = $("#accessoryIds");
	var newVal='';
	var oldVal = $accessoryIds.val();
	if(oldVal=='' || oldVal == null || typeof(oldVal) == 'undefined'){
		oldVal=='';
		newVal = accessory.id;
	}else{
		newVal = oldVal+","+accessory.id;
	}
	$accessoryIds.val(newVal);
	addAccessoryToTable2(accessory);
}

//初始化附件管理
function initAccessory(){
	var consignId= $('#consignId').val();
	if(consignId){
		$.ajax({
			url:'consignController.do?getAttachment',
			dataType:'json',
			data:{id:consignId},
			success:function(res){
				if(res.obj!=null){
					$.each(res.obj, function(i,accessory){
						addAccessoryToTable2(accessory)
					})
				}
			}
			
		})
	}
	
}

function addAccessoryToTable2(accessory){
	var $tableBody= $('#accessoryTable tbody');
	var id = $("#id").val();
	var str= accessory.realpath;
	var num=str.lastIndexOf('.')
	var strs=str.slice(num);
	var temp= strs.substring(1);
	if(temp=='png'||temp=='jpg'){
	 $tableBody.append('<tr id="'+accessory.id+'"><input name="accessoryId" type="hiden" value="'+accessory.id+'">'
		 	+'<td><img src=\''+accessory.realpath+'\' width=\'70px\' height=\'50px\'/></td>'
		 	+'<td><button type="button" onclick="downloadAccessory(\''+accessory.id+'\')">下载</button>'
		 		+'<button type="button" onclick="deleteAccessory(\''+accessory.id+'\')">删除</button>'
		 	+'</td>'
		 +'</tr>')
	}
	else{
	 $tableBody.append('<tr id="'+accessory.id+'">'
		 	+'<td>'+accessory.attachmenttitle+'</td>'
		 	+'<td><button type="button" onclick="downloadAccessory(\''+accessory.id+'\')">下载</button>'
		 		+'<button type="button" onclick="deleteAccessory(\''+accessory.id+'\')">删除</button>'
		 	+'</td>'
		 +'</tr>')
	}
}

function downloadAccessory(accessoryId){
	window.open("uploadController.do?download&accessoryId="+accessoryId);
}
function deleteAccessory(accessoryId){
	$.ajax({
		 type:"post",
		 asyn:true,
		 url:"consignController.do?deleteAccessoryByIds",
		 contentType:"application/x-www-form-urlencoded",
		 data:{accessoryIds:accessoryId},
		 success:function(data){
			 data=JSON.parse(data);
			 if(data.success){
				deleteAccessoryToTable(accessoryId);
			 }
		 }
	});
}
function deleteAccessoryToTable(accessoryId){
	var $tableBody= $('#accessoryTable tbody');
	$tableBody.find("#"+accessoryId).remove();
}
/**
* 展开更多信息
* 20181218 - weiheng
*/
function showMore(){
	var moreDom = $(".btn-4-show-more");
    var trs = $('tr.dy');
    moreDom.data('state', 1);
    trs.show();
    moreDom.children("span").children("span").removeClass("icon-more");
    moreDom.children("span").children("span").addClass("icon-little")
    $("#wtinfo").animate({ scrollTop: 0 }, 1000);//100为滚动条的位置，1000为滚动的时延
    resetWitnessDate();
}
/**
 * 隐藏更多信息
 * 20181218 - weiheng
 */
function hideMore(){
	var moreDom = $(".btn-4-show-more");
    var trs = $('tr.dy');
    moreDom.data('state', 0);
    moreDom.attr("icon","icon-more");
    moreDom.children("span").children("span").removeClass("icon-little");
    moreDom.children("span").children("span").addClass("icon-more")
    trs.hide();
    resetWitnessDate();
}
/**
 * 重置见证时间的日期格式（后台传过来含时分秒）
 * 20181218 - weiheng
 */
function resetWitnessDate(){
	var witnessDate = $("#witnessDate").val();
    $("#witnessDate").val(witnessDate.split(" ")[0]);
}