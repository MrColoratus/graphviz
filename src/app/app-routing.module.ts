import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { OutlierComponent } from './graph/outlier/outlier.component';
import { InspectorComponent } from './graph/inspector/inspector.component';
import { PieChartComponent } from './graph/pie-chart/pie-chart.component';

const routes: Routes = [
  { path: 'home', component: DashboardComponent },
  { path: 'graph/1', component: PieChartComponent },
  { path: 'graph/2', component: OutlierComponent },
  { path: 'graph/3', component: InspectorComponent },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: '**', redirectTo: '/home', pathMatch: 'full' }
]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
