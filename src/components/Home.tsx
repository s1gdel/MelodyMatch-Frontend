import '../styles/Home.css';
import spotifyImage from '../assets/spotify.png';

function Home() {
    const handleSignIn = () => {
        window.location.href = `${import.meta.env.VITE_BACKEND_URL}/oauth2/authorization/spotify`;
      };

  return (
    <>
      <div>
        <h1>Introducing MelodyMatch</h1>
        <h2>
          <span className="music-emoji">🎵</span>
        </h2>
        <h2>Finding songs you like has never been easier</h2>
      </div>
      
      <button id="signIn" onClick={handleSignIn}>
        <img src={spotifyImage} width={"30px"} height={"30px"} alt="Spotify Logo" />
        Sign in with Spotify
      </button>
    </>
  );
}

export default Home;