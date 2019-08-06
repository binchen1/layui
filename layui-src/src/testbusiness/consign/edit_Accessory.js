function acce (){};

acce.prototype.addToForm = function (accessory) {
    var $accessoryIds = $("#accessoryIds");
    var newVal = '';
    var oldVal = $accessoryIds.val();
    if (oldVal == '' || oldVal == null || typeof (oldVal) == 'undefined') {
        oldVal == '';
        newVal = accessory.id;
    } else {
        newVal = oldVal + "," + accessory.id;
    }
    $accessoryIds.val(newVal);
    addAccessoryToTable(accessory);
}

//初始化附件管理
acce.prototype.initAccessory = function () {
    var consignId = $('#consignId').val();
    if (consignId) {
        $.ajax({
            url: 'consignController.do?getAttachment',
            dataType: 'json',
            data: {
                id: consignId
            },
            success: function (res) {
                if (res.obj != null) {
                    $.each(res.obj, function (i, accessory) {
                        addAccessoryToTable(accessory)
                    })
                }
            }
        })
    }
}

acce.prototype.downloadAccessory = function (accessoryId) {
    window.open("uploadController.do?download&accessoryId=" + accessoryId);
}


acce.prototype.deleteAccessory = function (accessoryId) {
    $.ajax({
        type: "post",
        asyn: true,
        url: "consignController.do?deleteAccessoryByIds",
        contentType: "application/x-www-form-urlencoded",
        data: {
            accessoryIds: accessoryId
        },
        success: function (data) {
            data = JSON.parse(data);
            if (data.success) {
                deleteAccessoryToTable(accessoryId);
            }
        }
    });
}


function addAccessoryToTable(accessory) {
    var $span = $("#accessoryManageDiv"),
        spanhtml = '';
    var str = accessory.realpath;
    var num = str.lastIndexOf('.')
    var strs = str.slice(num);
    var temp = strs.substring(1);

    if (temp == 'png' || temp == 'jpg') {
        spanhtml += '<img class="' + accessory.id + '" src=\'' + accessory.realpath + '\' width=\'70px\' height=\'50px\'/>'
    } else {
        spanhtml += '<span class="' + accessory.id + '">' + accessory.attachmenttitle + ' &emsp;</span>'

    }
    $span.append(spanhtml)

    filesObj.files.push({
        'id': accessory.id,
        'realpath': accessory.realpath || '',
        'attachmenttitle': accessory.attachmenttitle || ''
    })
}
function deleteAccessoryToTable(accessoryId) {
    $('#accessoryManageDiv').find('.' + accessoryId).remove()
}

window.accessory = new acce();