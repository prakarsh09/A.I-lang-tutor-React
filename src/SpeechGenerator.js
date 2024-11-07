import React, { useState } from 'react';

const SpeechGenerator = () => {
    const [text, setText] = useState('');
    const [audioUrl, setAudioUrl] = useState(null);

    const generateSpeech = async () => {
        if (!text) {
            alert("Please enter some text.");
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/genspeech?text=${encodeURIComponent(text)}`, {
                method: 'GET',
            });
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            setAudioUrl(url);
        } catch (error) {
            console.error("Error generating speech:", error);
            alert("Failed to generate speech. Please try again.");
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-600 to-blue-500 p-4">
            <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-lg shadow-lg p-6 max-w-md w-full text-center">
                <h1 className="text-2xl font-semibold text-white mb-4">Text to Speech Generator</h1>
                
                <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Enter text here"
                    className="w-full p-3 rounded-lg bg-white bg-opacity-20 text-white placeholder-gray-200 focus:outline-none focus:ring focus:ring-blue-300"
                />
                
                <button
                    onClick={generateSpeech}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                    Generate Speech
                </button>
                
                {audioUrl && (
                    <div className="mt-6">
                        <audio controls src={audioUrl} className="w-full">
                            Your browser does not support the audio element.
                        </audio>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SpeechGenerator;
