import axios from 'axios';
import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import TinderCard from 'react-tinder-card';
import '../Styles/Display.css';

interface Song {
  id: string;
  name: string;
  artists: string[];
  imageUrl: string;
  previewUrl: string | null;
}

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true,
});

function Display() {
  const [isAuth, setIsAuth] = useState(false);
  const [trackData, setTrackData] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [genre, setGenre] = useState('');
  const [inputGenre, setInputGenre] = useState('');
  const [canSwipe, setCanSwipe] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const tinderCardRef = useRef<any>(null);

  const handlePlaylistCreation = async () => {
    try {
      const response = await api.post('/createPlaylist', {});
      alert(response.data);
    } catch (error) {
      console.error('Error creating a playlist:', error);
      alert('Failed to Create Playlist');
    }
  };

  const fetchRecommendations = async (genre: string) => {
    try {
      const response = await api.get(`/getRecommendations?genre=${genre}`);
      setTrackData((prevTracks) => [...prevTracks, ...response.data]);
      return response;
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      alert('Error getting songs');
      throw error;
    } finally {
      setIsFetching(false);
    }
  };
  

  const addSongToPlaylist = async (songId: string) => {
    try {
      await api.post('/likedSong', { trackIds: [songId] });
    } catch (error) {
      console.error('Error adding song to playlist:', error);
    }
  };

  useEffect(() => {
    api.post('/authenticate')
      .then((response) => {
        if (response.status === 200) setIsAuth(true);
      })
      .catch(console.error)
      .finally(() => setTimeout(() => setIsLoading(false), 1000));
  }, []);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (genre) {
      fetchRecommendations(genre);
      intervalId = setInterval(() => fetchRecommendations(genre), 40000);
    }
    return () => intervalId && clearInterval(intervalId);
  }, [genre]);

  useEffect(() => {
    setCanSwipe(false);
    const timer = setTimeout(() => setCanSwipe(true), 4200);
    return () => clearTimeout(timer);
  }, [currentIndex]);

  useEffect(() => {
    if (audioRef.current && trackData[currentIndex]?.previewUrl) {
      audioRef.current.src = trackData[currentIndex].previewUrl;
      audioRef.current.play().catch(console.error);
    }
  }, [currentIndex, trackData]);

  const handleSwipeAttempt = () => {
    if (!canSwipe) {
      alert('Please listen to each song for at least 4 seconds to prevent misuse on the backend.');
      tinderCardRef.current?.restoreCard();
    }
  };

  const onSwipe = (direction: string) => {
    if (!canSwipe) return;
    
    const swipedSongId = trackData[currentIndex].id;
    if (direction === 'right') addSongToPlaylist(swipedSongId);
    setCurrentIndex((prev) => prev + 1);
  };

  const handleGetSongs = async () => {
    setIsFetching(true);
    setGenre(inputGenre);
    setTrackData([]);
    setCurrentIndex(0);
    try {
      await fetchRecommendations(inputGenre);
    } catch (error) {
    }
  };

  if (isLoading) return <div>Authenticating...</div>;

  return (
    <div>
      {isAuth ? (
        <>
          <button id="createPlaylist" onClick={handlePlaylistCreation}>
            Create Playlist
          </button>
          <div className="genre-input">
            <input
              type="text"
              value={inputGenre}
              onChange={(e) => setInputGenre(e.target.value)}
              placeholder="Type a genre"
            />
            <button onClick={handleGetSongs}>Get Songs</button>
          </div>
          {isFetching && (
              <div className="loader">
                <span className="bar"></span>
                <span className="bar"></span>
                <span className="bar"></span>
              </div>
            )}
          <div className="card-container">
            {trackData.length > 0 && currentIndex < trackData.length ? (
              <TinderCard
                ref={tinderCardRef}
                key={trackData[currentIndex].id}
                onSwipe={onSwipe}
                onSwipeRequirementFulfilled={handleSwipeAttempt}
                preventSwipe={canSwipe ? [] : ['left', 'right', 'up', 'down']}
              >
                <div className="card">
                  <img src={trackData[currentIndex].imageUrl} alt={trackData[currentIndex].name} />
                  <h3>{trackData[currentIndex].name}</h3>
                  <p>{trackData[currentIndex].artists.join(', ')}</p>
                  {trackData[currentIndex].previewUrl && (
                    <audio ref={audioRef} controls>
                      <source src={trackData[currentIndex].previewUrl} type="audio/mpeg" />
                      Your browser does not support audio
                    </audio>
                  )}
                </div>
              </TinderCard>
            ) : (
              <>
                <p>You are seeing this because of one of these reasons:</p>
                <ul>
                  <li>1. You haven't generated any songs</li>
                  <li>2. Songs are still loading</li>
                  <li>3. You hit your limit of 600 songs</li>
                </ul>
              </>
            )}
          </div>
        </>
      ) : (
        <>
          <h1>You're not logged in.</h1>
          <Link to="/home">
            <button>Return to Login</button>
          </Link>
        </>
      )}
    </div>
  );
}

export default Display;