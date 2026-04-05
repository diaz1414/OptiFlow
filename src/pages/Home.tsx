import Hero from '../components/Hero';
import UploadZone from '../components/UploadZone';
import HowItWorks from '../components/HowItWorks';
import { motion } from 'framer-motion';

const Home = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Hero />
      <UploadZone />
      <HowItWorks />
    </motion.div>
  );
};

export default Home;
