import React from "react";

const Footer: React.FC = () => {
    const currentYear = new Date().getFullYear();

    return (
        // Footer
        <footer className="bg-white">
            <div className="mx-auto overflow-hidden px-6 py-2 sm:py-4 lg:px-8">
                {/* <nav aria-label="Footer" className="-mb-6 flex flex-wrap justify-center gap-x-12 gap-y-3 text-sm/6">
                    {navigation.main.map((item) => (
                        <a key={item.name} href={item.href} className="text-gray-600 hover:text-gray-900">
                            {item.name}
                        </a>
                    ))}
                </nav> */}
                {/* <div className="mt-16 flex justify-center gap-x-10">
                    {navigation.social.map((item) => (
                        <a key={item.name} href={item.href} className="text-gray-600 hover:text-gray-800">
                            <span className="sr-only">{item.name}</span>
                            <item.icon aria-hidden="true" className="size-6" />
                        </a>
                    ))}
                </div> */}
                <p className="mt-10 text-center text-sm/6 text-gray-600"> &copy; {currentYear} Tejada Tech Group EIRL. All rights reserved. Beta version 0.0.1</p>
            </div>
        </footer>

    );
};

export default Footer;
