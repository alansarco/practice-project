import React from 'react';
import axios from 'axios';
import { useStateContext } from "context/ContextProvider";

const DownloadButton = ({ candidateId }) => {
    const {token} = useStateContext();  
    const YOUR_ACCESS_TOKEN = token; 
    const headers = {
        'Authorization': `Bearer ${YOUR_ACCESS_TOKEN}`
    };
    const handleDownload = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/download-requirement/${candidateId}`, {
                responseType: 'blob', // Important to set response type
            });

            // Create a URL for the file
            const url = window.URL.createObjectURL(new Blob([response.data]));

            // Create a link element to download the file
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'requirements.zip'); // Set the file name
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Error downloading the file:', error);
            alert('Failed to download the file.');
        }
    };

    return (
        <button onClick={handleDownload}>
            Download Requirements
        </button>
    );
};

export default DownloadButton;