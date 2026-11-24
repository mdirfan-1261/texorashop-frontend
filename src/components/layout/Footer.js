
import Link from "next/link";

import {
  ArrowRight,
  CreditCard,
  Truck,
  ShieldCheck,
  Headphones,
} from "lucide-react";

import {
  FaInstagram,
  FaFacebookF,
  FaYoutube,
  FaXTwitter,
} from "react-icons/fa6";

const footerSections = [
  {
    title: "Shop",
    links: [
      { label: "All Products", href: "/products" },
      { label: "Categories", href: "/products" },
      { label: "New Arrivals", href: "/new-arrivals" },
      { label: "Best Sellers", href: "/best-sellers" },
      { label: "Special Offers", href: "/special-offers" },
    ],
  },
  {
    title: "Customer Service",
    links: [
      { label: "Contact Us", href: "/contact" },
      { label: "My Account", href: "/login" },
      { label: "Track My Order", href: "/track-order" },
      { label: "Shipping Information", href: "/shipping-info" },
      { label: "Returns & Refunds", href: "/returns-refunds" },
      { label: "FAQs", href: "/faqs" },
    ],
  },
  {
    title: "Company & Policies",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Careers", href: "/careers" },
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "Terms & Conditions", href: "/terms" },
      { label: "Cancellation Policy", href: "/cancellation-policy" },
    ],
  },
];

const socialLinks = [
  { icon: FaInstagram, href: "https://www.instagram.com/", label: "Instagram" },
  { icon: FaFacebookF, href: "https://www.facebook.com/", label: "Facebook" },
  { icon: FaYoutube, href: "https://www.youtube.com/@TexoraAI", label: "YouTube" },
  { icon: FaXTwitter, href: "https://x.com/", label: "X" },
];

const services = [
  {
    icon: Truck,
    title: "Reliable Delivery",
    subtitle: "Convenient delivery options",
  },
  {
    icon: ShieldCheck,
    title: "Secure Shopping",
    subtitle: "Shop with confidence",
  },
  {
    icon: CreditCard,
    title: "Easy Payments",
    subtitle: "Convenient payment options",
  },
  {
    icon: Headphones,
    title: "Customer Support",
    subtitle: "We're here to help",
  },
];

export default function Footer() {
  return (
    <footer className="mt-8 bg-[#111827] text-gray-300 sm:mt-12">

      {/* Service Highlights */}
      <div className="border-b border-white/10">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-x-3 gap-y-4 px-3 py-5 sm:gap-6 sm:px-5 sm:py-8 md:grid-cols-4">
          {services.map((item) => {
            const Icon = item.icon;

            return (
              <div key={item.title} className="flex min-w-0 items-center gap-2 sm:gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-500/10 text-orange-400 sm:h-11 sm:w-11 sm:rounded-xl">
                  <Icon size={18} className="sm:h-[21px] sm:w-[21px]" />
                </div>

                <div className="min-w-0">
                  <h4 className="text-xs font-semibold text-white sm:text-sm">
                    {item.title}
                  </h4>
                  <p className="mt-0.5 text-[10px] leading-4 text-gray-400 sm:mt-1 sm:text-xs">
                    {item.subtitle}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Footer */}
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-x-5 gap-y-7 px-4 py-8 sm:gap-10 sm:px-5 sm:py-12 lg:grid-cols-5">

        {/* Brand */}
        <div className="col-span-2 lg:col-span-2">
          <Link href="/" className="group inline-flex items-center gap-2.5 sm:gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 via-orange-500 to-orange-700 shadow-lg shadow-orange-900/40 ring-1 ring-orange-300/30 transition duration-300 group-hover:scale-105 sm:h-12 sm:w-12 sm:rounded-xl">
              <span className="text-xl font-black tracking-tight text-white sm:text-2xl">
                T
              </span>
            </div>

            <span className="text-xl font-extrabold tracking-tight text-white sm:text-2xl">
              Texora
              <span className="bg-gradient-to-r from-amber-300 via-orange-400 to-orange-500 bg-clip-text text-transparent">
                Shop
              </span>
              <span className="text-orange-400">.</span>
            </span>
          </Link>

          <p className="mt-3 max-w-sm text-xs leading-6 text-gray-400 sm:mt-5 sm:text-sm sm:leading-7">
            Discover a better way to shop with TexoraShop. Explore quality
            products, find exciting deals, and enjoy a seamless online
            shopping experience — all in one place.
          </p>

          {/* Social Links */}
          <div className="mt-4 flex items-center gap-2.5 sm:mt-5 sm:gap-3">
            {socialLinks.map((social) => {
              const Icon = social.icon;

              return (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-gray-400 transition hover:border-orange-500/40 hover:bg-orange-500/10 hover:text-orange-400 sm:h-9 sm:w-9"
                >
                  <Icon size={15} />
                </a>
              );
            })}
          </div>
        </div>

        {/* Footer Links */}
        {footerSections.map((section) => (
          <div key={section.title} className="min-w-0">
            <h4 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-white sm:mb-5 sm:text-sm">
              {section.title}
            </h4>

            <ul className="space-y-2 sm:space-y-3">
              {section.links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="group inline-flex items-start gap-1.5 text-xs leading-5 text-gray-400 transition hover:text-orange-400 sm:items-center sm:gap-2 sm:text-sm"
                  >
                    <ArrowRight
                      size={12}
                      className="mt-1 shrink-0 opacity-0 transition group-hover:opacity-100 sm:mt-0"
                    />
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-2 px-3 py-4 text-center sm:flex-row sm:justify-between sm:gap-4 sm:px-5 sm:py-6 sm:text-left">
          <p className="text-[10px] text-gray-500 sm:text-xs">
            © {new Date().getFullYear()} TexoraShop. All rights reserved.
          </p>

          <p className="text-[10px] text-gray-400 sm:text-xs">
            Designed & Developed by{" "}
            <a
              href="https://texora.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-orange-400 transition hover:text-orange-300 hover:underline"
            >
              Texora.AI
            </a>
          </p>

          <p className="text-[10px] text-gray-500 sm:text-xs">
            Made for a better shopping experience.
          </p>
        </div>
      </div>
    </footer>
  );
}
