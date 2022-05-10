import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { VecDataService } from '../vec-data.service';

declare var Plotly: any;

@Component({
  selector: 'vector-plot',
  templateUrl: './vector-plot.component.html',
  styleUrls: ['./vector-plot.component.css']
})


export class VectorPlotComponent implements OnInit {
  @ViewChild("vectorGraph", { static: false }) vectorGraph!: ElementRef;
  @ViewChild("waveGraph", { static: false }) waveGraph!: ElementRef;
  private _N_STEPS = 100;
  private _MAX_ANGLE = 4 * 360;
  phase_shift = 0;
  angle_sig = 45;
  angle_measure = 120;
  phase_shift_valid = true;
  angle_sig_valid = true;
  angle_measure_valid = true;
  private x_wave: number[] = [];
  private y_wave: number[] = [];
  private _data_iterator: any;
 
  // private _data_vectors: any;
  // private _data_wave: any;
  
  private layout_vectors = {
    autosize: false,
    width: 500,
    height: 500,
    xaxis: {range: [-1.05, 1.05]},
    yaxis: {range: [-1.05, 1.05], scaleanchor: 'x'},
    show_legend: true,
    legend: {"orientation": "h"}
  };

  private layout_wave = {
    autosize: false,
    width: 700,
    height: 500,
    xaxis: {range: [0, this._MAX_ANGLE]},
    yaxis: {range: [-1.1, 1.1]}
  };

  constructor(private _vecDataService: VecDataService) { }

  ngOnInit() { }

  ngAfterViewInit() {
    this.requestSingleData();
    let vals = this._data_iterator.next();
    let data_vectors = this.formatVectorData(vals.value[1])
    let data_wave = this.formatWaveData(vals.value[1])

    Plotly.newPlot(
      this.vectorGraph.nativeElement,
      data_vectors,
      this.layout_vectors
    );

    Plotly.newPlot(
      this.waveGraph.nativeElement,
      data_wave,
      this.layout_wave
    );
  
    this.update();
  }

  verifyInput(key: string, value_str: string) {
    let value = Number(value_str);
    if (key === 'd_phi') {
      if (isNaN(value)) {
        this.phase_shift_valid = false;
      } else {
        this.phase_shift_valid = true;
        this.phase_shift = value;
      }
    }
    if (key === 'phi_m') {
      if (isNaN(value)) {
        this.angle_measure_valid = false;
      } else {
        this.angle_measure_valid = true;
        this.angle_measure = value;
      }
    }
    if (key === 'phi_sig') {
      if (isNaN(value)) {
        this.angle_sig_valid = false;
      } else {
        this.angle_sig_valid = true;
        this.angle_sig = value;
      }
    }
    this.requestSingleData();
    this.update();
  }

  requestAllData() {
    this.x_wave = [];
    this.y_wave = [];
    this._data_iterator = this._vecDataService.getSimData(this._MAX_ANGLE, this._N_STEPS, this.phase_shift, this.angle_sig, this.angle_measure).entries();
  }

  requestSingleData() {
    this._data_iterator = this._vecDataService.getSimData(0, 1, this.phase_shift, this.angle_sig, this.angle_measure).entries();
  }


  onAnimate(d_phi_str: string, phi_m_str: string, phi_sig_str: string) {
    let d_phi_new = Number(d_phi_str);
    let phi_m_new = Number(phi_m_str);
    let phi_sig_new = Number(phi_sig_str);

    if (!isNaN(d_phi_new) && !isNaN(phi_m_new) && !isNaN(phi_sig_new)) {
      this.phase_shift = d_phi_new;
      this.angle_measure = phi_m_new;
      this.angle_sig = phi_sig_new;
      this.requestAllData();
      this.update();
    }
  }

  formatVectorData(vals: any) {
    let angle_sig = deg2rad(this.angle_sig);
    let angle_measure = deg2rad(this.angle_measure);
    return [
      {x: [0, vals.a0], y: [0, 0], type: "scatter", name: "Eingangswelle", mode: "lines", marker: {color: 'green'}},
      {x: [0, vals.a1_sig*Math.cos(angle_sig)], y: [0, vals.a1_sig*Math.sin(angle_sig)], type: "scatter", name: "Hauptspannungsrichtung 1", mode: "lines", marker: {color: 'blue'}},
      {x: [0, -vals.a2_sig*Math.sin(angle_sig)], y: [0, vals.a2_sig*Math.cos(angle_sig)], type: "scatter", name: "Hauptspannungsrichtung 2", mode: "lines", marker: {color: 'blue'}},
      {x: [0, (vals.a1_m + vals.a2_m)*Math.cos(angle_measure)], y: [0, (vals.a1_m + vals.a2_m)*Math.sin(angle_measure)], type: "scatter", name: "Ausgangswelle", mode: "lines", marker: {color: 'red'}}
    ];
  }

  formatWaveData(vals: any) {
    let angle_step = this._MAX_ANGLE / this._N_STEPS;
    this.x_wave.push(angle_step * this.x_wave.length);
    this.y_wave.push(vals.a1_m + vals.a2_m);
    return [
      {x: this.x_wave, y: this.y_wave, type: 'scatter', mode: 'lines', marker: {color: 'red'}}
    ];
  }

  update(this: any) {
    let iter_item = this._data_iterator.next();
    
    if (!iter_item.done) {
      let data_vectors = this.formatVectorData(iter_item.value[1]);
      let data_wave = this.formatWaveData(iter_item.value[1]);
      
      Plotly.animate(
        this.vectorGraph.nativeElement, 
        {
          data: data_vectors
        }, 
        {
          transition: {
            duration: 0
          },
          frame: {
            duration: 0,
            redraw: false 
          }
        }
      );
        
      Plotly.animate(
        this.waveGraph.nativeElement, 
        {
          data: data_wave
        }, 
        {
          transition: {
            duration: 0
          },
          frame: {
            duration: 0,
            redraw: false
          }
        }
      );

      let fps = 25;
      setTimeout(
        () => requestAnimationFrame(this.update.bind(this)),
        1000/fps
      ); 
    }
  }
}

function deg2rad(deg: number): number {
  return 2 * Math.PI / 360 * deg;
}
