KJE.DisabilityCalc=function(){this.iDecimal=0;this.MONTHLY_DISABILITY_EXPENSES=0;this.LONG_MESSAGE="";this.SHORT_MESSAGE="";this.INFLATION_DISABILITY_EXPENSES=0;this.oldMONTHLY_EXPENSES=-1;this.DEFAULT_EXPENSE_PERCENT=KJE.parameters.get("DEFAULT_EXPENSE_PERCENT",70);this.MSG_SHORT1=KJE.parameters.get("MSG_SHORT1","You have no current disability shortfall.");this.MSG_SHORT2=KJE.parameters.get("MSG_SHORT2","Your current shortfall is");this.MSG_SHORT3=KJE.parameters.get("MSG_SHORT3","per month.");this.MSG_LONG1=KJE.parameters.get("MSG_LONG1","You need no additional coverage for the first");this.MSG_LONG2=KJE.parameters.get("MSG_LONG2",".");this.MSG_LONG3=KJE.parameters.get("MSG_LONG3","You need an additional MONTHLY_SHORTFALL1 coverage per month for");this.MSG_LONG4=KJE.parameters.get("MSG_LONG4",".");this.MSG_LONG5=KJE.parameters.get("MSG_LONG5","You will need MONTHLY_SHORTFALL2 of additional coverage for the following");this.MSG_LONG6=KJE.parameters.get("MSG_LONG6",".");this.MSG_LONG7=KJE.parameters.get("MSG_LONG7","If you remain disabled for more than a few years, you may need to increase this coverage to account for inflation. At the end of your anticipated LENGTH_OF_DISABILITY month disability your expenses would be INFLATION_DISABILITY_EXPENSES after accounting for ANNUAL_INFLATION annual inflation.");this.sSchedule=new KJE.Repeating()};KJE.DisabilityCalc.prototype.clear=function(){this.MONTHLY_EXPENSES=0;this.LENGTH_OF_DISABILITY=0;this.CURRENT_MONTHLY_COVERAGE=0;this.LENGTH_OF_CURRENT_COVERAGE=0;this.ANNUAL_INFLATION=0};KJE.DisabilityCalc.prototype.calculate=function(k){var f=KJE;var i=this.MONTHLY_EXPENSES;var m=this.LENGTH_OF_DISABILITY;var g=this.CURRENT_MONTHLY_COVERAGE;var l=this.LENGTH_OF_CURRENT_COVERAGE;var b=this.ANNUAL_INFLATION;var e=this.DEFAULT_EXPENSE_PERCENT;if(this.oldMONTHLY_EXPENSES!=i&&this.oldMONTHLY_EXPENSES!=-1){this.MONTHLY_DISABILITY_EXPENSES=((e/100)*i)}this.oldMONTHLY_EXPENSES=i;var c=this.MONTHLY_DISABILITY_EXPENSES-g;var a=this.MONTHLY_DISABILITY_EXPENSES;var j=m-l;this.INFLATION_DISABILITY_EXPENSES=KJE.FV_AMT(KJE.ROR_MONTH(b/100),m,this.MONTHLY_DISABILITY_EXPENSES);if(c<=0){this.SHORT_MESSAGE=this.MSG_SHORT1;this.LONG_MESSAGE=this.MSG_LONG1+" "+KJE.getTermLabel(l)+(this.MSG_LONG2.length==1?"":" ")+this.MSG_LONG2}else{this.SHORT_MESSAGE=this.MSG_SHORT2+" "+f.dollars(c,0)+(this.MSG_SHORT3.length==1?"":" ")+this.MSG_SHORT3;this.LONG_MESSAGE=this.MSG_LONG3+" "+KJE.getTermLabel(l)+(this.MSG_LONG4.length==1?"":" ")+this.MSG_LONG4}if(j>0){this.LONG_MESSAGE+=" "+this.MSG_LONG5+" "+KJE.getTermLabel(m-l)+(this.MSG_LONG6.length==1?"":" ")+this.MSG_LONG6}this.LONG_MESSAGE+=" "+this.MSG_LONG7;var o=Math.round(m);this.DS_EXPENSES=KJE.FloatArray(o);this.DS_COVERAGE=KJE.FloatArray(o);if(k){var h=this.sSchedule;h.clearRepeat();h.addHeader(h.sReportCol("Payment #",1),h.sReportCol("Monthly expenses",2),h.sReportCol("Insurance coverage",3),h.sReportCol("Difference",4))}this.cats=new Array(o);for(var d=0;d<o;d++){this.DS_EXPENSES[d]=this.MONTHLY_DISABILITY_EXPENSES;if(l>d){this.DS_COVERAGE[d]=g}else{this.DS_COVERAGE[d]=0}this.cats[d]=d+1;if(k){h.addRepeat(f.number(d+1),f.dollars(this.DS_EXPENSES[d],this.iDecimal),f.dollars(this.DS_COVERAGE[d],this.iDecimal),f.dollars(this.DS_COVERAGE[d]-this.DS_EXPENSES[d],this.iDecimal))}}this.MONTHLY_SHORTFALL1=c;this.MONTHLY_SHORTFALL2=a};KJE.DisabilityCalc.prototype.formatReport=function(b){var c=KJE;var a=this.iDecimal;var d=b;d=KJE.replace("LONG_MESSAGE",this.LONG_MESSAGE,d);d=KJE.replace("SHORT_MESSAGE",this.SHORT_MESSAGE,d);d=KJE.replace("MONTHLY_SHORTFALL1",c.dollars(this.MONTHLY_SHORTFALL1,a),d);d=KJE.replace("MONTHLY_SHORTFALL2",c.dollars(this.MONTHLY_SHORTFALL2,a),d);d=KJE.replace("MONTHLY_EXPENSES",c.dollars(this.MONTHLY_EXPENSES,a),d);d=KJE.replace("MONTHLY_DISABILITY_EXPENSES",c.dollars(this.MONTHLY_DISABILITY_EXPENSES,a),d);d=KJE.replace("LENGTH_OF_DISABILITY",c.number(this.LENGTH_OF_DISABILITY),d);d=KJE.replace("CURRENT_MONTHLY_COVERAGE",c.dollars(this.CURRENT_MONTHLY_COVERAGE,a),d);d=KJE.replace("LENGTH_OF_CURRENT_COVERAGE",c.number(this.LENGTH_OF_CURRENT_COVERAGE),d);d=KJE.replace("ANNUAL_INFLATION",c.percent(this.ANNUAL_INFLATION/100,1),d);d=KJE.replace("INFLATION_DISABILITY_EXPENSES",c.dollars(this.INFLATION_DISABILITY_EXPENSES,a),d);d=KJE.replace("DEFAULT_EXPENSE_PERCENT",c.percent(this.DEFAULT_EXPENSE_PERCENT/100),d);d=d.replace("**REPEATING GROUP**",this.sSchedule.getRepeat());this.sSchedule.clearRepeat();return d};KJE.CalcName="Disability Insurance";KJE.CalcType="Disability";KJE.CalculatorTitleTemplate="Disability Insurance Needs";KJE.initialize=function(){KJE.CalcControl=new KJE.DisabilityCalc();KJE.GuiControl=new KJE.Disability(KJE.CalcControl)};KJE.Disability=function(e){var d=KJE;var c=KJE.gLegend;var b=KJE.inputs.items;this.MSG_GRAPH1=KJE.parameters.get("MSG_GRAPH1","Monthly disability expenses");this.MSG_GRAPH2=KJE.parameters.get("MSG_GRAPH2","Current insurance");this.MSG_GRAPH3=KJE.parameters.get("MSG_GRAPH3","Month of Disability");KJE.DollarSlider("MONTHLY_EXPENSES","Current monthly expenses",0,100000,0,0,6);KJE.DollarSlider("MONTHLY_DISABILITY_EXPENSES","Disability monthly expenses",0,100000,0,0,6);KJE.NumberSlider("LENGTH_OF_DISABILITY","Length of disability",1,120,0);KJE.DollarSlider("CURRENT_MONTHLY_COVERAGE","Current monthly coverage",0,100000,0,0,6);KJE.NumberSlider("LENGTH_OF_CURRENT_COVERAGE","Length of coverage",0,240,0);KJE.InflationRateSlider("ANNUAL_INFLATION","Annual Inflation");var a=KJE.gNewGraph(KJE.gLINE,"GRAPH1",true,false,KJE.colorList[1],e.MSG_SHORT1);a._legend._iOrientation=(c.TOP_RIGHT);KJE.addDiv("INPUTS",KJE.colorList[0])};KJE.Disability.prototype.setValues=function(b){var a=KJE.inputs.items;b.MONTHLY_EXPENSES=a.MONTHLY_EXPENSES.getValue();b.MONTHLY_DISABILITY_EXPENSES=a.MONTHLY_DISABILITY_EXPENSES.getValue();b.LENGTH_OF_DISABILITY=a.LENGTH_OF_DISABILITY.getValue();b.CURRENT_MONTHLY_COVERAGE=a.CURRENT_MONTHLY_COVERAGE.getValue();b.LENGTH_OF_CURRENT_COVERAGE=a.LENGTH_OF_CURRENT_COVERAGE.getValue();b.ANNUAL_INFLATION=a.ANNUAL_INFLATION.getValue()};KJE.Disability.prototype.refresh=function(e){var d=KJE;var c=KJE.gLegend;var b=KJE.inputs.items;var a=KJE.gGraphs[0];KJE.setTitleTemplate("Disability Insurance Needs");a.removeAll();a.setGraphCategories(e.cats);a.add(new KJE.gGraphDataSeries(e.DS_EXPENSES,this.MSG_GRAPH1,a.getColor(1)));a.add(new KJE.gGraphDataSeries(e.DS_COVERAGE,this.MSG_GRAPH2,a.getColor(2)));a._titleXAxis.setText(this.MSG_GRAPH3);a.setTitle(e.SHORT_MESSAGE);a.paint();b.MONTHLY_DISABILITY_EXPENSES.setValue(e.MONTHLY_DISABILITY_EXPENSES,true)};KJE.InputScreenText=" <div id=KJE-D-INPUTS> <div id='KJE-C-MONTHLY_EXPENSES'><input id='KJE-MONTHLY_EXPENSES' /></div> <div id='KJE-C-MONTHLY_DISABILITY_EXPENSES'><input id='KJE-MONTHLY_DISABILITY_EXPENSES' /></div> <div id='KJE-C-CURRENT_MONTHLY_COVERAGE'><input id='KJE-CURRENT_MONTHLY_COVERAGE' /></div> <div style=\"height:10px\"></div> <div id='KJE-C-LENGTH_OF_DISABILITY'><input id='KJE-LENGTH_OF_DISABILITY' /></div> <div id='KJE-C-LENGTH_OF_CURRENT_COVERAGE'><input id='KJE-LENGTH_OF_CURRENT_COVERAGE' /></div> <div id='KJE-C-ANNUAL_INFLATION'><input id='KJE-ANNUAL_INFLATION' /></div> <div style=\"height:10px\"></div> </div> **GRAPH1** ";KJE.DefinitionText=" <div id='KJE-D-MONTHLY_EXPENSES' ><dt>Current monthly expenses</dt><dd>Your total monthly living expenses. Remember to include your home or rent payments, food, clothing, gas, phone and other monthly expenses.</dd></div> <div id='KJE-D-MONTHLY_DISABILITY_EXPENSES' ><dt>Disability monthly expenses</dt><dd>Your monthly expenses while you are disabled. This amount is usually a little less than your original monthly expenses. The default value for this field is calculated as 70% of your current monthly expenses. You should keep in mind, however, that many expenses such as your mortgage, rent, utilities and food will most likely remain the same as before you were disabled.</dd></div> <div id='KJE-D-LENGTH_OF_DISABILITY' ><dt>Length of disability</dt><dd>The number of months you expect a disability will prevent you from working. A common mistake is to underestimate the time it takes to get back to work.</dd></div> <div id='KJE-D-CURRENT_MONTHLY_COVERAGE' ><dt>Current monthly coverage</dt><dd>Your current monthly disability coverage. Make sure to include any disability coverage supplied by your employer.</dd></div> <div id='KJE-D-LENGTH_OF_CURRENT_COVERAGE' ><dt>Length of coverage</dt><dd>Number of months that your current monthly coverage will last.</dd></div> <div id='KJE-D-ANNUAL_INFLATION' ><dt>Annual inflation</dt><dd>**INFLATION_DEFINITION** If you are disabled for a short period of time, inflation is usually not a very important factor. However, you may need to consider the effect of inflation if you remain disabled for more than a few years.</dd></div> ";KJE.ReportText=' <!--HEADING "Disability Insurance Needs" HEADING--> <h2 class=\'KJEReportHeader KJEFontHeading\'>SHORT_MESSAGE</h2>LONG_MESSAGE **GRAPH** <div class=KJEReportTableDiv><table class=KJEReportTable><caption class=\'KJEHeaderRow KJEHeading\'>Results Summary</caption> <tbody class=\'KJEReportTBody\'> <tr class=KJEEvenRow><th class="KJELabel KJECellBorder KJECell60" scope=\'row\'>Current expenses </th><td class="KJECell KJECell40"> MONTHLY_EXPENSES per month</td></tr> <tr class=KJEOddRow><th class="KJELabel KJECellBorder" scope=\'row\'>Expenses during disability </th><td class="KJECell"> MONTHLY_DISABILITY_EXPENSES per month</td></tr> <tr class=KJEEvenRow><th class="KJELabel KJECellBorder" scope=\'row\'>Disability expenses after ANNUAL_INFLATION annual inflation </th><td class="KJECell"> INFLATION_DISABILITY_EXPENSES per month after LENGTH_OF_DISABILITY months. </td></tr> <tr class=KJEOddRow><th class="KJELabel KJECellBorder" scope=\'row\'>Length of disability </th><td class="KJECell"> LENGTH_OF_DISABILITY months</td></tr> <tr class=KJEEvenRow><th class="KJELabel KJECellBorder" scope=\'row\'>Current coverage </th><td class="KJECell"> CURRENT_MONTHLY_COVERAGE per month</td></tr> <tr class=KJEOddRow><th class="KJELabel KJECellBorder" scope=\'row\'>Length of current coverage </th><td class="KJECell"> LENGTH_OF_CURRENT_COVERAGE months</td></tr> </tbody> </table> </div> <h2 class=\'KJEScheduleHeader KJEFontHeading\'>Monthly expenses and Insurance coverage</h2> **REPEATING GROUP** ';