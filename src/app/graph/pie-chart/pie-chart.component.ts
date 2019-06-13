import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3';
import { DataService } from 'src/app/_services/data.service';

@Component({
  selector: 'app-pie-chart',
  templateUrl: './pie-chart.component.html',
  styleUrls: ['./pie-chart.component.css']
})
export class PieChartComponent implements OnInit {

  width = 450/1.5;
  height = 450/1.5;
  margin = 40;
  radius = Math.min(this.width, this.height) / 2 - this.margin;

  ghettoesByYear = null;
  svg = null;

  constructor(
      private dataService: DataService
  ) { }

  ngOnInit() {
    this.setupViz();
    this.loadData();
  }

  setupViz() {
    this.svg = d3.select("#my_dataviz")
        .append("svg")
            .attr("width", this.width)
            .attr("height", this.height)
        .append("g")
            .attr("transform", "translate(" + this.width / 2 + "," + this.height / 2 + ")");
  }

  loadData() {
    let ref = this;
    
    this.dataService.getData(this, (rawData) => {
        this.ghettoesByYear = d3.nest()
            .key(function(d) { return d.year; })
            .key(function(d) { return d.ghetto; })
            .rollup(function(v) { return v.length; })
            .entries(rawData);

        this.update(2017);
    })
  }

  getGhettoesByYear(year: number) {
      let index = year - 2014;

      if(index < 0 || index > 3) {
          throw new Error("Invalid year: " + year);
      }

      return {
          notGhetto: this.ghettoesByYear[index].values[0].value,
          ghetto: this.ghettoesByYear[index].values[1].value
      };
  }

  update(year: number): void {

    let data = this.getGhettoesByYear(year);

    // set the color scale
    let color = d3.scaleOrdinal()
        .domain(data)
        .range(['orange', 'red']);

    let pie = d3.pie()
        .value(function(d) {return d.value; })
        .sort(function(a, b) { return d3.ascending(a.key, b.key);} ) // This make sure that group order remains the same in the pie chart
    let data_ready = pie(d3.entries(data))

    var u = this.svg.selectAll("path")
        .data(data_ready);

    let arcGenerator = d3.arc()
        .innerRadius(0)
        .outerRadius(this.radius)

    // Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
    u
        .enter()
        .append('path')
        .merge(u)
        .transition()
        .duration(1000)
        .attr('d', arcGenerator)
        .attr('fill', function(d){ return(color(d.data.key)) })
        .attr("stroke", "white")
        .style("stroke-width", "2px")
        .style("opacity", 1)

    // remove the group that is not present anymore
    u
        .exit()
        .remove();

    u = this.svg.selectAll('text').data([]).exit().remove();

    this.svg.selectAll('text')
        .data(data_ready)
        .enter()
        .append('text')
        .text(function(d){ 
            let isGhetto = d.data.key === 'ghetto';
            return (isGhetto ? 'Ghettos: ' : 'Non-ghettos: ') + d.data.value;
        })
        .attr("transform", function(d) { return "translate(" + arcGenerator.centroid(d) + ")";  })
        .style("text-anchor", "middle")
        .style("font-size", 13)
  }

}
