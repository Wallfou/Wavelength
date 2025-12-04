import "./HomePage.css";
import React, {useEffect, useRef} from "react";
import { assets } from "../../assets/assets";

const HomePage = ({ navigate }) => {
  const titleRef = useRef(null);
  useEffect(() => {
    let ticking = false;
    const update = () => {
      ticking = false;
      const END = 300;
      const y = window.scrollY || 0;
      const p = Math.min(Math.max(y / END, 0), 1); 

      const startX = window.innerWidth * 0.5 - 250 - 170;
      const startY = window.innerHeight * 0.1 - 16;
      const tx = startX * (1-p);
      const ty = startY * (1-p);

      const startScale = 1;
      const endScale = 0.4;
      const scale = startScale + (endScale - startScale) * p;

      if (titleRef.current) {
        titleRef.current.style.setProperty("--tx", `${tx}px`);
        titleRef.current.style.setProperty("--ty", `${ty}px`);
        titleRef.current.style.setProperty("--scale", scale.toString());
      }
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", update);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div className="home-page">
      <div className="navbar">Home</div>

      <h1 ref={titleRef} className="title-text title-fx">Wavelength</h1>
      

      <div className="home-container" style={{ backgroundImage: `url(${assets.home_background})` }}>
        <div className="title-container">
          <p className="title-subtext">
            Transform your emotions into music.
            Describe your vibe, upload an image, or both. Our AI will create the
            perfect playlist that matches your mood.
          </p>
        </div>
      </div>
      <div className="convert-container">
          <button type="button" className="convert-section" id="section1" style={{ '--hover-bg': `url(${assets.home_buttons_background})`, '--hover-bg-pos': 'left center' }} onClick={() => navigate('/text-input')}>
            <h2>Text Input</h2>
            <p>Describe your mood in words and watch AI craft the perfect soundtrack for your moment.</p>
          </button>
          <button className="convert-section" id="section2" style={{ '--hover-bg': `url(${assets.home_buttons_background})`, '--hover-bg-pos': 'center center' }}>
            <h2>Image Input</h2>
            <p>Upload any image and let AI translate its colors, mood, and energy into music.</p>
          </button>
          <button className="convert-section" id="section3" style={{ '--hover-bg': `url(${assets.home_buttons_background})`, '--hover-bg-pos': 'right center' }}>
            <h2>Combine</h2>
            <p>Combine text and images for the most accurate mood matching and discover new music.</p>
          </button>
        </div>
        <div className="explanation-container">
          <p>Wavelength is an AI-powered playlist generator that creates perfect playlists from your text descriptions and images.</p>
        </div>
    </div>
  );
};

export default HomePage;
