import React, { useRef, useEffect, useState } from "react";
import Webcam from "react-webcam";

const videoConstraints = {
  width: 1100,
  height: 550,
  facingMode: "user",
  audio: false,
  screenshotQuality: 0.5,
  mirrored: true,
};

interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface CameraProps {
  classification: string;
  setClassification: (classification: string) => void;
}

export default function Camera({ classification, setClassification }: CameraProps) {
  const webcamRef = useRef<Webcam>(null);
  const cameraSec = useRef<HTMLDivElement>(null);
  const [screenshot, setScreenshot] = useState<string>("");
  const [pageloaded, setPageloaded] = useState<boolean>(false);

  const box: Box = {
    x: 750,
    y: 100,
    width: 275,
    height: 275,
  };

  useEffect(() => {
    const delay = setTimeout(() => {
      if (cameraSec.current) {
        cameraSec.current.style.display = "flex";
      }
      setPageloaded(true);
    }, 3000);

    return () => {
      clearTimeout(delay);
    };
  }, []);

  useEffect(() => {
    if (pageloaded) {
      const interval = setInterval(() => {
        captureBoxFrame();
      }, 1000);

      return () => {
        clearInterval(interval);
      };
    }
  }, [pageloaded]);

  const captureBoxFrame = async () => {
    if (!webcamRef.current) {
      console.error("Webcam reference is not set.");
      return;
    }

    const screenshot = webcamRef.current.getScreenshot();
    if (!screenshot) {
      console.error("Failed to capture screenshot.");
      return;
    }

    setScreenshot(screenshot);

    try {
      const response = await fetch("/api/sendScreenshot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ screenshot }),
      });

      if (!response.ok) {
        console.error("Failed to send screenshot to the server.");
        setClassification("NO SIGN SHOWN");
        return;
      }

      const data = await response.json();
      console.log("Response from server:", data.response);

      if (data.response === "Too many concurrent requests") {
        setClassification("NO SIGN SHOWN");
      } else {
        setClassification(data.response || "NO SIGN SHOWN");
      }
    } catch (error) {
      console.error("Error sending screenshot to the server:", error);
      setClassification("NO SIGN SHOWN");
    }
  };

  return (
    <div
      ref={cameraSec}
      style={{ display: "none" }}
      className="justify-center items-center mt-10 mb-10"
    >
      <div className="relative border-2 border-gray-300 rounded-lg shadow-xl">
        <Webcam
          ref={webcamRef}
          audio={false}
          screenshotFormat="image/jpeg"
          videoConstraints={videoConstraints}
          mirrored={true}
        />

        <div
          style={{
            position: "absolute",
            top: box.y,
            left: box.x,
            width: box.width,
            height: box.height,
            border: "5px solid blue",
            pointerEvents: "none",
          }}
        />

        <h1
          style={{
            position: "absolute",
            top: box.y - 25,
            left: box.x,
            width: box.width,
            textAlign: "center",
            pointerEvents: "none",
          }}
          className="italic font-semibold dark:text-gray-700"
        >
          {classification}
        </h1>
      </div>
    </div>
  );
}
