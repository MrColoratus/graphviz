import { Component, OnInit, ViewChild, Output, EventEmitter, Input } from '@angular/core';
import { InspectorTarget } from '../inspector-target';

@Component({
  selector: 'app-selector',
  templateUrl: './selector.component.html',
  styleUrls: ['./selector.component.css']
})
export class SelectorComponent implements OnInit {

  @Input() data: Array<any>;
  @Input() startingArea: number;
  @Output() targetChange = new EventEmitter<InspectorTarget>(false);

  private selectingArea: boolean = false;
  private currentSelector: string = 'Area';

  constructor() { }

  ngOnInit() {
    // Sort the data alphabetically
    this.data.sort((a, b) => {
      if(a.area < b.area) return -1;
      else if(a.area > b.area) return 1;
      else return 0;
    });

    this.beginSelectingArea();
  }

  changeTargetAvg(target: string) {

    this.selectingArea = false;

    const CRITERIA = ['unemployment','immigrants','convicted','education','income'];
    const _this = this;

    function generateTarget(condition: Function) {
      let totalPositive = 0;
      let result = _this.data.reduce((target, dataObj) => {

        if(condition(dataObj)) {
          totalPositive++;

          CRITERIA.forEach(c => {
            if(!target[c]) {
              target[c] = 0;
            }

            target[c] += dataObj[c];
          });
        }

        return target;
      }, {});

      CRITERIA.forEach(c => {
        result[c] = result[c] / totalPositive
      });

      return result;
    }

    let newTarget = null;

    switch(target) {
      case 'ghetto':
        // The average of all ghettos
        newTarget = generateTarget((d) => d.ghetto === 1);
        this.currentSelector = newTarget.name = "Ghetto average";
        break;
      case 'nonghetto':
        // The average of all non-ghettos
        newTarget = generateTarget((d) => d.ghetto === 0);
        this.currentSelector = newTarget.name = "Non-ghetto average";
        break;
      case 'all':
        // The average of all areas
        newTarget = generateTarget((d) => true);
        this.currentSelector = newTarget.name = "All areas average";
        break;
    }

    this.targetChange.emit(newTarget);
  }

  beginSelectingArea() {
    this.selectingArea = true;
    this.changeArea(this.data[this.startingArea]);
    this.currentSelector = 'Area';
  }

  changeArea(area) {
    area.name = area.area;
    this.targetChange.emit(area);
  }

}
