import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Leaf, Shield, Eye, Users, ArrowRight, CheckCircle } from 'lucide-react';
import './LandingPage.css';

function LandingPage() {
  const navigate = useNavigate();
  const [isEntering, setIsEntering] = useState(false);

  const handleEnter = () => {
    setIsEntering(true);
    setTimeout(() => {
      navigate('/login');
    }, 800);
  };

  const features = [
    {
      icon: <Shield className="feature-icon" />,
      title: "Blockchain Security",
      description: "Immutable records on Hyperledger Fabric ensure complete data integrity"
    },
    {
      icon: <Eye className="feature-icon" />,
      title: "Complete Transparency",
      description: "Track every step from farm to shelf with QR code verification"
    },
    {
      icon: <Users className="feature-icon" />,
      title: "Multi-Stakeholder",
      description: "Farmers, labs, processors, manufacturers - all connected seamlessly"
    }
  ];

  const benefits = [
    "NMPB/GACP Compliance",
    "Real-time Quality Monitoring",
    "GPS-based Geo-fencing",
    "IPFS Decentralized Storage",
    "SMS Support for Rural Areas",
    "Consumer Verification Portal"
  ];

  return (
    <div className={`landing-page ${isEntering ? 'entering' : ''}`}>
      {/* Animated Background */}
      <div className="bg-animation">
        <div className="floating-leaf leaf-1">🌿</div>
        <div className="floating-leaf leaf-2">🍃</div>
        <div className="floating-leaf leaf-3">🌱</div>
        <div className="floating-leaf leaf-4">🌿</div>
        <div className="floating-leaf leaf-5">🍃</div>
      </div>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <div className="hero-logo floating">
              <div className="logo-circle">
                <Leaf size={60} />
              </div>
            </div>
            
            <h1 className="hero-title fade-in">
              <span className="title-main">HERBIONYX</span>
              <span className="title-sub">Hyperledger Fabric Ayurvedic Herbs Traceability</span>
            </h1>
            
            <p className="hero-description fade-in">
              Revolutionary blockchain-based traceability system ensuring authenticity, 
              quality, and transparency in the Ayurvedic herbs supply chain from farm to consumer.
            </p>

            <div className="hero-stats fade-in">
              <div className="stat-item glass-card">
                <div className="stat-number">100%</div>
                <div className="stat-label">Traceable</div>
              </div>
              <div className="stat-item glass-card">
                <div className="stat-number">5</div>
                <div className="stat-label">Organizations</div>
              </div>
              <div className="stat-item glass-card">
                <div className="stat-number">24/7</div>
                <div className="stat-label">Monitoring</div>
              </div>
            </div>

            <button 
              className="enter-button glass-button primary"
              onClick={handleEnter}
              disabled={isEntering}
            >
              {isEntering ? (
                <span>Entering System...</span>
              ) : (
                <>
                  <span>ENTER HERBIONYX</span>
                  <ArrowRight className="button-icon" />
                </>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <h2 className="section-title">Powered by Advanced Technology</h2>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card glass-card fade-in">
                <div className="feature-icon-wrapper">
                  {feature.icon}
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="benefits-section">
        <div className="container">
          <div className="benefits-content">
            <div className="benefits-text">
              <h2 className="section-title">Complete Ecosystem Benefits</h2>
              <p className="section-description">
                HERBIONYX provides end-to-end traceability with regulatory compliance, 
                ensuring quality and authenticity at every step of the supply chain.
              </p>
              <div className="benefits-list">
                {benefits.map((benefit, index) => (
                  <div key={index} className="benefit-item fade-in">
                    <CheckCircle className="check-icon" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="benefits-visual">
              <div className="supply-chain-visual glass-card">
                <div className="chain-step">
                  <div className="step-icon">🌱</div>
                  <div className="step-label">Collection</div>
                </div>
                <div className="chain-arrow">→</div>
                <div className="chain-step">
                  <div className="step-icon">🔬</div>
                  <div className="step-label">Quality Testing</div>
                </div>
                <div className="chain-arrow">→</div>
                <div className="chain-step">
                  <div className="step-icon">⚙️</div>
                  <div className="step-label">Processing</div>
                </div>
                <div className="chain-arrow">→</div>
                <div className="chain-step">
                  <div className="step-icon">🏭</div>
                  <div className="step-label">Manufacturing</div>
                </div>
                <div className="chain-arrow">→</div>
                <div className="chain-step">
                  <div className="step-icon">👤</div>
                  <div className="step-label">Consumer</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-logo">
              <Leaf size={24} />
              <span>HERBIONYX</span>
            </div>
            <p className="footer-text">
              Empowering Rural Farmers through Blockchain Technology
            </p>
            <p className="footer-demo">
              Demo System - September 18, 2025
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;