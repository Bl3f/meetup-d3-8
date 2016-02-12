var itemSize = 15,
    cellSize = itemSize - 1,
    margin = {top: 120, right: 20, bottom: 20, left: 110},
    cssSelector = ".heatmap";

var width = 960 - margin.right - margin.left,
    height = 600 - margin.top - margin.bottom;

var formatDate = d3.time.format("%Y-%m-%d");

var colorScale = d3.scale.threshold()
    .domain([0.95, 1])
    .range(["#e74c3c", "#e67e22", "#2ecc71", "#2ecc71"]);

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

var d3Heatmap = {}

d3Heatmap.create = function (el, props, state) {
    var svg = d3.select(cssSelector)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    svg.append("g")
        .attr("class", "cells");

    svg.append("g") // Add the X Axis
        .attr("class", "y axis");

    svg.append("g") // Add the X Axis
        .attr("class", "x axis");

    this.update(el, state);
}

d3Heatmap.update = function (el, state) {
    this._drawpoints(el, state);
}

d3Heatmap._drawpoints = function (el, state) {
    var g = d3.select(el).selectAll('.cells');

    var xScale = d3.scale.ordinal()
        .domain(state.x)
        .rangeBands([0, state.x.length * itemSize]);

    var xAxis = d3.svg.axis()
        .scale(xScale)
        .tickFormat(function (d) {
            return d;
        })
        .outerTickSize(0)
        .orient("top");

    var yScale = d3.scale.ordinal()
        .domain(state.y)
        .rangeBands([0, state.y.length * itemSize]);

    var yAxis = d3.svg.axis()
        .scale(yScale)
        .tickFormat(function (d) {
            return d;
        })
        .outerTickSize(0)
        .orient("left");

    var cell = g.selectAll('.cell')
        .data(state.data);

    cell.enter().append('g')
        .attr('class', 'cell')
        .append('rect')
            .attr('width', cellSize)
            .attr('height', cellSize)
            .attr('fill', 'transparent');

    cell.select('rect')
        .attr('fill', function(d) { return colorScale(d.achievement); })
        .transition()
        .duration(500)
            .attr('y', function(d) { return yScale(d.country); })
            .attr('x', function(d) { return xScale(d.model); });

    cell.exit().remove();

    d3.select(el).select(".y.axis")
        .call(yAxis)
        .selectAll('text')
        .attr('font-weight', 'normal');

    d3.select(el).select(".x.axis")
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


var HeatMap = React.createClass({
    propTypes: {
        data: React.PropTypes.array
        //domain: React.PropTypes.object
    },
    getState : function () {
        return {
            data: this.props.data,
            x: get_x(this.props.data).sort(sorters[this.props.dataSort]),
            y: get_y(this.props.data).sort(sorters[this.props.dataSort])
        }
    },
    componentDidMount : function () {
        var el = this.getDOMNode();
        d3Heatmap.create(el, {}, this.getState());
    },
    componentDidUpdate: function() {
        var el = this.getDOMNode();
        d3Heatmap.update(el, this.getState());
    },
    render : function () {
        return (
            <div className="heatmap"></div>
        )
    }
});

var App = React.createClass({
    getInitialState : function () {
        return {
            data : [],
            selectedData: [],
            dataSort: 0
        }
    },
    componentDidMount : function () {
        var _ = this;

        d3.json(this.props.source)
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
                });

                var t_elements = d3.set(data.map(function ( item ) { return +item.day; } )).values().sort();

                var selectedData = data.filter(function ( item ) {
                    return +item.day === +t_elements[t_elements.length - 1];
                });

                _.setState({
                    data: data,
                    selectedData: selectedData
                });

                _.refs.rangeDate.max = parseInt(t_elements[t_elements.length - 1]);
                _.refs.rangeDate.min = parseInt(t_elements[0])
                _.refs.rangeDate.step = 86400000;
                _.refs.rangeDate.value = t_elements[t_elements.length - 1];
            }).get();
    },
    changeSort: function () {
        this.setState({
            dataSort: this.refs.selectSort.value
        });
    },
    filterData: function () {
        var _ = this;

        var selectedData = this.state.data.filter(function ( item ) {
            return +item.day === parseInt(_.refs.rangeDate.value);
        });

        _.setState({
            date: this.refs.rangeDate.value,
            selectedData: selectedData,
        });
    },
    render : function () {
        return (
            <div className="app">
                <select ref="selectSort" onChange={this.changeSort} >
                    <option value="0">A-Z</option>
                    <option value="1">Z-A</option>
                    <option value="2">random</option>
                </select>
                <input className="rangeDate" ref="rangeDate" type="range" valuemax="50" min="0" step="1" onChange={this.filterData} />
                <HeatMap data={this.state.selectedData} dataSort={this.state.dataSort} />
            </div>
        );
    }
});

ReactDOM.render(<App source="data.json" />, document.getElementById("my-app"));
