<%@ page language="java" contentType="text/html; charset=utf-8" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>

<head>
  <title>任务文件页面</title>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
  <meta http-equiv="pragma" content="no-cache">
  <meta http-equiv="cache-control" content="no-cache">
</head>

<body>
  <div style="padding:1px;">

    <div style="width:50%;height:31%; margin: 20px auto;">
      <a href="#" id="testRecordImgButton">
        <img src="images/fileWrite.png" title="填写试验记录" style="width:100%;height:100%">
      </a>
    </div>
    <div style="width:50%;height:31%; margin: 20px auto;">
      <a href="#" id="testReportImgButton">
        <img src="images/fileLookup.png" title="查看UDR报告" style="width:100%;height:100%">
      </a>
    </div>
    <div style="width:100%;height:5%; margin: 20px auto;">
      <a id="switchToFileModel" href="#" onclick="showFileModel()" class="layui-btn layui-btn-xs"
        style="float:right; margin-top:31px;margin-right:10px;">
        <i class="layui-icon">&#xe609;</i>切换到文件模式
      </a>
    </div>
  </div>
  <script>
    var filesObj = { "fileSize": 0 }
  </script>
</body>

</html>