"use client";

import React, { useRef, useEffect, useState } from "react";

interface CameraProps {
    classification: string;
}

export default function PlayStatsBar({ classification }: CameraProps){

    const [randomLetter, setRandomLetter] = useState<string>("A")
    const [seconds, setSeconds] = useState<number>(0)
    const [score, setScore] = useState<number>(0)

    let letters = ["A", "B", "C", "D", "E", "F", "G"]

    const timer = useRef<NodeJS.Timeout | null>(null);
    const timer2 = useRef<NodeJS.Timeout | null>(null);


    useEffect(() => {
        if (classification === randomLetter) {
            if (!timer.current) {  
              setSeconds(5)
              timer.current = setTimeout(() => {
                getRandomLetter();
                timer.current = null;
                if(timer2.current){
                    clearInterval(timer2.current)
                }
                timer2.current=null    
                setSeconds(0)
                setScore((prev)=>prev+1)
       
                }, 5000);
            }

            timer2.current = setInterval(()=>{
                setSeconds((prev) => prev-1)
            }, 1000)
        }

        else{
            setSeconds(0)
            if (timer.current) {
                clearInterval(timer.current);
            }
            if(timer2.current){
                clearTimeout(timer2.current)
            }
            timer2.current = null
            timer.current = null;
        }

      }, [classification, randomLetter]);
    
    function getRandomLetter(){

        const filteredLetters = letters.filter((letter) => letter !== classification);

        let random = filteredLetters[Math.floor(Math.random() * filteredLetters.length)]
        
        setRandomLetter(random)
    }

    const statsBarOption = "flex-col text-center mx-10 p-5 bg-transparent"
    const title = "text-3xl tracking-wide font-bold"
    const subtitle = "mt-5 text-xl";

    return (
        <div className="flex flex-wrap justify-center rounded-lg shadow-xl mx-50 py-5 bg-gradient-to-r from-blue-500 to-blue-300 mt-5 text-white">
            <div className={statsBarOption}>
                <h1 className={title}>Timer</h1>
                <h1 className={subtitle}>{seconds}</h1>
            </div>
            <div className={statsBarOption}>
                <h1 className={title}>Current Sign</h1>
                <h1 className={subtitle}>{classification}</h1>
            </div>
            <div className={statsBarOption}>
                <h1 className={title}>Target Sign</h1>
                <h1 className={subtitle}>{randomLetter}</h1>
            </div>
            <div className={statsBarOption}>
                <h1 className={title}>Score</h1>
                <h1 className={subtitle}>{score}</h1>
            </div>
        </div>
    );

}