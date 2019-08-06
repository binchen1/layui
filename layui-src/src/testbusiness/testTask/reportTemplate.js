var taskUdr;
$(function () {
    initVars();
    getUdrs();
    
    // 为分组模板绑定切换的方法
    $(".btn-4-template").on("click",function(){
    	var testObjectUseUdrId = this.getAttribute("data-key");
        openUdrTemplate(testObjectUseUdrId);
    });
});
//打印预览
function lookprint(){
	taskUdr = new UDR('udr');
	taskUdr.lookprint();
}
//打印
function print(){
	taskUdr = new UDR('udr');
	taskUdr.print();
}
function getUdrs() {
    var testObjectId = $('#testObjectId').val();
    var templateType = '3';
    var url = 'testObjectUseUdrController.do?getUdrByTemplateType';
    ajaxSubmitResponseJSON({
        url: url,
        data: {
            testObjectId: testObjectId,
            templateType: templateType,
            companyCode: $("#companyCode").val()
        },
        success: function (data) {
            if (data.success) {
                var rows = data.obj;
                if (!rows || rows.length == 0) {
                    return;
                }
                if (rows.length == 1) {
                    $('#myLayout').layout('remove', 'north');
                    openUdr(rows[0]);
                } else {
                	var htm = '';
                    for (var i = 0; i < rows.length; i++) {
                        htm += '<a class="easyui-linkbutton btn-4-template" style="margin-right: 5px;" data-key="' 
                        	+ rows[i].id + '">模板' + (i + 1) + '</a>';
                    }
                    $('#templates').html(htm);
                    $('.btn-4-template').linkbutton();
                    openUdr(rows[0]);
                }
            }
        }
    });

    function openUdr(row) {
    	openUdrTemplate(row.id);
    }
}

function openUdrTemplate(testObjectUseUdrId) {
    var url = 'testObjectUseUdrController.do?getUdrData';
    var testTaskId = $('#testTaskId').val();
    ajaxSubmitResponseJSON({
        url: url,
        data: {
            testTaskId: testTaskId,
            testObjectUseUdrId: testObjectUseUdrId,
            companyCode: $("#companyCode").val()
        },
        success: function (data) {
            taskUdr = new UDR('udr');
            taskUdr.initUdr(data.obj);
        }
    });
}

function initVars() {
    var testTaskId = getUrlParam('testTaskId');
    testTaskId = testTaskId ? testTaskId : '';
    $('#testTaskId').val(testTaskId);

    var testObjectId = getUrlParam('testObjectId');
    testObjectId = testObjectId ? testObjectId : '';
    $('#testObjectId').val(testObjectId);
    
    // 立即打印：1.立即将UDR报告打印为pdf
    var printNow = getUrlParam('printNow');
    $('#printNow').val(printNow);
    // 报告ID
    var reportId = getUrlParam('reportId');
    $('#reportId').val(reportId);
    var attId = getUrlParam('attId');
    $('#attId').val(attId);
    
    var companyCode = getUrlParam('companyCode');
    $('#companyCode').val(companyCode);
}

function getUrlParam(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    //构造一个含有目标参数的正则表达式对象
    var r = window.location.search.substr(1).match(reg);
    //匹配目标参数
    if (r) {
        return decodeURI(r[2]);
    }
    return '';
}