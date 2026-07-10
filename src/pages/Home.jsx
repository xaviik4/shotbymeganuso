import Hero from "../components/Hero";
import Ticker from "../components/Ticker";
import GradeSlider from "../components/GradeSlider";
import Process from "../components/Process";
import Work from "../components/Work";
import Services from "../components/Services";
import Features from "../components/Features";
import About from "../components/About";
import Faq from "../components/Faq";
import Contact from "../components/Contact";

export default function Home({ setToast }) {
  return (
    <>
      <Hero />
      <Ticker />
      <GradeSlider />
      <Process />
      <Work />
      <Services />
      <Features />
      <About />
      <Faq />
      <Contact setToast={setToast} />
    </>
  );
}
