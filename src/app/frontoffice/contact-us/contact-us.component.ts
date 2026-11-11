import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LangSwitcherComponent } from '@/shared/components/lang-switcher/lang-switcher/lang-switcher.component';

interface Faq {
  id: number;
  question: string;
  answer: string;
  category: string;
  active: boolean;
}

@Component({
  selector: 'app-contact-us',
  standalone: true,
  imports: [CommonModule, RouterModule, LangSwitcherComponent],
  templateUrl: './contact-us.component.html',
  styleUrls: ['./contact-us.component.scss']
})
export class ContactUsComponent implements OnInit {

  activeCategory = 'all';

  gccCountries = [
    { flag: '🇸🇦', name: 'Saudi Arabia' },
    { flag: '🇦🇪', name: 'UAE' },
    { flag: '🇰🇼', name: 'Kuwait' },
    { flag: '🇶🇦', name: 'Qatar' },
    { flag: '🇧🇭', name: 'Bahrain' },
    { flag: '🇴🇲', name: 'Oman' },
  ];

  faqs: Faq[] = [
    { id: 1,  category: 'general',     active: false, question: 'What is X10ECOM?', answer: 'X10ECOM is a fulfillment, delivery, and eCommerce operations platform that helps brands and online sellers expand across the GCC from a single platform.' },
    { id: 2,  category: 'general',     active: false, question: 'Who can use X10ECOM?', answer: 'X10ECOM is designed for brand owners, eCommerce businesses, Shopify sellers, manufacturers, distributors, and international sellers looking to enter GCC markets.' },
    { id: 3,  category: 'general',     active: false, question: 'Which countries do you support?', answer: 'We support Saudi Arabia, United Arab Emirates, Kuwait, Qatar, Bahrain, and Oman — full GCC coverage from a single platform.' },
    { id: 4,  category: 'general',     active: false, question: 'Can international sellers join X10ECOM?', answer: 'Yes. International sellers can use X10ECOM to store inventory, fulfill orders, and sell across the GCC without building local operations.' },
    { id: 5,  category: 'services',    active: false, question: 'What services does X10ECOM provide?', answer: 'Warehousing, Fulfillment, Delivery Management, Cash on Delivery (COD), Returns Management, Order Tracking, Inventory Management, Seller Dashboard, and GCC Market Expansion Support.' },
    { id: 6,  category: 'services',    active: false, question: 'Can I sell in multiple GCC countries at the same time?', answer: 'Yes. X10ECOM allows you to manage and fulfill orders across multiple GCC markets from one account.' },
    { id: 7,  category: 'general',     active: false, question: 'Do I need a local company in the GCC?', answer: 'Not necessarily. Requirements may vary depending on your business model and target market. Our team can guide you through the available options.' },
    { id: 8,  category: 'account',     active: false, question: 'How do I get started?', answer: 'Simply create an account, complete the verification process, submit your inventory, and start selling across the GCC.' },
    { id: 9,  category: 'services',    active: false, question: 'Can I track my orders and inventory?', answer: 'Yes. All orders can be tracked through your seller dashboard. You can also monitor inventory levels, stock movements, and order activity in real time.' },
    { id: 10, category: 'services',    active: false, question: 'How are returns handled?', answer: 'Returned orders are processed through our returns management system and handled according to the selected service plan.' },
    { id: 11, category: 'services',    active: false, question: 'How often do I receive my payouts?', answer: 'Payout schedules depend on your selected plan and payment agreement.' },
    { id: 12, category: 'general',     active: false, question: 'Are there any hidden fees?', answer: 'No. X10ECOM follows a transparent pricing model with clearly defined service fees. No surprises.' },
    { id: 13, category: 'account',     active: false, question: 'Do you verify sellers?', answer: 'Yes. To maintain a secure ecosystem, sellers may be required to complete identity verification before activating their account.' },
    { id: 14, category: 'account',     active: false, question: 'What documents are required for verification?', answer: 'You may be asked to provide a government-issued ID or passport, a selfie holding your ID, and business registration documents (if applicable).' },
    { id: 15, category: 'integration', active: false, question: 'Can I connect my Shopify store?', answer: 'Yes. Shopify integration is supported and can be set up directly from your seller dashboard.' },
    { id: 16, category: 'integration', active: false, question: 'Do you offer API integration?', answer: 'Yes. API access is available for eligible sellers and partners to automate order management and inventory sync.' },
    { id: 17, category: 'services',    active: false, question: 'How long does delivery take?', answer: 'Delivery times vary by destination and service level but are optimized for fast delivery across the GCC.' },
  ];

  get filteredFaqs(): Faq[] {
    if (this.activeCategory === 'all') return this.faqs;
    return this.faqs.filter(f => f.category === this.activeCategory);
  }

  ngOnInit(): void {}

  setCategory(cat: string): void {
    this.activeCategory = cat;
    this.faqs = this.faqs.map(f => ({ ...f, active: false }));
  }

  toggleFaq(id: number): void {
    this.faqs = this.faqs.map(f => ({ ...f, active: f.id === id ? !f.active : false }));
  }

  copyEmail(): void {
    navigator.clipboard.writeText('contact@x10ecom.com').then(() => {
      const t = document.createElement('div');
      t.textContent = '✓ Email copié !';
      t.style.cssText = 'position:fixed;top:20px;right:20px;background:#10b981;color:#fff;padding:12px 24px;border-radius:10px;z-index:9999;font-weight:600;font-size:.9rem;box-shadow:0 4px 20px rgba(16,185,129,.4)';
      document.body.appendChild(t);
      setTimeout(() => t.remove(), 2500);
    });
  }

  openWhatsApp(): void {
    window.open('https://wa.me/212600000000', '_blank');
  }
}