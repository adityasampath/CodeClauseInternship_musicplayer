import React, { useContext } from 'react'
import { assets } from '../assets/assets'
import { PlayerContext } from '../context/PlayerContext'

const Player = () => {

    const {track,seekBar,seekBg,playStatus,play,pause,time,previous,next,seekSong,audioRef} = useContext(PlayerContext);

    const testAudio = () => {
        console.log("Test audio button clicked");
        console.log("Track:", track);
        console.log("Audio element:", audioRef.current);
        console.log("Audio src:", audioRef.current?.src);
        console.log("Audio readyState:", audioRef.current?.readyState);
        console.log("Audio networkState:", audioRef.current?.networkState);
        
        if (audioRef.current && track) {
            audioRef.current.play().then(() => {
                console.log("Test play successful");
            }).catch(error => {
                console.error("Test play failed:", error);
            });
        }
    };

  return track ? (
    <div className='h-[10%] bg-black flex justify-between items-center text-white px-4'>
      <div className='hidden lg:flex items-center gap-4'>
        <img className='w-12' src={track.image} alt="" />
        <div>
            <p>{track.name}</p>
            <p>{track.desc.slice(0,12)}</p>
        </div>
      </div>
      <div className='flex flex-col items-center gap-1 m-auto'>
        <div className='flex gap-4'>
            <img className='w-4 cursor-pointer' src={assets.shuffle_icon} alt="" />
            <img onClick={previous} className='w-4 cursor-pointer' src={assets.prev_icon} alt="" />
            {playStatus
            ?<img onClick={pause} className='w-4 cursor-pointer' src={assets.pause_icon} alt="" />
            :<img onClick={play} className='w-4 cursor-pointer' src={assets.play_icon} alt="" />
            }
            <img onClick={next} className='w-4 cursor-pointer' src={assets.next_icon} alt="" />
            <img className='w-4 cursor-pointer' src={assets.loop_icon} alt="" />
        </div>
        <button 
          onClick={testAudio} 
          className='bg-red-500 text-white px-2 py-1 text-xs rounded mb-2'
        >
          Test Audio
        </button>
        <div className='flex items-center gap-5'>
            <p>{time.currentTime.minute}:{time.currentTime.second.toString().padStart(2, '0')}</p>
            <div ref={seekBg} onClick={seekSong} className='w-[60vw] max-w-[500px] bg-gray-300 rounded-full cursor-pointer'>
                <hr ref={seekBar} className='h-1 border-none w-0 bg-green-800 rounded-full'/>
            </div>
            <p>{time.totalTime.minute}:{time.totalTime.second.toString().padStart(2, '0')}</p>
        </div>
      </div>
      <div className='hidden lg:flex items-center gap-2 opacity-75'>
        <img className='w-4' src={assets.plays_icon} alt="" />
        <img className='w-4' src={assets.mic_icon} alt="" />
        <img className='w-4' src={assets.queue_icon} alt="" />
        <img className='w-4' src={assets.speaker_icon} alt="" />
        <img className='w-4' src={assets.volume_icon} alt="" />
        <div className='w-20 bg-slate-50 h-1 rounded'>

        </div>
        <img className='w-4' src={assets.mini_player_icon} alt="" />
        <img className='w-4' src={assets.zoom_icon} alt="" />
      </div>
    </div>
  )
  : null
}

export default Player
