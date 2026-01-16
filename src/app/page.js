'use client'

import { useEffect, useState } from 'react'
import WizardForm from '../components/onboarding/WizardForm'
import Preloader from '../components/Preloader'
import ConnectTile from '../components/solution-tiles/ConnectTile'
import LaunchTile from '../components/solution-tiles/LaunchTile'
import MatchTile from '../components/solution-tiles/MatchTile'
import TrackTile from '../components/solution-tiles/TrackTile'
import { Analytics } from "@vercel/analytics/next"

export default function Home() {
  const [isLoading, setIsLoading] = useState(true)
  const [isNavbarVisible, setIsNavbarVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isWaitlistModalOpen, setIsWaitlistModalOpen] = useState(false)

  // Preloader timer
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1200)
    return () => clearTimeout(timer)
  }, [])

  // Smooth scroll function
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  // Navbar scroll hide/show functionality
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down & past 100px
        setIsNavbarVisible(false)
      } else {
        // Scrolling up
        setIsNavbarVisible(true)
      }

      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

  // Scroll trigger for For Whom and Our Solution sections
  useEffect(() => {
    const observerOptions = {
      threshold: 0.2,
      rootMargin: '0px 0px -50px 0px'
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const element = entry.target
          element.classList.remove('scroll-hidden')
          element.classList.add('animate-scroll-blur')
        }
      })
    }, observerOptions)

    // Observe For Whom section elements
    const forWhomElements = document.querySelectorAll('.for-whom-animate')
    forWhomElements.forEach(el => observer.observe(el))

    // Observe Our Solution section elements
    const solutionElements = document.querySelectorAll('.solution-animate')
    solutionElements.forEach(el => observer.observe(el))

    return () => observer.disconnect()
  }, [])
  if (isLoading) {
    return <Preloader />
  }

  return (
    <div className="min-h-screen">
      {/* Glass Navigation Bar */}
      <div className={`fixed top-8 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ${isNavbarVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
        }`}>
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 md:px-8 py-3">
          <nav className="flex items-center justify-between">
            <div className="flex items-center">
              <img
                src="/logo.png"
                alt="Jetfluenz Logo"
                className="h-8 w-auto"
              />
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8 ml-6">
              <button
                onClick={() => scrollToSection('home')}
                className="text-white/90 hover:text-white transition-colors font-medium">
                Home
              </button>
              <button
                onClick={() => scrollToSection('for-whom')}
                className="text-white/70 hover:text-white/90 transition-colors">
                For Whom
              </button>
              <button
                onClick={() => scrollToSection('solution')}
                className="text-white/70 hover:text-white/90 transition-colors">
                Solution
              </button>
              <button
                onClick={() => scrollToSection('contact')}
                className="text-white/70 hover:text-white/90 transition-colors">
                Contact
              </button>
              <button
                onClick={() => setIsWaitlistModalOpen(true)}
                className="bg-white/20 text-white px-4 py-2 rounded-full hover:bg-white/30 transition-colors text-sm">
                Join the Waitlist
              </button>
            </div>

            {/* Mobile Hamburger */}
            <button
              className="md:hidden text-white p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </nav>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {isMobileMenuOpen && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-40 md:hidden">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 min-w-[250px]">
            <div className="space-y-4">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  scrollToSection('home');
                }}
                className="block text-white text-lg hover:text-blue-300 transition-colors py-2 w-full text-left">
                Home
              </button>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  scrollToSection('for-whom');
                }}
                className="block text-white/80 text-lg hover:text-blue-300 transition-colors py-2 w-full text-left">
                For Whom
              </button>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  scrollToSection('solution');
                }}
                className="block text-white/80 text-lg hover:text-blue-300 transition-colors py-2 w-full text-left">
                Solution
              </button>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  scrollToSection('contact');
                }}
                className="block text-white/80 text-lg hover:text-blue-300 transition-colors py-2 w-full text-left">
                Contact
              </button>
              <div className="border-t border-white/20 pt-4 mt-4">
                <button
                  className="w-full bg-white/20 text-white px-4 py-3 rounded-full hover:bg-white/30 transition-colors"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsWaitlistModalOpen(true);
                  }}
                >
                  Join the Waitlist
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Gradient Wrapper for first three sections (Hero, For Whom, Our Solution) */}
      <div style={{ backgroundColor: '#2008b9' }}>

        {/* Hero Section */}
        <section id="home" className="relative py-16 md:py-20 px-4 md:px-6 min-h-screen flex items-center overflow-hidden">
          {/* Decorative Lines */}
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
            {/* Top line - full width */}
            <div className="absolute top-20 left-0 w-full h-[1px] bg-white/20"></div>
            {/* Right line - full height */}
            <div className="absolute top-0 right-20 w-[1px] h-full bg-white/20"></div>
            {/* Bottom line - full width */}
            <div className="absolute bottom-20 left-0 w-full h-[1px] bg-white/20"></div>
            {/* Left line - full height */}
            <div className="absolute top-0 left-20 w-[1px] h-full bg-white/20"></div>
            {/* Center vertical line - full height */}
            <div className="absolute top-0 left-1/2 w-[1px] h-full bg-white/10 transform -translate-x-1/2"></div>
            {/* Center horizontal line - full width */}
            <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white/10 transform -translate-y-1/2"></div>
          </div>

          <div className="container mx-auto relative z-10">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              <div className="text-center lg:text-left">
                <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-4 md:mb-6 leading-tight animate-fade-in-left">
                  Jetfluenz
                </h1>
                <p className="text-lg sm:text-xl text-white/80 mb-6 md:mb-8 max-w-lg mx-auto lg:mx-0 leading-relaxed animate-fade-in-left" style={{ animationDelay: '0.2s', opacity: 0 }}>
                  connects <span className="text-yellow-300 font-semibold">micro-influencers</span> with <span className="text-blue-300 font-semibold">businesses</span> to create <span className="text-green-300 font-semibold">authentic campaigns</span> that <span className="text-pink-300 font-semibold">convert</span>.
                </p>
                <button
                  onClick={() => setIsWaitlistModalOpen(true)}
                  className="bg-white text-gray-800 px-6 sm:px-8 py-3 sm:py-4 rounded-full font-semibold hover:bg-gray-50 transition-all duration-300 shadow-lg animate-fade-in-up relative overflow-hidden group border-2 border-transparent hover:border-white/30" style={{ animationDelay: '0.4s', opacity: 0 }}>
                  <span className="relative z-10">Join the waitlist</span>
                  <div className="absolute inset-0 rounded-full border-2 border-transparent group-hover:border-orange-400 transition-all duration-500 animate-border-travel"></div>
                </button>
              </div>

              <div className="relative h-80 sm:h-96 flex items-center justify-center mt-8 lg:mt-0">
                {/* 2x2 Grid Layout */}
                <div className="grid grid-cols-2 grid-rows-2 gap-3 sm:gap-4 w-full h-full max-w-sm sm:max-w-lg">
                  {/* First image - spans 2 rows (left column) */}
                  <div className="row-span-2">
                    <img
                      src="/card1-hero.png"
                      alt="Hero card 1"
                      className="w-full h-full object-cover rounded-2xl shadow-lg animate-blur-to-clear"
                    />
                  </div>

                  {/* Second image - top right */}
                  <div className="row-span-1">
                    <img
                      src="/card2-hero.png"
                      alt="Hero card 2"
                      className="w-full h-full object-cover rounded-2xl shadow-lg animate-blur-to-clear"
                    />
                  </div>

                  {/* Third image - bottom right */}
                  <div className="row-span-1">
                    <img
                      src="/card3-hero.png"
                      alt="Hero card 3"
                      className="w-full h-full object-cover rounded-2xl shadow-lg animate-blur-to-clear"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* For Whom Section */}
        <section id="for-whom" className="py-20 px-4 md:px-6 bg-white min-h-screen flex items-center">
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-6xl font-bold text-black relative inline-block">
                For Whom<span className="text-orange-500">?</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">

              {/* Business Card */}
              <div className="bg-white rounded-[2rem] shadow-soft overflow-hidden hover:scale-105 transition-transform duration-300 group border border-gray-100">
                <div className="bg-[#2008b9] h-72 p-8 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-blue-600/20 rounded-full blur-3xl transform scale-150 translate-x-1/2 translate-y-1/2"></div>
                  <img
                    src="/business.png"
                    alt="Business"
                    className="w-full h-full object-contain relative z-10 drop-shadow-lg"
                    style={{ filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.2))' }}
                  />
                </div>
                <div className="p-8">
                  <h3 className="text-3xl font-bold mb-6 text-black">Business</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <span className="text-orange-500 mr-2 text-xl">•</span>
                      <span className="text-gray-600 font-medium">Scale brand reach with authentic partnerships</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-orange-500 mr-2 text-xl">•</span>
                      <span className="text-gray-600 font-medium">Cost-effective campaigns with measurable ROI</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-orange-500 mr-2 text-xl">•</span>
                      <span className="text-gray-600 font-medium">Real engagement that converts</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Startups Card */}
              <div className="bg-white rounded-[2rem] shadow-soft overflow-hidden hover:scale-105 transition-transform duration-300 group border border-gray-100">
                <div className="bg-[#2008b9] h-72 p-8 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-blue-600/20 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
                  <img
                    src="/startups.png"
                    alt="Startups"
                    className="w-full h-full object-contain relative z-10 drop-shadow-lg"
                    style={{ filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.2))' }}
                  />
                </div>
                <div className="p-8">
                  <h3 className="text-3xl font-bold mb-6 text-black">Startups</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <span className="text-orange-500 mr-2 text-xl">•</span>
                      <span className="text-gray-600 font-medium">Launch products with targeted buzz</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-orange-500 mr-2 text-xl">•</span>
                      <span className="text-gray-600 font-medium">Limited budgets maximum impact</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-orange-500 mr-2 text-xl">•</span>
                      <span className="text-gray-600 font-medium">Quick awareness building</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Micro-Influencers Card */}
              <div className="bg-white rounded-[2rem] shadow-soft overflow-hidden hover:scale-105 transition-transform duration-300 group border border-gray-100">
                <div className="bg-[#2008b9] h-72 p-8 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-blue-600/20 rounded-full blur-3xl transform translate-y-1/2"></div>
                  <img
                    src="/infulencers.png"
                    alt="Micro-Influencers"
                    className="w-full h-full object-contain relative z-10 drop-shadow-lg"
                    style={{ filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.2))' }}
                  />
                </div>
                <div className="p-8">
                  <h3 className="text-3xl font-bold mb-6 text-black">Micro-Influencers</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <span className="text-orange-500 mr-2 text-xl">•</span>
                      <span className="text-gray-600 font-medium">Monetize content on Instagram, TikTok, YouTube</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-orange-500 mr-2 text-xl">•</span>
                      <span className="text-gray-600 font-medium">Brand partnerships that align with values</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-orange-500 mr-2 text-xl">•</span>
                      <span className="text-gray-600 font-medium">Grow following while earning</span>
                    </li>
                  </ul>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Our Solution Section */}
        <section id="solution" className="py-20 px-4 md:px-6 bg-[#2008b9] min-h-screen flex items-center">
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-6xl font-bold text-white relative inline-block">
                Our Solution<span className="text-orange-500">.</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto auto-rows-[minmax(280px,auto)] md:auto-rows-[minmax(350px,auto)]">

              {/* What We Do? - Large Card */}
              <div className="md:col-span-2 bg-white rounded-[2rem] p-10 flex flex-col justify-between hover:scale-[1.02] transition-transform duration-300">
                <div>
                  <h3 className="text-4xl md:text-5xl font-bold text-black mb-6">
                    What We Do<span className="text-orange-500">?</span>
                  </h3>
                </div>
                <div>
                  <p className="text-xl md:text-2xl font-medium text-black leading-relaxed max-w-2xl">
                    We offer expert solutions in four key areas, designed to help you achieve your business goals.
                  </p>
                </div>
              </div>

              {/* Connect - Square Card */}
              <ConnectTile />

              {/* Launch - Square Card */}
              <LaunchTile />

              {/* Smart Matching - Square Card */}
              <MatchTile />

              {/* Track & Grow - Square Card */}
              <TrackTile />

            </div>
          </div>
        </section>

        {/* End Gradient Wrapper */}
      </div>

      {/* Dashboard & Process Section */}
      <section className="min-h-screen flex items-center py-12 md:py-24 px-4 md:px-6 bg-[#2008b9] overflow-hidden">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* Left: 3D Dashboard Card */}
            <div className="relative perspective-1000 group">
              {/* Back card layers for stack effect */}
              <div className="absolute inset-0 bg-white/10 rounded-xl transform translate-x-4 translate-y-4 -rotate-2"></div>
              <div className="absolute inset-0 bg-white/20 rounded-xl transform translate-x-2 translate-y-2 -rotate-1"></div>

              {/* Main Card */}
              <div className="bg-white rounded-xl p-6 md:p-8 shadow-2xl relative z-10 animate-float transform-style-3d hover:scale-105 transition-all duration-500">

                {/* Dashboard Header */}
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900">Your Dashboard</h2>
                  <div className="flex items-center space-x-2">
                    <div className="w-2.5 h-2.5 bg-green-500 rounded-full"></div>
                    <div className="w-2.5 h-2.5 bg-yellow-400 rounded-full"></div>
                    <div className="w-2.5 h-2.5 bg-red-500 rounded-full"></div>
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div className="text-center p-4 bg-blue-50 rounded-xl">
                    <div className="text-3xl font-bold text-blue-600 mb-1">5</div>
                    <div className="text-xs text-gray-500 font-medium">Active</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-xl">
                    <div className="text-3xl font-bold text-green-600 mb-1">12</div>
                    <div className="text-xs text-gray-500 font-medium">Complete</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-xl">
                    <div className="text-3xl font-bold text-purple-600 mb-1">3</div>
                    <div className="text-xs text-gray-500 font-medium">Upcoming</div>
                  </div>
                </div>

                {/* Influencer List */}
                <div className="mb-8">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">Top Influencers</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50/80 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-orange-200 rounded-full flex items-center justify-center">
                          <span className="text-orange-600 font-bold text-xs">SJ</span>
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 text-sm">Sarah J.</div>
                          <div className="text-xs text-gray-500">Fashion</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900 text-sm">150K</div>
                        <div className="text-xs text-green-600 font-medium">5% rate</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50/80 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-bold text-xs">MR</span>
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 text-sm">Mike R.</div>
                          <div className="text-xs text-gray-500">Tech</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900 text-sm">80K</div>
                        <div className="text-xs text-green-600 font-medium">7% rate</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50/80 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-200 rounded-full flex items-center justify-center">
                          <span className="text-green-600 font-bold text-xs">AM</span>
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 text-sm">Alex M.</div>
                          <div className="text-xs text-gray-500">Fitness</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900 text-sm">120K</div>
                        <div className="text-xs text-green-600 font-medium">6% rate</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center bg-gray-50 rounded-lg p-2">
                    <div className="text-sm font-bold text-green-600">+15%</div>
                    <div className="text-[10px] text-gray-500 text-uppercase tracking-wider">VIEWS</div>
                  </div>
                  <div className="text-center bg-gray-50 rounded-lg p-2">
                    <div className="text-sm font-bold text-blue-600">+8%</div>
                    <div className="text-[10px] text-gray-500 text-uppercase tracking-wider">LIKES</div>
                  </div>
                  <div className="text-center bg-gray-50 rounded-lg p-2">
                    <div className="text-sm font-bold text-purple-600">+12%</div>
                    <div className="text-[10px] text-gray-500 text-uppercase tracking-wider">SALES</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Process Steps */}
            <div className="flex flex-col justify-center space-y-12 pl-0 lg:pl-12">
              {['Business Onboards', 'Influencer Onboards', 'Smart Matching', 'Campaign Launch', 'Results & Insights'].map((item, index) => (
                <h3
                  key={index}
                  className="text-3xl md:text-5xl font-bold text-white/90 hover:text-white transition-all cursor-default transform hover:translate-x-4 duration-300"
                  style={{
                    animation: `fade-in-right 0.5s ease-out forwards ${index * 0.1}s`,
                    opacity: 0.9 // Fallback
                  }}
                >
                  {item}
                </h3>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-6 bg-white">
        <div className="container mx-auto">
          <h2 className="text-5xl font-bold text-gray-800 text-center mb-16">FAQ</h2>
          <div className="max-w-4xl mx-auto space-y-4">

            <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
              <button
                className="w-full p-6 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
                onClick={() => {
                  const content = document.getElementById('faq-1');
                  const icon = document.getElementById('icon-1');
                  if (content.style.display === 'none' || content.style.display === '') {
                    content.style.display = 'block';
                    icon.style.transform = 'rotate(180deg)';
                  } else {
                    content.style.display = 'none';
                    icon.style.transform = 'rotate(0deg)';
                  }
                }}
              >
                <h3 className="text-xl font-semibold text-gray-800">What is Jetfluenz?</h3>
                <svg id="icon-1" className="w-6 h-6 text-gray-500 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div id="faq-1" className="px-6 pb-6" style={{ display: 'none' }}>
                <p className="text-gray-600">Jetfluenz is a platform that connects micro-influencers (under 10K followers) with businesses and startups to run authentic and affordable marketing campaigns.</p>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
              <button
                className="w-full p-6 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
                onClick={() => {
                  const content = document.getElementById('faq-2');
                  const icon = document.getElementById('icon-2');
                  if (content.style.display === 'none' || content.style.display === '') {
                    content.style.display = 'block';
                    icon.style.transform = 'rotate(180deg)';
                  } else {
                    content.style.display = 'none';
                    icon.style.transform = 'rotate(0deg)';
                  }
                }}
              >
                <h3 className="text-xl font-semibold text-gray-800">Who can join Jetfluenz?</h3>
                <svg id="icon-2" className="w-6 h-6 text-gray-500 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div id="faq-2" className="px-6 pb-6" style={{ display: 'none' }}>
                <p className="text-gray-600 mb-3"><strong>Influencers:</strong> Anyone with under 10K followers who creates content in niches like fashion, food, fitness, lifestyle, travel, etc.</p>
                <p className="text-gray-600"><strong>Businesses/Startups:</strong> Small businesses, local shops, e-commerce brands, and startups looking for affordable influencer marketing.</p>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
              <button
                className="w-full p-6 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
                onClick={() => {
                  const content = document.getElementById('faq-3');
                  const icon = document.getElementById('icon-3');
                  if (content.style.display === 'none' || content.style.display === '') {
                    content.style.display = 'block';
                    icon.style.transform = 'rotate(180deg)';
                  } else {
                    content.style.display = 'none';
                    icon.style.transform = 'rotate(0deg)';
                  }
                }}
              >
                <h3 className="text-xl font-semibold text-gray-800">Why micro-influencers?</h3>
                <svg id="icon-3" className="w-6 h-6 text-gray-500 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div id="faq-3" className="px-6 pb-6" style={{ display: 'none' }}>
                <p className="text-gray-600">Micro-influencers often have highly engaged, loyal audiences. Their followers trust them, which means campaigns feel more authentic and deliver better results at lower costs.</p>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
              <button
                className="w-full p-6 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
                onClick={() => {
                  const content = document.getElementById('faq-4');
                  const icon = document.getElementById('icon-4');
                  if (content.style.display === 'none' || content.style.display === '') {
                    content.style.display = 'block';
                    icon.style.transform = 'rotate(180deg)';
                  } else {
                    content.style.display = 'none';
                    icon.style.transform = 'rotate(0deg)';
                  }
                }}
              >
                <h3 className="text-xl font-semibold text-gray-800">How does the matching work?</h3>
                <svg id="icon-4" className="w-6 h-6 text-gray-500 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div id="faq-4" className="px-6 pb-6" style={{ display: 'none' }}>
                <p className="text-gray-600">Our smart algorithm matches businesses and influencers based on niche, audience demographics, engagement rate, location, and budget to ensure the best fit for every campaign.</p>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
              <button
                className="w-full p-6 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
                onClick={() => {
                  const content = document.getElementById('faq-5');
                  const icon = document.getElementById('icon-5');
                  if (content.style.display === 'none' || content.style.display === '') {
                    content.style.display = 'block';
                    icon.style.transform = 'rotate(180deg)';
                  } else {
                    content.style.display = 'none';
                    icon.style.transform = 'rotate(0deg)';
                  }
                }}
              >
                <h3 className="text-xl font-semibold text-gray-800">Is Jetfluenz free to use?</h3>
                <svg id="icon-5" className="w-6 h-6 text-gray-500 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div id="faq-5" className="px-6 pb-6" style={{ display: 'none' }}>
                <p className="text-gray-600 mb-3"><strong>For influencers:</strong> Free to join and start receiving campaign offers.</p>
                <p className="text-gray-600"><strong>For businesses:</strong> Creating an account is free; payment depends on campaign budget and chosen influencers.</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" style={{ backgroundColor: '#2008b9' }} className="py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-white text-center md:text-left mb-6 md:mb-0">
              <h3 className="text-2xl font-bold mb-2">Jetfluenz</h3>
              <p className="text-white/70">Connecting micro-influencers with businesses</p>
            </div>
            <div className="text-center md:text-right">
              <div className="text-white/70 text-sm space-y-2">
                <p>Coming Soon - Join the Waitlist</p>
                <div className="flex flex-col space-y-1">
                  <a href="mailto:support.jetfluenz@devou.in" className="text-white/80 hover:text-white transition-colors">
                    support.jetfluenz@devou.in
                  </a>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-white/20 mt-8 pt-6 text-center text-white/60">
            <p>&copy; 2026 Jetfluenz. All rights reserved.</p>
            <p className="text-sm mt-2">
              Developed by{' '}
              <a
                href="https://devou.in"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/80 hover:text-white transition-colors underline underline-offset-2"
              >
                Devou Solutions
              </a>
              <span className="mx-2 text-white/40">|</span>
              <a
                href="/terms"
                className="text-white/80 hover:text-white transition-colors underline underline-offset-2"
              >
                Terms & Conditions
              </a>
            </p>
          </div>
        </div>
      </footer>

      {/* Waitlist Modal */}
      {/* Onboarding Wizard */}
      <WizardForm
        isOpen={isWaitlistModalOpen}
        onClose={() => setIsWaitlistModalOpen(false)}
      />

      {/* Vercel Analytics */}
      <Analytics />
    </div>
  )
}