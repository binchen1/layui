function feeObj (){};

/**
 * 重新获取总费用显示    
 * 20181226 - weiheng
 */
feeObj.prototype.getTotalFee = function () {
    var total = 0.0;
    $("#receiveTestObjects").find("td[billingItem='1']").each(function () {
        var fee1 = $(this).text();
        total += parseFloat(fee1);
    });
    $("#feeTotal").val(total);
    $('#manualFeeTotal').val(total);
    $('#sumFee').text(total + " 元");
};

/**
 * 通过合同重新计算收样参数的价格，并渲染到样品列表
 * 20190104 - weiheng
 */
feeObj.prototype.recalculateTestParamPriceByContract = function () {
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
                fee.getTotalFee(); // 重新计费
            }
        }
    });
}
/**
 * 初始化委托费用的显示
 * 20190102 - weiheng
 */
feeObj.prototype.initTotalFee = function () {
    var fee1 = $('#manualFeeTotal').val();
    $("#feeTotal").val(fee1);
    $('#sumFee').text(fee1 + " 元");
    if (fee1 && parseInt(fee1) != 0) { // 如果委托费用不为0，则显示费用信息
        $("#fee-box").css("display", "block");
    }

    var contractId = $("#contractId").val();
    if (contractId != "") {
        $("#chargeByContract").attr("checked", "checked");
        $("#chargeContract, #chargeContractSelect").css("display", "inline-block");
    }
}

feeObj.prototype.FeesOnChange = function (obj) {
    //取得原来的值，再加上他
    var current = $(obj).val();
    $('#manualFeeTotal').val(current);
}

feeObj.prototype.calcTestFees = function (fee) {
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
};

/**
 * 获取计费合同信息
 * 20190103 - weiheng
 */
feeObj.prototype.getUseableContract = function () {
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
};

feeObj.prototype.getTestObjectFees = function (testObject) {
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

/***计费方式 选择合同 */
feeObj.prototype.feeContract = function () {
    var defaultId = $('#fee-box-middle input').val()
    var openUrl = 'consignController.do?goSelectChargeContract&defaultId=' + defaultId;
    layerOpenFun(openUrl, '选择合同', ['80%', '80%'], ['确定', '取消'], 'feeContractCallback', 'openCallback')
}

//检查信用额度是否够用
feeObj.prototype.checkCreditLine = function () {
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

window.fee = new feeObj();
