/** @format */

import { CTA } from '../../components/landing/CTA';
import { Footer } from '../../components/landing/Footer';
import { Hero } from '../../components/landing/Hero';
import { Features } from '../../components/landing/Features';
import { Stats } from '../../components/landing/Stats';

const Landing = () => {
  return (
    <div className="min-h-screen">
      <Hero />
      <Features />
      <Stats />
      <CTA />
      <Footer />
    </div>
  );
};

export default Landing;
