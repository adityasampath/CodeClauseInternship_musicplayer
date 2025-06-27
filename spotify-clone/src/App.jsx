import React, { useContext } from 'react'
import Sidebar from './components/Sidebar'
import Player from './components/Player'
import Display from './components/Display'
import { PlayerContext } from './context/PlayerContext'

const App = () => {

  const { audioRef, track, songsData } = useContext(PlayerContext);

  // Enable audio context on first user interaction
  const enableAudio = () => {
    if (audioRef.current) {
      // This helps with browser autoplay policies
      audioRef.current.load();
      console.log("Audio enabled for user interaction");
    }
  };

  return (
    <div className='h-screen bg-black' onClick={enableAudio}>
      {
        songsData.length !== 0
          ? <>
            <div className='h-[90%] flex'>
              <Sidebar />
              <Display />
            </div>
            <Player />
          </>
          : <div className='h-screen flex items-center justify-center'>
              <div className='text-center'>
                <div className="w-16 h-16 border-4 border-gray-600 border-t-green-500 rounded-full animate-spin mx-auto mb-4"></div>
                <p className='text-white text-lg'>Loading Spotify...</p>
                <p className='text-gray-400 text-sm mt-2'>Make sure the backend server is running</p>
              </div>
            </div>
      }

      <audio 
        ref={audioRef} 
        preload='auto'
        crossOrigin="anonymous"
        onError={(e) => {
          console.error("Audio error:", e);
          console.error("Audio error details:", {
            code: e.target.error?.code,
            message: e.target.error?.message,
            src: e.target.src
          });
        }}
        onLoadStart={() => console.log("Audio load started:", track?.name)}
        onLoadedData={() => console.log("Audio data loaded:", track?.name)}
        onCanPlay={() => console.log("Audio can play:", track?.name)}
        onEnded={() => console.log("Audio ended")}
        onPlay={() => console.log("Audio started playing")}
        onPause={() => console.log("Audio paused")}
      >
        {track && (
          <>
            <source src={track.file} type="audio/mpeg" />
            <source src={track.file.replace('/video/upload/f_mp3/', '/video/upload/f_ogg/')} type="audio/ogg" />
            <source src={track.file} type="audio/mp4" />
            Your browser does not support the audio element.
          </>
        )}
      </audio>
    </div>
  )
}

export default App
