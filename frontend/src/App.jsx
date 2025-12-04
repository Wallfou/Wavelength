import React, { useState, useEffect } from 'react';
import HomePage from './pages/Homepage/HomePage';
import TextInputPage from './pages/ConvertPage/textInputPage';

const Router = ({ children }) => {
  const [currentPage, setCurrentPage] = useState(window.location.pathname);
  const [pageData, setPageData] = useState(() => {
    const saved = sessionStorage.getItem('pageData');
    return saved ? JSON.parse(saved) : {};
  });

  const navigate = (page, data = {}) => {
    sessionStorage.setItem('pageData', JSON.stringify(data));
    window.history.pushState({ pageData: data }, '', page);
    setCurrentPage(page);
    setPageData(data);
  };

  useEffect(() => {
    const handlePopState = (event) => {
      setCurrentPage(window.location.pathname);
      const data = event.state?.pageData || {};
      setPageData(data);
      sessionStorage.setItem('pageData', JSON.stringify(data));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return (
    <>
      {React.Children.map(children, (child) =>
        React.cloneElement(child, {
          isActive: child.props.path === currentPage,
          navigate,
          pageData,
        })
      )}
    </>
  );
};

const Route = ({ isActive, element, navigate, pageData }) => {
  if (!isActive) return null;
  return React.cloneElement(element, { navigate, pageData });
};

const App = () => (
  <Router>
    <Route path="/" element={<HomePage />} />
    <Route path="/text-input" element={<TextInputPage />} />
  </Router>
);

export default App;
