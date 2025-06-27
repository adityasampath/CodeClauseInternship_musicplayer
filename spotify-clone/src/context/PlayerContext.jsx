import { createContext, useEffect, useRef, useState } from "react";
// import { songsData } from "../assets/assets";
import axios from 'axios'

export const PlayerContext = createContext();

const PlayerContextProvider = (props) => {

    const audioRef = useRef();
    const seekBg = useRef();
    const seekBar = useRef();
    const url = 'http://localhost:4000'

    const [songsData, setSongsData] = useState([]);
    const [albumsData,setAlbumData] = useState([]);
    const [track, setTrack] = useState(songsData[0]);
    const [playStatus, setPlayStatus] = useState(false);
    const [time, setTime] = useState({
        currentTime: {
            second: 0,
            minute: 0
        },
        totalTime: {
            second: 0,
            minute: 0
        }
    })


    const play = () => {
        console.log("Play function called");
        console.log("Current track:", track);
        console.log("Audio ref:", audioRef.current);
        
        if (audioRef.current && track) {
            audioRef.current.play().then(() => {
                console.log("Audio started playing");
                setPlayStatus(true);
            }).catch(error => {
                console.error("Error playing audio:", error);
            });
        } else {
            console.error("Cannot play: missing audio ref or track");
        }
    }

    const pause = () => {
        console.log("Pause function called");
        if (audioRef.current) {
            audioRef.current.pause();
            setPlayStatus(false);
        }
    }

    const playWithId = async (id) => {
        console.log("playWithId called with id:", id);
        console.log("Current songsData:", songsData);
        
        const foundSong = songsData.find(item => item._id === id);
        
        if (foundSong) {
            console.log("Found song:", foundSong);
            
            // Transform Cloudinary URL to serve as MP3
            let audioUrl = foundSong.file;
            if (audioUrl.includes('cloudinary.com') && audioUrl.includes('/video/upload/')) {
                // Add format transformation to convert to MP3
                audioUrl = audioUrl.replace('/video/upload/', '/video/upload/f_mp3/');
                console.log("Transformed audio URL:", audioUrl);
            }
            
            // Create a new track object with the transformed URL
            const transformedTrack = {
                ...foundSong,
                file: audioUrl
            };
            
            setTrack(transformedTrack);
            
            // Wait a bit for the track to update
            setTimeout(async () => {
                if (audioRef.current) {
                    try {
                        // Force reload the audio element with new source
                        audioRef.current.load();
                        
                        // Wait for the audio to be ready
                        const playPromise = audioRef.current.play();
                        if (playPromise !== undefined) {
                            await playPromise;
                            setPlayStatus(true);
                            console.log("Started playing:", foundSong.name);
                        }
                    } catch (error) {
                        console.error("Error playing song:", error);
                        console.error("Error name:", error.name);
                        
                        if (error.name === 'NotSupportedError') {
                            console.error("Audio format not supported. Trying alternative format...");
                            // Try with original URL without transformation
                            const originalTrack = { ...foundSong };
                            setTrack(originalTrack);
                            
                            setTimeout(async () => {
                                try {
                                    audioRef.current.load();
                                    await audioRef.current.play();
                                    setPlayStatus(true);
                                } catch (fallbackError) {
                                    console.error("Fallback also failed:", fallbackError);
                                    alert("This audio format is not supported by your browser. Please try a different song.");
                                }
                            }, 200);
                        }
                    }
                } else {
                    console.error("Audio ref not available");
                }
            }, 200);
        } else {
            console.error("Song not found with id:", id);
        }
    }

    const previous = async () => {
        songsData.map(async (item, index) => {
            if (track._id === item._id && index > 0) {
                await setTrack(songsData[index - 1]);
                await audioRef.current.play();
                setPlayStatus(true);
            }
        })

    }

    const next = async () => {
        songsData.map(async (item, index) => {
            if (track._id === item._id && index < songsData.length-1) {
                await setTrack(songsData[index + 1]);
                await audioRef.current.play();
                setPlayStatus(true);
            }
        })
    }

    const seekSong = async (e) => {
        audioRef.current.currentTime = ((e.nativeEvent.offsetX / seekBg.current.offsetWidth) * audioRef.current.duration)
    }

    const getSongsData = async () => {
        try {
            console.log("Fetching songs from:", `${url}/api/song/list`);
            const response = await axios.get(`${url}/api/song/list`);
            console.log("Songs response:", response.data);
            
            if (response.data.success && response.data.songs) {
                // Transform all song URLs to MP3 format
                const transformedSongs = response.data.songs.map(song => {
                    let audioUrl = song.file;
                    if (audioUrl.includes('cloudinary.com') && audioUrl.includes('/video/upload/')) {
                        audioUrl = audioUrl.replace('/video/upload/', '/video/upload/f_mp3/');
                    }
                    return { ...song, file: audioUrl };
                });
                
                setSongsData(transformedSongs);
                if (transformedSongs.length > 0) {
                    console.log("Setting first track:", transformedSongs[0]);
                    setTrack(transformedSongs[0]);
                }
                console.log("Songs loaded successfully:", transformedSongs.length);
            } else {
                console.error("Failed to get songs:", response.data);
            }
        } catch (error) {
            console.error("Error fetching songs:", error);
            // Set some dummy data so the app doesn't show black screen
            setSongsData([]);
        }
    }

    const getAlbumsData = async () => {
        try {
            console.log("Fetching albums from:", `${url}/api/album/list`);
            const response = await axios.get(`${url}/api/album/list`);
            console.log("Albums response:", response.data);
            
            if (response.data.success && response.data.albums) {
                setAlbumData(response.data.albums);
                console.log("Albums loaded successfully:", response.data.albums.length);
            } else {
                console.error("Failed to get albums:", response.data);
            }
        } catch (error) {
            console.error("Error fetching albums:", error);
            setAlbumData([]);
        }
    }

    useEffect(() => {
        setTimeout(() => {

            audioRef.current.ontimeupdate = () => {
                seekBar.current.style.width = (Math.floor(audioRef.current.currentTime / audioRef.current.duration * 100)) + "%";
                setTime({
                    currentTime: {
                        second: Math.floor(audioRef.current.currentTime % 60),
                        minute: Math.floor(audioRef.current.currentTime / 60)
                    },
                    totalTime: {
                        second: Math.floor(audioRef.current.duration % 60),
                        minute: Math.floor(audioRef.current.duration / 60)
                    }
                })
            }

        }, 1000);
    }, [audioRef])

    useEffect(() => { 

        getSongsData()
        getAlbumsData()

     }, [])

    const contextValue = {
        audioRef,
        seekBar,
        seekBg,
        track, setTrack,
        playStatus, setPlayStatus,
        time, setTime,
        play, pause,
        playWithId,
        previous, next,
        seekSong,
        songsData,albumsData
    }

    return (
        <PlayerContext.Provider value={contextValue}>
            {props.children}
        </PlayerContext.Provider>
    )

}

export default PlayerContextProvider;