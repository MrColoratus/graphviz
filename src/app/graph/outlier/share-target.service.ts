import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ShareTargetService {

  private targetMouseOverSource = new BehaviorSubject<object>(null);
  mouseOverTarget = this.targetMouseOverSource.asObservable();

  private targetSelectedSource = new BehaviorSubject<object>(null);
  selectedTarget = this.targetSelectedSource.asObservable();

  private thresholdSource = new BehaviorSubject<boolean>(false);
  thresholdSelected = this.thresholdSource.asObservable();

  constructor() { }

  changeMouseOverTarget(target: object) {
    this.targetMouseOverSource.next(target);
  }

  changeSelectedTarget(target: object) {
    this.targetSelectedSource.next(target);
  }

  changeThresholdSelected(selected: boolean) {
    this.thresholdSource.next(selected);
  }
}
