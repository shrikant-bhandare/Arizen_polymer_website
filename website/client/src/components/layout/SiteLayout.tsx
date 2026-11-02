import { AnimatePresence, motion } from 'framer-motion';
import { Outlet, ScrollRestoration, useNavigation } from 'react-router';
import { Footer } from './Footer';
import { Header } from './Header';

export default function SiteLayout() {
  const navigation = useNavigation();
  return (
    <>
      <a href="#main" className="sr-only z-[70] rounded-full bg-cyan px-5 py-3 font-semibold text-navy focus:not-sr-only focus:fixed focus:top-4 focus:left-4">
        Skip to content
      </a>
      <AnimatePresence>
        {navigation.state === 'loading' && (
          <motion.div
            key="progress"
            className="fixed inset-x-0 top-0 z-[80] h-0.5 origin-left bg-cyan"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 0.85, transition: { duration: 2, ease: [0.1, 0.8, 0.2, 1] } }}
            exit={{ scaleX: 1, opacity: 0, transition: { duration: 0.3 } }}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>
      <Header />
      <main id="main" tabIndex={-1}>
        <Outlet />
      </main>
      <Footer />
      <ScrollRestoration />
    </>
  );
}

export function BootScreen() {
  return (
    <div className="grid min-h-[100svh] place-items-center bg-navy" role="status" aria-label="Loading">
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-white/15 border-t-cyan" />
    </div>
  );
}
