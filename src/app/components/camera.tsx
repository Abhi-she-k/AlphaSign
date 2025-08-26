import React, { useRef, useEffect, useState } from "react";
import Webcam from "react-webcam";

const videoConstraints = {
  width: 1100,
  height: 550,
  facingMode: "user",
  audio: false,
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
  const [handvisible, setHandVisible] = useState<boolean>(false);
  const [screenshotfreq, setScreenshotFreq] = useState<number>(100);


  const [box, setBox] = useState<Box>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });

  const process_screenshot = async (screenshot: string) => {
  
    try {

      console.log(screenshot)

      const response = await fetch("/api/processImage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ screenshot: screenshot, request_option: "classify"}),
      });
  
      if (!response.ok) {
        console.error("Failed to send screenshot to the server.");
        setClassification("NO SIGN SHOWN");
        return;
      }
  
      const data = await response.json();
      console.log("Classification from server:", data.response);

      const letter = data.response[0]
      const box_position = data.response[1]

      setClassification(letter);


      if(box_position != 0){

        setHandVisible(true)
        process_hand_frame(box_position)
        setScreenshotFreq(100)

      }
      else{
        setHandVisible(false)
        setScreenshotFreq(500)
      }
      
  
    } catch (error) {
      console.error("Error sending screenshot to the server:", error);
      setClassification("NO SIGN SHOWN");
    }
  }; 
  
  const request_hand_frame = async (screenshot: string) => {

    try {

      const response = await fetch("/api/processImage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ screenshot: screenshot, request_option: "hand_frame" }),
      });
  
      if (!response.ok) {
        console.error("Failed to get response from server");
        setClassification("NO SIGN SHOWN");
        return;
      }
  
      const data = await response.json();
      console.log("Response from server:", data.response);

      const box_position = data.response

      if(box_position != 0){

        setHandVisible(true)
        process_hand_frame(box_position)
        setScreenshotFreq(100)

      }
      else{
        setHandVisible(false)
        setScreenshotFreq(500)
      }
        
    } catch (error) {
      console.error("Error sending screenshot to the server:", error);
      setClassification("NO SIGN SHOWN");
    }

  };

  function process_hand_frame(box_position: Array<any>){

    const x_left = box_position[0]
    const y_left = box_position[1]
    const x_right = box_position[2]
    const y_right = box_position[3]
    const img_coord = box_position[4]

    const x_scaler = videoConstraints.width / img_coord[1]
    const y_scaler = videoConstraints.height / img_coord[0]

    setBox({
      x: x_left*x_scaler,
      y: y_left*y_scaler,
      width: (x_right - x_left)*x_scaler,
      height: (y_right - y_left)*y_scaler
    })

  } 

  useEffect(() => {
    const delay = setTimeout(() => {

        if (cameraSec.current) {
          cameraSec.current.style.display = "flex";
        }

        const checkReady = setInterval(() => {
          if (webcamRef.current?.video?.readyState === 4) {
            setPageloaded(true);
            clearInterval(checkReady); // stop checking once ready
          }
        }, 200);

    }, 1000);

    return () => {
      clearTimeout(delay);
    };
  }, []);

  useEffect(() => {
    if (pageloaded) {
      const interval = setInterval(() => {
        capture_screenshot();
      }, screenshotfreq); 
      return () => clearInterval(interval);
    }
  }, [pageloaded]);
  
  const lastProcessed = useRef<number>(0)

  useEffect(() => {

    if(pageloaded){
      const now = Date.now();

      if(now - lastProcessed.current > screenshotfreq+200){
        
        lastProcessed.current = now
        process_screenshot(screenshot);
  
      }
    }

  }, [screenshot]);
  
  const capture_screenshot= async () => {

      if (webcamRef.current) {

        const screenshot = webcamRef.current.getScreenshot();

        if (!screenshot) {
          console.error("Failed to capture screenshot.");
          return;
        }

        setScreenshot(screenshot);
        request_hand_frame(screenshot)
    }
    else {
      console.error("No webcam referenace")
    }
  }

  return (
    <div
      ref={cameraSec}
      style={{ display: "none" }}
      className="justify-center items-center mt-10 mb-10">
      <div className="relative border-2 border-gray-300 rounded-lg shadow-xl">
        <Webcam
          ref={webcamRef}
          audio={false}
          screenshotFormat="image/jpeg"
          videoConstraints={videoConstraints}
          mirrored={true}
        />
        { handvisible == true ?
          (<>
            <div
              style={{
                position: "absolute",
                top: box.y,
                left: box.x,
                width: box.width,
                height: box.height,
                border: "5px solid blue",
                pointerEvents: "none",
              }}>  
            </div>
                
            <h1
              style={{
                position: "absolute",
                top: box.y - 25,
                left: box.x,
                width: box.width,
                textAlign: "center",
                pointerEvents: "none",
              }}
              className="italic font-semibold dark:text-gray-700">
              {classification}
            </h1>
          </>)
          : null
        }
      </div>
    </div>
  );
}
