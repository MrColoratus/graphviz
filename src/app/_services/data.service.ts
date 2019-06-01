import { Injectable } from '@angular/core';

import * as d3 from "d3";

@Injectable({
  providedIn: 'root'
})
export class DataService {

  private dataUrl = "assets/data.csv";
  private data = null;

  constructor() { }

  getData(thisArg?:any, onSuccess?:Function, onError?:Function) {

    let thisRef = this;

    if (this.data != null) {
      if (thisArg != null && onSuccess != null) {
        onSuccess.call(thisArg, this.data);
      }
      
      return;
    }

    d3.csv(this.dataUrl)
        .then(function(data) {
            function checkNum(d, valueName:string) {
              if(isNaN(d[valueName]) || d[valueName] == 0){
                return false;
              }

              d[valueName] = +d[valueName];
              return true;
            }

            data = data.filter(function(d){
              return (
                checkNum(d, 'convicted') && 
                checkNum(d, 'education') &&
                checkNum(d, 'immigrants') &&
                checkNum(d, 'income') &&
                checkNum(d, 'unemployment')
                );
            });

            data.forEach(function(d) {
                d.criterias = +d.criterias;
                d.residents = +d.residents;
                d.ghetto = +d.ghetto;
                d.year = +d.year;
            });
            
            thisRef.data = data;

            if (thisArg != null && onSuccess != null) {
              onSuccess.call(thisArg, data);
            }
        })
        .catch(function(error) {
            console.log("Error while loading data:", error);

            if (thisArg != null && onError != null) {
              onError.call(thisArg, error);
            }
        });

  }
}
