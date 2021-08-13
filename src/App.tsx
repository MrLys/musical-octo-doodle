import React, {useEffect, useState} from 'react';
import { arc } from "d3-shape"
import { scaleLinear } from "d3-scale"
import {Client} from '@stomp/stompjs';
import './App.css';
type State = {
  cputemperature: number
  cpuutilization: number
  gpumemoryUtilization: number
  gputemperature: number
  gpuutilization: number
  memoryUtilization: number
}
const connect = (client : Client, setState: any) => {
  client.configure({
    brokerURL: 'ws://192.168.172.1:8080/hwinfo',
    onConnect: () => {
      console.log('Connected:');
      client.subscribe('/queue/info', (message) => {
          const dto : State = JSON.parse(message.body);
            setState(dto);
      })
    },
    debug: (str) => {
      console.log(new Date(), str);
    }
  });
  client.activate();
}


const red = "#f31700";
const green = "#37b400";
const orange = "#ffa000";
const yellow = "#ffe000";
const blue = "#4ccafa"
type GaugeProps = {
    value: number
    min: number
    max: number
    label: string
    units: string
    fillFinder(value: number):string
}
const Gauge = ({
                   value=50,
                   min=0,
                   max=100,
                   label,
                   units,
                   fillFinder
               } : GaugeProps) => {

    const percentageValue = (value/100.0);
    const formattedValue = Math.round(value)
    const percentScale = scaleLinear()
        .domain([min, max])
        .range([0, 1])
    const percent = percentScale(value)
    const angleScale = scaleLinear()
        .domain([0, 1])
        .range([-Math.PI / 2, Math.PI / 2])
        .clamp(true)
    const angle = angleScale(percent)
    const backgroundArc = arc();
    const backgroundArcData = backgroundArc({
        startAngle: -Math.PI / 2,
        endAngle: angle,
        innerRadius: 0.65,
        outerRadius: 1,
    });
    return (
        <div>
            <p className="gauge-label" style={{color: "#FFFFFF"}}>{label}</p>
            <svg style={{overflow: "visible"}}
                 width="9em"
                 viewBox={[
                     -1, -1,
                     2, 1,
                 ].join(" ")}>
                <defs>
                    <linearGradient
                        id="Gauge__gradient"
                        gradientUnits="userSpaceOnUse"
                        x1="-1"
                        x2="1"
                        y2="0">
                    </linearGradient>
                </defs>
                <path
                    d={backgroundArcData!!}
                    fill={fillFinder(value)}
                />
            </svg>
            <h3 className="gauge-value" style={{color: fillFinder(value)}}>{value}{units}</h3>
        </div>
    )
}
const fillFinderGPUTemp = (value: number) : string => {
    if (value > 90) return red;
    if (value > 75) return orange;
    if (value > 60) return yellow;
    if (value > 40) return green;
    return blue;
}
const fillFinderCPUTemp = (value: number) : string => {
    if (value > 75) return red;
    if (value > 60) return orange;
    if (value > 50) return yellow;
    if (value > 30) return green;
    return blue;
}
const fillFinderCPUUtil = (value: number) : string => {
    if (value > 90) return red;
    if (value > 75) return orange;
    if (value > 60) return yellow;
    if (value > 10) return green;
    return blue;
}
const fillFinderGPUUtil = (value: number) : string => {
    if (value > 90) return red;
    if (value > 75) return orange;
    if (value > 60) return yellow;
    if (value > 10) return green;
    return blue;
}
const fillFinderRAM = (value: number) : string => {
    if (value > 90) return red;
    if (value > 75) return orange;
    if (value > 60) return yellow;
    if (value > 10) return green;
    return blue;
}
const fillFinderVRAM = (value: number) : string => {
    if (value > 90) return red;
    if (value > 75) return orange;
    if (value > 60) return yellow;
    if (value > 10) return green;
    return blue;
}
function App() {
  const [client, setClient] = useState(new Client());
  const [state, setState] = useState({} as State);
  useEffect(() => {
    connect(client, setState);
  }, [client, state])
  return (
      <div className="App">
          <div className="container">
              <div className="row">
                  <div className="item">
                      <Gauge label={"GPU"} max={100} min={0} units={"°C"} value={state.gputemperature}  fillFinder={fillFinderGPUTemp}/>
                  </div>
                  <div className="item">
                      <Gauge label={"GPU"} max={100} min={0} units={"%"} value={state.gpuutilization} fillFinder={fillFinderGPUUtil}/>
                  </div>
              </div>
              <div className="row">
                  <div className="item">
                      <Gauge label={"CPU"} max={100} min={0} units={"°C"} value={state.cputemperature}  fillFinder={fillFinderCPUTemp}/>
                  </div>
                  <div className="item">
                      <Gauge label={"CPU"} max={100} min={0} units={"%"} value={state.cpuutilization}  fillFinder={fillFinderCPUUtil}/>
                  </div>
              </div>
              <div className="row">
                  <div className="item">
                      <Gauge label={"RAM"} max={100} min={0} units={"%"} value={state.memoryUtilization}  fillFinder={fillFinderRAM}/>
                  </div>
                  <div className="item">
                      <Gauge label={"VRAM"} max={100} min={0} units={"%"} value={state.gpumemoryUtilization}  fillFinder={fillFinderVRAM}/>
                  </div>
              </div>
          </div>
      </div>
  );
}
export default App;
