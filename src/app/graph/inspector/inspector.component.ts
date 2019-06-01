import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { DataService } from 'src/app/_services/data.service';

import * as d3 from 'd3';
import { InspectorTarget } from './inspector-target';

@Component({
  selector: 'app-inspector',
  templateUrl: './inspector.component.html',
  styleUrls: ['./inspector.component.css']
})
export class InspectorComponent implements OnInit {

  @ViewChild('svg') svgRef : ElementRef;

  private MARGIN = 50;
  private WIDTH = 600 - 2 * this.MARGIN;
  private HEIGHT = 400 - 2 * this.MARGIN - 50;
  
  private currentData;

  // SVG components
  private barContainer;
  private xScale;
  private xSubscale;
  private yScale;
  private target1Text;
  private target2Text;

  private target1: InspectorTarget;
  private target2: InspectorTarget;

  private subgroups = ['target1', 'target2'];
  private criterias = [
    {id: 'unemployment', name: 'Unemployment', threshold: 40},
    {id: 'immigrants', name: 'Immigrants', threshold: 50},
    {id: 'convicted', name: 'Convicted', threshold: 2.7},
    {id: 'education', name: 'Education', threshold: 50},
    {id: 'income', name: 'Income', threshold: 55}
  ];

  constructor(private dataService : DataService) {}

  ngOnInit() {

    function onSuccess(data) {

      let dataByYear = d3.nest()
        .key(function (d) { return d.year; })
        .rollup(function (v) {
          return v;
        })
        .entries(data);
  
      this.currentData = dataByYear[3].value;
  
      this.target1 = this.currentData[0];
      this.target2 = this.currentData[1];
      this.targets = [this.target1, this.target2];

      let areas = [];
      this.currentData.forEach(element => {
        areas.push(element.area);
      });
      this.areas = areas;

      this.setupVisuals();
      this.updateGraph();
    }

    this.dataService.getData(this, onSuccess);

  }

  setupVisuals() {

    const _this = this;
    let svg = d3.select(this.svgRef.nativeElement);
  
    const chart = svg.append('g')
      .attr('transform', `translate(${this.MARGIN}, ${this.MARGIN})`);

    // Scales
    this.xScale = d3.scaleBand()
      .range([0, this.WIDTH])
      .domain(this.criterias.map((c) => c.id))
      .padding(0.4);

    this.xSubscale = d3.scaleBand()
      .range([0, this.xScale.bandwidth()])
      .domain(this.subgroups)
      .padding(0.1);

    this.yScale = d3.scaleLinear()
      .range([this.HEIGHT, 0])
      .domain([0, 100]);

    // Horizontal Y lines
    const makeYLines = () => d3.axisLeft()
      .scale(this.yScale);

    // Add the axis' and lines
    chart.append('g')
      .attr('transform', `translate(0, ${this.HEIGHT})`)
      .call(d3.axisBottom(this.xScale));

    chart.append('g')
      .call(d3.axisLeft(this.yScale));

    chart.append('g')
      .attr('class', 'grid')
      .attr('opacity', 0.3)
      .call(makeYLines()
        .tickSize(-this.WIDTH, 0, 0)
        .tickFormat('')
      );

    this.barContainer = chart.append('g');

    let thresholdContainer = chart.append('g');
    this.criterias.forEach(c => {
      thresholdContainer.append('rect')
        .attr('x', _this.xScale(c.id))
        .attr('y', this.yScale(c.threshold))
        .attr('width', this.xSubscale.bandwidth() * 2.35)
        .attr('height', 1);
    });

    let textContainer = chart.append('g')
      .attr('transform', `translate(0, ${this.HEIGHT + 50})`);

    textContainer.append('text')
      .attr('transform', `translate(0, 15)`)
      .text('Comparing:')

    this.target1Text = textContainer.append('text')
      .attr('transform', `translate(100, 0)`)
      .attr('font-size', 15)
      .attr('fill', 'orange')
      .text('Target 1');

    this.target2Text = textContainer.append('text')
      .attr('transform', `translate(100, 30)`)
      .attr('font-size', 15)
      .attr('fill', 'red')
      .text('Target 2');
  }

  updateGraph() {
    const _this = this;

    this.target1Text.text(this.target1.name);
    this.target2Text.text(this.target2.name);

    let targetData = this.convertTargetsToData();

    this.barContainer.selectAll('g').data([]).exit().remove();

    let bargroups = this.barContainer
      .selectAll('g')
      .data(targetData)
      .enter()
      .append('g')
        .attr('transform', function(d) { return 'translate(' + _this.xScale(d.criteria) + ', 0)'; });

    bargroups.selectAll('rect')
      .data(function(d) { return _this.subgroups.map(function(key) { return {key: key, value: d[String(key)]}; })})
      .enter().append('rect')
        .attr('x', (d) => this.xSubscale(d.key))
        .attr('y', (d) => this.yScale(d.value))
        .attr('width', this.xSubscale.bandwidth())
        .attr('height', (d) => _this.HEIGHT - _this.yScale(d.value))
        .attr('fill', (d) => (d.key === 'target1' ? 'orange' : 'red'));

    bargroups.selectAll('text')
        .data(function(d) { return _this.subgroups.map(function(key) { return {key: key, value: d[String(key)]}; })})
        .enter().append('text')
        .attr('x', (d) => this.xSubscale(d.key) + _this.xSubscale.bandwidth()/2)
        .attr('y', (d) => this.yScale(d.value) - 5)
        .attr('width', this.xSubscale.bandwidth())
        .attr('height', (d) => _this.HEIGHT - _this.yScale(d.value))
        .attr('font-size', 12)
        .attr('text-anchor', 'middle')
        .text((d) => Number(d.value).toFixed(1));
  }

  convertTargetsToData(): Array<object> {

    let results = [];

    this.criterias.forEach(crit => {
      let id = crit.id;
      results.push({
        criteria: id,
        target1: this.target1[id],
        target2: this.target2[id]
      });
    })

    return results;
  }

  target1Change(target) {
    this.target1 = target;
    this.updateGraph();
  }

  target2Change(target) {
    this.target2 = target;
    this.updateGraph();
  }

}