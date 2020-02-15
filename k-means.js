
var width = d3.select("#kmeans")[0][0].offsetWidth - 300;
var height = Math.max(200, width * .5);

var border = 1;
var mark = false;
var svg = d3.select("#kmeans svg")
  .attr('width', width)
  .attr('height', height)
  .style('padding', '20px')
  .style('background', 'white')
  .style('cursor', 'pointer')
  .on('click', function() {
    d3.event.preventDefault();
    epoch();
  });


var lineg = svg.append('g');
var pointg = svg.append('g');
var centerg = svg.append('g');
d3.select("#start")
  .on('click', function() { epoch(), make(); });
d3.select("#restart")
  .on('click', function() { restart(); make(); start(); });
d3.select("#reset")
  .on('click', function() { init(); make(); stop();});
d3.select("#stop")
.on('click', function() { stop();});

var clusters = [], points = [];

init(); 
function start(){
    t = setInterval(epoch, 2000);
    u = setInterval(make, 2000);
}
function epoch() {
  d3.select("#restart").attr("disabled", null);
  if (mark) {
    moveCentroid();
    make();
  } else {
    updateGroups();
    make();
  }
  mark = !mark;
}
function stop() { 
    clearInterval(t); 
    clearInterval(u);    
} 

function init() {
  d3.select("#restart").attr("disabled", "disabled");

  var N = parseInt(d3.select('#N')[0][0].value, 10);
  var K = parseInt(d3.select('#K')[0][0].value, 10);
  clusters = [];
  for (var i = 0; i < K; i++) {
    var g = {
      points: [],
      color: 'hsl(' + (i * 360 / K) + ',100%,50%)',
      center: {
        x: Math.random() * width,
        y: Math.random() * height
      },
      init: {
        center: {}
      }
    };
    g.init.center = {
      x: g.center.x,
      y: g.center.y
    };
    clusters.push(g);
  }

  points = [];
  mark = false;
  for (i = 0; i < N; i++) {
    var point ={
      x: Math.random() * width,
      y: Math.random() * height,
      cluster: undefined
    };
    point.init = {
      x: point.x,
      y: point.y,
      cluster: point.cluster
    };
    points.push(point);
  }
}

function restart() {
  mark = false;
  d3.select("#restart").attr("disabled", "disabled");

  clusters.forEach(function(g) {
    g.points = [];
    g.center.x = g.init.center.x;
    g.center.y = g.init.center.y;
  });

  for (var i = 0; i < points.length; i++) {
    var point = points[i];
    points[i] = {
      x: point.init.x,
      y: point.init.y,
      cluster: undefined,
      init: point.init
    };
  }
}


function make() {
  var circles = pointg.selectAll('circle')
    .data(points);
  circles.enter()
    .append('circle');
  circles.exit().remove();
  circles
    .transition()
    .duration(500)
    .attr('cx', function(d) { return d.x; })
    .attr('cy', function(d) { return d.y; })
    .attr('fill', function(d) { return d.cluster ? d.cluster.color : 'black'; })
    .attr('r', 5);

  if (points[0].cluster) {
    var l = lineg.selectAll('line')
      .data(points);
    var updateLine = function(lines) {
      lines
        .attr('x1', function(d) { return d.x; })
        .attr('y1', function(d) { return d.y; })
        .attr('x2', function(d) { return d.cluster.center.x; })
        .attr('y2', function(d) { return d.cluster.center.y; })
        .attr('stroke', function(d) { return d.cluster.color; });
    };
    updateLine(l.enter().append('line'));
    updateLine(l.transition().duration(500));
    l.exit().remove();
  } else {
    lineg.selectAll('line').remove();
  }

  var c = centerg.selectAll('path')
    .data(clusters);
  var centroidUpdate = function(centers) {
    centers
      .attr('transform', function(d) { return "translate(" + d.center.x + "," + d.center.y + ") rotate(0)";})
      .attr('fill', function(d,i) { return d.color; })
      .attr('stroke', '#black');
  };
  c.exit().remove();
  centroidUpdate(c.enter()
    .append('path')
    .attr('d', d3.svg.symbol().type('triangle-down'))
    .attr('stroke', '#aabbcc'));
  centroidUpdate(c
    .transition()
    .duration(500));}

function moveCentroid() {
  clusters.forEach(function(cluster, i) {
    if (cluster.points.length == 0) return;

    // get center of gravity
    var x = 0, y = 0;
    cluster.points.forEach(function(point) {
      x += point.x;
      y += point.y;
    });

    cluster.center = {
      x: x / cluster.points.length,
      y: y / cluster.points.length
    };
  });
  
}

function updateGroups() {
  clusters.forEach(function(g) { g.points = []; });
  points.forEach(function(point) {
    // find the nearest cluster
    var min = Infinity;
    var cluster;
    clusters.forEach(function(g) {
      var d = Math.pow(g.center.x - point.x, 2) + Math.pow(g.center.y - point.y, 2);
      if (d < min) {
        min = d;
        cluster = g;
      }
    });

    // update cluster
    cluster.points.push(point);
    point.cluster = cluster;
  });
}


