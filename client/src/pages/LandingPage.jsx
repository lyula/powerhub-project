import { Link } from "react-router-dom";
import { colors } from "../theme/colors";
import { useEffect, useState } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { 
  FaPlay, 
  FaUsers, 
  FaGraduationCap, 
  FaRocket, 
  FaVideo, 
  FaComments, 
  FaThumbsUp, 
  FaBookOpen,
  FaMobileAlt,
  FaDesktop,
  FaCloud,
  FaLock,
  FaStar,
  FaChevronRight,
  FaUser,
  FaLightbulb,
  FaHandshake,
  FaBars,
  FaTimes
} from "react-icons/fa";

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: 'ease-in-out',
      once: true,
      offset: 100
    });
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mobileMenuOpen && !event.target.closest('.mobile-menu-container')) {
        setMobileMenuOpen(false);
      }
    };

    const handleEscapeKey = (event) => {
      if (event.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };

    if (mobileMenuOpen) {
      document.addEventListener('click', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'hidden'; // Prevent scrolling when menu is open
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  const features = [
    {
      icon: <FaVideo className="w-8 h-8" />,
      title: "Upload & Share Videos",
      description: "Upload your educational content, tutorials, and projects to share with the PLP community."
    },
    {
      icon: <FaUsers className="w-8 h-8" />,
      title: "Build Your Channel",
      description: "Create your own channel, customize your profile, and build a following of fellow learners."
    },
    {
      icon: <FaGraduationCap className="w-8 h-8" />,
      title: "Learn Together",
      description: "Access curated educational content, collaborate on projects, and grow your skills."
    },
    {
      icon: <FaComments className="w-8 h-8" />,
      title: "Interactive Community",
      description: "Engage with comments, likes, and real-time discussions with your peers."
    },
    {
      icon: <FaBookOpen className="w-8 h-8" />,
      title: "Organized Learning",
      description: "Filter content by specializations, save videos for later, and track your learning journey."
    },
    {
      icon: <FaRocket className="w-8 h-8" />,
      title: "Smart Recommendations",
      description: "Get personalized content recommendations based on your interests and learning goals."
    }
  ];

  const stats = [
    { number: "10K+", label: "Active Students" },
    { number: "5K+", label: "Educational Videos" },
    { number: "500+", label: "Study Channels" },
    { number: "10+", label: "Specializations" }
  ];

  const testimonials = [
    {
      name: "Sarah Wanjiru",
      role: "Software Engineering Student",
      content: "PowerHub transformed how I learn. The community is amazing and the content quality is top-notch!",
      rating: 5
    },
    {
      name: "Mike Odhiambo",
      role: "Data Science Student", 
      content: "I've built my channel from zero to 1000 subscribers. The platform makes sharing knowledge so easy.",
      rating: 5
    },
    {
      name: "Dennis Kimathi",
      role: "Cybersecurity Student",
      content: "The collaboration features helped me connect with peers and work on amazing projects together.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white overflow-hidden font-primary">
      {/* Navbar */}
      <header 
        className="fixed w-full top-0 z-50 backdrop-blur-lg bg-white/90 dark:bg-black/90 border-b border-gray-200 dark:border-gray-800 shadow-sm"
        data-aos="fade-down"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mobile-menu-container">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center space-x-2">
              <div 
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: colors.secondary }}
              >
                <FaPlay className="w-3 h-3 sm:w-4 sm:h-4 text-white ml-0.5" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold font-heading" style={{ color: colors.secondary }}>
                PowerHub
              </h1>
            </div>
            <nav className="hidden md:flex items-center space-x-6 lg:space-x-8">
              <a href="#features" className="text-sm lg:text-base text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium">Features</a>
              <a href="#about" className="text-sm lg:text-base text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium">About</a>
              <a href="#community" className="text-sm lg:text-base text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium">Community</a>
              <Link to="/login" className="text-sm lg:text-base text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium">
                Login
              </Link>
              <Link
                to="/register"
                className="px-4 lg:px-6 py-2 text-sm lg:text-base rounded-full font-semibold transition-all duration-300 hover:scale-105"
                style={{ backgroundColor: colors.primary, color: "#fff" }}
              >
                Get Started
              </Link>
            </nav>
            
            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors relative z-50"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle mobile menu"
            >
              <div className="w-6 h-6 flex flex-col justify-center items-center">
                <span className={`block w-5 h-0.5 bg-current transition-all duration-300 ${mobileMenuOpen ? 'rotate-45 translate-y-1' : '-translate-y-1'}`}></span>
                <span className={`block w-5 h-0.5 bg-current transition-all duration-300 ${mobileMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
                <span className={`block w-5 h-0.5 bg-current transition-all duration-300 ${mobileMenuOpen ? '-rotate-45 -translate-y-1' : 'translate-y-1'}`}></span>
              </div>
            </button>
          </div>
          
          {/* Mobile menu */}
          <div className={`md:hidden absolute top-full left-0 right-0 bg-white/95 dark:bg-black/95 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800 shadow-lg transition-all duration-300 ${mobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
            <div className="px-4 py-6 space-y-4">
              <a 
                href="#features" 
                className="block text-lg font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </a>
              <a 
                href="#about" 
                className="block text-lg font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </a>
              <a 
                href="#community" 
                className="block text-lg font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Community
              </a>
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <Link 
                  to="/login" 
                  className="block text-lg font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block w-full text-center px-6 py-3 mt-4 rounded-full font-semibold transition-all duration-300 text-lg"
                  style={{ backgroundColor: colors.primary, color: "#fff" }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-14 sm:pt-16 px-4 sm:px-6">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-black dark:via-gray-900 dark:to-black"></div>
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            background: `radial-gradient(circle at 20% 50%, ${colors.primary}22 0%, transparent 50%), radial-gradient(circle at 80% 20%, ${colors.secondary}22 0%, transparent 50%)`
          }}
        ></div>
        
        <div className="relative z-10 max-w-6xl mx-auto text-center">
          <div data-aos="fade-up" data-aos-delay="100">
            <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-4 sm:mb-6 font-heading">
              Learn. Share.{" "}
              <span 
                className="bg-gradient-to-r bg-clip-text text-transparent"
                style={{ 
                  backgroundImage: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`
                }}
              >
                Grow.
              </span>
            </h1>
          </div>
          
          <div data-aos="fade-up" data-aos-delay="200">
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 dark:text-gray-300 mb-8 sm:mb-12 max-w-4xl mx-auto leading-relaxed px-4">
              Join the premier educational platform for PLP students. Upload videos, build your channel, 
              collaborate with peers, and accelerate your learning journey.
            </p>
          </div>

          <div data-aos="fade-up" data-aos-delay="300" className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center px-4">
            <Link
              to="/register"
              className="group px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-full transition-all duration-300 hover:scale-105 flex items-center justify-center shadow-lg"
              style={{ backgroundColor: colors.primary, color: "#fff" }}
            >
              Start Learning Now
              <FaChevronRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/login"
              className="px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-full border-2 transition-all duration-300 hover:scale-105 hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-black"
              style={{ borderColor: colors.secondary, color: colors.secondary }}
            >
              Sign In
            </Link>
          </div>

          {/* Stats */}
          <div data-aos="fade-up" data-aos-delay="400" className="mt-12 sm:mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 px-4">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold font-heading" style={{ color: colors.primary }}>
                  {stat.number}
                </div>
                <div className="text-gray-400 mt-1 sm:mt-2 text-sm sm:text-base">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 sm:py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16" data-aos="fade-up">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 font-heading">
              Everything You Need to{" "}
              <span style={{ color: colors.primary }}>Excel</span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto px-4">
              PowerHub provides all the tools and features you need to create, share, and learn in an engaging educational environment.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                data-aos="fade-up"
                data-aos-delay={index * 100}
                className="bg-white dark:bg-gray-900/50 backdrop-blur-sm border border-gray-200 dark:border-gray-800 rounded-2xl p-6 sm:p-8 hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-300 hover:scale-105 shadow-lg dark:shadow-none"
              >
                <div 
                  className="w-12 sm:w-16 h-12 sm:h-16 rounded-xl flex items-center justify-center mb-4 sm:mb-6"
                  style={{ backgroundColor: `${colors.primary}20`, color: colors.primary }}
                >
                  {feature.icon}
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-gray-900 dark:text-white font-heading">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm sm:text-base">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 sm:py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div data-aos="fade-right">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 sm:mb-8 font-heading">
                Built for{" "}
                <span style={{ color: colors.secondary }}>PLP Students</span>
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-6 sm:mb-8 leading-relaxed">
                PowerHub is specifically designed for Power Learn Project students who want to enhance their learning experience through video content, peer collaboration, and community engagement.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1"
                    style={{ backgroundColor: colors.primary }}
                  >
                    <FaUser className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">Student-Focused Design</h4>
                    <p className="text-gray-600 dark:text-gray-300">Interface and features tailored specifically for educational content and learning workflows.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1"
                    style={{ backgroundColor: colors.primary }}
                  >
                    <FaLightbulb className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">Knowledge Sharing</h4>
                    <p className="text-gray-600 dark:text-gray-300">Share your expertise, learn from others, and contribute to a growing knowledge base.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1"
                    style={{ backgroundColor: colors.primary }}
                  >
                    <FaHandshake className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">Collaborative Learning</h4>
                    <p className="text-gray-600 dark:text-gray-300">Work together on projects, participate in discussions, and build meaningful connections.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div data-aos="fade-left" className="relative">
              <div className="relative">
                <div 
                  className="absolute inset-0 rounded-3xl transform rotate-6"
                  style={{ backgroundColor: `${colors.primary}20` }}
                ></div>
                <div 
                  className="absolute inset-0 rounded-3xl transform -rotate-3"
                  style={{ backgroundColor: `${colors.secondary}20` }}
                ></div>
                <div className="relative bg-white dark:bg-gray-900 rounded-3xl p-8 border border-gray-200 dark:border-gray-800 shadow-lg dark:shadow-none">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="text-center">
                      <FaMobileAlt className="w-12 h-12 mx-auto mb-4" style={{ color: colors.primary }} />
                      <h4 className="font-semibold text-gray-900 dark:text-white">Mobile Ready</h4>
                      <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">Learn on the go</p>
                    </div>
                    <div className="text-center">
                      <FaDesktop className="w-12 h-12 mx-auto mb-4" style={{ color: colors.primary }} />
                      <h4 className="font-semibold text-gray-900 dark:text-white">Desktop Optimized</h4>
                      <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">Full-featured experience</p>
                    </div>
                    <div className="text-center">
                      <FaCloud className="w-12 h-12 mx-auto mb-4" style={{ color: colors.primary }} />
                      <h4 className="font-semibold text-gray-900 dark:text-white">Cloud Storage</h4>
                      <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">Secure and reliable</p>
                    </div>
                    <div className="text-center">
                      <FaLock className="w-12 h-12 mx-auto mb-4" style={{ color: colors.primary }} />
                      <h4 className="font-semibold text-gray-900 dark:text-white">Privacy First</h4>
                      <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">Your data protected</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section id="community" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16" data-aos="fade-up">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Join Our{" "}
              <span style={{ color: colors.secondary }}>Community</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              See what our students are saying about their PowerHub experience.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                data-aos="fade-up"
                data-aos-delay={index * 150}
                className="bg-white dark:bg-gray-900/50 backdrop-blur-sm border border-gray-200 dark:border-gray-800 rounded-2xl p-8 hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-300 shadow-lg dark:shadow-none"
              >
                <div className="flex items-center mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <FaStar key={i} className="w-5 h-5" style={{ color: colors.primary }} />
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">"{testimonial.content}"</p>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">{testimonial.name}</h4>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative">
        <div 
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, ${colors.primary}10, ${colors.secondary}10)`
          }}
        ></div>
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center relative z-10">
          <div data-aos="fade-up">
            <h2 className="text-4xl md:text-5xl font-bold mb-8">
              Ready to Start Your{" "}
              <span style={{ color: colors.primary }}>Learning Journey?</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-12 leading-relaxed">
              Join thousands of PLP students who are already learning, sharing, and growing together on PowerHub.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link
                to="/register"
                className="group px-8 py-4 text-lg font-semibold rounded-full transition-all duration-300 hover:scale-105 flex items-center justify-center"
                style={{ backgroundColor: colors.primary, color: "#fff" }}
              >
                Create Your Account
                <FaChevronRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/login"
                className="px-8 py-4 text-lg font-semibold rounded-full border-2 transition-all duration-300 hover:scale-105"
                style={{ borderColor: colors.secondary, color: colors.secondary }}
              >
                I Already Have an Account
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: colors.secondary }}
              >
                <FaPlay className="w-4 h-4 text-white ml-0.5" />
              </div>
              <h3 className="text-xl font-bold" style={{ color: colors.secondary }}>
                PowerHub
              </h3>
            </div>
            <div className="flex items-center space-x-8">
              <Link to="/terms" className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                Terms & Conditions
              </Link>
              <Link to="/login" className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <span className="text-gray-500 dark:text-gray-400">
                © {new Date().getFullYear()} PowerHub. All rights reserved.
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
