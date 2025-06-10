"use client";

import React, { useState } from "react";

interface OptionsProp{
    options: "play" | "learn";
    setOptions: (classification: "play" | "learn") => void;
}

export default function Options({options, setOptions}: OptionsProp) {
  
const baseStyle = "font-medium rounded-lg px-20 py-5 text-center me-2 mb-2 text-3xl";

const clicked = "bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 text-white"

const unclicked = "bg-white text-gray-700 hover:bg-gradient-to-r from-blue-200 to-blue-300 cursor-pointer";

return (
<div className="flex justify-center bg-transparent">
    <button
    type="button"
    onClick={() => setOptions("play")}
    className={`${baseStyle} ${
        options === "play"
        ? clicked
        : unclicked
    }`}
    >
    Play
    </button>

    <button
    type="button"
    onClick={() => setOptions("learn")}
    className={`${baseStyle} ${
        options === "learn"
        ? clicked
        : unclicked
    }`}
    >
    Learn
    </button>
</div>
);}
