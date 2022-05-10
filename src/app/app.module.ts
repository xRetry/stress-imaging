import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { VecDataService } from './vec-data.service';
import { VectorPlotComponent } from './vector-plot/vector-plot.component';

@NgModule({
  declarations: [
    AppComponent,
    VectorPlotComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [VecDataService],
  bootstrap: [AppComponent]
})
export class AppModule { }
