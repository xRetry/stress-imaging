import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class VecDataService {

  constructor() { }

  getSimData(max_angle: number, n_steps: number, phase_shift: number, angle_sig: number, angle_measure: number) {
    max_angle = deg2rad(max_angle);
    phase_shift = deg2rad(phase_shift);
    angle_sig = deg2rad(angle_sig);
    angle_measure = deg2rad(angle_measure);

    let angle_step = max_angle / n_steps;
    var data = [];

    for (let i=0; i<n_steps; i++) {
      let angle_current = i * angle_step;
      if (i === n_steps-1) angle_current = max_angle;
      data.push(
        this.evaluate(angle_current, phase_shift, angle_sig, angle_measure)
      );
    }
    return data
  }

  evaluate(angle_current: number, phase_shift: number, angle_sig: number, angle_measure: number) {
    let a0 = 1;
    let a1_sig = a0 * Math.cos(angle_sig) * Math.cos(angle_current);
    let a2_sig = a0 * -Math.sin(angle_sig) * Math.cos(angle_current + phase_shift);
    a0 = Math.cos(angle_current);
    let a1_m = a1_sig * Math.cos(angle_measure - angle_sig);
    let a2_m = a2_sig * Math.sin(angle_measure - angle_sig);

    let step = {
      a0,
      a1_sig,
      a2_sig,
      a1_m,
      a2_m,
    }
    
    return step
  }
}

function deg2rad(deg: number): number {
  return 2 * Math.PI / 360 * deg;
}

function rad2deg(rad: number): number {
  return 360 / (2 * Math.PI) * rad;
}


