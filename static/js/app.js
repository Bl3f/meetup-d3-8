var itemSize = 22,
    cellSize = 22,
    margin = {top: 120, right: 20, bottom: 20, left: 110},
    cssSelector = ".heatmap",
    selectedDate = new Date(2015, 11, 1);

var formatDate = d3.time.format("%Y-%m-%d");

var unique = function(d, i, self) {
    return self.indexOf(d) == i;
};

d3.json('data.json')
    .on("load", function ( response ) {
        var data = response.map(function( item ) {
            var newItem = {};
            newItem.country = item.country;
            newItem.model = item.product;
            newItem.achievement = item.achievement_views_daily;
            newItem.vAchieved = item.achieved_views
            newItem.targetMonth = item.target_views
            newItem.targetDay = item.target_views_daily
            newItem.day = formatDate.parse(item.day);

            return newItem;
        }).filter(function ( item ) {
            return +item.day === +selectedDate;
        });

        data = data.concat(data);
        data = data.concat(data);
        
        var x_size = data.map(function( item ) { return item.model; } ).filter(unique).length,
            y_size = data.map(function( item ) { return item.country; } ).filter(unique).length;

        var x1 = x_size,
            x2 = parseInt(x_size / 3),
            y1 = 2;
        
        var points = [x1 * y1 + x2, x1 * y1 + x2 + 3, x1 * (y1 + 1) + x2, x1 * (y1 + 1) + x2 + 3,  x1 * (y1 + 2) + x2, x1 * (y1 + 2) + x2 + 3,  x1 * (y1 + 3) + x2, x1 * (y1 + 3) + x2 + 3, x1 * (y1 + 5) + x2 - 1, x1 * (y1 + 6) + x2, x1 * (y1 + 6) + x2 + 1, x1 * (y1 + 6) + x2 + 2, x1 * (y1 + 6) + x2 + 3, x1 * (y1 + 5) + x2 + 4]

        var width = 960 - margin.right - margin.left,
            height = 700 - margin.top - margin.bottom;

        var svg = d3.select(cssSelector)
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var cells = svg.selectAll('rect')
            .data(data)
            .enter().append('g').append('rect')
            .attr('class', 'cell')
            .attr('width', cellSize)
            .attr('height', cellSize)
            .attr('y', function(d, i) { return (cellSize + 1) * ( parseInt( i / x_size ) ); })
            .attr('x', function(d, i) { return (cellSize + 1) * ( i % x_size ); })
            .attr('fill', function(d, i) {
                return "#"+((1<<24)*Math.random()|0).toString(16); // see http://stackoverflow.com/a/5365036
            });

        cells.attr('fill', function(d, i) {
            return points.indexOf(i) > -1 ? "white" : "black";
        });

        window.setInterval(function() {
            if (Math.random() < 0)
                cells.attr('fill', function(d, i) {
                    return "#"+((1<<24)*Math.random()|0).toString(16); // see http://stackoverflow.com/a/5365036
                });
            else
                cells.attr('fill', function(d, i) {
                    return points.indexOf(i) > -1 ? "white" : "black";
                });
        }, 1000);

    }).get();
