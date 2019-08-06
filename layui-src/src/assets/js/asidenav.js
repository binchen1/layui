$(document).ready(function () {
  var html = '';
  html += '<div class="aside-nav bounceInUp animated" style="display:none"  id="aside-nav">'
  html += '<label style="display:none" id="aside-nav-label" data-funCode="showFloatNavigator" for="" class="aside-menu" title="按住拖动">'
  html += '<span style="font-size:16px;display:block;padding-top:15px;">快速</span><span style="font-size:16px;">体验</span></label>'
  html += '<a style="display:none"  data-funCode="consignManagement" href="#"  title="委托管理" class="menu-item menu-line menu-first">委托<br>管理</a>'
  html += '<a style="display:none"  data-funCode="taskAssignMenu" href="#"  title="任务分配" class="menu-item menu-line menu-second">任务<br>分配</a>'
  html += '<a style="display:none"  data-funCode="testTaskMenu" href="#"  title="试验检测" class="menu-item menu-line menu-third">试验<br>检测</a>'
  html += '<a style="display:none"  data-funCode="testTaskReviewMenu"  href="#" title="试验复核" class="menu-item menu-line menu-fourth">试验<br>复核</a>'
  html += '<a style="display:none"  data-funCode="reportAuditMenu" href="#"  title="报告审核" class="menu-item menu-line menu-fifth">报告<br>审核</a>'
  html += '<a style="display:none"  data-funCode="reportApproveMenu" href="#"  title="报告批准" class="menu-item menu-line menu-sixth">报告<br>批准</a>'
  html += '</div>'

  document.getElementById('asidenav-box').innerHTML = html;
  funCode('showFloatNavigator,consignManagement,taskAssignMenu,testTaskMenu,testTaskReviewMenu,reportAuditMenu,reportApproveMenu','', funCodeCallback);
  function funCodeCallback(res, objParam) {
    console.log(res, objParam)
    if (res.obj && res.obj.length > 0) {
      $.each(res.obj, function (i, v) {
        if ('showFloatNavigator' === v.functioncode) {
          $('[data-funCode="showFloatNavigator"]').show();
          $('#aside-nav').show();
        }
      })
    }
    if (!$('#aside-nav-label').is(":hidden")) {
      if (res.obj && res.obj.length > 0) {
        $.each(res.obj, function (i, v) {
          if (objParam.codes.indexOf(v.functioncode) > -1) {
            $('[data-funCode=' + v.functioncode + ']').show();
            $('[data-funCode=' + v.functioncode + ']').on('click', function () {
              jumpPage(v.functionurl, v.functionname)
            })
          }
        })
      }
    }
  }
  function jumpPage(url, name) {
    var id = "1";
    window.parent.addTabs({ "id": id, "title": name, "close": false, "url": url });
  }

  var ua = navigator.userAgent; /Safari|iPhone/i.test(ua) && 0 == /chrome/i.test(ua) && $("#aside-nav").addClass("no-filter");
  var drags = { down: !1, x: 0, y: 0, winWid: 0, winHei: 0, clientX: 0, clientY: 0 },
    asideNav = $("#aside-nav")[0],
    getCss = function (a, e) { return a.currentStyle ? a.currentStyle[e] : document.defaultView.getComputedStyle(a, !1)[e] };
  $("#aside-nav").on('mousemove', function () {
    // var top = getCss(this, "right");
    // var right = getCss(this, "top");
    // var top2 = top + 130
    // var right2 = right + 130
    // $(this).css({ "width": "260px", "height": "260px", "top": top2 + "px", "right": right2 + "px" })
  })
  $("#aside-nav").on("mousedown", function (a) {
    drags.down = !0,
      drags.clientX = a.clientX,
      drags.clientY = a.clientY,
      drags.x = getCss(this, "right"),
      drags.y = getCss(this, "top"),
      drags.winHei = $(window).height(),
      drags.winWid = $(window).width(),
      $(document).on("mousemove", function (a) {
        // $("#aside-nav").on("mousemove", function (a) {
        if (drags.winWid > 640 && (a.clientX < 120 || a.clientX > drags.winWid - 50))//50px
          return !1 /*,console.log(!1)*/;
        if (a.clientY < 180 || a.clientY > drags.winHei - 120)//导航高度
          return !1;
        var e = a.clientX - drags.clientX,
          t = a.clientY - drags.clientY;
        asideNav.style.top = parseInt(drags.y) + t + "px";
        asideNav.style.right = parseInt(drags.x) - e + "px";
      })
  }).on("mouseup", function () {
    drags.down = !1, $(document).off("mousemove")
  });

  $("#aside-nav").on('mouseleave', function () {
    // $(this).css({ "width": "70px", "height": "70px" })
    $("#aside-nav").trigger('mouseup');
  })
})







