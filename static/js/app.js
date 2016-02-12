var itemSize = 18,
    cellSize = itemSize - 1,
    margin = {top: 120, right: 20, bottom: 20, left: 110},
    cssSelector = ".heatmap";

var formatDate = d3.time.format("%Y-%m-%d");

var rangeDate = document.getElementById("range-date");
var selectSort = document.getElementById("select-sort");

var populateRange = function(t) {
    rangeDate.step = 86400000;
    rangeDate.min = parseInt(t[0]);
    rangeDate.max = parseInt(t[t.length - 1]);
    rangeDate.value = t[t.length - 1];
}

var sorters = [
    function(a, b) { return a < b ? -1 : 1; },
    function(a, b) { return a > b ? -1 : 1; },
    function(a, b) { return Math.random() < 0.5; }
]

var get_x = function(data) {
    return d3.set(data.map(function( item ) { return item.model; } )).values();
}

var get_y = function(data) {
    return d3.set(data.map(function( item ) { return item.country; } )).values();
}


d3.json('data.json')
    .on("load", function ( response ) {
        var width = 960 - margin.right - margin.left,
            height = 700 - margin.top - margin.bottom;

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
        });

        var t_elements = d3.set(data.map(function ( item ) { return +item.day; } )).values().sort();

        var selectedData = data.filter(function ( item ) {
            return +item.day === +t_elements[t_elements.length - 1];
        })

        populateRange(t_elements);

        var colorScale = d3.scale.threshold()
            .domain([0.95, 1])
            .range(["#e74c3c", "#e67e22", "#2ecc71", "#2ecc71"]);

        var svg = d3.select(cssSelector)
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        svg.append("g")
            .attr("class", "squares");

        svg.append("g") // Add the X Axis
            .attr("class", "y axis");

        svg.append("g") // Add the X Axis
            .attr("class", "x axis");

        rangeDate.addEventListener("input", function() {
            var selectedDate = this.value;

            selectedData = data.filter(function ( item ) {
                return +item.day === parseInt(selectedDate);
            });

            display(selectedData, parseInt(selectSort.value));
        });

        selectSort.addEventListener("input", function() {
            display(selectedData, parseInt(this.value));
        });

        var display = function(data, idSorter) {
            if (idSorter == undefined)
                var idSorter = 0;

            var x = get_x(selectedData).sort(sorters[idSorter]),
                y = get_y(selectedData).sort(sorters[idSorter]);


            var xScale = d3.scale.ordinal()
                .domain(x)
                .rangeBands([0, x.length * itemSize]);

            var xAxis = d3.svg.axis()
                .scale(xScale)
                .tickFormat(function (d) {
                    return d;
                })
                .orient("top");

            var yScale = d3.scale.ordinal()
                .domain(y)
                .rangeBands([0, y.length * itemSize]);

            var yAxis = d3.svg.axis()
                .scale(yScale)
                .tickFormat(function (d) {
                    return d;
                })
                .orient("left");

            var selection = svg.select(".squares").selectAll('.cell')
                .data(data);

            selection.enter().append('g')
                .attr('class', 'cell')
                .append('rect')
                    .attr('width', cellSize)
                    .attr('height', cellSize)
                    .attr('fill', 'transparent');

            selection.select('rect')
                .attr('y', function(d) { return yScale(d.country); })
                .attr('x', function(d) { return xScale(d.model); })
                .attr('fill', function(d) { return colorScale(d.achievement); });
                
            selection.exit().remove();

            svg.select(".y.axis")
                .call(yAxis)
                .selectAll('text')
                .attr('font-weight', 'normal');

            svg.select(".x.axis")
                .call(xAxis)
                .selectAll('text')
                .attr('font-weight', 'normal')
                .style("text-anchor", "start")
                .attr("dx", ".8em")
                .attr("dy", ".5em")
                .attr("transform", function (d) {
                    return "rotate(-65)"
                });
        }

        display(selectedData);

    }).get();
