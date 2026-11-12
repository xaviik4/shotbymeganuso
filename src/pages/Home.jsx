import Hero from "../components/Hero";
import Ticker from "../components/Ticker";
import GradeSlider from "../components/GradeSlider";
import Process from "../components/Process";
import Services from "../components/Services";
import Features from "../components/Features";
import About from "../components/About";
import Faq from "../components/Faq";
import Contact from "../components/Contact";
import Testimonials from "../components/Testimonials";

export default function Home({ setToast }) {
  return (
    <>
      <Hero />
      <Ticker />
      <GradeSlider />
      <Process />
      <Services />
      <Features />
      <About />
      <Testimonials />
      <Faq />
      <Contact setToast={setToast} />
    </>
  );
}
