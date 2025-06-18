
import React, {useState, useEffect, useRef} from 'react';
import { Link, useLocation } from 'react-router-dom'; // useLocation to check active link
import './NavigationBar.css'; 
import logo from './assets/gobearlogo.png';

function NavigationBar() {
  const location = useLocation(); // Hook to get current path
  
  // for underline
  const [activeIndex, setActiveIndex] = useState(0);
  const itemRefs = useRef([]);
  const lineRef = useRef(null);

  useEffect(() => {
    const activeEl = itemRefs.current[activeIndex];
    if (activeEl && lineRef.current) {
      const link = activeEl.querySelector('a');

      const { offsetTop, offsetHeight, offsetLeft, offsetWidth } = link;

      lineRef.current.style.top = `${offsetTop}px`; // align with top of link
      lineRef.current.style.left = `0px`; // stay flush left
      lineRef.current.style.width = `100%`; // full width of parent
      lineRef.current.style.height = `3px`; // horizontal line like 
    }
  }, [activeIndex]);

  const handleClick = (index) => {
    setActiveIndex(index);
  };

  return (
    <div className="navbar-container">
      <div className="navbar-header">
        <div className="navbar-bg">
          <img src={logo} alt="Go Bear Logo" className="logo" /> 
        </div>
      </div>

      <nav className="navbar-nav">
        <ul>
          {['Dashboard', 'Teams', 'Tasks', 'Rewards', 'Chat'].map((label, index) => {
          const path = `/${label.toLowerCase()}`;
          const isActive = location.pathname === path;
          
          return (
            <li key={index} ref={el => itemRefs.current[index] = el}>
              <Link
                to={path}
                className={location.pathname === path ? 'active-link' : ''}
                onClick={() => handleClick(index)}
              >
                {label}
                {isActive && <span ref={lineRef} className='underline-line'></span>}
              </Link>
            </li>
          );
        })}
        </ul>
        {/* <span ref={lineRef} className="underline-line"></span> */}
      </nav>

      <div className="navbar-footer">
        {/* Placeholder for the settings icon */}
        <span role="img" aria-label="settings">⚙️</span>
      </div>
    </div>
  );
}

export default NavigationBar;