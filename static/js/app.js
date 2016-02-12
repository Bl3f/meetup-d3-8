var ReactBsTable = window.BootstrapTable;

var itemSize = 17,
    cellSize = itemSize - 1,
    margin = {top: 120, right: 20, bottom: 20, left: 110},
    cssSelector = ".heatmap";

var width = 960 - margin.right - margin.left,
    height = 300 - margin.top - margin.bottom;

var formatDate = d3.time.format("%Y-%m-%d");
var formatNumber = function(x) { return x === undefined || x === NaN ? '-' : d3.format(",r")(x); }

var colorScale = d3.scale.threshold()
    .domain([0.95, 1])
    .range(["#e74c3c", "#e67e22", "#2ecc71", "#2ecc71"]);

var sorters = [
    function(a, b) { return a < b ? -1 : 1; },
    function(a, b) { return a > b ? -1 : 1; },
    function(a, b) { return Math.random() < 0.5; }
]

var get_x = function(data) {
    return d3.set(data.map(function( item ) { return item.y; } )).values();
}

var get_y = function(data) {
    return d3.set(data.map(function( item ) { return item.x; } )).values();
}

var cleanNumber = function (number) {
    return number == null ? 0 : d3.round(number, 2);
}

var d3Heatmap = {}

d3Heatmap.create = function (node, elt, state) {
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

    this.update(node, elt, state);
}

d3Heatmap.update = function (node, elt, state) {
    this._drawpoints(node, elt, state);
}

d3Heatmap._drawpoints = function (node, elt, state) {
    var g = d3.select(node).selectAll('.cells');

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
        .on('mouseover', function (d, i) {
            if (elt.state.isClicked) {

            } else {
                elt.handleHover(d.x, d.y);                
            }
        })
        .on('mouseout', function (d, i) {
            if (elt.state.isClicked) {

            } else {
                elt.handleOut();
            }
        })
        .on('click', function (d, i) {
            elt.handleHover(d.x, d.y);
            if (!elt.state.isClicked) {
                d3.selectAll('.cell rect').style("stroke", "transparent")
                d3.select(this).style("stroke", "black");
                elt.handleClick();
            } else {
                d3.selectAll('.cell rect').style("stroke", "transparent")
                d3.select(this).style("stroke", "black");
            }

        })
        .style("stroke-width", "2px")
        .attr('fill', function(d) { return colorScale(d.achievement); })
        .transition()
        .duration(500)
            .attr('y', function(d) { return yScale(d.x); })
            .attr('x', function(d) { return xScale(d.y); });

    cell.exit().remove();

    d3.select(node).select(".y.axis")
        .call(yAxis)
        .selectAll('text')
        .attr('font-weight', 'normal');

    d3.select(node).select(".x.axis")
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
        data: React.PropTypes.array,
        xHovered: React.PropTypes.string,
        yHovered: React.PropTypes.string
    },
    getInitialState : function () {
        return {
            xHovered: null,
            yHovered: null,
            isClicked: false
        }
    },
    getState : function () {
        return {
            data: this.props.data,
            x: get_x(this.props.data).sort(sorters[this.props.dataSort]),
            y: get_y(this.props.data).sort(sorters[this.props.dataSort]),
        }
    },
    componentDidMount : function () {
        var node = ReactDOM.findDOMNode(this);
        d3Heatmap.create(node, this, this.getState());
    },
    componentDidUpdate: function() {
        var node = ReactDOM.findDOMNode(this);
        d3Heatmap.update(node, this, this.getState());
    },
    handleHover : function (x, y) {
        this.props.handleHover(x, y);
    },
    handleOut : function () {
        this.props.handleHover(null, null);
    },
    handleClick : function () {
        this.setState({
            isClicked: !this.state.isClicked
        })
    },
    checkChange : function () {
        this.handleClick();
    },
    render : function () {
        return (
            <div className="heatmap"></div>
        )
    }
});

var DisplayData = React.createClass({
    getValue : function () {
        if (this.props.data.length < 1 || this.props.x == null)
            return {}

        var d = this.props.data.filter(function (item) {
            return item.x == this.props.x && item.y == this.props.y && +item.day == this.props.day;
        }, this)[0];

        return d
    },
    render : function () {
        var d = this.getValue();

        return (
            <div className="details">
                <div>{formatDate(new Date(+this.props.day))}</div>
                <h3 className="metric-title">Views</h3>
                <span className="light"><img className="light-icon" width="22" src="/static/img/greenlight.png" /></span>
                <span className="value">{formatNumber(d.achievement * 100)}%</span>
                <div className="numbers">
                    <span className="new">{formatNumber(d.vAchieved)}</span> vs. <span className="target">{formatNumber(d.targetDay)}</span>
                    <span>{' '}(monthly target: {formatNumber(d.targetMonth)})</span>
                </div>
            </div>
        )
    }
});

var App = React.createClass({
    getInitialState : function () {
        return {
            data : [],
            selectedData: [],
            hoveredData: [],
            dataSort: 0
        }
    },
    componentDidMount : function () {
        var _ = this;

        d3.json(this.props.source)
            .on("load", function ( response ) {
                var data = response.map(function( item ) {
                    var newItem = {};
                    newItem.x = item.country;
                    newItem.y = item.product;
                    newItem.achievement = cleanNumber(item.achievement_views_daily);
                    newItem.vAchieved = cleanNumber(item.achieved_views)
                    newItem.targetMonth = cleanNumber(item.target_views)
                    newItem.targetDay = cleanNumber(item.target_views_daily)
                    newItem.day = formatDate.parse(item.day);

                    return newItem;
                });

                var t_elements = d3.set(data.map(function ( item ) { return +item.day; } )).values().sort();

                var selectedData = data.filter(function ( item ) {
                    return +item.day === +t_elements[t_elements.length - 1];
                });

                _.setState({
                    date: t_elements[t_elements.length - 1],
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
            selectedData: selectedData
        });
    },
    handleHover : function (x, y) {
        var _ = this;

        this.setState({
            xHovered: x,
            yHovered: y,
            hoveredData: _.state.data.filter(function (item) { return item.x == x && item.y == y; })
        })
    },
    render : function () {
        return (
            <div className="app">
                <div className="filters">
                    <select ref="selectSort" onChange={this.changeSort} >
                        <option value="0">A-Z</option>
                        <option value="1">Z-A</option>
                        <option value="2">random</option>
                    </select>
                    <input className="rangeDate" ref="rangeDate" type="range" onChange={this.filterData} />
                </div>
                <HeatMap data={this.state.selectedData} dataSort={this.state.dataSort} handleHover={this.handleHover} />
                <DisplayData day={this.state.date} x={this.state.xHovered} y={this.state.yHovered} data={this.state.selectedData} />
                <BootstrapTable data={this.state.hoveredData}>
                  <TableHeaderColumn dataField="day" dataFormat={formatDate} >Day</TableHeaderColumn>
                  <TableHeaderColumn dataField="x" isKey={true} >Country</TableHeaderColumn>
                  <TableHeaderColumn dataField="y">Model</TableHeaderColumn>
                  <TableHeaderColumn dataField="achievement">Achievement</TableHeaderColumn>
                  <TableHeaderColumn dataField="vAchieved">Volume achieved</TableHeaderColumn>
              </BootstrapTable>
            </div>
        );
    }
});

ReactDOM.render(<App source="data.json" />, document.getElementById("my-app"));
