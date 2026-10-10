import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 mt-8 backdrop-blur-md border-t border-white/20">
      <div className="container mx-auto text-center text-sm">
        © {new Date().getFullYear()} ViviMart. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
