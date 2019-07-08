function test_createChart() {
  var ss = SpreadsheetApp.openById(top.FILES.AAA);
  var sheet = ss.getSheetByName(top.SHEETS.INDREP); 
  createChart(sheet);
}

function createChart(sheet) {
  var charts = sheet.getCharts();
  var chart;
  if (charts.length > 0) {
    var chart = charts[charts.length - 1];
    sheet.removeChart(chart);
  }

  chart = sheet.newChart()
  .asLineChart()
  .addRange(sheet.getRange('B6:B8'))
  .addRange(sheet.getRange('F6:AC8'))
  .setMergeStrategy(Charts.ChartMergeStrategy.MERGE_COLUMNS)
  .setTransposeRowsAndColumns(true)
  .setNumHeaders(1)
  .setHiddenDimensionStrategy(Charts.ChartHiddenDimensionStrategy.IGNORE_BOTH)
  .setOption('useFirstColumnAsDomain', true)
  .setOption('curveType', 'none')
  .setOption('interpolateNulls', false)
  .setOption('legend.position', 'top')
  .setOption('chartArea.left', '6.351%')
  .setOption('chartArea.top', '18.059%')
  .setOption('chartArea.width', '89.763%')
  .setOption('chartArea.height', '61.72500000000001%')
  .setOption('domainAxis.direction', 1)
  .setOption('title', '')
  .setOption('treatLabelsAsText', false)
  .setOption('legend.textStyle.fontName', 'Arial')
  .setOption('legend.textStyle.fontSize', 11)
  .setOption('legend.textStyle.color', '#434343')
  .setOption('titleTextStyle.fontName', 'Arial')
  .setOption('titleTextStyle.fontSize', 16)
  .setOption('titleTextStyle.color', '#000000')
  .setOption('titleTextStyle.bold', true)
  
  .setOption('hAxis.slantedText', true)
  .setOption('hAxis.slantedTextAngle', 30)
  .setOption('hAxis.textStyle.fontName', 'Arial')
  .setOption('hAxis.textStyle.fontSize', 11)
  .setOption('hAxis.textStyle.color', '#434343')
  .setOption('hAxis.titleTextStyle.fontName', 'Arial')
  .setOption('hAxis.titleTextStyle.fontSize', 11)
  .setOption('hAxis.titleTextStyle.color', '#222222')
  .setOption('hAxis.titleTextStyle.italic', true)
  
  .setYAxisTitle('')
  .setRange(-0.1, 1.2)
  
  .setOption('vAxes.0.viewWindowMode', 'pretty')
  .setOption('vAxes.0.textStyle.fontName', 'Arial')
  .setOption('vAxes.0.textStyle.fontSize', 11)
  .setOption('vAxes.0.textStyle.color', '#ffffff')
  .setOption('vAxes.0.titleTextStyle.fontName', 'Arial')
  .setOption('vAxes.0.titleTextStyle.fontSize', 11)
  .setOption('vAxes.0.titleTextStyle.color', '#434343')
  .setOption('vAxes.0.titleTextStyle.italic', true)
  
  .setOption('series.0.color', '#999999')
  .setOption('series.0.dataLabelPlacement', 'below')
  .setOption('series.0.pointShape', 'x-mark')
  .setOption('series.0.pointSize', 7)
 // .setOption('series.0.labelInLegend', 'Class average')
  .setOption('series.0.lineWidth', 0)
 
  .setOption('series.1.color', '#6a1b9a')
  .setOption('series.1.dataLabelPlacement', 'above')
  .setOption('series.1.pointSize', 7)
  .setOption('series.1.lineWidth', 0)
  
  .setOption('trendlines.1.labelInLegend', '')
  .setOption('trendlines.1.visibleInLegend', false)
  .setOption('trendlines.1.showR2', false)
  .setOption('width', 1054)
  .setPosition(12, 2, 2, 14)
  .build();
  sheet.insertChart(chart);
};

//  chart = sheet.newChart()
//  .asLineChart()
//  .addRange(sheet.getRange('B6:B8'))
//  .addRange(sheet.getRange('F6:U8'))
//  .setMergeStrategy(Charts.ChartMergeStrategy.MERGE_COLUMNS)
//  .setTransposeRowsAndColumns(true)
//  .setNumHeaders(1)
//  .setHiddenDimensionStrategy(Charts.ChartHiddenDimensionStrategy.IGNORE_BOTH)
//  .setOption('useFirstColumnAsDomain', true)
//  .setOption('curveType', 'none')
//  .setOption('interpolateNulls', false)
//  .setOption('legend.position', 'top')
//  .setOption('chartArea.left', '6.351%')
//  .setOption('chartArea.top', '18.059%')
//  .setOption('chartArea.width', '89.763%')
//  .setOption('chartArea.height', '61.72500000000001%')
//  .setOption('domainAxis.direction', 1)
//  .setOption('title', '')
//  .setOption('treatLabelsAsText', false)
//  .setOption('legend.textStyle.fontName', 'Arial')
//  .setOption('legend.textStyle.fontSize', 11)
//  .setOption('legend.textStyle.color', '#434343')
//  .setOption('titleTextStyle.fontName', 'Arial')
//  .setOption('titleTextStyle.fontSize', 16)
//  .setOption('titleTextStyle.color', '#000000')
//  .setOption('titleTextStyle.bold', true)
//  .setOption('hAxis.slantedText', true)
//  .setOption('hAxis.slantedTextAngle', 30)
//  .setOption('hAxis.textStyle.fontName', 'Arial')
//  .setOption('hAxis.textStyle.fontSize', 11)
//  .setOption('hAxis.textStyle.color', '#434343')
//  .setOption('hAxis.titleTextStyle.fontName', 'Arial')
//  .setOption('hAxis.titleTextStyle.fontSize', 11)
//  .setOption('hAxis.titleTextStyle.color', '#222222')
//  .setOption('hAxis.titleTextStyle.italic', true)
//  .setYAxisTitle('')
//  .setRange(-0.1, 1.2)
//  .setOption('vAxes.0.viewWindowMode', 'pretty')
//  .setOption('vAxes.0.textStyle.fontName', 'Arial')
//  .setOption('vAxes.0.textStyle.fontSize', 11)
//  .setOption('vAxes.0.textStyle.color', '#ffffff')
//  .setOption('vAxes.0.titleTextStyle.fontName', 'Arial')
//  .setOption('vAxes.0.titleTextStyle.fontSize', 11)
//  .setOption('vAxes.0.titleTextStyle.color', '#434343')
//  .setOption('vAxes.0.titleTextStyle.italic', true)
//  .setOption('series.0.color', '#999999')
//  .setOption('series.0.dataLabelPlacement', 'below')
//  .setOption('series.0.pointShape', 'x-mark')
//  .setOption('series.0.pointSize', 7)
//  .setOption('series.0.labelInLegend', 'Class average')
//  .setOption('series.0.lineWidth', 0)
//  .setOption('series.1.color', '#6a1b9a')
//  .setOption('series.1.dataLabelPlacement', 'above')
//  .setOption('series.1.pointSize', 7)
//  .setOption('series.1.labelInLegend', 'Krithik Suresh')
//  .setOption('series.1.lineWidth', 0)
//  .setOption('trendlines.1.labelInLegend', 'Trend line for William Ingram')
//  .setOption('trendlines.1.visibleInLegend', true)
//  .setOption('trendlines.1.showR2', false)
//  .setOption('width', 1054)
//  .setPosition(12, 2, 1, 5)
//  .build();
//  sheet.insertChart(chart);
//};


//function moveChartOld(sheet) {
//  // var spreadsheet = SpreadsheetApp.getActive();
//  // spreadsheet.getRange('B11').activate();
//  // var sheet = ss.getActiveSheet();
//  var charts = sheet.getCharts();
//  var chart;
//  if (charts.length > 0) {
//    var chart = charts[charts.length - 1];
//    sheet.removeChart(chart);
//  }
//  
//  chart = sheet.newChart()
//  .asLineChart()
//  .addRange(sheet.getRange('B6:B8'))
//  .addRange(sheet.getRange('F6:AC8'))
//  .setMergeStrategy(Charts.ChartMergeStrategy.MERGE_COLUMNS)
//  .setTransposeRowsAndColumns(true)
//  .setNumHeaders(1)
//  .setHiddenDimensionStrategy(Charts.ChartHiddenDimensionStrategy.IGNORE_BOTH)
//  .setOption('useFirstColumnAsDomain', true)
//  .setOption('curveType', 'none')
//  .setOption('interpolateNulls', false)
//  .setOption('legend.position', 'top')
//  .setOption('chartArea.left', '6.351%')
//  .setOption('chartArea.top', '18.059%')
//  .setOption('chartArea.width', '89.763%')
//  .setOption('chartArea.height', '61.72500000000001%')
//  .setOption('domainAxis.direction', 1)
//  .setOption('title', '')
//  .setOption('treatLabelsAsText', false)
//  .setOption('legend.textStyle.fontName', 'Arial')
//  .setOption('legend.textStyle.fontSize', 11)
//  .setOption('legend.textStyle.color', '#434343')
//  .setOption('titleTextStyle.fontName', 'Arial')
//  .setOption('titleTextStyle.fontSize', 16)
//  .setOption('titleTextStyle.color', '#000000')
//  .setOption('titleTextStyle.bold', true)
//  .setOption('width', 1054)
//  .setOption('height', 337)
//  .setPosition(12, 2, 1, 14)
//  .build();
//  sheet.insertChart(chart);
//};