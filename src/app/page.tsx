'use client';

import React, { useState } from "react";


import Camera from './components/camera';
import Options from './components/options'
import PlayStatsBar from "./components/playstatsbar";
import LearnStatsBar from "./components/learnstatsbar";



export default function Home() {
  
  const [classification, setClassification] = useState<string>("NO SIGN SHOWN");
  const [options, setOptions] = useState<"play" | "learn">("play");



  return (
    <div className='items-center bg-gradient-to-r from-sky-500 to-indigo-500'>
      
      
      <Options options={options} setOptions={setOptions}></Options>
      {options == "play" ? <PlayStatsBar classification={classification}/>: null}
      {options == "learn" ? <LearnStatsBar classification={classification}/>: null}
      <Camera classification={classification} setClassification={setClassification} />
    </div>
  );
}
