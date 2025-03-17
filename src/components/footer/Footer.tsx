import React from "react";
import AppVersion from "../AppVersion";

const Footer: React.FC = () => {
    const currentYear = new Date().getFullYear();

    return (
        // Footer
        <footer className="bg-[#18181b] ">
            <div className="sm:flex sm:justify-center mx-auto overflow-hidden px-4 py-1 sm:py-1 lg:px-4 gap-1">
                <p className="text-center text-sm/8 text-gray-300"> &copy; {currentYear} Tejada Tech Group EIRL. All rights reserved.</p>
                <AppVersion />
            </div>
        </footer>

    );
};

export default Footer;
