import React, { useState } from 'react';
import HomePage from './pages/Homepage/HomePage';
import ConvertPage from './pages/ConvertPage/ConvertPage';

const Router = ({ children }) => {
  const [currentPage, setCurrentPage] = useState('/');
  const [pageData, setPageData] = useState({});

  const navigate = (page, data = {}) => {
    setCurrentPage(page);
    setPageData(data);
  };

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
    <Route path="convert" element={<ConvertPage />} />
  </Router>
);

export default App;
