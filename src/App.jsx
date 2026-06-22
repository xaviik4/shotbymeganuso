import './index.css';
import Nav       from './components/Nav';
import Hero      from './components/Hero';
import Ticker    from './components/Ticker';
import Reel      from './components/Reel';
import Portfolio from './components/Portfolio';
import Services  from './components/Services';
import About     from './components/About';
import Contact   from './components/Contact';
import Footer    from './components/Footer';

export default function App() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Ticker />
        <Reel />
        <Portfolio />
        <Ticker />
        <Services />
        <About />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
