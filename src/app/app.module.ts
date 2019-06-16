import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { OutlierComponent } from './graph/outlier/outlier.component';
import { OutlierGraphComponent } from './graph/outlier/outlier-graph/outlier-graph.component';
import { InspectorComponent } from './graph/inspector/inspector.component';
import { PieChartComponent } from './graph/pie-chart/pie-chart.component';
import { SelectorComponent } from './graph/inspector/selector/selector.component';
import { PieChartGraphComponent } from './graph/pie-chart/pie-chart-graph/pie-chart-graph.component';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    OutlierComponent,
    OutlierGraphComponent,
    InspectorComponent,
    PieChartComponent,
    SelectorComponent,
    PieChartGraphComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
