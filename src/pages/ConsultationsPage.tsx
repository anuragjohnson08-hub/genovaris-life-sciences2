import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  AlertCircle,
  ArrowRight,
  Bookmark,
  CheckCircle2,
  Clock,
  Mail,
  MapPin,
  Phone,
  Send,
  ShieldCheck,
  Truck,
} from 'lucide-react';
import { SectionKicker } from '../components/SectionKicker';
import { ImportantNoticeCard } from '../components/ImportantNoticeCard';
import { useRegimen } from '../context/RegimenContext';
import {
  appendSupplyInquiry,
  loadSupplyInquiries,
} from '../services/storage';
import type {
  SupplyInquiryInput,
  SupplyInquiryRecord,
  ValidationErrors,
} from '../types/medicine';
import { validateSupplyInquiryInput } from '../utils/regimenLogic';
import { triggerHaptic } from '../utils/haptics';
import { IOS_SPRING_SNAPPY } from '../utils/motion';
import { handleInPageAnchorClick } from '../utils/sectionNavigation';
import { INDIAN_SUPPLY_LOCATIONS } from '../data/indianLocations';
import {
  checkSupplyTransportAvailability,
  findIndianLocationByCityOrLabel,
  findIndianLocationByPincode,
  sanitizePincodeInput,
  type TransportAvailabilityResult,
} from '../utils/supplyTransport';

const INQUIRY_TYPES = [
  'Wholesale Supply & Stockist',
  'Clinic / Hospital Procurement',
  'Distribution / PCD Partnership',
  'Product Visual Aids & Samples',
];

export interface ConsultationsPageProps {
  embedded?: boolean;
}

export function ConsultationsPage({ embedded = false }: ConsultationsPageProps) {
  const [searchParams] = useSearchParams();
  const { products, regimen, openRegimen } = useRegimen();

  const initialProductSlug = searchParams.get('product') ?? '';

  const [formState, setFormState] = useState<SupplyInquiryInput>(() => {
    const initialSlugs = initialProductSlug
      ? [initialProductSlug]
      : regimen.map((entry) => entry.slug);
    return {
      fullName: '',
      organization: '',
      email: '',
      phone: '',
      inquiryType: INQUIRY_TYPES[0],
      productSlugs: initialSlugs,
      cityRegion: '',
      pincode: '',
      message: '',
      acknowledgedDisclaimer: false,
    };
  });

  const [fieldErrors, setFieldErrors] = useState<ValidationErrors>({});
  const [transportCheck, setTransportCheck] =
    useState<TransportAvailabilityResult | null>(null);
  const [latestConfirmation, setLatestConfirmation] =
    useState<SupplyInquiryRecord | null>(null);
  const [history, setHistory] = useState<SupplyInquiryRecord[]>(() =>
    loadSupplyInquiries()
  );
  const confirmationRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (initialProductSlug) {
      setFormState((prev) =>
        prev.productSlugs.includes(initialProductSlug)
          ? prev
          : { ...prev, productSlugs: [...prev.productSlugs, initialProductSlug] }
      );
    }
  }, [initialProductSlug]);

  useEffect(() => {
    if (latestConfirmation) {
      confirmationRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [latestConfirmation]);

  const toggleProductSelection = (slug: string) => {
    triggerHaptic('selection');
    setFormState((prev) => ({
      ...prev,
      productSlugs: prev.productSlugs.includes(slug)
        ? prev.productSlugs.filter((item) => item !== slug)
        : [...prev.productSlugs, slug],
    }));
  };

  const applyShortlist = () => {
    triggerHaptic('light');
    setFormState((prev) => ({
      ...prev,
      productSlugs: Array.from(
        new Set([...prev.productSlugs, ...regimen.map((r) => r.slug)])
      ),
    }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLatestConfirmation(null);

    const validation = validateSupplyInquiryInput(formState);
    if (Object.keys(validation).length > 0) {
      triggerHaptic('warning');
      setFieldErrors(validation);
      return;
    }

    setFieldErrors({});
    setTransportCheck(null);
    const created = appendSupplyInquiry(formState);
    triggerHaptic('success');
    setLatestConfirmation(created);
    setHistory((prev) => [created, ...prev]);
    setFormState({
      fullName: '',
      organization: '',
      email: '',
      phone: '',
      inquiryType: INQUIRY_TYPES[0],
      productSlugs: [],
      cityRegion: '',
      pincode: '',
      message: '',
      acknowledgedDisclaimer: false,
    });
  };

  const handleCheckTransport = () => {
    const result = checkSupplyTransportAvailability(
      formState.pincode ?? '',
      formState.cityRegion,
    );
    setTransportCheck(result);

    if (result.pincode && result.pincode !== (formState.pincode ?? '')) {
      setFormState((prev) => ({
        ...prev,
        pincode: result.pincode,
      }));
    }

    if (result.locationName && !formState.cityRegion.trim()) {
      setFormState((prev) => ({
        ...prev,
        cityRegion: result.locationName ?? prev.cityRegion,
      }));
    }

    if (result.status === 'available') {
      triggerHaptic('success');
      setFieldErrors((prev) => {
        if (!prev.pincode) return prev;
        const next = { ...prev };
        delete next.pincode;
        return next;
      });
    } else {
      triggerHaptic('warning');
    }
  };

  const resolveProductName = (slug: string) =>
    products.find((p) => p.slug === slug)?.name ?? slug;

  const HeadingTag = embedded ? 'h2' : 'h1';

  return (
    <section
      id="contact"
      aria-labelledby="supply-contact-heading"
      className={
        embedded
          ? 'mx-auto max-w-6xl px-5 sm:px-8 py-16 sm:py-22'
          : 'mx-auto max-w-6xl px-5 sm:px-8 py-10 sm:py-14'
      }
    >
      <header className="max-w-3xl">
        <SectionKicker label="Supply & Distribution Desk" />
        <HeadingTag
          id="supply-contact-heading"
          className="mt-3.5 text-[clamp(1.9rem,3.3vw,2.75rem)] font-bold leading-[1.12] tracking-[-0.03em] text-[#153226]"
        >
          Contact for medicine supply
        </HeadingTag>
        <p className="mt-3.5 text-[16px] leading-[1.65] text-[#4C6156]">
          Reach out for pharmacy stockist inquiries, hospital procurement,
          regional distribution partnerships, or official product visual aids
          across the Genovaris Lifesciences range.
        </p>
      </header>

      <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Supply Inquiry Form */}
        <section
          aria-labelledby="supply-form-heading"
          className="lg:col-span-7 rounded-3xl border border-[#E3E9E0] bg-[#FEFDF9] p-7 sm:p-9"
        >
          <h2
            id="supply-form-heading"
            className="text-[20px] font-bold tracking-[-0.02em] text-[#153226]"
          >
            Request supply &amp; product details
          </h2>

          {latestConfirmation && (
            <motion.div
              ref={confirmationRef}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              role="status"
              className="mt-5 rounded-2xl border border-[#C6DBC8] bg-[#EDF5EE] p-5"
            >
              <div className="flex items-start gap-3">
                <CheckCircle2
                  size={20}
                  className="mt-0.5 shrink-0 text-[#173A2C]"
                  aria-hidden="true"
                />
                <div>
                  <p className="text-[15px] font-semibold text-[#153226]">
                    Supply inquiry saved — Reference{' '}
                    <span className="font-mono tabular-nums">
                      {latestConfirmation.referenceCode}
                    </span>
                  </p>
                  <p className="mt-1 text-[14px] leading-relaxed text-[#3D5549]">
                    Thank you, {latestConfirmation.fullName}. Your inquiry
                    summary has been recorded below for follow-up with the
                    Genovaris Lifesciences supply desk.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label
                  htmlFor="supply-name"
                  className="block text-[13.5px] font-semibold text-[#153226]"
                >
                  Full name <span className="text-[#7A2E1D]">*</span>
                </label>
                <input
                  id="supply-name"
                  type="text"
                  autoComplete="name"
                  value={formState.fullName}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      fullName: e.target.value,
                    }))
                  }
                  aria-invalid={Boolean(fieldErrors.fullName)}
                  aria-describedby={
                    fieldErrors.fullName ? 'supply-name-error' : undefined
                  }
                  placeholder="Rajesh Sharma"
                  className="mt-2 min-h-[46px] w-full rounded-2xl border border-[#D8E1D5] bg-[#F7F8F1] px-4 text-[15px] text-[#153226] placeholder:text-[#7A8E83] focus:border-[#173A2C] focus:bg-white focus:outline-none transition-colors"
                />
                {fieldErrors.fullName && (
                  <p
                    id="supply-name-error"
                    className="mt-1.5 text-[13px] text-[#8E2F1B]"
                  >
                    {fieldErrors.fullName}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="supply-org"
                  className="block text-[13.5px] font-semibold text-[#153226]"
                >
                  Pharmacy, clinic or company
                </label>
                <input
                  id="supply-org"
                  type="text"
                  autoComplete="organization"
                  value={formState.organization}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      organization: e.target.value,
                    }))
                  }
                  placeholder="MedCare Distributors / City Clinic"
                  className="mt-2 min-h-[46px] w-full rounded-2xl border border-[#D8E1D5] bg-[#F7F8F1] px-4 text-[15px] text-[#153226] placeholder:text-[#7A8E83] focus:border-[#173A2C] focus:bg-white focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label
                  htmlFor="supply-email"
                  className="block text-[13.5px] font-semibold text-[#153226]"
                >
                  Email address <span className="text-[#7A2E1D]">*</span>
                </label>
                <input
                  id="supply-email"
                  type="email"
                  autoComplete="email"
                  value={formState.email}
                  onChange={(e) =>
                    setFormState((prev) => ({ ...prev, email: e.target.value }))
                  }
                  aria-invalid={Boolean(fieldErrors.email)}
                  aria-describedby={
                    fieldErrors.email ? 'supply-email-error' : undefined
                  }
                  placeholder="orders@pharmacy.example"
                  className="mt-2 min-h-[46px] w-full rounded-2xl border border-[#D8E1D5] bg-[#F7F8F1] px-4 text-[15px] text-[#153226] placeholder:text-[#7A8E83] focus:border-[#173A2C] focus:bg-white focus:outline-none transition-colors"
                />
                {fieldErrors.email && (
                  <p
                    id="supply-email-error"
                    className="mt-1.5 text-[13px] text-[#8E2F1B]"
                  >
                    {fieldErrors.email}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="supply-phone"
                  className="block text-[13.5px] font-semibold text-[#153226]"
                >
                  Phone / WhatsApp (optional)
                </label>
                <input
                  id="supply-phone"
                  type="tel"
                  autoComplete="tel"
                  value={formState.phone}
                  onChange={(e) =>
                    setFormState((prev) => ({ ...prev, phone: e.target.value }))
                  }
                  aria-invalid={Boolean(fieldErrors.phone)}
                  aria-describedby={
                    fieldErrors.phone ? 'supply-phone-error' : undefined
                  }
                  placeholder="+91 98765 43210"
                  className="mt-2 min-h-[46px] w-full rounded-2xl border border-[#D8E1D5] bg-[#F7F8F1] px-4 text-[15px] text-[#153226] placeholder:text-[#7A8E83] focus:border-[#173A2C] focus:bg-white focus:outline-none transition-colors"
                />
                {fieldErrors.phone && (
                  <p
                    id="supply-phone-error"
                    className="mt-1.5 text-[13px] text-[#8E2F1B]"
                  >
                    {fieldErrors.phone}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label
                  htmlFor="supply-type"
                  className="block text-[13.5px] font-semibold text-[#153226]"
                >
                  Inquiry type <span className="text-[#7A2E1D]">*</span>
                </label>
                <select
                  id="supply-type"
                  value={formState.inquiryType}
                  onChange={(e) => {
                    triggerHaptic('selection');
                    setFormState((prev) => ({
                      ...prev,
                      inquiryType: e.target.value,
                    }));
                  }}
                  className="mt-2 min-h-[46px] w-full rounded-2xl border border-[#D8E1D5] bg-[#F7F8F1] px-4 text-[15px] text-[#153226] focus:border-[#173A2C] focus:bg-white focus:outline-none cursor-pointer"
                >
                  {INQUIRY_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                {fieldErrors.inquiryType && (
                  <p className="mt-1.5 text-[13px] text-[#8E2F1B]">
                    {fieldErrors.inquiryType}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="supply-city"
                  className="block text-[13.5px] font-semibold text-[#153226]"
                >
                  City / Territory (India only)
                </label>
                <input
                  id="supply-city"
                  type="text"
                  list="indian-supply-locations"
                  value={formState.cityRegion}
                  onChange={(e) => {
                    const value = e.target.value;
                    const matched = findIndianLocationByCityOrLabel(value);
                    setFormState((prev) => ({
                      ...prev,
                      cityRegion: value,
                      pincode: matched ? matched.pincode : prev.pincode,
                    }));
                    setTransportCheck(null);
                  }}
                  placeholder="e.g. Ranchi, Mumbai, Bengaluru"
                  className="mt-2 min-h-[46px] w-full rounded-2xl border border-[#D8E1D5] bg-[#F7F8F1] px-4 text-[15px] text-[#153226] placeholder:text-[#7A8E83] focus:border-[#173A2C] focus:bg-white focus:outline-none transition-colors"
                />
                <datalist id="indian-supply-locations">
                  {INDIAN_SUPPLY_LOCATIONS.map((loc) => (
                    <option
                      key={loc.pincode}
                      value={`${loc.city}, ${loc.state}`}
                    >
                      {loc.pincode}
                    </option>
                  ))}
                </datalist>

                <div className="mt-3.5">
                  <label
                    htmlFor="supply-pincode"
                    className="block text-[13.5px] font-semibold text-[#153226]"
                  >
                    Pincode (Indian location)
                  </label>
                  <div className="mt-2 flex items-center gap-2">
                    <input
                      id="supply-pincode"
                      type="text"
                      inputMode="numeric"
                      autoComplete="postal-code"
                      maxLength={6}
                      value={formState.pincode ?? ''}
                      onChange={(e) => {
                        const sanitized = sanitizePincodeInput(e.target.value);
                        const matched =
                          sanitized.length === 6
                            ? findIndianLocationByPincode(sanitized)
                            : null;
                        setFormState((prev) => ({
                          ...prev,
                          pincode: sanitized,
                          cityRegion: matched
                            ? `${matched.city}, ${matched.state}`
                            : prev.cityRegion,
                        }));
                        setTransportCheck(null);
                        setFieldErrors((prev) => {
                          if (!prev.pincode) return prev;
                          const next = { ...prev };
                          delete next.pincode;
                          return next;
                        });
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleCheckTransport();
                        }
                      }}
                      aria-invalid={Boolean(
                        fieldErrors.pincode ||
                          transportCheck?.status === 'invalid',
                      )}
                      aria-describedby={
                        fieldErrors.pincode
                          ? 'supply-pincode-error'
                          : transportCheck
                            ? 'supply-transport-status'
                            : undefined
                      }
                      placeholder="e.g. 834001"
                      className="min-h-[46px] min-w-0 flex-1 rounded-2xl border border-[#D8E1D5] bg-[#F7F8F1] px-4 font-mono text-[15px] tabular-nums text-[#153226] placeholder:font-sans placeholder:text-[#7A8E83] focus:border-[#173A2C] focus:bg-white focus:outline-none transition-colors"
                    />
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.96 }}
                      transition={IOS_SPRING_SNAPPY}
                      onClick={handleCheckTransport}
                      className="inline-flex min-h-[46px] shrink-0 items-center justify-center gap-1.5 rounded-2xl bg-[#173A2C] px-4 text-[14px] font-semibold text-white hover:bg-[#102B20] transition-colors whitespace-nowrap cursor-pointer"
                    >
                      <Truck size={15} strokeWidth={1.9} aria-hidden="true" />
                      <span>Check</span>
                    </motion.button>
                  </div>

                  {fieldErrors.pincode && (
                    <p
                      id="supply-pincode-error"
                      className="mt-1.5 text-[13px] text-[#8E2F1B]"
                    >
                      {fieldErrors.pincode}
                    </p>
                  )}

                  {transportCheck && (
                    <div
                      id="supply-transport-status"
                      role="status"
                      aria-live="polite"
                      className={`mt-2.5 flex items-start gap-2.5 rounded-2xl border px-3.5 py-2.5 text-[13px] leading-snug ${
                        transportCheck.status === 'available'
                          ? 'border-[#BFD7C2] bg-[#EDF5EE] text-[#153226]'
                          : 'border-[#E4C7BC] bg-[#FCF3F0] text-[#7A2E1D]'
                      }`}
                    >
                      {transportCheck.status === 'available' ? (
                        <CheckCircle2
                          size={16}
                          strokeWidth={2}
                          className="mt-0.5 shrink-0 text-[#173A2C]"
                          aria-hidden="true"
                        />
                      ) : (
                        <AlertCircle
                          size={16}
                          strokeWidth={2}
                          className="mt-0.5 shrink-0 text-[#8E2F1B]"
                          aria-hidden="true"
                        />
                      )}
                      <div className="min-w-0">
                        <p className="font-semibold">
                          {transportCheck.headline}
                        </p>
                        <p className="mt-0.5 opacity-90">
                          {transportCheck.detail}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Product Multi-Select Checkboxes */}
            <fieldset>
              <legend className="text-[13.5px] font-semibold text-[#153226]">
                Products of interest
              </legend>
              <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {products.map((product) => {
                  const selected = formState.productSlugs.includes(product.slug);
                  return (
                    <label
                      key={product.slug}
                      className={`flex items-center gap-3 rounded-2xl border px-3.5 py-3 text-[14px] cursor-pointer transition-colors ${
                        selected
                          ? 'border-[#173A2C] bg-[#EDF3EA] text-[#153226]'
                          : 'border-[#DCE4D9] bg-[#F7F8F1] text-[#4C6156] hover:bg-[#F0F5EE]'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => toggleProductSelection(product.slug)}
                        className="h-4 w-4 rounded accent-[#173A2C] cursor-pointer"
                      />
                      <span className="font-medium truncate">
                        {product.name}{' '}
                        <span className="font-mono text-[12px] text-[#556B5F]">
                          ({product.code})
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </fieldset>

            <div>
              <label
                htmlFor="supply-message"
                className="block text-[13.5px] font-semibold text-[#153226]"
              >
                Supply volume or inquiry details{' '}
                <span className="text-[#7A2E1D]">*</span>
              </label>
              <textarea
                id="supply-message"
                rows={4}
                value={formState.message}
                onChange={(e) =>
                  setFormState((prev) => ({ ...prev, message: e.target.value }))
                }
                aria-invalid={Boolean(fieldErrors.message)}
                aria-describedby={
                  fieldErrors.message ? 'supply-message-error' : undefined
                }
                placeholder="Share expected monthly box quantities, territory coverage, or questions about our formulations."
                className="mt-2 w-full rounded-2xl border border-[#D8E1D5] bg-[#F7F8F1] p-4 text-[15px] leading-relaxed text-[#153226] placeholder:text-[#7A8E83] focus:border-[#173A2C] focus:bg-white focus:outline-none transition-colors"
              />
              {fieldErrors.message && (
                <p
                  id="supply-message-error"
                  className="mt-1.5 text-[13px] text-[#8E2F1B]"
                >
                  {fieldErrors.message}
                </p>
              )}
            </div>

            <div>
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formState.acknowledgedDisclaimer}
                  onChange={(e) => {
                    triggerHaptic('selection');
                    setFormState((prev) => ({
                      ...prev,
                      acknowledgedDisclaimer: e.target.checked,
                    }));
                  }}
                  className="mt-1 h-4 w-4 rounded border-[#8BA095] accent-[#173A2C] cursor-pointer"
                />
                <span className="text-[13.5px] leading-relaxed text-[#4C6156]">
                  I understand this website provides product and supply
                  information and does not provide personal medical diagnosis or
                  treatment.
                </span>
              </label>
              {fieldErrors.acknowledgedDisclaimer && (
                <p className="mt-1.5 text-[13px] text-[#8E2F1B]">
                  {fieldErrors.acknowledgedDisclaimer}
                </p>
              )}
            </div>

            <div className="pt-2">
              <motion.button
                type="submit"
                whileTap={{ scale: 0.97 }}
                transition={IOS_SPRING_SNAPPY}
                className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full bg-[#173A2C] px-7 py-3 text-[15px] font-medium text-white hover:bg-[#102B20] transition-colors cursor-pointer"
              >
                <Send size={15} strokeWidth={1.9} aria-hidden="true" />
                <span>Submit supply inquiry</span>
              </motion.button>
            </div>
          </form>
        </section>

        {/* Right Column: Direct Supply Contact Details + Shortlist + Saved Log */}
        <aside className="lg:col-span-5 space-y-6">
          <div className="rounded-3xl border border-[#E3E9E0] bg-[#153226] text-white p-6 sm:p-7">
            <h2 className="text-[18px] font-bold">Direct supply contact</h2>
            <p className="mt-2 text-[14px] leading-relaxed text-[#C9DDD2]">
              Reach our distribution and trade supply desk directly for rate
              cards, stockist onboarding, and dispatch timelines.
            </p>

            <dl className="mt-5 space-y-4 text-[14px]">
              <div className="flex items-start gap-3">
                <Phone
                  size={16}
                  className="mt-0.5 shrink-0 text-[#9FC2B0]"
                  aria-hidden="true"
                />
                <div>
                  <dt className="text-[11.5px] uppercase tracking-[0.11em] text-[#9FC2B0]">
                    Supply Desk / WhatsApp
                  </dt>
                  <dd className="mt-0.5 font-medium text-white">
                    Direct phone / WhatsApp line — share number to publish
                  </dd>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail
                  size={16}
                  className="mt-0.5 shrink-0 text-[#9FC2B0]"
                  aria-hidden="true"
                />
                <div>
                  <dt className="text-[11.5px] uppercase tracking-[0.11em] text-[#9FC2B0]">
                    Trade &amp; Orders Email
                  </dt>
                  <dd className="mt-0.5 font-medium text-white">
                    <a
                      href="mailto:supply@genovarislifesciences.com"
                      className="link-underline-center text-white hover:text-[#DDEAE3] transition-colors"
                    >
                      supply@genovarislifesciences.com
                    </a>
                  </dd>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock
                  size={16}
                  className="mt-0.5 shrink-0 text-[#9FC2B0]"
                  aria-hidden="true"
                />
                <div>
                  <dt className="text-[11.5px] uppercase tracking-[0.11em] text-[#9FC2B0]">
                    Dispatch Hours
                  </dt>
                  <dd className="mt-0.5 text-[#DDEAE3]">
                    Monday – Saturday · 9:30 AM – 6:30 PM
                  </dd>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin
                  size={16}
                  className="mt-0.5 shrink-0 text-[#9FC2B0]"
                  aria-hidden="true"
                />
                <div>
                  <dt className="text-[11.5px] uppercase tracking-[0.11em] text-[#9FC2B0]">
                    Registered Office
                  </dt>
                  <dd className="mt-0.5 leading-relaxed text-[#DDEAE3]">
                    3A, Third Floor, Aparajita Apartment, Dhobi Ghat Road, near
                    Maa Kamla Coaching Centre, Lalpur, Ranchi, Jharkhand – 834001
                  </dd>
                </div>
              </div>
            </dl>

            <div className="mt-5 border-t border-white/15 pt-5">
              <div className="flex items-center gap-2 text-[11.5px] font-medium uppercase tracking-[0.11em] text-[#9FC2B0]">
                <ShieldCheck size={14} strokeWidth={2} aria-hidden="true" />
                <span>Verified Registrations</span>
              </div>
              <dl className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 text-[13px]">
                <div className="rounded-xl bg-white/7 px-3.5 py-2.5 border border-white/10">
                  <dt className="text-[11px] uppercase tracking-[0.1em] text-[#9FC2B0]">
                    GSTIN
                  </dt>
                  <dd className="mt-0.5 font-mono text-[13px] font-medium tabular-nums text-white">
                    20AMDPA2242F2Z2
                  </dd>
                </div>
                <div className="rounded-xl bg-white/7 px-3.5 py-2.5 border border-white/10">
                  <dt className="text-[11px] uppercase tracking-[0.1em] text-[#9FC2B0]">
                    FSSAI Reg. ID
                  </dt>
                  <dd className="mt-0.5 font-mono text-[13px] font-medium tabular-nums text-white">
                    21126016000816
                  </dd>
                  <dd className="mt-0.5 text-[11px] text-[#C9DDD2]">
                    Distributor · Ranchi
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Saved Supply List Context */}
          <div className="rounded-3xl border border-[#E3E9E0] bg-[#EDF3EA] p-6 sm:p-7">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 text-[#153226]">
                <Bookmark size={18} strokeWidth={1.85} aria-hidden="true" />
                <h2 className="text-[17px] font-bold">Your Supply Shortlist</h2>
              </div>
              <span className="font-mono text-[12px] tabular-nums text-[#4C6156]">
                {regimen.length} selected
              </span>
            </div>

            {regimen.length === 0 ? (
              <p className="mt-3 text-[14.5px] leading-relaxed text-[#4C6156]">
                Shortlist any of our 4 medicines from the catalog to attach them
                to your supply inquiry with one tap.
              </p>
            ) : (
              <>
                <ul className="mt-4 space-y-2.5">
                  {regimen.map((entry) => (
                    <li
                      key={entry.slug}
                      className="flex items-center justify-between gap-3 rounded-2xl bg-[#FEFDF9] px-4 py-3 border border-[#DCE5D9]"
                    >
                      <div className="min-w-0">
                        <p className="text-[14px] font-semibold text-[#153226] truncate">
                          {entry.formulation.name}
                        </p>
                        <p className="text-[12px] text-[#556B5F]">
                          {entry.formulation.code} · {entry.formulation.dosageForm}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={applyShortlist}
                  className="mt-4 inline-flex min-h-[40px] items-center rounded-full bg-[#173A2C] px-4 py-2 text-[13px] font-medium text-white hover:bg-[#102B20] transition-colors cursor-pointer"
                >
                  Attach shortlist to form
                </button>
              </>
            )}

            <div className="mt-4 flex items-center gap-4">
              <button
                type="button"
                onClick={openRegimen}
                className="link-underline-center text-[13.5px] font-semibold text-[#173A2C] hover:text-[#102B20] transition-colors cursor-pointer"
              >
                Open Supply List
              </button>
              {embedded ? (
                <a
                  href="#products"
                  onClick={(e) => {
                    triggerHaptic('selection');
                    handleInPageAnchorClick(e, 'products');
                  }}
                  className="group underline-trigger inline-flex items-center gap-1 text-[13.5px] font-semibold text-[#173A2C] hover:text-[#102B20] transition-colors"
                >
                  <span className="link-underline-center">Browse medicines</span>
                  <ArrowRight
                    size={13}
                    className="transition-transform duration-200 group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </a>
              ) : (
                <Link
                  to="/#products"
                  onClick={() => triggerHaptic('selection')}
                  className="group underline-trigger inline-flex items-center gap-1 text-[13.5px] font-semibold text-[#173A2C] hover:text-[#102B20] transition-colors"
                >
                  <span className="link-underline-center">Browse medicines</span>
                  <ArrowRight
                    size={13}
                    className="transition-transform duration-200 group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </Link>
              )}
            </div>
          </div>

          {/* Saved Inquiries Log */}
          <div className="rounded-3xl border border-[#E3E9E0] bg-[#FEFDF9] p-6 sm:p-7">
            <h2 className="text-[17px] font-bold text-[#153226]">
              Recent supply inquiries
            </h2>
            {history.length === 0 ? (
              <p className="mt-3 text-[14px] leading-relaxed text-[#556B5F]">
                Submitted supply inquiries appear here with their reference code
                for your records.
              </p>
            ) : (
              <ul className="mt-4 divide-y divide-[#EAEFE8]">
                {history.slice(0, 5).map((item) => (
                  <li key={item.id} className="py-3.5 first:pt-0 last:pb-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[12px] font-medium tabular-nums text-[#173A2C]">
                        {item.referenceCode}
                      </span>
                      <span className="text-[12px] text-[#556B5F]">
                        {item.inquiryType}
                      </span>
                    </div>
                    <p className="mt-1 text-[14px] font-semibold text-[#153226]">
                      {item.fullName}
                      {item.organization ? ` · ${item.organization}` : ''}
                    </p>
                    {item.productSlugs.length > 0 && (
                      <p className="mt-0.5 text-[12.5px] font-medium text-[#3D574A]">
                        {item.productSlugs.map(resolveProductName).join(', ')}
                      </p>
                    )}
                    <p className="mt-1 text-[13.5px] leading-relaxed text-[#4C6156] line-clamp-2">
                      {item.message}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </div>

      {!embedded && (
        <div className="mt-14">
          <ImportantNoticeCard />
        </div>
      )}
    </section>
  );
}
