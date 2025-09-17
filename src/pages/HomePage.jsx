// HomePage.jsx
import React from 'react';
import { useNavigate, Link } from 'react-router-dom';

function HomePage() {
    const navigate = useNavigate();
    return (
        <div>
            <h1>Home Page</h1>;
            <button className="active" onClick={() => { navigate('/') }}>Home</button>
                
        </div>
    )
}

export default HomePage;