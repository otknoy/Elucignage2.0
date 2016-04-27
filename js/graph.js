var graph = {};
// グラフの表示領域を設定
var margin = {top: 50, right: 20, bottom: 30, left: 50};
var width = window.innerWidth/10*6.8 - margin.left - margin.right;
var height = window.innerHeight/10*3 - margin.top - margin.bottom;

//　ドラッグのところで使われている
//　いまいちわかっていない
var bisectDate = d3.bisector(function(d) { return d.date; }).left;

var dataMin; //データセットの最小値
var dataMax; //データ・セットの最大値

// スケールと出力レンジの定義
var x = d3.time.scale()
    .range([0, width]);

var y = d3.scale.linear()
    .range([height, 0]);

// 軸の定義
var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

// svgの定義
var svg = d3.select("#graph").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var countryNameArray

graph.create = function(data) {
  //グラフタイトル追加
  d3.select("#graph").select("svg").append('text')
  .attr({
    x:width/2-40, //width/2-font-size
    y:25, //font-size+5
    fill: "black",
    "font-size":20 //ここを変数にする
  })
  .text("エボラ感染者数―合計");

countryNameArray = Object.keys(data[0]);

  // データをフォーマット
    data.forEach(function(d) {
      for(var i=1; i<=countryNameArray.length-1; i++){
        d[countryNameArray[i]] =+ d[countryNameArray[i]];
      }
    });

  // 線の定義
    var line = d3.svg.line()
    .x(function(d) { return x(d.date); })
    .y(function(d) { return y(d.close); });

    for(var i=0; i<=data.length-1; i++){
      for(var j=2; j<=countryNameArray.length-1; j++){
          if(i==0 && j==2){
              dataMin = data[i][countryNameArray[j]];
              dataMax = data[i][countryNameArray[j]];
          }else if(data[i][countryNameArray[j]] < dataMin){
              dataMin = data[i][countryNameArray[j]];
          }else if(data[i][countryNameArray[j]] > dataMax){
              dataMax = data[i][countryNameArray[j]];
          }
      }
    }

    //　時系列順にソート
    data.sort(function(a, b) {
      return a.date - b.date;
    });

    // データを入力ドメインとして設定
    // 同時にextentで目盛りの単位が適切になるようにする
    x.domain(d3.extent(data, function(d) { return d.date; })).clamp(true);
    y.domain(d3.extent(data, function(d) { return d.close; }));

    // x軸をsvgに表示
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    // y軸をsvgに表示
    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Casualties (人)");

    // path要素をsvgに表示し、折れ線グラフを設定
    svg.append("path")
        .datum(data)
        .attr("class", "line")
        .attr("d", line);

    var focus = svg.append("g")
        .attr("class", "focus")
        .style("display", "none");

        focus.append("circle")
      .attr("r", 4.5);

      focus.append("text")
          .attr("x", 9)
          .attr("dy", ".35em");

      focus.append("line")
          .attr("x1", 0).attr("x2", 0) // vertical line so same value on each
          .attr("y1", 0).attr("y2", height); // top to bottom

      var dragListener = d3.behavior.drag()
        .on("dragstart", function() { console.log("dragstart"); })
        .on("drag", dragmove)
        .on("dragend", function() { console.log("dragend"); });

      function dragmove() {
          var x0 = x.invert(d3.event.x),
              i = bisectDate(data, x0, 1),
              d0 = data[i - 1],
              d1 = data[i],
              d = x0 - d0.date > d1.date - x0 ? d1 : d0;

          // Translate focus line by mouse coordinates
          focus.attr("transform", "translate(" + x(d.date) + ",0)");
          focus.select("text").text(d.date);

          map.highlightCountry(d);

          // Change highlited articles
          if($('.'+Date.parse(d.date)) != null){
              d3.selectAll("li").selectAll("p").style("color", "black");
              $('.'+Date.parse(d.date)).css('color','red');
          }else{
              d3.selectAll("li").selectAll("p").style("color", "black");
          }
      }

      svg.append("rect")
          .attr("class", "overlay")
          .attr("width", width)
          .attr("height", height)
          .on("mouseover", function() { focus.style("display", null); })
          .call(dragListener);
};