//初始化url参数对象
var param = new UrlSearch();
//是否正在提交中
var isSubmiting = false;
// 初始的附加费用
var initialFeeData = [];
var checkedFeeData = [];
var firstAdd = true;
$(document).ready(function () {

    //绑定功能按钮事件
    buildUIEvent();

    $("#additionalFees").on("change", "tbody input[type='checkbox']", function(e){
        if(e.target.checked){
            checkedFeeData.push(e.target.id);
            $(this).parent().parent().find(".addtionFeeCount").val(1);
        }else{
            checkedFeeData.indexOf(e.target.id) != -1 && checkedFeeData.splice(checkedFeeData.indexOf(e.target.id) , 1);
            $(this).parent().parent().find(".addtionFeeCount").val(0);
        }
    });

    $("#additionalFees").on("change", ".addtionFeeCount", function(){
       if($(this).val()<=0){
           $(this).val(0);
       } else{
           $(this).val(parseInt($(this).val()));
           $(this).parent().parent().find("input[type=checkbox]").attr("checked", true);
       }
    });

    //加载testobject对象
    TObject.initFromSession(function (loadSuccess) {

        TObject.qualificationType = param.qualificationType;
        TObject.isUpdateConsign = param.isUpdateConsign;

        if (param.detail != "detailPage") {
            param.addSubsample ? $('#material-box').hide() : $('#material-box').show();
            if (true != loadSuccess) {
                //弹出选择样品的对话框
                $('.btn-4-select-sample').click();
            }
            //加载打包参数内容一致加载
            LoadGroupParams();
            return;
        } else {
            console.log('param.addSubsample', param.addSubsample);

            param.addSubsample ? $('#material-box').hide() : $('#material-box').show();
            //禁用所有的输入按钮
            $("input,select,a").attr("disabled", "disabled");
            $("a").hide();

            // 样品描述选择禁用
            $('#description').combobox('disable');
        }

    });
});


//弹出选择大类和样品的界面
function PopTestSampleSelectForm(callback) {
    //传递参数：资质ID、大类ID、样品ID
    //弹出选择界面
    HitekTopLayer({
        type: 2,
        title: "请选择委托样品",
        skin: 'mylayui-layer-molv',
        content: 'consignController.do?goSampleSelect&qualificationType=' + param.qualificationType
            + '&isUpdateConsign=' + param.isUpdateConsign
            + "&BIG_CATEGORY_ID=" + TObject.BIG_CATEGORY_ID
            + "&TEST_SAMPLE_ID=" + TObject.THE_TEST_SAMPLE_ID,
        btn: ['确定', '取消'],
        area: ['80%', '80%'],
        closeBtn: 0
    },
        function (index, layero, cuLayer) {

            //获取数据对象，如果对象获取成功，符合要求，则可以关闭

            var iframeWin = window.top[layero.find('#layui-layer-iframe' + index)[0]['name']];


            //得到iframe页的窗口对象，执行iframe页的方法：
            var selSample = iframeWin.GetResult();

            //关闭弹出层,从返回窗体里面获取layer
            cuLayer.close(index);

            if (selSample == null || (!selSample.THE_TEST_SAMPLE_ID) || (!selSample.BIG_CATEGORY_ID)) {
                window.top.layer.msg("请选择检测样品");
                return;
            }

            if (callback) {
                callback(selSample);
            }
        });
}

//End构建    事件驱动点
function buildUIEvent() {
    //参数全选功能
    $(".checkAllParam").click(function () {
        TObject.SetParamAllChecked($(this).prop("checked"));
    });

    //选中或取消选中参数
    $("#params").on("click", ".paramSelect", function () {
        var paramID = $(this).attr("data-id");
        //获取本身的checked值
        TObject.SetParamChecked(paramID, $(this).prop("checked"), true);
    });

    //更改子价格
    $("#params").on("change", ".selectChildPrice", function () {
        var paramID = $(this).attr("data-id");
        //获取本身的checked值
        var curOpt = $(this).find("option:selected");
        TObject.SetParamPrice(paramID, curOpt.attr("data-priceValue"), true);
    });

    $(".testParamsNumber-wrap-reduce").on("click",function(){
        if(parseInt($("#testParamsNumber").val()) <= 1){
            return;
        }
        $("#testParamsNumber").val(parseInt($("#testParamsNumber").val())-1);
        var count = $("#testParamsNumber").val() || 0;
        var _ele = $("#params tbody").find("input:checked");
        for(var i=0;i<_ele.length;i++){
            TObject.SetParamCount(_ele.eq(i).attr("data-id"), count);
        }
    });

    $(".testParamsNumber-wrap-plus").on("click", function(){
        $("#testParamsNumber").val(parseInt($("#testParamsNumber").val())+1);
        var count = $("#testParamsNumber").val() || 0;
        var _ele = $("#params tbody").find("input:checked");
        for(var i=0;i<_ele.length;i++){
            TObject.SetParamCount(_ele.eq(i).attr("data-id"), count);
        }
    });

    // 更改统一数量
    $("#testParamsNumber").on("change", function(){
        var count = $(this).val() || 0;
        var _ele = $("#params tbody").find("input:checked");
        for(var i=0;i<_ele.length;i++){
            TObject.SetParamCount(_ele.eq(i).attr("data-id"), count);
        }
    })

    //更改数量
    $("#params").on("change", ".countNumber", function () {
        var paramID = $(this).attr("data-id");

        var count = $(this).val() || 0;

        TObject.SetParamCount(paramID, count);
    });

    $("#testObjectAttributesL input").change(function () {
        var ctr = this;
        //如果更改， 则直接回写到TObject;
        TObject.LoadDataFromUI_OtherInfos_others_L(ctr);
    });


    //界面折叠展开功能
    $(".divTitle").click(function () {
        var showed = $(this).data('showstate');
        var next = $(this).next(".divContent");
        if (showed == 0) {
            next.show();
            $(this).data("showstate", 1);
            //设置图标为向下
            $(this).removeClass("unexpanded");
            $(this).addClass("expanded");
        } else {
            next.hide();
            $(this).data("showstate", 0);
            $(this).removeClass("expanded");
            $(this).addClass("unexpanded");
        }
    });

    //选择样品按钮
    $('.btn-4-select-sample').click(function () {
        PopTestSampleSelectForm(function (selSample) {
            TObject.initFromSample(selSample, {});
        });
        return false;
    });

    //选择规程按钮
    $(".btn-4-add-standard").click(function () {
        var paramTr = $('#params').find('tr.data');
        var paramIds=[],testParamIds=[];
        if (TObject.SELECTED_PARAM_IDS.length === 0) {
            paramTr.find('input:checkbox').each(function () {
                paramIds.push($(this).data('id'));
            });
            testParamIds = paramIds;
        }else{
            testParamIds = TObject.SELECTED_PARAM_IDS;
        }

        var url = "baseStandardNewController.do?consignStandardList&sampleId=" + TObject.THE_TEST_SAMPLE_ID +
          "&testParamIds=" + testParamIds + "&&operSuccFunc=SelectStandardCallBack";

        HitekTopLayer({
            type: 2,
            title: '选择规程',
            offset: 'auto',
            skin: 'mylayui-layer-molv',
            content: url,
            closeBtn: 0,
            btn: ['确定', '取消'],
            area: ['80%', '90%']
        },
            function (index, layero, cuLayer) {
                //获取数据对象，如果对象获取成功，符合要求，则可以关闭
                var iframeWin = window.top[layero.find('#layui-layer-iframe' + index)[0]['name']];
                //得到iframe页的窗口对象，执行iframe页的方法：

                iframeWin.saveData(true, function () {
                    //刷新数据对象
                    TObject.RefreshParamStandardFromServer();

                    cuLayer.close(index);
                });
                //关闭弹出层,从返回窗体里面获取layer
            });

        return false;
    });

    // 自定义参数打包按钮
    $('.btn-4-add-group').click(function (e) {

        e.stopPropagation();

        if (TObject.SELECTED_PARAM_IDS.length == 0) {
            tip('请选择需要打包的试验参数');
            return;
        }
        window.top.layer.prompt({
            title: '请填写打包参数名称',
        }, function (val, index) {
            if (isSubmiting) {
                return;
            }
            window.top.layer.close(index);
            isSubmiting = true;
            $.ajax({
                url: 'testParamController.do?doSaveTestParamGroup',
                async: true,
                data: {
                    name: val,
                    ids: TObject.SELECTED_PARAM_IDS.join(','),
                    sampleId: TObject.THE_TEST_SAMPLE_ID
                },
                dataType: 'json',
                success: function (data) {
                    isSubmiting = false;
                    tip(data.msg);
                    if (data.success) {
                        //刷新打包参数列表
                        LoadGroupParams();
                    }
                }
            });
        });
        return false;
    });

    $('#groups').click(function(e){
        e.stopPropagation();
    })
    // 快速收取打包参数
    $('#groups').change(function (e) {
        //清空选中项        
        TObject.SetParamChecked(TObject.SELECTED_PARAM_IDS.concat(), false, false);
        //选中打包参数内容
        var option = $(this).find('option:selected');
        var paramIds = option.data('params');
        if (paramIds) {

            var paramIdAry = paramIds.split(',');
            TObject.SetParamChecked(paramIdAry, true);
        }
        return false;
    });

    // 打开附加费用弹窗
    $(".btn-4-add-openList").click(function(e){

        // 避免点击删除之后触发折叠的事件代码
        e.stopPropagation();
        if(firstAdd){
            for(var i=0;i<$("#additionalFees tbody input[type=checkbox]").length;i++){
                checkedFeeData.push($("#additionalFees tbody input[type=checkbox]").attr("id"));
            }
            firstAdd = false;
        }

        var content = "<div class='layer-additionalFeesList2'>" +
            "<a class='easyui-linkbutton btn-4-add-additionalFee layer-additionalFeesList2-btn' onclick='addAdditionalFee()' icon='iconfont icon-add' plain='true'>添加</a>" +
            "<a class='easyui-linkbutton btn-4-delete-additionalFee layer-additionalFeesList2-btn' onclick='deleteAdditionalFee()' icon='iconfont icon-remove' plain='true'>删除</a>" +
            "<table id='additionalFeesList2' cellpadding=0 cellspacing=1>"+ $("#additionalFees").html() +"</table>" +
            "</div>";

        var ly = window.top.layer;
        ly.open({
            type: 1,
            title: "附加费用管理",
            // maxmin: true,
            shadeClose: true, //点击遮罩关闭层
            area: ['700px', '450px'],
            skin: 'mylayui-layer-molv',
            btn: ['确定','取消'],
            content: content
        });

        window.top.$("#additionalFeesList2 tbody input[type='checkbox']").attr("checked", false);
    });

    //新增附加费用 按钮事件
    window.top.addAdditionalFee = function() {
    // $('.btn-4-add-additionalFee').click(function () {
        var url = 'additionalFeeController.do?edit';

        HitekTopLayer({
            type: 2,
            skin: 'mylayui-layer-molv',
            title: '新增附加费用',
            content: url,
            maxmin: false,
            btn: ['保存', '取消'],
            area: ['500px', '400px']
        },
            function (index, layero, cuLayer) {
                //获取数据对象，如果对象获取成功，符合要求，则可以关闭
                var iframeWin = window.top[layero.find('#layui-layer-iframe' + index)[0]['name']];
                //得到iframe页的窗口对象，执行iframe页的方法：
                iframeWin.SaveAddtionFee(function () {
                    //刷新附加费用列表
                    TObject.Fee_Refresh();

                    // 新增之后取消全选，只勾选刚新增的
                    $("#additionalFees tbody input[type='checkbox']").attr("checked", false);

                    // 勾选
                    for(var i=0,l=checkedFeeData.length;i<l;i++){
                        $("#additionalFees tbody input[id="+ checkedFeeData[i] +"]").attr("checked", true);
                    }

                    // 同步两个窗口的数据
                    window.top.$("#additionalFeesList2").html($("#additionalFees").html());
                    window.top.$("#additionalFeesList2 tbody input[type='checkbox']").attr("checked", false);
                });
                //关闭弹出层,从返回窗体里面获取layer
                //cuLayer.close(index);

            });
        return false;
    };

    //删除附加费用按钮事件
    window.top.deleteAdditionalFee = function() {
    // $('.btn-4-delete-additionalFee').click(function (e) {

        var delIds = [];
        window.top.$("#additionalFeesList2 tbody").find("input:checked").each(function () {
            delIds.push($(this).attr('id'));
        });

        if (delIds && delIds.length > 0) {
            var index = window.top.layer.open({
                title: '删除提示',
                content: '确认删除选中附加费用？',
                icon: 3,
                btn: ['确定', '取消'],
                yes: function () {
                    window.top.layer.close(index);
                    var ids = delIds.join(',');
                    // TObject.Fee_Del(delIds);
                    ajaxSubmitResponseJSON({
                        url: 'additionalFeeController.do?doDel',
                        data: {
                            "id": ids
                        },
                        success: function (data) {
                            if (data.success) {
                                TObject.Fee_Refresh();
                                // 取消全选
                                $("#additionalFees tbody input[type='checkbox']").attr("checked", false);
                                // 勾选
                                for(var i=0,l=checkedFeeData.length;i<l;i++){
                                    $("#additionalFees tbody input[id="+ checkedFeeData[i] +"]").attr("checked", true);
                                }
                                layer.close(index);

                                // 同步两个窗口的数据
                                window.top.$("#additionalFeesList2").html($("#additionalFees").html());
                                window.top.$("#additionalFeesList2 tbody input[type='checkbox']").attr("checked", false);
                            }
                        }
                    });
                }
            });
        }
    };

    // 录入其他材料
    $('.btn-4-record-material').click(function () {
        //判断该样品是否要做试验，实质是给样品打个标记
        HitekTopLayer({
            type: 2,
            title: '录入收样信息',
            skin: 'mylayui-layer-molv',
            content: 'consignController.do?goRecordSample',
            btn: ['确定', '取消'],
            area: ['95%', '95%'],
            closeBtn: 0,
        },
            function (index, layero, cuLayer) {
                // 把选中的样品 和 参数 加入到父页面中来
                //通过接口找到样品

                var iframeWin = window.top[layero.find('#layui-layer-iframe' + index)[0]['name']];

                var arrData = iframeWin.echoReferConsignedSample();
                if (arrData.length>0 ) {
                    TObject.RefMaterial_Add(arrData);
                    cuLayer.close(index);
                }

            }
        );

        return false;
    });

    //删除其他材料
    $('.btn-4-delete-material').click(function (e) {

        e.stopPropagation();

        var delIds = [];
        $('#referConsignedSampleDataDataGrid tbody').find('input:checked').each(function () {
            delIds.push($(this).parents("tr").attr('id'));
        });

        if (delIds.length == 0){
            window.top.layer.msg("请选择需要删除的检测样品");
            return;
        }

        var index = window.top.layer.open({
            title: '删除提示',
            content: '确认删除选中材料？',
            icon: 3,
            btn: ['确定', '取消'],
            yes: function () {
                TObject.RefMaterial_Del(delIds);
                //LoadReferConsignedSampleDataDataGrid(newData);
                window.top.layer.close(index);
            }
        });
    });

    //引用已委托原材料
    $('.btn-4-quote-material').click(function () {
        var title = '引用已委托原材料';
        var url = 'consignController.do?goReferConsignedSample';
        HitekTopLayer({
            type: 2,
            title: title,
            content: url,
            skin: 'mylayui-layer-molv',
            btn: ['确定', '取消'],
            area: ['80%', '95%']
        },
            function (index, layero, cuLayer) {
                var iframeWin = window.top[layero.find('#layui-layer-iframe' + index)[0]['name']];
                var referConsignedSampleData = iframeWin.buildReferConsignedSample();
                //循环添加， 去除重复的内容
                TObject.RefMaterial_Add(referConsignedSampleData);
                //初始化显示内容   初始化内容
                //LoadReferConsignedSampleDataDataGrid_Add(referConsignedSampleData);
                cuLayer.close(index);

            });

        return false;
    });

    //编辑工程部位功能
    $('#part-attr').click(function () {

        if (TObject.SELECTED_PARAM_IDS.length == 0) {
            tip('请选择参数');
            return;
        }

        var partStr = $('#part').val();
        var partArr = [];

        if (partStr) {
            partArr = partStr.split(';')
        }

        //获取最大的工程部位数量
        var maxCount = TObject._calcMaxCount();

        var html = '<table class="formtable" cellpadding="0" cellspacing="1" style="width:100%;">'
        html += '<tr><th>序号</th><th>检测部位</th></tr>'
        for (var i = 0; i < maxCount; i++) {
            html += '<tr><td>' + (i + 1) + '</td>'
            html += '<td><input type="text" style="line-height:28px;height: 28px;width:100%" name="partText' + i + '" value="' + (partArr[i] || "") + '" ></td>'
            html += '</tr>'
        }
        html += '</table>'
        HitekTopLayer({
            type: 1,
            title: '设置检测部位',
            skin: 'mylayui-layer-molv',
            content: html,
            area: ['30%', '60%'],
            btn: ['确定', '取消']
        },
            function (index, layero, cuLayer) {
                var partTextStr = '';
                $(layero).find('input').each(function () {
                    partTextStr += $(this).val() + ';'
                });
                //去除最后的1个字符串
                var partTextStr1 = partTextStr.slice(0, -1);
                $('#part').val(partTextStr1);
                $('#projectPartAndUse').val(partTextStr1);

                TObject.LoadDataFromUI_OtherInfos_others_L();
                cuLayer.close(index);
            }
        );

    })

    //增加龄期信息
    $('.btn-4-add-period').click(function () {
        //数据驱动界面添加行
        TObject.Period_Add();
        return false;
    });

    //删除选中龄期
    $('.btn-4-delete-period').click(function (e) {

        e.stopPropagation();

        var delIds = [];
        $('#periods tbody').find('input:checked').each(function () {
            delIds.push($(this).parents("tr").attr('id'));
        });

        if (delIds.length == 0){
            window.top.layer.msg("请选择需要删除的龄期")
            return;
        }

        var index = window.top.layer.open({
            title: '删除提示',
            content: '确认删除选中龄期？',
            icon: 3,
            btn: ['确定', '取消'],
            yes: function () {
                //删除数据对象
                TObject.Period_Del(delIds);
                window.top.layer.close(index);
            }
        });
        return false;
    });

    //规格型号按钮

    $('#choose-attr').click(function () {
        var url = 'webpage/com/hitek/testbusiness/consign/attrDiv.jsp';
        var stanfileds = TObject.otherInfos.filter(function (item) {
            return standardFields.indexOf(item.systemFieldName) >= 0
        });
        for (var index = 0; index < stanfileds.length; index++) {
            var element = stanfileds[index];
            var itmp = {};
            itmp.systemFieldName = element.fieldName;
            itmp.name = element.displayName;
            itmp.isDefaultValue = element.isDefaultValue;
            itmp.order = element.orderNo;
            if (element.listValue && element.listValue.length > 0) {
                itmp.listValue = element.listValue;
            }
            else {
                itmp.listValue = element.value;
            }
            itmp.value = element.value;
        }
        if (stanfileds.length === 0) {
            stanfileds = [{ "name": "自定义规格", "value": "" }];
        }
        HitekTopLayer({
            type: 2,
            skin: 'mylayui-layer-molv',
            title: '选择规格型号',
            content: url,
            btn: ['确定', '取消'],
            area: ['400px', '60%'],
            success: function (layero, index) {
                //获取对象
                var iframeWin = window.top[layero.find('#layui-layer-iframe' + index)[0]['name']];
                iframeWin.SetStandardArr(stanfileds, $("#standard").val());
            }
        },
            function (index, layero, cuLayer) {

                //获取数据对象，如果对象获取成功，符合要求，则可以关闭

                var iframeWin = window.top[layero.find('#layui-layer-iframe' + index)[0]['name']];
                var standardArr = iframeWin.GetStandardArr();
                if (standardArr.length===0){
                    return;
                }
                cuLayer.close(index);

                var standard = '';
                for (var i = 0; i < standardArr.length; i++) {
                    var systemFieldName = standardArr[i].name;
                    var fieldName = GetSystemFieldCtrName(systemFieldName);
                    var val = standardArr[i].value;
                    $("#standard-" + fieldName).val(val);
                    $("#testObjectAttributesR  [systemfieldname='" + systemFieldName + "']").val(val);
                    standard += val + " ";
                }
                standard = standard.substring(0, standard.length - 1);
                $('#standard').val(standard);
                $('#standard-cont').text(standard);
                //加载数据内容
                TObject.LoadDataFromUI_OtherInfos_standard();
                TObject.LoadDataFromUI_OtherInfos_others_L();
                TObject.LoadDataFromUI_OtherInfos_others_R();

            });

    });

}

//构建打包参数相关UI
function LoadGroupParams() {

    var url = 'testParamController.do?getTestParamGroups';

    if (TObject.BIG_CATEGORY_ID != '' && TObject.THE_TEST_SAMPLE_ID != '') {
      url += '&bigCategoryId=' + TObject.BIG_CATEGORY_ID + "&sampleId=" + TObject.THE_TEST_SAMPLE_ID;
    } else if (param.BIG_CATEGORY_ID != '' && param.THE_TEST_SAMPLE_ID != '') {
      url += '&bigCategoryId=' + param.BIG_CATEGORY_ID + "&sampleId=" + TObject.THE_TEST_SAMPLE_ID;
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



//输入样品辅助信息时，当失去焦点的动作
//用于校验批号的唯一性
function onTestOtherInfo(obj) {
    var id = $(obj).attr('id');
    var dataAttr = $(obj).attr('systemFieldName');
    //赋值到对应的属性
    TObject.LoadDataFromUI_OtherInfos_others_R(obj);

    if (dataAttr == "批号") { //批号，需要到后端取教研唯一性
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



//缓存送样信息到缓存中
function storeSamples() {
    var dataObj = {
        "samplingPlace": $('#samplingPlace').val(),
        "samplingDate": $("#samplingDate").val(),
        "samplingCompany": $("#samplingCompany").val(),
        "samplePerson": $("#samplePerson").val(),
        "samplePersonNumber": $("#samplePersonNumber").val(),
    }
    storeSessionFunc('consign-editSample-samplingInfo', dataObj)
}


/**
 *构建收样信息，收样信息构建结果是样品对象
 */
function createTestObject() {
    if (!TObject.BIG_CATEGORY_ID
        || !TObject.THE_TEST_SAMPLE_ID) {
        window.top.layer.msg('请选择试验检测对象');
        return;
    }
    if (TObject.SELECTED_PARAM_IDS.length == 0) {
        window.top.layer.msg('请选择试验参数');
        return;
    }

    //获取系统参数,是否根据计价数量生成样品
    var flag = isCreateTestSampleByParamNum();
    //获取打包样品对象
    var sourceTobj = Package_TestObject();
    var testObjects = []; // 样品数组
    var isGroup = []; // 打包样品id
    var sharePrices = []; // 打包价格

    if(window._testParamsData.length > 1){
        for(var i=0;i<window._testParamsData.length;i++){
            if(window._testParamsData[i].sharePrice){
                isGroup.push([]);
                sharePrices.push(window._testParamsData[i].sharePrice);
                for(var j=0;j<window._testParamsData[i].testParams.length;j++){
                    isGroup[isGroup.length-1].push(window._testParamsData[i].testParams[j].id);
                }
            }
        }
    }

    //如果不需要生成，则直接返回
    if (!flag) {
        // 未计算附加费用，添加上附加费用
        if(sourceTobj.additionalFees && sourceTobj.additionalFees.length !=0 ){
            for(var i=0;i<sourceTobj.additionalFees.length;i++){
                sourceTobj.testObjectPrice = parseFloat(sourceTobj.testObjectPrice) + parseFloat(sourceTobj.additionalFees[i].price * sourceTobj.additionalFees[i].count);
                sourceTobj.additionalFeePrice = (sourceTobj.additionalFeePrice || 0) + parseFloat(sourceTobj.additionalFees[i].price * sourceTobj.additionalFees[i].count);
            }
        }
        sourceTobj.initalTestObjectPrice = sourceTobj.testObjectPrice;

        testObjects.push(sourceTobj);

        // 添加一个字段grouped
        if(isGroup.length != 0){
            for(var i=0;i<testObjects.length;i++){
                var testParams = testObjects[i].testParams;
                var testParamsId = [];

                for(var x=0;x<testParams.length;x++){
                    testParamsId.push(testParams[x].testParamId);
                }

                for(var j=0;j<isGroup.length;j++){
                    var _flag = true;
                    var shareIds = isGroup[j];
                    for(var k=0;k<shareIds.length;k++){
                        if(testParamsId.indexOf(shareIds[k])==-1){
                            _flag = false;
                        }
                    }

                    if(_flag){
                        for(var y=0;y<testParams.length;y++){
                            if(shareIds.indexOf(testParams[y].testParamId) !== -1){
                                testParams[y].grouped = true;
                                testParams[y].groupIndex = j;
                            }
                        }
                    }
                }
            }
        }
    }
    else {
        // 根据最大数量，生成样品对象
        var sampleNum = TObject._calcMaxCount();
        // 处理样品参数，全部修改为1
        var testParams = sourceTobj.testParams;
        for (var j = 0; j < testParams.length; j++) {
            testParams[j].count = 1; // 自减
        }

        var additionalFees = 0;
        // 未计算附加费用，添加上附加费用
        if(sourceTobj.additionalFees && sourceTobj.additionalFees.length !=0 ){
            for(var i=0;i<sourceTobj.additionalFees.length;i++){
                additionalFees += parseFloat(sourceTobj.additionalFees[i].price * sourceTobj.additionalFees[i].count);
            }
        }

        // 循环生成样品
        //  for (var i = 0; i < sampleNum; i++) {
        //      testObjects.push(JSON.parse(JSON.stringify(sourceTobj)));
        //  }

        // 循环生成样品
        for (var i = 0; i < sampleNum; i++) {
            var _data = JSON.parse(JSON.stringify(sourceTobj));
            var testObjectPrice = 0;
            for(var j=0;j<_data.testParams.length;j++){
                testObjectPrice += _data.testParams[j].price || 0;
            }
            _data.testObjectPrice = testObjectPrice + additionalFees;
            _data.initalTestObjectPrice = _data.testObjectPrice;
            _data.additionalFeePrice = additionalFees;
            testObjects.push(_data);
        }

        //  判断是否有打包价并重新计算打包价格
        if(isGroup.length != 0){
            for(var i=0;i<testObjects.length;i++){
                var testParams = testObjects[i].testParams;
                var testParamsId = [];

                for(var x=0;x<testParams.length;x++){
                    testParamsId.push(testParams[x].testParamId);
                }

                for(var j=0;j<isGroup.length;j++){
                    var _flag = true;
                    var shareIds = isGroup[j];
                    for(var k=0;k<shareIds.length;k++){
                        if(testParamsId.indexOf(shareIds[k])==-1){
                            _flag = false;
                        }
                    }

                    if(_flag){
                        for(var y=0;y<testParams.length;y++){
                            if(shareIds.indexOf(testParams[y].testParamId) !== -1){
                                testParams[y].grouped = true;
                                testParams[y].groupIndex = j;
                                testObjects[i].testObjectPrice -= testParams[y].price;
                            }
                        }
                        testObjects[i].testObjectPrice += sharePrices[j];
                        testObjects[i].initalTestObjectPrice = testObjects[i].testObjectPrice;
                    }
                }
            }
        }
    }
    return testObjects;
}
/**
 * 是否根据计价数量生成样品对象
 * @return boolean
 * 20181227 - weiheng
 */
function isCreateTestSampleByParamNum() {

    var res = false;
    var testObjects = [];
    // 获取系统参数：是否根据计价数量生成样品对象
    var createSampleByParamNum = ajaxRequestSync('tSBusinessParamController.do?getBusinessParam', {
        'key': 'ACCEPT_SAMPLE_25'
    });
    if (createSampleByParamNum == 'Y') {
        res = true;
    }
    return res;
}

//打包检测对象
function Package_TestObject() {
    //存储数据
    TObject.LoadDataFromUI_TestParams();
    TObject.LoadDataFromUI_SamplingInfo();
    TObject.LoadDataFromUI_OtherInfos_standard();
    TObject.LoadDataFromUI_OtherInfos_others_L();
    TObject.LoadDataFromUI_OtherInfos_others_R();

    TObject.LoadDataFromUI_AddtionFees();
    TObject.LoadDataFromUI_Materials();
    TObject.LoadDataFromUI_Periods();

    //复制TObject对象。
    var testobject = {};
    //获取所有的对象列表，清洗不需要的方法
    var keys = Object.keys(TObject);
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        if (key == "fn")
            continue;

        var curValue = TObject[key];
        if (curValue instanceof Function) {
            continue;
        }
        // if (curValue instanceof Array) {
        //     continue;
        // }        
        testobject[key] = curValue;
    }
    //移除多余的缓存属性
    delete testobject["SELECTED_PARAM_IDS"];
    delete testobject["TestParamList"];
    delete testobject["WaitSelectParamList"];
    delete testobject["WaitTestOtherInfoList"];
    delete testobject["TEST_SAMPLE"];
    delete testobject["prototype"];
    // 去掉龄期为空数据
    for(var j=0;j<testobject.periods.length;j++) {
        var item = testobject.periods[j];
        if(!item.days && !item.formingDate && !item.mark && !item.periodCode){
            testobject.periods.splice(j, 1);
        }
    }

    // 增加pirces字段
    if(window._testParamsData){
        var priceArray = [];
        for(var i=0;i<window._testParamsData.length;i++){
            priceArray = priceArray.concat(window._testParamsData[i].testParams);
        }

        for(var i=0;i<testobject.testParams.length;i++){
            for(var j=0;j<priceArray.length;j++){
                if(testobject.testParams[i].testParamId === priceArray[j].id){
                    testobject.testParams[i].prices = priceArray[j].prices;
                }
            }
        }
    }

    return testobject;
}



/***
*   同步请求数据
*   20181227
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