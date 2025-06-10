"use client";

import React, { useRef, useEffect, useState } from "react";

import { getRandomLetter } from "../utils/utilities";
import { get } from "http";


interface CameraProps {
    classification: string;
}

export default function LearnStatsBar({ classification }: CameraProps){

    const [randomLetter, setRandomLetter] = useState<string>("A");

    const nextLetter = () => {
        const newLetter = getRandomLetter(classification);
        setRandomLetter(newLetter);
    }

    const statsBarOption = "flex-col text-center mx-10 p-5 bg-transparent"
    const title = "text-3xl tracking-wide font-bold"
    const subtitle = "mt-5 text-xl";

    return (
        <div className="flex flex-wrap justify-center rounded-lg shadow-xl mx-50 py-5 bg-gradient-to-r from-blue-500 to-blue-300 mt-5 text-white">
            
            <div className={statsBarOption}>
                <h1 className={title}>Pic</h1>
            </div>
            <div className={statsBarOption}>
                <h1 className={title}>Current Sign</h1>
                <h1 className={subtitle}>{classification}</h1>
            </div>
            <div className={statsBarOption}>
                <h1 className={title}>Practice Sign</h1>
                <h1 className={subtitle}>{randomLetter}</h1>
            </div>
   
            <div className={`${statsBarOption} mt-5`}>
                <button type="button" onClick={nextLetter} className="text-white bg-blue-600 font-medium rounded-lg text-sm px-10 py-3 text-center hover:bg-gradient-to-r from-blue-200 to-blue-300 cursor-pointer">Next Letter</button>
            </div>
        </div>
    );

}