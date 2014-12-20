console.log("STEPS GRAPH JS");
var margin = {top: 20, right: 40, bottom: 10, left: 20},
    width = 640 - margin.left - margin.right,
    height = 480 - margin.top - margin.bottom,
    barWidth = Math.floor(width / 7) - 1;

var x = d3.scale.linear()
    .range([barWidth / 2, width - barWidth / 2]);

var y = d3.scale.linear()
    .range([height, 0]);

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("right")
    .tickSize(0)
    .tickFormat(function(d) { console.log("d:"+d);return Math.round(d); });

// An SVG element with a bottom-right origin.
var svg = d3.select("#stepsGraph").append("svg")
    //.attr("width", width + margin.left + margin.right)
    //.attr("height", height + margin.top + margin.bottom)
    .attr("viewBox", "0 0 640 480")
    .attr("preserveAspectRatio", "xMinYMin meet")
  .append("g")
    //.attr("transform", "translate(" + margin.left + "," + margin.top + ")");


// A sliding container to hold the bars by birthyear.
var dates = svg.append("g")
    .attr("class", "dates");

// A label for the current year.
/*
var title = svg.append("text")
    .attr("class", "title")
    .attr("dy", ".71em")
    .text("");
*/
d3.csv("steps.csv", function(error, data) {

  // Convert strings to numbers.
  data.forEach(function(d) {
    d.date = +d.date;
    d.steps = +d.steps;
  });

  // Compute the extent of the data set in age and years.
  var steps1 = d3.max(data, function(d) { return d.steps; }),
      date0 = d3.min(data, function(d) { return d.date; }),
      date1 = d3.max(data, function(d) { return d.date; }),
      date = date1;

    console.log(date0);
    console.log(date1);
    console.log(steps1);
  // Update the scale domains.
  x.domain([date1 - 6, date1]);
  y.domain([0, steps1]);

  
  
  data = d3.nest()
      .key(function(d) { return d.date; })
      //.key(function(d) { return d.date - 5; })
      .rollup(function(v) { return v.map(function(d) { return d.steps; }); })
      .map(data);

  // Add an axis to show the population values.
  svg.append("g")
      .attr("class", "y axis")
      .attr("transform", "translate(" + width + ",0)")
      .call(yAxis)
    .selectAll("g")
    .filter(function(value) { return !value; })
      .classed("zero", true);

  // Add labeled rects for each birthyear (so that no enter or exit is required).
  var dateV = dates.selectAll(".date")
      .data(d3.range(date0, date1+1, 1))
    .enter().append("g")
      .attr("class", "dates")
      .attr("transform", function(dateV) { return "translate(" + x(dateV) + ",0)"; });

  console.log(dateV);

  dateV.selectAll("rect")
      .data(function(dateV) { return [data[dateV][0]] || [0]; })
    .enter().append("rect")
      .attr("x", -barWidth / 2)
      .attr("width", barWidth)
      .attr("y", y)
      .attr("height", function(value) { return height - y(value); });

  // Add labels to show birthyear.
  dateV.append("text")
      .attr("y", height+14)
      .text(function(dateV) { return dateV; });
  

  // Allow the arrow keys to change the displayed year.
  window.focus();
  d3.select(window).on("keydown", function() {
    switch (d3.event.keyCode) {
      case 37: date = Math.max(date0, date - 1); break;
      case 39: date = Math.min(date1, date + 1); break;
    }
    update();
  });

  function update() {
    if (!(date in data)) return;
    //title.text(date);
    
    dates.transition()
        .duration(400)
        .attr("transform", "translate(" + (x(date1) - x(date)) + ",0)");

    dateV.selectAll("rect")
        .data(function(dateV) { return [data[dateV][0]] || [0]; })
      .transition()
        .duration(400)
        .attr("y", y)
        .attr("height", function(value) { return height - y(value); });
  }
});
