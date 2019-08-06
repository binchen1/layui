$(function(){
	initDataGrid();
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
function initDataGrid() {
    dataGrid = $('#dataGrid').datagrid({
        url: 'testObjectController.do?referConsignedSampleDatagrid',
        pagination: true,
        toolbar: '.toolbar',
        fit: true,
        sortName: 'createDate',
        sortOrder: 'desc',
        singleSelect:false,
        fitColumns:true,
        rownumbers : true,
        scrollbarSize:0,
        columns: [[
            {title: "ID", field: "id", checkbox: true}, 
            {title: "样品ID", field: "testObjectId",hidden : true}, //只有引用样品 ， 和要做试验的样品才有，只是单纯的录入，不做试验的那种没有ID
            {title: "委托ID", field: "consignId",hidden : true}, //应用的样品才有
            {title: "委托编号", field: "consignCode"}, //应用的样品才有
            {title: "样品编号", field: "testObjectCode"},
            {title: "meta", field: "meta",hidden : true},
            //==================下面的，全是冗余字段==========================
            {title: "样品名称", field: "testSampleDisplayName"},
            {title: "试验参数", field: "testObjectParams"},
            {title: "规格型号", field: "standard"},
            {title: "试样数量", field: "sampleNum"},
           // {title: "代表批量", field: "dbpl"},
            {title: "生产厂家", field: "sccj"},
            {title: "生产产地", field: "sccd"},
            {title: "生产日期", field: "scrq"},
            {title: "出厂日期", field: "ccrq"},
            {title: "批号", field: "ph"},
            {title: "样品描述", field: "remark"},
            {title: '是否做试验', field: 'isCompletedTest', align: 'center', formatter: oneZero2CN} //如果不要求做试验，则勾选
          //是否需要做试验，复选框
        ]],
        detailFormatter: function (rowIndex, rowData) {
           
        },
        onLoadSuccess: function () {
            
        },
        //双击事件
        onDblClickRow: function (index, row) {  
        
        	
        },
        onClickRow:function(index,row){
        	
        }
    });
}
function oneZero2CN(value, row) {
    return '<input type="checkbox" ' + (value == 1 ? 'checked' : '') + ' data-id="' + row.id + '" disabled="disabled">';
}
function reloadDataGrid(goFirstPage) {
    var queryParams = $('.search-box form').serializeJSON();
    if (goFirstPage) {
        /*从第一页开始显示*/
        dataGrid.datagrid('load', queryParams);
    } else {
        /*停留在当前页面*/
        dataGrid.datagrid('reload', queryParams);
    }
}

function buildReferConsignedSample(){
	var arrData=[];
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


