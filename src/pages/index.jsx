import Layout from "./Layout.jsx";

import Onboarding from "./Onboarding";

import BeatCraving from "./BeatCraving";

import Stats from "./Stats";

import Account from "./Account";

import Awards from "./Awards";

import StatDetail from "./StatDetail";

import Home from "./Home";

import Login from "./Login";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Login: Login,
    
    Onboarding: Onboarding,
    
    BeatCraving: BeatCraving,
    
    Stats: Stats,
    
    Account: Account,
    
    Awards: Awards,
    
    StatDetail: StatDetail,
    
    Home: Home,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || 'Login'; // Default to Login instead of first page
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Login />} />
                
                
                <Route path="/Login" element={<Login />} />
                
                <Route path="/Onboarding" element={<Onboarding />} />
                
                <Route path="/BeatCraving" element={<BeatCraving />} />
                
                <Route path="/Stats" element={<Stats />} />
                
                <Route path="/Account" element={<Account />} />
                
                <Route path="/Awards" element={<Awards />} />
                
                <Route path="/StatDetail" element={<StatDetail />} />
                
                <Route path="/Home" element={<Home />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}