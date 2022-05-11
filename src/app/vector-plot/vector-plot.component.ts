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
  private _MAX_ANGLE = 3 * 360;
  phase_shift = 0;
  angle_sig = 30;
  angle_measure = 80;
  phase_shift_valid = true;
  angle_sig_valid = true;
  angle_measure_valid = true;
  private wave_measure: [number[], number[]] = [[], []];
  private wave_sig1: [number[], number[]] = [[], []];
  private wave_sig2: [number[], number[]] = [[], []];
  private _data_iterator: any;
  

  private layout_vectors = {
    autosize: false,
    width: 700,
    height: 700,
    title: {text: 'Zeitauschnitt der Wellen'},
    xaxis: {range: [-1.05, 1.05]},
    yaxis: {range: [-1.05, 1.05], scaleanchor: 'x'},
    show_legend: true,
    legend: {"orientation": "h"}
  };

  private layout_wave = {
    autosize: false,
    width: 700,
    height: 500,
    title: {text: 'Zeitlicher Verlauf der Wellenamplituden'},
    xaxis: {range: [0, this._MAX_ANGLE]},
    yaxis: {range: [-1.1, 1.1], title: 'Amplitude'},
    show_legend: true,
    legend: {"orientation": "h"}
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
  
    this.update(true);
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
    this.update(true);
  }

  requestAllData() {
    this.wave_measure = [[], []];
    this.wave_sig1 = [[], []];
    this.wave_sig2 = [[], []];
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
      this.update(true);
    }
  }

  formatVectorData(vals: any) {
    const line_width = 4;
    let angle_sig = deg2rad(this.angle_sig);
    let angle_measure = deg2rad(this.angle_measure);
    return [
      {x: [-10*Math.cos(angle_measure), 10*Math.cos(angle_measure)], y: [-10*Math.sin(angle_measure), 10*Math.sin(angle_measure)], type: "scatter", name: "Analysatorstellung", mode: "lines", line: {color: 'black', width: line_width/2, dash: 'dot'}},
      {x: [0, vals.a0], y: [0, 0], type: "scatter", name: "Eingangswelle", mode: "lines", line: {color: 'green', width: line_width}},
      {x: [0, vals.a1_sig*Math.cos(angle_sig)], y: [0, vals.a1_sig*Math.sin(angle_sig)], type: "scatter", name: "Hauptspannungsrichtung 1", mode: "lines", line: {color: 'blue', width: line_width}},
      {x: [0, -vals.a2_sig*Math.sin(angle_sig)], y: [0, vals.a2_sig*Math.cos(angle_sig)], type: "scatter", name: "Hauptspannungsrichtung 2", mode: "lines", line: {color: 'blue', width: line_width}},
      {x: [0, (vals.a1_m + vals.a2_m)*Math.cos(angle_measure)], y: [0, (vals.a1_m + vals.a2_m)*Math.sin(angle_measure)], type: "scatter", name: "Ausgangswelle", mode: "lines", line: {color: 'red', width: line_width}},
    ];
  }

  formatWaveData(vals: any) {
    let angle_step = this._MAX_ANGLE / this._N_STEPS;
    let angle_current = angle_step * this.wave_measure[0].length;
    this.wave_sig1[0].push(angle_current);
    this.wave_sig1[1].push(vals.a1_sig);
    this.wave_sig2[0].push(angle_current);
    this.wave_sig2[1].push(-vals.a2_sig);
    this.wave_measure[0].push(angle_current);
    this.wave_measure[1].push(vals.a1_m + vals.a2_m);
    return [
      {x: this.wave_sig1[0], y: this.wave_sig1[1], type: 'scatter', mode: 'lines', name: 'Hauptspannungsrichtung 1', marker: {color: 'blue'}},
      {x: this.wave_sig2[0], y: this.wave_sig2[1], type: 'scatter', mode: 'lines', name: 'Hauptspannungsrichtung 2', marker: {color: 'blue'}},
      {x: this.wave_measure[0], y: this.wave_measure[1], type: 'scatter', mode: 'lines', name: 'Ausgangswelle', marker: {color: 'red'}},
    ];
  }

  update(this: any, is_single: boolean) {
    let iter_item = this._data_iterator.next();
    
    if (!iter_item.done) {
      let data_vectors = this.formatVectorData(iter_item.value[1]);
      let data_wave = [];
      
      if (!is_single) {
         data_wave = this.formatWaveData(iter_item.value[1]);
      }
      
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
            redraw: is_single 
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
            redraw: is_single
          }
        }
      );

      let fps = 25;
      setTimeout(
        () => requestAnimationFrame(this.update.bind(this, false)),
        1000/fps
      ); 
    }
  }
}

function deg2rad(deg: number): number {
  return 2 * Math.PI / 360 * deg;
}
