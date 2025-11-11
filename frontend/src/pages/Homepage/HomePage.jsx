import "./HomePage.css";

const HomePage = () => {
  return (
    <div className="home-page">
      <div className="navbar">
        Home
      </div>
      <div className="home-container">
        <div className="title-container">
          <h1 className="title-text">Wavelength</h1>
          <p className="title-subtext">Transform your emotions into music</p>
          <p className="title-paragraph">
            Describe your vibe, upload an image, or both. Our AI will create the
            perfect playlist that matches your mood.
          </p>
        </div>
        <div className="convert-container">
          <button className="convert-section" id="section1">
            <h2>Text Input</h2>
            <p>Describe your mood in words and watch AI craft the perfect soundtrack for your moment.</p>
          </button>
          <button className="convert-section" id="section2">
            <h2>Image Input</h2>
            <p>Upload any image and let AI translate its colors, mood, and energy into music.</p>
          </button>
          <button className="convert-section" id="section3">
            <h2>Combine</h2>
            <p>Combine text and images for the most accurate mood matching and discover new music.</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
