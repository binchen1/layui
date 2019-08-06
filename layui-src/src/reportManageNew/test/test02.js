/*!
 * testobject
 * 本文件用于加载样品属性信息
 * 包括：通用样品辅助信息、取样信息、样品特殊属性信息、规格型号信息 * 
 */
//规格型号的SystemFields
var standardFields = ["型号", "规格", "等级", "标号"];
//需要隐藏的字段（由规格型号 和 通用的 代表批量 和 试验数量组成）
var needHideFields = ["型号", "规格", "等级", "标号", "代表批量", "试样数量"];
//标准样品字段，左侧固定的字段
var standSampleFields = ["delegatesNum", "description", "part", "projectPartAndUse", "remark", "sampleNum"];

//上次加载的检测项目IDS   用于减少服务器请求。
var lastTestItemIDS_require = [];
var lastTestItemIDS_loadOther = [];
var lastTestItemIDS_buildOther = [];

function GetSystemFieldCtrName(systemFieldName) {
    switch (systemFieldName) {
        case "型号":
            return "model";
            break;
        case "规格":
            return "specification";
            break;
        case "等级":
            return "grade";
            break;
        case "标号":
            return "label";
            break;
        case "代表批量":
            return "delegatesNum";
            break;
        case "试样数量":
            return "sampleNum";
            break;
        default:
            return "";
            break;
    }
}
(function (window, undefined) {
    var testobject = {};

    var dfoption = {
        //样品ID
        TEST_SAMPLE_ID: '',
        //大类ID
        BIG_CATEGORY_ID: '',
        //当前样品对象
        TEST_SAMPLE: '',
        SELECTED_PARAM_IDS: [],

        //样品ID
        testSampleId: '',
        velName: '',
        //样品名称
        testSampleName: '',


        //样品辅助信息：代表数量
        delegatesNum: '',
        //样品辅助信息：样品描述
        description: '',
        //样品辅助信息：样品层次名称
        level: '',
        //样品辅助信息：说明信息
        mark: '',
        //样品辅助信息:检测部位
        part: '',
        //样品辅助信息：工程部位/用途
        projectPartAndUse: '',
        //样品辅助信息：备注
        remark: '',
        //样品辅助信息：样品数量
        sampleNum: '',


        //规格型号***组合值
        standard: '',
        //规格型号-规格
        specification: '',
        //规格型号-等级
        grade: '',
        //规格型号-名称        
        label: '',
        //规格型号：类型
        model: '',

        //取样信息：取样人
        samplePerson: '',
        //取样信息：取样人证书号
        samplePersonNumber: '',
        //取样信息：取样单位
        samplingCompany: '',
        //取样信息：取样时间
        samplingDate: '',
        //取样信息：取样地点
        samplingPlace: '',

        //样品辅助信息：样品名称
        testSampleDisplayName: '',

        //存储结构
        additionalFees: [],
        //已经选择的参数列表
        testParams: [],
        //属性信息
        otherInfos: [],
        //关联材料信息
        otherMaterials: [],
        //龄期信息
        periods: [],

        //待选择的全部检测参数列表
        TestParamList: [],
        //数据对象内容缓存
        WaitSelectParamList: [],
        //可选择的检测参数的 辅助信息列表
        WaitTestOtherInfoList: [],
    };
    $.extend(testobject, dfoption);
    testobject.fn = testobject.prototype = {
        constructor: testobject,
        init: function () { }
    };

    testobject.fn.init.prototype = testobject.fn;
    $.extend(testobject, {
        initFromSample: function (sampleinfo, completed) {
            //sampleinfo对象的结构
            // res.BIG_CATEGORY_ID = BIG_CATEGORY_ID;
            // res.TEST_SAMPLE_ID = TEST_SAMPLE_ID;
            // res.Sample = currentSample;
            // res.Sample.SampleLevelStr = getSampleLevel();
            // res.Sample.ParentSampleList = getSampleList();
            this.testSampleId = sampleinfo.TEST_SAMPLE_ID;
            var smpobj = sampleinfo.Sample;
            //样品名称
            this.testSampleDisplayName = smpobj.attributes.displayName;
            //样品描述
            this.description = smpobj.attributes.description;
            //记录样品对象            
            this.TEST_SAMPLE = smpobj;
            this.TEST_SAMPLE_ID = sampleinfo.TEST_SAMPLE_ID;
            this.BIG_CATEGORY_ID = sampleinfo.BIG_CATEGORY_ID;
            this.level = smpobj.SampleLevelStr;

            this.WaitSelectParamList = [];
            this.WaitTestOtherInfoList = [];
            this.SELECTED_PARAM_IDS = [];

            lastTestItemIDS_require = [];
            lastTestItemIDS_loadOther = [];
            lastTestItemIDS_buildOther = [];

            this.initiUI(completed);

            //从服务器获取默认值
            var uitlocalS = renderContent('consignUnit-project-sampleSender')

            if (uitlocalS) {
                this._loadSamplingInfo(uitlocalS.consignUnit.id, function (data) {
                    $.extend(testobject, data);
                    testobject.init_BuildSamplingUI();
                });
            }
        },
        initFromSession: function (loadedData) {
            var objectString = sessionStorage.getItem(param.testobjectid);
            if (!objectString) { // 编辑或查看详情
                console.log("xxx");
                if (loadedData) {
                    loadedData(false);
                }
                return;
            }
            //从SessionStaorage缓存中加载检测对象
            var sobj = eval('(' + objectString + ')');

            //合并对象
            $.extend(true, this, sobj);

            console.log(sobj);

            //构建对象属性
            //如果从Session加载， 则默认从Session中加载所有的参数 作为循环检测的内容
            //不默认加载
            this.TestParamList = sobj.testParams;

            //加载样品ID
            this.TEST_SAMPLE_ID = sobj.testSampleId;

            //获取选中的参数ID
            this.SELECTED_PARAM_IDS = [];
            for (let index = 0; index < this.TestParamList.length; index++) {
                const element = this.TestParamList[index];
                this.SELECTED_PARAM_IDS.push(element.testParamId);
            }

            // //如果对象存在， 则 直接返回
            // if (!!this.BIG_CATEGORY_ID) {
            //     if (loadedData) {
            //         loadedData(true);
            //     }
            // }

            this._loadTestSample_LoadBIG_CATEGORYID(function () {
                testobject.initiUI();
                if (loadedData) {
                    loadedData(true);
                }
            });
        },
        initiUI: function (completed) {
            if (!completed) {
                completed = {};
                completed.ParamLoaded = undefined;
            }
            //加载样品名称
            var sampleName = this.testSampleDisplayName + this.level;
            $("#testSampleName").html(sampleName);


            //加载检测参数列表
            this._loadTestParamByBCSampleID(function (data) {
                testobject.WaitSelectParamList = data;
                //设置选中数量， 设置 未选中的数量
                testobject.init_BuidTestParamUI()
                //完成事件
                if (completed.ParamLoaded) {
                    completed.ParamLoaded(data);
                };
            });

            //设置取样信息
            this.init_BuildSamplingUI();

            //加载样品辅助信息
            this.init_BuildTestOTherInfo();

            //加载附加费用数据
            this._loadAddtionalFee(function (data) {
                testobject.init_BuildAddtionalFee(data);
            });

            //加载引用的原材料
            this.init_BuildRefMaterial();

            //加载龄期信息
            this.init_BuildPeriods();

            //加载收样要求
            this._loadRequirements(this.init_BuildRequirements);
        },
        //构建检测参数部分UI
        init_BuidTestParamUI: function (tableID) {
            if (!tableID) {
                tableID = "#params";
            }
            var data = this.WaitSelectParamList.concat();
            //传递进来的参数是 待选择的参数列表
            if (!data) {
                //没有可用的检测参数
                //直接显示缓存的内容
                data = {
                    sharePrice: null,
                    sharePriceIdentity: null,
                    testParams: this.TestParamList
                }
            }

            var html = "";
            //返回的结果是分组数据
            //循环分组，构建UI
            for (var i = 0; i < data.length; i++) {
                //分组对象
                var row = data[i];

                var shareIdentity = row.sharePriceIdentity;

                html += '<tr class="group' + i + ' title"><td colspan="9"><div>';
                if (!!shareIdentity) {
                    html += '<strong>以下试验参数共用单价（￥<span id="sharePrice">' + row.sharePrice + '</span>） - ' + shareIdentity + '</strong>';
                } else {
                    html += '<strong>非共用单价试验参数</strong>';
                }

                var params = row.testParams;


                var useGrounpPrice = false;
                var maxCount = 0;
                var sumAmount = 0;
                for (var j = 0; j < params.length; j++) {
                    var param = params[j];
                    //设置分组序号
                    param.groupIndex = i;

                    if (!param.paramPriceComponents) {
                        param.paramPriceComponents = this.init_BuidTestParamUI_PriceComp(param);
                    }
                    param.basisIds = "";
                    param.standardIds = "";
                    param.displayBasis = "";
                    param.displayStandards = "";
                    var curParam = this.TestParamList.filter(function (k) { return k.testParamId == param.id; });
                    if (curParam && curParam.length > 0) {
                        $.extend(param, curParam[0]);
                        param.displayBasis = param.basis.replace(",", "</br>");
                        param.displayStandards = param.standard.replace(",", "</br>");
                    } else {
                        //如果不是查看或编辑, 则使用系统级的默认规程
                        var useStandards = params[j].useStandards;
                        for (var k = 0; k < useStandards.length; k++) {
                            var cStand = useStandards[k];
                            if (cStand.baseStandardUseType == '1'
                                || cStand.baseStandardUseType == '3') {
                                if (!!param.displayStandards) {
                                    param.displayBasis += "<br/>";
                                    param.basisIds += ",";
                                }
                                param.displayBasis += useStandards[k].baseStandardName + "(" + useStandards[k].publishCode + ")";
                                param.basisIds += useStandards[k].baseStandardId;
                            }
                            if (cStand.baseStandardUseType == '2'
                                || cStand.baseStandardUseType == '3') {
                                if (!!param.displayStandards) {
                                    param.displayStandards += "<br/>";
                                    param.standardIds += ",";
                                }
                                param.displayStandards += useStandards[k].baseStandardName + "(" + useStandards[k].publishCode + ")";
                                param.standardIds += useStandards[k].baseStandardId;
                            }
                        }
                    }

                    //获取是否选中                    
                    if (this.SELECTED_PARAM_IDS.indexOf(param.id) >= 0) {
                        param.checked = "checked";
                        param.count = param.count || 1;
                        useGrounpPrice = true;
                    }
                    else {
                        param.checked = "";
                        param.count = 0;
                    }
                    if (maxCount < param.count) { maxCount = param.count; }
                    //计算单项金额
                    param.paramAmount = parseInt(param.count) * parseFloat(param.price) || 0;
                    sumAmount += parseFloat(param.paramAmount);
                }

                //计算是否启用分组收费
                html += '<span style="float: right"><strong>本组费用合计：￥<span class="group-fees">';
                if (!!shareIdentity) {
                    html += maxCount * row.sharePrice;
                } else {
                    html += sumAmount.toString();
                }
                html += '</span></strong></span>';

                html += '</div></td></tr>';
                var thtml = template('testParamGridTr', { items: params });
                html += thtml;
            }
            this.TestParamList = [];
            for (let index = 0; index < data.length; index++) {
                const element = data[index];
                //压栈
                this.TestParamList = this.TestParamList.concat(element.testParams);
            }
            //this.TestParamList.push(params);
            //设置tbody的内容。
            $(tableID).find('tbody').html(html);
        },
        /**
         *构建计数数量微调器
         */
        init_BuidTestParamUI_PriceComp: function (item) {
            prices = item.prices;
            var htm = '';

            if (!item.price && prices.length > 0) {
                item.price = prices[0].price;
            }
            htm += '<select style=" border: 0;width:100%" class="selectChildPrice" data-id="' + item.id + '">';
            for (var i = 0; i < prices.length; i++) {
                var priceO = prices[i];
                if (priceO.type === '1' || priceO.type === '2') {
                    htm += '<option value="' + priceO.id + '"';
                    htm += ' data-priceValue="' + priceO.price + '"';
                    htm += ' data-price="' + priceO.type + '"';
                    htm += ' data-sample="' + (priceO.testSampleId ? priceO.testSampleId : '') + '"';
                    htm += ' class="price' + priceO.type + '"';
                    htm += '>';
                    htm += priceO.price;
                    htm += '</option>';
                }
            }
            if (prices.length == 0) {
                htm += '<option value="" ';
                htm += ' data-price=""';
                htm += ' data-sample=""';
                htm += ' class="price"';
                htm += ' style="display:none;"';
                htm += ' >';
                htm += 0
                htm += '</option>';
            }
            htm += '</select>';
            return htm;
        },
        //构建取样信息部分UI
        init_BuildSamplingUI: function () {
            $('#samplingPlace').val(this.samplingPlace)
            $('#samplingDate').val(this.samplingDate)
            $('#samplingCompany').val(this.samplingCompany)
            $('#samplePerson').val(this.samplePerson)
            $('#samplePersonNumber').val(this.samplePersonNumber)
        },
        //构建样品信息区域左侧UI
        init_BuildTestOTherInfo_Left: function () {
            var container = $('#testObjectAttributesL'); //收样辅组信息
            var attributes = container.find('tbody tr input');

            for (let i = 0; i < attributes.length; i++) {
                const elctr = attributes[i];
                if (this.hasOwnProperty($(elctr).attr("id"))) {
                    $(elctr).val(this[$(elctr).attr("id")]);
                }
            }
            //$('#standard-cont').text($('#standard').val());
        },
        //构建样品信息区域右侧UI
        init_BuildTestOtherInfo_Right: function () {
            $("#testObjectAttributesR tr").remove();
            //获取当前对象的属性 进行展示
            var items = testobject.otherInfos ? testobject.otherInfos : [];

            //循环构建控件
            for (let index = 0; index < items.length; index++) {
                const el = items[index];
                var tr = $("<tr>");
                tr.attr("class", "dy");
                //如果是规格型号字段，则隐藏，因为已经固定在左侧显示了。
                if (needHideFields.indexOf(el.systemFieldName) >= 0) {
                    tr.hide();
                }
                //默认隐藏规格型号相关字段
                var htm = '<td class="td-label"><label for="' + el.attributeId + '">' + el.name + '：</label></td>';
                var curCtr = {};
                switch (el.dataType) {
                    //时间类型
                    case 2:
                        curCtr = $("<input  type='text'>");
                        curCtr.attr("onclick", "WdatePicker({dateFmt:\'yyyy-MM-dd\'})");
                        curCtr.attr("class", "Wdate");
                        break;
                    //下拉框类型
                    case 5:
                        curCtr = $("<select>");
                        var values = el.listValue.split(';');
                        for (var k = 0; k < values.length; k++) {
                            var ophtml = '<option value="' + values[k] + '"' + (values[k] == el.value ? "selected" : "") + '>' + values[k] + '</option>';
                            curCtr.append($(ophtml));
                        }
                        break;
                    //输入框类型
                    default:
                        curCtr = $("<input type='text'>");
                        if (el.isDefaultValue && el.inputHistory && el.inputHistory[0]) {
                            curCtr.val(el.inputHistory[0]);
                        }
                        if (el.inputHistory && el.inputHistory.length > 0) {
                            curCtr.attr("list", "inforList" + el.id);
                        }
                        break;
                }
                curCtr.attr("onblur", "onTestOtherInfo(this)");
                curCtr.attr("id", el.id);
                curCtr.attr("name", el.id);
                curCtr.attr("systemFieldName", el.systemFieldName);
                curCtr.addClass("inputCtr");
                if (el.value) {
                    $(curCtr).attr("value", el.value);
                }
                htm += '<td class="value">' + curCtr.prop("outerHTML") + '</td></tr>'

                $(tr).html(htm);
                $(tr).data("data", el);
                $("#testObjectAttributesR").append(tr);
            }
        },
        init_BuildTestOTherInfo: function () {
            this._loadTestOtherInfo(function () {
                //根据当前选中的检测项目进行处理
                var itemIds = [];
                for (let i = 0; i < testobject.TestParamList.length; i++) {
                    const el = testobject.TestParamList[i];
                    if (testobject.SELECTED_PARAM_IDS.indexOf(el.id) >= 0) {
                        var itemid = el.testItemId;
                        if ($.inArray(itemid, itemIds) < 0) {
                            itemIds.push(itemid);
                        }
                    }
                }

                console.log(lastTestItemIDS_buildOther);
                console.log(itemIds);

                if (lastTestItemIDS_buildOther.sort().toString() == itemIds.sort().toString()) {
                    return;
                }


                lastTestItemIDS_buildOther = itemIds;
                var others = [];
                //获取当前对象的属性 进行展示
                var oldItems = testobject.otherInfos ? testobject.otherInfos : [];
                for (let i = 0; i < testobject.WaitTestOtherInfoList.length; i++) {
                    const element = testobject.WaitTestOtherInfoList[i];
                    if (itemIds.indexOf(element.parentID) >= 0) {
                        //从之前的数据里  获取默认值
                        //根据ID获取上次数据
                        var fitem = oldItems.filter(function (item) {
                            return item.attributeId == element.id;
                        })
                        if (fitem && fitem.length > 0) {
                            $.extend(element, fitem[0]);
                        } else {
                            //根据系统字段名称  获取上次数据
                            var snitems = oldItems.filter(function (item) {
                                return item.systemFieldName && item.systemFieldName != '不定义' && item.systemFieldName == element.systemFieldName;
                            });

                            if (snitems && snitems.length > 0) {
                                //设置值
                                element.value = snitems[0].value;
                            }
                        }

                        others.push(element);
                    }
                }

                //排序
                others.sort(function (a, b) {
                    return a.orderNo > b.orderNo;
                });

                //缓存到列表
                testobject.otherInfos = others;
                testobject.init_BuildTestOTherInfo_Left();
                testobject.init_BuildTestOtherInfo_Right();
            });
        },
        //构建附加费用UI
        init_BuildAddtionalFee: function (serverList) {
            // 如果从服务器获取， 则 合并对象 列表
            if (serverList) {
                for (let j = 0; j < serverList.length; j++) {
                    const selem = serverList[j];
                    for (let index = 0; index < this.additionalFees.length; index++) {
                        const element = this.additionalFees[index];
                        //如果两个元素的ID相同，则赋值给这个元素
                        if (selem.id == element.id) {
                            selem.checked = "checked";
                            selem.count = element.count;
                            break;
                        }
                    }
                }
                this.additionalFees = serverList;
            }

            var thtml = template('addtionFeeDataGridRowTemplate', { items: this.additionalFees });
            $('#additionalFees tbody').html(thtml);
        },
        //构建关联检测样品信息区域UI
        init_BuildRefMaterial: function () {
            var html = template('materialDataGridRowTemplate', { items: this.otherMaterials });
            //缓存数据            
            $("#referConsignedSampleDataDataGrid").find("tbody").html(html);
        },
        //构建龄期信息区域UI
        init_BuildPeriods: function () {
            //获取龄期信息 并显示
            var html = template('periodsDataGridRowTemplate', { items: this.periods });
            //缓存数据            
            $("#periods").find("tbody").html(html);
        },
        init_BuildRequirements: function (rows) {
            if (!rows || rows.length == 0) {
                var htmstr = '<tr ><td colspan="2"><span>满足正常收样要求即可</span></td></tr>';
                $("#requirements").find("tbody").html(htmstr);
                return;
            }
            var htm = "";
            for (let index = 0; index < rows.length; index++) {
                const element = rows[index];
                var htstr = "";
                if (!element.text)
                    continue;
                //分割样品要求字符串为数组，并进行排序和去重，
                var valueAry = $.unique(element.text.split('\r'));
                for (var i = 0; i < valueAry.length; i++) {
                    htstr += valueAry[i] + '<br>';
                }
                htm += '<tr><td class="td-label">' + element.title + '</td><td class="value">' + htstr + '</td></tr>';
            }

            $("#requirements").find("tbody").html(htm);
        },
        _loadTestSample_LoadBIG_CATEGORYID: function (callback) {
            var paramId = this.TestParamList[0].testParamId;
            var url = 'bigCategoryController.do?getBigCategoryByTestParam';
            url += '&testParamId=' + paramId;
            ajaxSubmitResponseJSON({
                url: url,
                success: function (data) {
                    testobject.BIG_CATEGORY_ID = data.id;
                    if (callback) {
                        callback();
                    }
                }
            });
        },
        _loadTestParamByBCSampleID: function (ParamLoaded) {
            ajaxSubmitResponseJSON({
                url: 'testParamController.do?getTestParamByTestSample',
                data: {
                    "sampleId": this.TEST_SAMPLE_ID,
                    'bigCategoryId': this.BIG_CATEGORY_ID
                },
                success: function (data) {
                    //获取返回的params
                    if (ParamLoaded) {
                        ParamLoaded(data);
                    }
                }
            });
        },
        _loadTestOtherInfo: function (testtherinfoLoaded) {
            if (this.SELECTED_PARAM_IDS.length == 0) {
                return;
            }
            if (this.WaitTestOtherInfoList.length > 0) {
                if (testtherinfoLoaded) {
                    testtherinfoLoaded();
                }
                return;
            }
            var sampleID = this.TEST_SAMPLE_ID;
            var itemIds = [];

            //获取所有参数的属性值
            for (let i = 0; i < this.TestParamList.length; i++) {
                const el = this.TestParamList[i];
                var itemid = el.testItemId;
                if (itemIds.indexOf(itemid) < 0) {
                    itemIds.push(itemid);
                }
            }

            if (lastTestItemIDS_loadOther.sort().toString() == itemIds.sort().toString()) {
                if (testtherinfoLoaded) {
                    testtherinfoLoaded();
                }
                return;
            }

            lastTestItemIDS_loadOther = itemIds;

            if (itemIds.length == 0) {
                return;
            }


            ajaxSubmitResponseJSON({
                url: 'testParamController.do?getTestOtherInfo',
                data: {
                    testItemIds: itemIds.join(','),
                    sampleId: sampleID
                },
                success: function (datas) {
                    testobject.WaitTestOtherInfoList = datas.sort(compare("orderNo"));

                    if (testtherinfoLoaded) {
                        testtherinfoLoaded();
                    }
                }
            });
        },
        _loadSamplingInfo: function (consignUnitID, samplingInfoLoaded) {
            $.ajax({
                url: 'testSampleController.do?getLastSamplingByConsignUnit',
                data: {
                    cosnignUnitId: consignUnitID
                },
                type: 'POST',
                dataType: 'json',
                success: function (res) {

                    if (res.success && res.obj.length > 0) {
                        // 取样地点 取样时间： 取样单位：取样人：取样人证号：
                        if (samplingInfoLoaded)
                            samplingInfoLoaded(res.obj[0]);
                    }
                }
            })
        },
        _loadAddtionalFee: function (loadeData) {
            ajaxSubmitResponseJSON({
                url: 'additionalFeeController.do?getAdditionalFees',
                data: {
                    testParamIds: testobject.SELECTED_PARAM_IDS.join(',')
                },
                success: function (data) {
                    if (loadeData) {
                        loadeData(data.rows);
                    }
                }
            });
        },
        _loadRequirements: function (loadedRequire) {

            //根据检测项目进行筛选
            var itemIds = [];
            for (let i = 0; i < testobject.TestParamList.length; i++) {
                const el = testobject.TestParamList[i];
                if (testobject.SELECTED_PARAM_IDS.indexOf(el.id) >= 0) {
                    var itemid = el.testItemId;
                    if ($.inArray(itemid, itemIds) < 0) {
                        itemIds.push(itemid);
                    }
                }
            }


            if (lastTestItemIDS_require.sort().toString() == itemIds.sort().toString()) {
                return;
            }

            lastTestItemIDS_require = itemIds;

            var paramIds = this.SELECTED_PARAM_IDS;

            if (itemIds.length == 0 && paramIds.length == 0) {
                loadedRequire(null);
                return;
            }
            var url = 'testParamController.do?getRequirements';
            ajaxSubmitResponseJSON({
                url: url,
                data: {
                    'testItemIds': itemIds.join(','),
                    'testParamIds': paramIds.join(',')
                },
                success: function (data) {
                    //输出收样的要求
                    loadedRequire(data.rows);
                }
            });


        }
    });
    //为 testobject  扩展属性，用于各类动作操作
    //无需状态的刷新操作，主要是：费用计算，
    $.extend(testobject, {
        _calcFee: function () {
            //计算单个合计
            //计算费用
            //重新构建UI

        },
        _calcPeriodCount: function () {
            var maxCount = this._calcMaxCount();
            var nowCount = this.periods.length
            if (maxCount > nowCount) {
                for (let i = nowCount; i < maxCount; i++) {
                    //添加一个空对象
                    this.periods.push({});
                }
            }
            //初始化界面
            this.init_BuildPeriods();
        },
        _calcMaxCount: function () {
            var maxCount = 1;
            for (let index = 0; index < this.TestParamList.length; index++) {
                const item = this.TestParamList[index];
                if (item.count > maxCount)
                    maxCount = item.count;
            }
            return maxCount;
        }
    });

    //TestOtherInfo相关
    $.extend(testobject, {
        LoadDataFromUI_OtherInfos_standard: function () {
            //规格型号***组合值
            this.standard = $("#standard").val();
            //规格型号-规格
            this.specification = $("#standard-specification").val();
            //规格型号-等级
            this.grade = $("#standard-grade").val();
            //规格型号-名称        
            this.label = $("#standard-label").val();
            //规格型号：类型
            this.model = $("#standard-model").val();
        },
        LoadDataFromUI_OtherInfos_others_L: function (ctr) { //这个是左侧的数据

            if (ctr) {
                var propertyName = $(ctr).attr("id");
                if (this.hasOwnProperty(propertyName)) {
                    this[propertyName] = $(ctr).val();
                }
                return;
            }

            var fileArr = standSampleFields;

            //标准样品字段 直接写入testobject属性
            for (let index = 0; index < fileArr.length; index++) {
                const element = fileArr[index];
                var curUI = $("#testObjectAttributesL").find("#" + element);
                if (curUI && this.hasOwnProperty(element)) {
                    this[element] = curUI.val() || "";
                }
            }
        },
        LoadDataFromUI_OtherInfos_others_R: function (loadCtr) {
            //右侧属性字段  写入otherinfos
            //获取属性 填写进入otherinfos
            if (loadCtr) {
                var ctrID = $(loadCtr).attr("id");

                var kitem = this.otherInfos.filter(function (a) {
                    return a.id == ctrID;
                });
                if (kitem && kitem.length > 0) {
                    kitem[0].value = $(loadCtr).val();
                }
                return;
            }

            var citems = $("#testObjectAttributesR").find(".inputCtr");

            for (let j = 0; j < this.otherInfos.length; j++) {
                const otitem = this.otherInfos[j];
                for (let k = 0; k < citems.length; k++) {
                    const fitem = $(citems[k]);
                    if (fitem.attr("id") == otitem.id) {

                        otitem.value = fitem.val();
                        var systemFieldName = fitem.attr("systemFieldName");
                        //如果是隐藏字段，但不是规格型号字段，则从左侧读取写入
                        if (needHideFields.indexOf(systemFieldName) >= 0
                            && standardFields.indexOf(systemFieldName) < 0) {
                            var fName = GetSystemFieldCtrName(systemFieldName);
                            if (this.hasOwnProperty(fName))
                                otitem.value = this[fName];
                        }
                        break;
                    }
                }
            }
        }
    });

    //参数相关
    $.extend(testobject, {
        _selectedParamChanged: function () {
            //构建UI
            this.init_BuidTestParamUI();
            //计算费用
            this._calcFee();
            //计算龄期试验
            this._calcPeriodCount();
            //加载收样要求
            this._loadRequirements(this.init_BuildRequirements);
            //构建新的 收样辅助信息
            this.init_BuildTestOTherInfo();
        },
        RefreshParamStandardFromServer: function () {
            //删除规程设置
            this.TestParamList = [];
            this._loadTestParamByBCSampleID(function (data) {
                testobject.WaitSelectParamList = data;
                testobject.init_BuidTestParamUI();
            });
        },
        SetParamAllChecked: function (checked) {
            var ids = [];
            for (let index = 0; index < this.TestParamList.length; index++) {
                const element = this.TestParamList[index];
                ids.push(element.id);
            }

            this.SetParamChecked(ids, checked);
        },
        //选中参数
        SetParamChecked: function (paramIDS, checked, rebuildUI) {
            if (checked == undefined || checked == null) {
                checked = true;
            }
            //将非数组 转换为数组
            if (!Array.isArray(paramIDS)) {
                var p = [];
                p.push(paramIDS);
                paramIDS = p;
            }
            for (let index = 0; index < paramIDS.length; index++) {
                const element = paramIDS[index];
                var sindex = this.SELECTED_PARAM_IDS.indexOf(element);
                //添加选中
                if (sindex < 0 && (!!checked)) {
                    this.SELECTED_PARAM_IDS.push(element);
                }
                //取消选中
                if (sindex >= 0 && (!checked)) {
                    this.SELECTED_PARAM_IDS.splice(sindex, 1);
                }
            }

            //选中参数
            for (let i = 0; i < this.TestParamList.length; i++) {
                const item = this.TestParamList[i];
                if (this.SELECTED_PARAM_IDS.indexOf(item.id) >= 0) {
                    if (item.count <= 0) {
                        item.count = 1;
                    }
                    item.checked = "checked";
                } else {
                    item.checked = "";
                    item.count = 0;
                }
            }

            if (rebuildUI || true) {
                this._selectedParamChanged();
            }
        },
        //设置计价数量
        SetParamCount: function (paramID, count) {

            if (!count || count < 0) {
                count = 0;
            }
            if (count == 0) {
                //移除选中状态                        
                this.SetParamChecked(paramID, false, false);
            } else {
                this.SetParamChecked(paramID, true, false);
            }

            //选中参数 
            for (let index = 0; index < this.TestParamList.length; index++) {
                const item = this.TestParamList[index];
                if (item.id == paramID) {
                    item.count = count;
                    break;
                }
            }
            this._selectedParamChanged();
        },
        SetParamPrice: function (paramID, price) {
            //选中参数 
            for (let index = 0; index < TestParamList.length; index++) {
                const item = TestParamList[index];
                if (item.paramID == paramID) {
                    //设置价格
                    item.price = price;
                    if (item.count == 0) {
                        //选中参数
                        this.SetParamChecked(paramID, true, false);
                    }
                    break;
                }
            }
            this._selectedParamChanged();
        }
    });

    //附加费用
    $.extend(testobject, {
        Fee_Refresh: function () {
            //加载附加费用数据
            this._loadAddtionalFee(function (data) {
                testobject.init_BuildAddtionalFee(data);
            });
        },
        Fee_Del: function (delIds) {
            if (!delIds) {
                return;
            }
            var itemlist = this.additionalFees;
            //倒叙循环删除
            for (let index = itemlist.length - 1; index >= 0; index--) {
                if (delIds.indexOf("feeTR" + index) >= 0) {
                    itemlist.splice(index, 1);
                }
            }
            this.additionalFees = itemlist;
            //刷新UI
            this.init_BuildAddtionalFee();
        }
    });
    //附加原材料和引用原材料
    $.extend(testobject, {
        RefMaterial_Add: function (adata) {

            //构建数组参数类型
            var data = [];
            if (Array.isArray(adata)) {
                data = adata;
            }
            else {
                data.push(adata);
            }

            if (!this.otherMaterials) {
                this.otherMaterials = [];
            }
            var alldata = this.otherMaterials;
            //判断重复
            //仅仅能判断引用造成的重复
            for (let index = 0; index < data.length; index++) {
                var hasAdded = false;
                const element = data[index];
                //如果是引用 则需要判断是否是重复引用
                if (element.refer == "1") {
                    for (let j = 0; j < alldata.length; j++) {
                        const exi = alldata[j];
                        if (exi.testObjectId == element.testObjectId) {
                            hasAdded = true;
                            break;
                        }
                    }

                    if (hasAdded) {
                        continue;
                    }
                }
                //添加进去
                alldata.push(element);
            }
            this.otherMaterials = alldata;
            this.init_BuildRefMaterial();
        },
        RefMaterial_Del: function (delIds) {
            if (!delIds) {
                return;
            }
            var itemlist = this.otherMaterials;
            //倒叙循环删除
            for (let index = itemlist.length - 1; index >= 0; index--) {
                if (delIds.indexOf("materialTR" + index) >= 0) {
                    itemlist.splice(index, 1);
                }
            }
            this.otherMaterials = itemlist;
            //刷新UI
            this.init_BuildRefMaterial();
        }
    });
    //龄期相关
    $.extend(testobject, {
        Period_Add: function () {
            //添加一个空对象
            this.periods.push({});
            //初始化界面
            this.init_BuildPeriods();
        },
        Period_Del: function (delIds) {
            if (!delIds) {
                return;
            }
            var itemlist = this.periods;
            //倒叙循环删除
            for (let index = itemlist.length - 1; index >= 0; index--) {
                if (delIds.indexOf("periodTR" + index) >= 0) {
                    itemlist.splice(index, 1);
                }
            }
            this.periods = itemlist;
            //刷新UI
            this.init_BuildPeriods();
        }
    });

    //数据对象打包~


    $.extend(testobject, {
        //构建选中的检测参数
        LoadDataFromUI_TestParams: function () {
            var result = [];
            var params = TObject.TestParamList;
            for (var i = 0; i < params.length; i++) {

                var curParam = params[i];
                if (TObject.SELECTED_PARAM_IDS.indexOf(curParam.id) < 0) {
                    continue;
                }
                var testParamO = {};

                testParamO.testParamId = curParam.id;
                /*试验参数单价，该属性用着界面显示单价用，实际单价由后台计算获得*/
                testParamO.price = curParam.price;

                //获取价格对象
                testParamO.priceId = curParam.priceId;
                testParamO.priceType = curParam.priceType;

                testParamO.testParamDisplayName = curParam.displayName;
                testParamO.qualificationType = curParam.qualificationType;
                testParamO.remark = curParam.remark;
                testParamO.basis = curParam.displayBasis;
                testParamO.standard = curParam.displayStandards;
                testParamO.basisIds = curParam.basisIds;
                testParamO.standardIds = curParam.standardIds;
                testParamO.isBuildSampleCode = curParam.isBuildSampleCode;
                testParamO.isLocaleItem = curParam.isLocaleItem;

                result.push(testParamO);
            }
            this.testParams = result;
        },
        //附加费用
        LoadDataFromUI_AddtionFees: function () {
            var addfees = [];
            var rows = $('#additionalFees').find('tbody tr');
            if (rows && rows.length > 0) {
                for (var i = 0; i < rows.length; i++) {
                    var row = $(rows[i]);
                    var checkbox = row.find("input[type=checkbox]");

                    if (!checkbox.prop("checked"))
                        continue;

                    var fee = {};
                    fee.id = row.attr("dataID");
                    fee.name = row.find('.name').text();
                    fee.price = row.find('.price').text();
                    fee.priceUnit = row.find('priceUnit').text();
                    fee.count = row.find('input.count').val();
                    fee.remark = row.find('input.remark').val();
                    addfees.push(fee);
                }
            }
            this.additionalFees = addfees;
        },
        LoadDataFromUI_Materials: function () {
            var otherMaterials = this.otherMaterials;
            var rows = $('#otherMaterials').find('tbody tr');
            if (rows && rows.length > 0) {
                for (var i = 0; i < rows.length; i++) {
                    var row = $(rows[i]);
                    var keyID = row.attr("dataid");
                    var otherMaterialFiter = this.otherMaterials.filter(function (a) {
                        return a.id == keyID;
                    });
                    if (otherMaterialFiter && otherMaterialFiter.length == 1) {
                        var otherMaterial = otherMaterialFiter[0];
                        otherMaterial.recommendedDosage = row.find(".recommendedDosage").val();
                        otherMaterial.dosage = row.find(".dosage").val();
                        otherMaterial.unitRatio = row.find(".unitRatio").val();
                        otherMaterial.remark = row.find(".remark").val();
                    }
                }
            }
        },
        LoadDataFromUI_Periods: function () {
            var pds = [];
            var rows = $('#periods').find('tbody tr');
            if (rows && rows.length > 0) {
                for (var i = 0; i < rows.length; i++) {
                    var period = {};
                    var row = $(rows[i]);
                    period.periodCode = row.find('input.period-code').val();
                    period.formingDate = row.find('input.forming-date').val();
                    period.days = row.find('input.days').val();
                    period.mark = row.find('input.mark').val();
                    pds.push(period);
                }
            }
            this.periods = pds;
        }
    });

    window.TObject = testobject;
})(window);