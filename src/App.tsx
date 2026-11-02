import { MotionConfig } from 'framer-motion';
import { BackToTop } from './components/BackToTop';
import { Nav } from './components/Nav';
import { PrintProposal } from './print/PrintProposal';
import { Closing } from './sections/Closing';
import { Deliverables } from './sections/Deliverables';
import { Features } from './sections/Features';
import { Foundation } from './sections/Foundation';
import { Hero } from './sections/Hero';
import { Introduction } from './sections/Introduction';
import { Investment } from './sections/Investment';
import { Payments } from './sections/Payments';
import { Portfolio } from './sections/Portfolio';
import { Products } from './sections/Products';
import { Recurring } from './sections/Recurring';
import { Scope } from './sections/Scope';
import { Terms } from './sections/Terms';
import { Timeline } from './sections/Timeline';
import { Understanding } from './sections/Understanding';

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <a
        href="#introduction"
        className="screen-only sr-only z-[70] rounded-full bg-cyan px-5 py-3 font-semibold text-navy focus:not-sr-only focus:fixed focus:top-4 focus:left-4"
      >
        Skip to proposal
      </a>
      <Nav />
      <main className="screen-only">
        <Hero />
        <Introduction />
        <Understanding />
        <Products />
        <Scope />
        <Features />
        <Foundation />
        <Investment />
        <Timeline />
        <Payments />
        <Recurring />
        <Deliverables />
        <Terms />
        <Portfolio />
        <Closing />
      </main>
      <BackToTop />
      <PrintProposal />
    </MotionConfig>
  );
}
