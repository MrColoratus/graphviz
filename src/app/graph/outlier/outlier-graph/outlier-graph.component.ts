import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import * as d3 from 'd3';
import { DataService } from '../../../_services/data.service';
import { ShareTargetService } from '../share-target.service';

@Component({
  selector: 'app-outlier-graph',
  styleUrls: ['./outlier-graph.component.css'],
  template: 
  `
  <div id="container" class="container background">
    <svg #svg></svg>
  </div>
  `
})
export class OutlierGraphComponent implements OnInit {
  @Input() year: number;
  @Input() threshold: number;
  @Input() feature: string;

  @ViewChild('svg') svgRef : ElementRef;

  mouseOverTarget: object;
  selectedTarget: object;
  thresholdSelected: boolean;
  
  constructor(private dataService: DataService,
              private shareTargetService: ShareTargetService) {}

  ngOnInit() {

    let compRef = this;

    function onSuccess(data) {
      let dataByYear = d3.nest()
        .key(function (d) { return d.year; })
        .rollup(function (v) {
          let areas = [];
          v.forEach(currentArea => {
            areas.push({
              area: currentArea.area,
              value: currentArea[compRef.feature],
              ghetto: currentArea.ghetto
            });
          });
          return areas;
        })
        .entries(data);

      let currentData = dataByYear[compRef.year - 2014].value;

      let margin = 50,
        width = 1000 - 2 * margin,
        height = 150 - 2 * margin,
        barHeight = 50,
        barWidth = 2,
        thresholdHeight = 90,
        thresholdWidth = 2,
        barSelectScale = 1.5,
        thresholdSelectScale = 1.1;

      let svg = d3.select(this.svgRef.nativeElement);

      let chart = svg.append('g')
        .attr("transform", `translate(${margin}, ${margin})`);

      let minVal = Math.floor(d3.min(currentData, (d) => { return d.value; }) - 0.000001);
      let maxVal = Math.ceil(d3.max(currentData, (d) => { return d.value; }) - 0.000001);

      let xScale = d3.scaleLinear()
        .domain([minVal, maxVal])
        .range([0, width]);

      let xAxis = d3.axisBottom(xScale).tickFormat(d => d + "%");
      
      chart.append('g')
        .attr('transform', `translate(0, ${height})`)
        .call(xAxis);

      function markThreshold() {
        chart.selectAll('.thresholdBar')
          .attr('height', thresholdHeight * thresholdSelectScale)
          .attr('y', height - (thresholdHeight/1.1) * thresholdSelectScale);

        chart.selectAll('.thresholdText')
          .attr('opacity', 1);
      }

      function clearThreshold() {
        chart.selectAll('.thresholdBar')
          .attr('height', thresholdHeight)
          .attr('y', height - thresholdHeight/1.1);

        chart.selectAll('.thresholdText')
          .attr('opacity', 0);
      }

      chart.append('g')
        .attr('class', 'threshold')
        .append('rect')
        .attr('class', 'thresholdBar')
        .attr('x', (s) => xScale(this.threshold))
        .attr('y', height - thresholdHeight)
        .attr('height', (s) => thresholdHeight)
        .attr('width', thresholdWidth)
        .attr('fill', 'black')
        .on('mouseover', function () {

          compRef.shareTargetService.changeThresholdSelected(true);

        })
        .on('mouseleave', function() {

          compRef.shareTargetService.changeThresholdSelected(false);

        });

        chart.select('.threshold')
          .append('text')
          .attr('class', 'thresholdText')
          .attr('x', xScale(this.threshold))
          .attr('y', height - thresholdHeight * thresholdSelectScale)
          .attr('dx', 5)
          .attr('dy', 15)
          .attr('text-anchor', 'left')
          .attr('opacity', 0)
          .attr('style', 'pointer-events: none')
          .text('Threshold: \t' + this.threshold + '%');


      let barGroups = chart.selectAll()
        .data(currentData)
        .enter()
        .append('g');

      function clearGraph() {
        chart.selectAll('.bar')
        .attr('height', barHeight)
        .attr('width', barWidth)
        .attr('y', height - barHeight);

        chart.selectAll('.value')
          .attr('opacity', 0);
      }

      function markGraph(actual) {
        chart.selectAll('.bar')
        .filter((d, i) => (actual.area == d.area))
        .attr('height', barHeight * barSelectScale)
        .attr('width', barWidth * barSelectScale)
        .attr('y', height - barHeight * barSelectScale);

        chart.selectAll('.value')
          .filter((d, i) => (actual.area == d.area))
          .attr('opacity', 1);
      }

      barGroups
        .append('rect')
        .attr('x', (s) => xScale(s.value))
        .attr('y', height - barHeight)
        .attr('height', (s) => barHeight)
        .attr('width', barWidth)
        .attr('class', (s) => (s.ghetto == 1 ? 'color2' : 'color1') + ' bar')
        .on('mouseover', function (actual) {

          compRef.shareTargetService.changeMouseOverTarget(actual);

        })
        .on('mouseleave', function () {

          compRef.shareTargetService.changeMouseOverTarget(null);

        })
        .on('click', function(actual) {

          compRef.shareTargetService.changeSelectedTarget(actual);
          d3.event.stopPropagation();

        });

      svg.on('click', function(actual) {

        if(compRef.selectedTarget != null) {
          compRef.shareTargetService.changeSelectedTarget(null);
        }

      });

      compRef.shareTargetService.mouseOverTarget.subscribe(target => {
        this.mouseOverTarget = target;

        clearGraph();
        if(compRef.mouseOverTarget) {
          markGraph(compRef.mouseOverTarget);
        } else if(compRef.selectedTarget) {
          markGraph(compRef.selectedTarget);
        }
      });
      compRef.shareTargetService.selectedTarget.subscribe(target => {
        this.selectedTarget = target;

        clearGraph();
        if(compRef.selectedTarget) {
          markGraph(compRef.selectedTarget);
        }
      });
      compRef.shareTargetService.thresholdSelected.subscribe(selected => {
        this.thresholdSelected = selected;

        if(this.thresholdSelected) {
          markThreshold();
        } else {
          clearThreshold();
        }
      });

      let tempScale = d3.scaleLinear()
        .domain([minVal, maxVal])
        .range([0, 100]);

      barGroups.append('text')
        .attr('class', 'value')
        .attr('x', (s) => xScale(s.value))
        .attr('y', height - barHeight * barSelectScale)
        .attr('dx', (data) => (tempScale(data.value) <= 50) ? 5 : -5)
        .attr('dy', 15)
        .attr('text-anchor', (data) => (tempScale(data.value) <= 50) ? 'start' : 'end')
        .attr('style', 'pointer-events: none')
        .attr('opacity', 0)
        .attr('fill', (s) => s.ghetto ? 'darkred' : 'darkgray')
        .text((s) => s.area + '\t' + Number(s.value).toFixed(1) + '%');
    }

    this.dataService.getData(this, onSuccess);

  }

  changeTargetArea(area: string) {
    console.log('Change area to:', area);
  }
}
