import { Shield, Phone, Mail, MapPin } from "lucide-react";
import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-primary-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-6" data-testid="link-footer-home">
              <Shield className="text-yellow-400 h-8 w-8" />
              <span className="font-bold text-xl">SecureHome Audit</span>
            </Link>
            <p className="text-gray-300 mb-6 leading-relaxed" data-testid="text-footer-description">
              Professional home security audits and title protection services. Protecting your most valuable investment with comprehensive documentation and monitoring solutions.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-yellow-400 transition-colors" data-testid="link-facebook">
                <span className="sr-only">Facebook</span>
                <div className="w-6 h-6 bg-current" style={{maskImage: "url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZD0iTTI0IDEyLjA3M2MwLTYuNjI3LTUuMzczLTEyLTEyLTEyczEyIDUuMzczIDEyIDEyeiIvPjwvc3ZnPg==')", maskSize: "contain", maskRepeat: "no-repeat", maskPosition: "center"}}></div>
              </a>
              <a href="#" className="text-gray-300 hover:text-yellow-400 transition-colors" data-testid="link-twitter">
                <span className="sr-only">Twitter</span>
                <div className="w-6 h-6 bg-current"></div>
              </a>
              <a href="#" className="text-gray-300 hover:text-yellow-400 transition-colors" data-testid="link-linkedin">
                <span className="sr-only">LinkedIn</span>
                <div className="w-6 h-6 bg-current"></div>
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-6" data-testid="text-services-heading">Services</h4>
            <ul className="space-y-3 text-gray-300">
              <li><a href="#" className="hover:text-yellow-400 transition-colors" data-testid="link-asset-audit">Asset Audit</a></li>
              <li><a href="#" className="hover:text-yellow-400 transition-colors" data-testid="link-title-protection">Title Protection</a></li>
              <li><a href="#" className="hover:text-yellow-400 transition-colors" data-testid="link-insurance-support">Insurance Support</a></li>
              <li><a href="#" className="hover:text-yellow-400 transition-colors" data-testid="link-monitoring">24/7 Monitoring</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-6" data-testid="text-contact-heading">Contact</h4>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-center" data-testid="text-contact-phone">
                <Phone className="h-4 w-4 mr-3" />
                <span>(555) 123-4567</span>
              </li>
              <li className="flex items-center" data-testid="text-contact-email">
                <Mail className="h-4 w-4 mr-3" />
                <span>info@securehome.com</span>
              </li>
              <li className="flex items-start" data-testid="text-contact-address">
                <MapPin className="h-4 w-4 mr-3 mt-1" />
                <span>123 Business Ave<br />Suite 100<br />City, State 12345</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-300 text-sm mb-4 md:mb-0" data-testid="text-copyright">
              © 2024 SecureHome Audit. All rights reserved.
            </p>
            <div className="flex space-x-6 text-sm text-gray-300">
              <a href="#" className="hover:text-yellow-400 transition-colors" data-testid="link-privacy">Privacy Policy</a>
              <a href="#" className="hover:text-yellow-400 transition-colors" data-testid="link-terms">Terms of Service</a>
              <a href="#" className="hover:text-yellow-400 transition-colors" data-testid="link-cookies">Cookie Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
