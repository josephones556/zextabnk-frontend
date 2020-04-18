

// Calculator backgrounds and colors
KJE.ErrorBackground="#FF7777"; // backgroundColor
KJE.IncompleteBackground="#FFFF77";
KJE.ClearColor="#FFFFFF";
KJE.colorList=["#eeeeee","#FFFFFF","#cccccc","#BE4262","#FABB50","#DDCCDD","#CCCCCC","#CCCCDD","#CCDDCC","#CCDDDD","#CCCCDD"];

// Report Header and Footer
KJE.ReportHeader="<div class='KJEReportTitleBlock'><div class='KJEReportTitle'>**REPORT_TITLE**</div>data2.profitstarscms.com</div>";
KJE.ReportFooter="<div class=KJECenter><p class='KJEReportFooter KJECenter'>Information and interactive calculators are made available to you as self-help tools for your independent use and are not intended to provide investment advice. We cannot and do not guarantee their applicability or accuracy in regards to your individual circumstances. All examples are hypothetical and are for illustrative purposes.  We encourage you to seek personalized advice from qualified professionals regarding all personal finance issues.</p></div><!--EXTRA_FOOTER-->";

KJE.parseDefinitions = function(sDefn) {
  return KJE.replace("<a href='http", "<a onclick='return KJE.clickAlert();' href='http",sDefn);
};

KJE.clickAlert=function() {
  return confirm("This Financial Institution has no control over information at any site hyperlinked to or from this Site. The Financial Institution makes no representation concerning and is not responsible for the quality, content, nature, or reliability of any hyperlinked site and is providing this hyperlink to you only as a convenience. The inclusion of any hyperlink does not imply any endorsement, investigation, verification or monitoring by this Financial Institution of any information in any hyperlinked site. In no event shall this Financial Institution be responsible for your use of a hyperlinked site.");
};


// Graph fonts, colors and heights
KJE.gFont           = ["Helvetica","Helvetica","Helvetica"];
KJE.gFontStyle      = ["bold","bold",""];
KJE.gFontSize       = [13,10,10];
KJE.gHeight               = 250;
KJE.gHeightReport         = 350;
KJE.gColorBackground      ="#FFFFFF";
KJE.gColorForeground      ="#000000";
KJE.gColorGrid            ="#BBBBBB";
KJE.gColorGridBackground1 ="#FFFFFF";
KJE.gColorGridBackground2 ="#CCCCCC";
KJE.gColorAxisLine        ="#666666";
KJE.gColorText            ="#000000";
KJE.gColorList            = ["#FF9933","#FF3300","#333333","#CC6600","#B2B2B2","#ffffff","#B72467","#6DC8BF","#00007f","#ff00ff","#ffff00","#00ffff","#7f007f","#7f0000","#007f7f","#0000ff","#00c8ff","#60ffff","#bfffbf","#ffff90","#a0c8ef"];
