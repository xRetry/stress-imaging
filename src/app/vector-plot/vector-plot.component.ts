import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

declare var Plotly: any;

@Component({
  selector: 'vector-plot',
  templateUrl: './vector-plot.component.html',
  styleUrls: ['./vector-plot.component.css']
})


export class VectorPlotComponent implements OnInit {
  @ViewChild("vectorGraph", { static: false }) vectorGraph!: ElementRef;
  @ViewChild("waveGraph", { static: false }) waveGraph!: ElementRef;
  private phi_step = Math.PI / 30;
  private phi = 0;
  private phi_duration = 6 * Math.PI;
  d_phi = 0;
  phi_sig = 45;
  phi_m = 120;
  private x_wave: number[] = [];
  private y_wave: number[] = [];
  private is_done = false;
 
  private data_vectors: any;
  private data_wave: any;
  
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
    xaxis: {range: [0, this.phi_duration]},
    yaxis: {range: [-1.1, 1.1]}
  };

  constructor() { }

  ngOnInit() { }

  ngAfterViewInit() {
    this.compute();

    Plotly.newPlot(
      this.vectorGraph.nativeElement,
      this.data_vectors,
      this.layout_vectors
    );

    Plotly.newPlot(
      this.waveGraph.nativeElement,
      this.data_wave,
      this.layout_wave
    );
    this.update();
  }

  compute() {
    let d_phi = deg2rad(this.d_phi);
    let phi_sig = deg2rad(this.phi_sig);
    let phi_m = deg2rad(this.phi_m);

    let a0 = Math.cos(this.phi);
    let a1_sig = a0 * Math.cos(phi_sig);
    let a2_sig = a0 * -Math.sin(phi_sig) * Math.cos(d_phi);
    let a1_m = a1_sig * Math.cos(phi_m - phi_sig);
    let a2_m = a2_sig * Math.sin(phi_m - phi_sig);

    this.data_vectors = [
      {x: [0, a0], y: [0, 0], type: "scatter", name: "Eingangswelle", mode: "lines", marker: {color: 'green'}},
      {x: [0, a1_sig*Math.cos(phi_sig)], y: [0, a1_sig*Math.sin(phi_sig)], type: "scatter", name: "Hauptspannungsrichtung 1", mode: "lines", marker: {color: 'blue'}},
      {x: [0, -a2_sig*Math.sin(phi_sig)], y: [0, a2_sig*Math.cos(phi_sig)], type: "scatter", name: "Hauptspannungsrichtung 2", mode: "lines", marker: {color: 'blue'}},
      {x: [0, (a1_m + a2_m)*Math.cos(phi_m)], y: [0, (a1_m + a2_m)*Math.sin(phi_m)], type: "scatter", name: "Ausgangswelle", mode: "lines", marker: {color: 'red'}}
    ];

    this.y_wave.push(a1_m + a2_m);
    this.x_wave.push(this.phi);

    this.data_wave = [
      {x: this.x_wave, y: this.y_wave, type: "scatter", name: "dsf", mode: "lines", marker: {color: 'red'}},
    ]

    this.phi += this.phi_step;
    if (this.phi > this.phi_duration) {
        this.phi = 0;
        this.x_wave = [];
        this.y_wave = [];
        this.is_done = true;
    }
  }

  plotGraphs(d_phi_str: string, phi_m_str: string, phi_sig_str: string) {
    let d_phi_new = Number(d_phi_str);
    let phi_m_new = Number(phi_m_str);
    let phi_sig_new = Number(phi_sig_str);

    if (d_phi_new != NaN && phi_m_new != NaN && phi_sig_new != NaN) {
      this.d_phi = d_phi_new;
      this.phi_m = phi_m_new;
      this.phi_sig = phi_sig_new;
      this.is_done = false;
      this.update();
    }
  }

  update(this: any) {
    this.compute();

    Plotly.animate(
      this.vectorGraph.nativeElement, 
      {
        data: this.data_vectors
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
        data: this.data_wave
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

    if (!this.is_done) {
      requestAnimationFrame(this.update.bind(this));
    }
  }
}

function deg2rad(deg: number): number {
  return 2 * Math.PI / 360 * deg;
}

function rad2deg(rad: number): number {
  return 360 / (2 * Math.PI) * rad;
}

