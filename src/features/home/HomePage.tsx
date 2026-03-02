import { Container, Row, Col, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { FiShield, FiCheckCircle, FiActivity, FiSliders } from "react-icons/fi";
import { HiShieldCheck, HiSparkles } from "react-icons/hi";
import { BsLightningChargeFill, BsShieldFillCheck } from "react-icons/bs";
import sailLogo from "../../assets/sailLogo.png";
import "./HomePage.css";

const HomePage = () => {
  const navigate = useNavigate();

  const stats = [
    { value: "100%", label: "Digital Compliance" },
    { value: "3-Tier", label: "Authorization" },
    { value: "24/7", label: "Monitoring" },
    { value: "Secure", label: "Data Storage" },
  ];

  return (
    <div className="steel-homepage">
      {/* Header */}
      <header className="steel-header">
        <Container fluid className="px-4">
          <div className="header-content">
            {/* Brand - Left Side */}
            <div className="header-brand">
              <img src={sailLogo} alt="SAIL Logo" className="brand-logo" />
              <div className="brand-info">
                <span className="brand-hindi">भिलाई इस्पात संयंत्र</span>
                <span className="brand-name">BHILAI STEEL PLANT</span>
                <span className="brand-sail">SAIL</span>
              </div>
            </div>

            {/* System Badge - Right Side */}
            <div className="system-badge">
              <div className="badge-icon">
                <HiShieldCheck size={24} />
              </div>
              <div className="badge-text">
                <span className="badge-title">
                  Electronic Permit to Work System
                </span>
                <span className="badge-subtitle">
                  Safety Engineering Department
                </span>
              </div>
            </div>
          </div>
        </Container>
      </header>

      {/* Hero Section */}
      <section className="steel-hero-section text-white">
        <Container>
          <Row className="align-items-center hero-row">
            <Col lg={6} md={12} className="hero-content">
              <div className="hero-text-wrapper">
                {/* Premium Badge */}
                <div className="premium-badge">
                  <HiSparkles className="badge-sparkle" />
                  <span>A Safety Engineering Department initiative.</span>
                </div>

                <h1 className="hero-title">
                  Welcome to <span className="text-highlight">e-PTW</span>
                </h1>
                <p className="hero-subtitle">
                  Electronic Permit to Work System for{" "}
                  <strong>Bhilai Steel Plant</strong>
                </p>
                <p className="hero-description">
                  A smart, digital solution for managing work permits safely and
                  efficiently. Streamline safety procedures with comprehensive
                  permit management, real-time tracking, compliance monitoring,
                  and complete accountability.
                </p>

                {/* Stats Row */}
                <div className="stats-row">
                  {stats.map((stat, index) => (
                    <div className="stat-item" key={index}>
                      <span className="stat-value">{stat.value}</span>
                      <span className="stat-label">{stat.label}</span>
                    </div>
                  ))}
                </div>

                <div className="hero-buttons">
                  <Button
                    variant="warning"
                    size="lg"
                    className="btn-get-started"
                    onClick={() => navigate("/login")}
                  >
                    <BsLightningChargeFill className="btn-icon" />
                    Get Started
                  </Button>
                </div>
              </div>
            </Col>
            <Col lg={6} md={12} className="hero-visual-col">
              <div className="hero-visual">
                {/* Central Shield */}
                <div className="central-shield">
                  <div className="shield-glow"></div>
                  <div className="shield-icon-wrapper">
                    <BsShieldFillCheck size={64} />
                  </div>
                  <div className="shield-rings">
                    <div className="ring ring-1"></div>
                    <div className="ring ring-2"></div>
                    <div className="ring ring-3"></div>
                  </div>
                </div>

                {/* Floating Feature Icons */}
                <div className="floating-icons">
                  <div className="float-icon float-1">
                    <FiShield />
                    <span>Safety</span>
                  </div>
                  <div className="float-icon float-2">
                    <FiCheckCircle />
                    <span>Compliance</span>
                  </div>
                  <div className="float-icon float-3">
                    <FiActivity />
                    <span>Tracking</span>
                  </div>
                  <div className="float-icon float-4">
                    <FiSliders />
                    <span>Control</span>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </div>
  );
};

export default HomePage;
