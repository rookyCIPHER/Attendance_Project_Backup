import React, {useRef, useState, useEffect} from 'react';
import axios from 'axios';
import '../css/CameraCapture.css';
import {redirect} from 'react-router-dom';
import axiosInstance from '../axios';
import {useDispatch, useSelector} from "react-redux";
import {personLogin} from "../Store/Slices/personSlice";


import {json, useNavigate} from "react-router-dom";
import {useLocation} from 'react-router-dom';



const MarkAttendance = () => {
    const videoRef = useRef();
    const canvasRef = useRef();
    const [capturedImage, setCapturedImage] = useState(null);
    const [student_Id, setStudent_Id] = useState(null);
    const dispatch = useDispatch();
    const navigate=useNavigate();
    
    const person = useSelector((state) => {
        return state.persons.person;
    });


    const location=useLocation();
    
    const {name_of_course,username_of_person,date_of_session,lat_of_session,lon_of_session,start_time_of_session,end_time_of_session} = location.state || {};

    useEffect(() => {
        // Set up the video stream
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices
                .getUserMedia({video: true})
                .then((stream) => {
                    videoRef.current.srcObject = stream;
                })
                .catch((error) => console.error('Error accessing the camera:', error));
        }
    }, []);

    const handleCapture = async () => {

       try {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');

            // Set canvas dimensions to match video stream
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            // Draw video frame on canvas
            context.drawImage(video, 0, 0, canvas.width, canvas.height);

            // Get image data from canvas
            const imageData = canvas.toDataURL('image/png');

            // Update captured image state
            setCapturedImage(imageData);
            console.log(imageData);
            setStudent_Id(person.username);
            const res = await axiosInstance.post("/Face_Recog/image_verification", {
                student_Id,
                image: imageData,
            });
            if (res.data.message === "success") {
                const sol=await axiosInstance.post("/Home/attendance",{student_Id:username_of_person,course_name:name_of_course,date:date_of_session,lat:lat_of_session,lon:lon_of_session,start_time:start_time_of_session,end_time:end_time_of_session})
                if(sol.data.msg==="Course not found."){
                    alert(sol.data.msg);
                }
                if(sol.data.msg==="Invalid sessions_list format in course."){
                    alert(sol.data.msg);
                }
                if(sol.data.msg==="Serializer Error in marking attendance."){
                    alert(sol.data.msg);
                }
                await navigate("/");
            } else {
                // If it's a failure, show an alert
                alert(res.data.message);
                await navigate("/markAttendance")
                // You can handle failure in another way, e.g., showing an error message
                // Or taking a different action based on your application's logic
            }
            
        }catch(error) {
            alert(error);
        }

    };

    return (
        <div className="video-container">
            <video ref={videoRef} autoPlay playsInline/>
            <canvas ref={canvasRef} style={{display: "none"}}/>
            <button onClick={handleCapture}>Capture Image</button>
        </div>
    );
};
export default MarkAttendance;
