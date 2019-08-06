
 function initData() {
  // 0:领样,1:收样处留样,2:测后留样,3:测后废弃,4:留样到期废弃,5:留样到期返还,6:提前废弃,7:提前返还,8:利用
  //  0:领样,1:收样处留样 ,2：测试，3留样
  this.tabsStatus0 = {
    "receiver": { "name": "领样人", "values": '' },
    "operator": { "name": "经办人", "values": this.userName },
    "operationDate": { "name": "领样日期", "values": new Date().Format("yyyy-MM-dd") },
    "reason": { "name": "备注", "values": '' },
    "isAmountAll": false,
    "tablecol": { "name": "试样数量", "values": '' },
    "amountAll": { "name": "领样数量", "values": '' },
  }
  this.tabsStatus1 = {
    "receiver": { "name": "留样人", "values": '' },
    "operator":{ "name": "经办人", "values": this.userName },
    "operationDate": { "name": "留样日期", "values": new Date().Format("yyyy-MM-dd") },
    "saveDayLimit": { "name": "留样期限(天)", "values": "" },
    "saveSite": { "name": "留样地点", "values": "" },
    "reason": { "name": "留样原因", "values": "" },
    "isAmountAll": true,
    "tablecol": { "name": "试样数量", "values": "" },
    "amountAll": { "name": "留样数量", "values": "" },
  }
  this.tabsStatus3 = {
    "operationType": [{ "values": "3", "lables": "废弃", "checkeds": "checked" },
    { "values": "2", "lables": "留样" }],
    "operationTitle": '测后样品处理方式',
    "operator":{ "name": "经办人", "values": this.userName },
    "operationDate": { "name": "样品废弃日期", "values": new Date().Format("yyyy-MM-dd") },
    "reason": { "name": "废弃原因", "values": "" },
    "isAmountAll": true,
    "tablecol": { "name": "领样数量", "values": "" },
    "amountAll": { "name": "废弃数量", "values": "" },
  }
  this.tabsStatus2 = {
    "operationType": [{ "values": "3", "lables": "废弃" },
    { "values": "2", "lables": "留样", "checkeds": "checked" }],
    "operationTitle": '测后样品处理方式',
    "receiver": { "name": "留样人", "values": '' },
    "operator":{ "name": "经办人", "values": this.userName },
    "operationDate": { "name": "留样日期", "values": new Date().Format("yyyy-MM-dd") },
    "saveDayLimit": { "name": "留样期限(天)", "values": "" },
    "saveSite": { "name": "留样地点", "values": "" },
    "reason": { "name": "留样原因", "values": "" },
    "isAmountAll": true,
    "tablecol": { "name": "领样数量", "values": "" },
    "amountAll": { "name": "留样数量", "values": "" },
  }
  this.tabsStatus4 = {
    "operationType": [{ "values": "4", "lables": "废弃", "checkeds": "checked" },
    { "values": "5", "lables": "返还" },
    { "values": "8", "lables": "利用" }],
    "operationTitle": "留样处理方式",
    "operator":{ "name": "经办人", "values": this.userName },
    "operationDate": { "name": "样品废弃日期", "values": new Date().Format("yyyy-MM-dd") },
    "reason": { "name": "废弃原因", "values": "" },
    "isAmountAll": true,
    "tablecol": { "name": "留样数量", "values": "" },
    "amountAll": { "name": "废弃数量", "values": "" },
  }
  this.tabsStatus5 = {
    "operationType": [{ "values": "4", "lables": "废弃" },
    { "values": "5", "lables": "返还", "checkeds": "checked" },
    { "values": "8", "lables": "利用" }],
    "operationTitle": "留样处理方式",
    "receiver": { "name": "接受人", "values": '' },
    "operator":{ "name": "经办人", "values": this.userName },
    "operationDate": { "name": "样品返还日期", "values": new Date().Format("yyyy-MM-dd") },
    "reason": { "name": "备注", "values": "" },
    "isAmountAll": true,
    "tablecol": { "name": "留样数量", "values": "" },
    "amountAll": { "name": "返还数量", "values": "" },
  }
  this.tabsStatus8 = {
    "operationType": [{ "values": "4", "lables": "废弃" },
    { "values": "5", "lables": "返还" },
    { "values": "8", "lables": "利用", "checkeds": "checked" }],
    "operationTitle": "留样处理方式",
    "reason": { "name": "申请利用原因", "values": "" },
    "isAmountAll": true,
    "tablecol": { "name": "留样数量", "values": "" },
    "amountAll": { "name": "利用数量", "values": "" },
  }
  return true;
}