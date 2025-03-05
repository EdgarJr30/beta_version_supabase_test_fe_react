import React from "react";

const Footer: React.FC = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-gray-800 text-white text-center p-4 mt-6">
            <p>Tejada Tech Group EIRL © {currentYear}. All Rights Reserved. Beta version 0.0.1</p>
        </footer>
    );
};

export default Footer;
