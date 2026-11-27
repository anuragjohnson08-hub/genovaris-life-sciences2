import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  Building2,
  CheckCircle2,
  Circle,
  FileCheck2,
  Lock,
  PencilLine,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';
import { useRegimen } from '../context/RegimenContext';
import { INFORMED_CHOICE_CHECKLIST } from '../data/products';
import {
  B2B_ENTITY_TYPES,
  evaluateB2bCredentials,
  lookupIndianGstState,
  type B2bCredentialErrors,
  type B2bCredentialsInput,
  type B2bEntityType,
} from '../utils/b2bVerification';
import { triggerHaptic } from '../utils/haptics';
import { IOS_SPRING_GENTLE, IOS_SPRING_SNAPPY } from '../utils/motion';
import { handleInPageAnchorClick } from '../utils/sectionNavigation';

export interface B2bComplianceCardProps {
  embedded?: boolean;
}

export function B2bComplianceCard({ embedded = false }: B2bComplianceCardProps) {
  const {
    checkedIds,
    toggleChecklistItem,
    b2bVerification,
    b2bGate,
    updateB2bVerification,
  } = useRegimen();

  const [draft, setDraft] = useState<B2bCredentialsInput>(() => ({
    businessName: b2bVerification.businessName,
    entityType: b2bVerification.entityType,
    drugLicenseNumber: b2bVerification.drugLicenseNumber,
    gstin: b2bVerification.gstin,
    fssaiNumber: b2bVerification.fssaiNumber,
  }));
  const [isEditingCredentials, setIsEditingCredentials] = useState(
    () => !b2bVerification.verified
  );
  const [credentialErrors, setCredentialErrors] = useState<B2bCredentialErrors>(
    {}
  );

  const liveGstState = lookupIndianGstState(draft.gstin);

  const handleVerifyCredentials = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const evaluation = evaluateB2bCredentials(draft);

    if (!evaluation.isCredentialsValid) {
      triggerHaptic('warning');
      setCredentialErrors(evaluation.errors);
      if (b2bVerification.verified) {
        updateB2bVerification({
          ...evaluation.normalized,
          verified: false,
          verifiedAt: null,
          gstStateName: null,
          drugLicenseScope: null,
        });
      }
      return;
    }

    triggerHaptic('success');
    setCredentialErrors({});
    setDraft(evaluation.normalized);
    updateB2bVerification({
      ...evaluation.normalized,
      verified: true,
      verifiedAt: new Date().toISOString(),
      gstStateName: evaluation.gstStateName,
      drugLicenseScope: evaluation.drugLicenseScope,
    });
    setIsEditingCredentials(false);
  };

  const handleEditCredentials = () => {
    triggerHaptic('light');
    setDraft({
      businessName: b2bVerification.businessName,
      entityType: b2bVerification.entityType,
      drugLicenseNumber: b2bVerification.drugLicenseNumber,
      gstin: b2bVerification.gstin,
      fssaiNumber: b2bVerification.fssaiNumber,
    });
    setCredentialErrors({});
    setIsEditingCredentials(true);
  };

  const remainingDeclarations =
    b2bGate.declarationsTotal - b2bGate.declarationsCompleted;

  return (
    <div
      id="b2b-verification"
      className={`overflow-hidden rounded-3xl border-2 bg-[#FEFDF9] transition-colors ${
        b2bGate.isFullyVerified
          ? 'border-[#173A2C]'
          : 'border-[#C9B37E]'
      }`}
    >
      {/* Authoritative B2B Compliance Header Band */}
      <div className="bg-[#153226] px-6 py-6 sm:px-9 sm:py-7 text-white">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 font-mono text-[11px] font-medium uppercase tracking-[0.13em] text-[#E6CE92]">
              {b2bGate.isFullyVerified ? (
                <ShieldCheck size={15} strokeWidth={2.1} aria-hidden="true" />
              ) : (
                <ShieldAlert size={15} strokeWidth={2.1} aria-hidden="true" />
              )}
              <span>
                Mandatory B2B Compliance Gate · Licensed Indian Trade Only
              </span>
            </div>

            <h2
              id="checklist-heading"
              className="mt-2.5 text-[24px] sm:text-[27px] font-semibold leading-tight tracking-[-0.018em] text-white"
            >
              B2B Trade &amp; License Verification
            </h2>

            <p className="mt-2 text-[14.5px] leading-[1.6] text-[#D3E3DA]">
              Genovaris Lifesciences supplies strictly to verified pharmacies,
              hospitals, and licensed distributors. Confirm your official Drug
              License, GSTIN, FSSAI registration, and statutory trade
              declarations before placing B2B wholesale supply requests.
            </p>
          </div>

          <div className="shrink-0 rounded-2xl border border-white/15 bg-white/8 px-4 py-3.5 lg:min-w-[235px]">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[11px] font-semibold uppercase tracking-[0.11em] text-[#B7CFC2]">
                Compliance Status
              </span>
              <span
                className={`inline-flex items-center gap-1 text-[12px] font-semibold ${
                  b2bGate.isFullyVerified ? 'text-[#A8E6BE]' : 'text-[#F2D48A]'
                }`}
              >
                {b2bGate.isFullyVerified ? (
                  <>
                    <BadgeCheck size={14} aria-hidden="true" />
                    <span>B2B Verified</span>
                  </>
                ) : (
                  <>
                    <Lock size={13} aria-hidden="true" />
                    <span>Required</span>
                  </>
                )}
              </span>
            </div>

            <p className="mt-2 font-mono text-[13.5px] font-medium tabular-nums text-white">
              {b2bGate.overallPercent}% complete ·{' '}
              {b2bGate.credentialsVerified ? 'Licenses OK' : 'Licenses pending'}
            </p>

            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/15">
              <motion.div
                initial={false}
                animate={{ scaleX: b2bGate.overallPercent / 100 }}
                transition={IOS_SPRING_GENTLE}
                className={`h-full w-full origin-left rounded-full will-change-transform ${
                  b2bGate.isFullyVerified ? 'bg-[#8FD9A8]' : 'bg-[#E6C775]'
                }`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 sm:p-9 space-y-8">
        {/* Step 1: Official Indian B2B License & Registration Verification */}
        <div>
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#E5ECE2]">
            <div className="flex items-start gap-2.5">
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#EAF1E8] font-mono text-[12.5px] font-bold text-[#153226]">
                01
              </span>
              <div>
                <h3 className="text-[16.5px] font-bold text-[#153226]">
                  Official Business &amp; License Credentials
                </h3>
                <p className="text-[13px] text-[#556B5F]">
                  Validates official Indian Drug Control, GSTIN, and FSSAI
                  registration formats for authorized B2B buyers.
                </p>
              </div>
            </div>

            <span
              className={`font-mono text-[12px] font-semibold uppercase tracking-[0.06em] ${
                b2bVerification.verified && !isEditingCredentials
                  ? 'text-[#173A2C]'
                  : 'text-[#8C5B12]'
              }`}
            >
              {b2bVerification.verified && !isEditingCredentials
                ? 'Verified'
                : 'Mandatory'}
            </span>
          </div>

          {b2bVerification.verified && !isEditingCredentials ? (
            <div
              role="status"
              className="mt-5 rounded-2xl border border-[#BFD7C2] bg-[#EDF5EE] p-5"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-3">
                  <BadgeCheck
                    size={21}
                    strokeWidth={2}
                    className="mt-0.5 shrink-0 text-[#173A2C]"
                    aria-hidden="true"
                  />
                  <div>
                    <p className="text-[15.5px] font-bold text-[#153226]">
                      {b2bVerification.businessName}
                    </p>
                    <p className="mt-0.5 text-[13.5px] text-[#3B5548]">
                      {b2bVerification.entityType}
                      {b2bVerification.gstStateName
                        ? ` · Registered in ${b2bVerification.gstStateName}, India`
                        : ''}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleEditCredentials}
                  className="inline-flex min-h-[38px] items-center gap-1.5 self-start rounded-full border border-[#B8D0BC] bg-white px-4 py-1.5 text-[13px] font-semibold text-[#153226] hover:bg-[#F5F9F5] transition-colors cursor-pointer"
                >
                  <PencilLine size={14} aria-hidden="true" />
                  <span>Edit credentials</span>
                </button>
              </div>

              <dl className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-[#CBE0CE] pt-4 text-[13px]">
                <div className="rounded-xl bg-white/85 px-3.5 py-2.5 border border-[#D4E4D6]">
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.09em] text-[#556B5F]">
                    Drug License No.
                  </dt>
                  <dd className="mt-1 font-mono font-semibold text-[#153226] break-all">
                    {b2bVerification.drugLicenseNumber}
                  </dd>
                  {b2bVerification.drugLicenseScope && (
                    <dd className="mt-0.5 text-[11.5px] text-[#4C6156]">
                      {b2bVerification.drugLicenseScope}
                    </dd>
                  )}
                </div>

                <div className="rounded-xl bg-white/85 px-3.5 py-2.5 border border-[#D4E4D6]">
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.09em] text-[#556B5F]">
                    Indian GSTIN
                  </dt>
                  <dd className="mt-1 font-mono font-semibold tabular-nums text-[#153226]">
                    {b2bVerification.gstin}
                  </dd>
                  {b2bVerification.gstStateName && (
                    <dd className="mt-0.5 text-[11.5px] text-[#4C6156]">
                      State Code · {b2bVerification.gstStateName}
                    </dd>
                  )}
                </div>

                <div className="rounded-xl bg-white/85 px-3.5 py-2.5 border border-[#D4E4D6]">
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.09em] text-[#556B5F]">
                    FSSAI License / Reg. ID
                  </dt>
                  <dd className="mt-1 font-mono font-semibold tabular-nums text-[#153226] break-all">
                    {b2bVerification.fssaiNumber}
                  </dd>
                  <dd className="mt-0.5 text-[11.5px] text-[#4C6156]">
                    FSSAI registration verified
                  </dd>
                </div>
              </dl>
            </div>
          ) : (
            <form
              onSubmit={handleVerifyCredentials}
              noValidate
              className="mt-5 space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="b2b-business-name"
                    className="block text-[13.5px] font-semibold text-[#153226]"
                  >
                    Registered Business / Pharmacy Name{' '}
                    <span className="text-[#8E2F1B]">*</span>
                  </label>
                  <input
                    id="b2b-business-name"
                    type="text"
                    value={draft.businessName}
                    onChange={(e) => {
                      setDraft((prev) => ({
                        ...prev,
                        businessName: e.target.value,
                      }));
                      if (credentialErrors.businessName) {
                        setCredentialErrors((prev) => ({
                          ...prev,
                          businessName: undefined,
                        }));
                      }
                    }}
                    aria-invalid={Boolean(credentialErrors.businessName)}
                    aria-describedby={
                      credentialErrors.businessName
                        ? 'b2b-business-name-error'
                        : undefined
                    }
                    placeholder="e.g. Apex Medico Distributors Pvt. Ltd."
                    className="mt-1.5 min-h-[44px] w-full rounded-2xl border border-[#D4DFD1] bg-[#F7F8F1] px-4 text-[14.5px] text-[#153226] placeholder:text-[#7A8E83] focus:border-[#173A2C] focus:bg-white focus:outline-none transition-colors"
                  />
                  {credentialErrors.businessName && (
                    <p
                      id="b2b-business-name-error"
                      className="mt-1 text-[12.5px] text-[#8E2F1B]"
                    >
                      {credentialErrors.businessName}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="b2b-entity-type"
                    className="block text-[13.5px] font-semibold text-[#153226]"
                  >
                    Authorized Business Category{' '}
                    <span className="text-[#8E2F1B]">*</span>
                  </label>
                  <select
                    id="b2b-entity-type"
                    value={draft.entityType}
                    onChange={(e) => {
                      triggerHaptic('selection');
                      setDraft((prev) => ({
                        ...prev,
                        entityType: e.target.value as B2bEntityType,
                      }));
                    }}
                    className="mt-1.5 min-h-[44px] w-full rounded-2xl border border-[#D4DFD1] bg-[#F7F8F1] px-4 text-[14.5px] text-[#153226] focus:border-[#173A2C] focus:bg-white focus:outline-none cursor-pointer"
                  >
                    {B2B_ENTITY_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label
                    htmlFor="b2b-drug-license"
                    className="block text-[13.5px] font-semibold text-[#153226]"
                  >
                    Drug License No. (Form 20B/21B or 20/21){' '}
                    <span className="text-[#8E2F1B]">*</span>
                  </label>
                  <input
                    id="b2b-drug-license"
                    type="text"
                    value={draft.drugLicenseNumber}
                    onChange={(e) => {
                      setDraft((prev) => ({
                        ...prev,
                        drugLicenseNumber: e.target.value,
                      }));
                      if (credentialErrors.drugLicenseNumber) {
                        setCredentialErrors((prev) => ({
                          ...prev,
                          drugLicenseNumber: undefined,
                        }));
                      }
                    }}
                    aria-invalid={Boolean(credentialErrors.drugLicenseNumber)}
                    aria-describedby={
                      credentialErrors.drugLicenseNumber
                        ? 'b2b-dl-error'
                        : undefined
                    }
                    placeholder="e.g. JH-RAN-20B-2024-004182"
                    className="mt-1.5 min-h-[44px] w-full rounded-2xl border border-[#D4DFD1] bg-[#F7F8F1] px-3.5 font-mono text-[13.5px] text-[#153226] placeholder:font-sans placeholder:text-[#7A8E83] focus:border-[#173A2C] focus:bg-white focus:outline-none transition-colors"
                  />
                  {credentialErrors.drugLicenseNumber && (
                    <p
                      id="b2b-dl-error"
                      className="mt-1 text-[12.5px] text-[#8E2F1B]"
                    >
                      {credentialErrors.drugLicenseNumber}
                    </p>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between gap-2">
                    <label
                      htmlFor="b2b-gstin"
                      className="block text-[13.5px] font-semibold text-[#153226]"
                    >
                      GSTIN (15-char Indian ID){' '}
                      <span className="text-[#8E2F1B]">*</span>
                    </label>
                    {liveGstState && (
                      <span className="font-mono text-[11px] font-medium text-[#2E5742]">
                        {liveGstState}
                      </span>
                    )}
                  </div>
                  <input
                    id="b2b-gstin"
                    type="text"
                    value={draft.gstin}
                    onChange={(e) => {
                      setDraft((prev) => ({
                        ...prev,
                        gstin: e.target.value,
                      }));
                      if (credentialErrors.gstin) {
                        setCredentialErrors((prev) => ({
                          ...prev,
                          gstin: undefined,
                        }));
                      }
                    }}
                    aria-invalid={Boolean(credentialErrors.gstin)}
                    aria-describedby={
                      credentialErrors.gstin ? 'b2b-gstin-error' : undefined
                    }
                    placeholder="e.g. 20AMDPA2242F2Z2"
                    className="mt-1.5 min-h-[44px] w-full rounded-2xl border border-[#D4DFD1] bg-[#F7F8F1] px-3.5 font-mono text-[13.5px] tabular-nums text-[#153226] placeholder:font-sans placeholder:text-[#7A8E83] focus:border-[#173A2C] focus:bg-white focus:outline-none transition-colors"
                  />
                  {credentialErrors.gstin && (
                    <p
                      id="b2b-gstin-error"
                      className="mt-1 text-[12.5px] text-[#8E2F1B]"
                    >
                      {credentialErrors.gstin}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="b2b-fssai"
                    className="block text-[13.5px] font-semibold text-[#153226]"
                  >
                    FSSAI License / Reg. No. (14 digits){' '}
                    <span className="text-[#8E2F1B]">*</span>
                  </label>
                  <input
                    id="b2b-fssai"
                    type="text"
                    value={draft.fssaiNumber}
                    onChange={(e) => {
                      setDraft((prev) => ({
                        ...prev,
                        fssaiNumber: e.target.value,
                      }));
                      if (credentialErrors.fssaiNumber) {
                        setCredentialErrors((prev) => ({
                          ...prev,
                          fssaiNumber: undefined,
                        }));
                      }
                    }}
                    aria-invalid={Boolean(credentialErrors.fssaiNumber)}
                    aria-describedby={
                      credentialErrors.fssaiNumber
                        ? 'b2b-fssai-error'
                        : undefined
                    }
                    placeholder="e.g. 21126016000816"
                    className="mt-1.5 min-h-[44px] w-full rounded-2xl border border-[#D4DFD1] bg-[#F7F8F1] px-3.5 font-mono text-[13.5px] tabular-nums text-[#153226] placeholder:font-sans placeholder:text-[#7A8E83] focus:border-[#173A2C] focus:bg-white focus:outline-none transition-colors"
                  />
                  {credentialErrors.fssaiNumber && (
                    <p
                      id="b2b-fssai-error"
                      className="mt-1 text-[12.5px] text-[#8E2F1B]"
                    >
                      {credentialErrors.fssaiNumber}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <p className="flex items-center gap-2 text-[12.5px] text-[#556B5F]">
                  <Building2 size={14} aria-hidden="true" />
                  <span>
                    Verified licenses are attached automatically to your B2B
                    supply inquiry for dispatch audit.
                  </span>
                </p>

                <div className="flex items-center gap-2.5">
                  {b2bVerification.verified && (
                    <button
                      type="button"
                      onClick={() => {
                        setCredentialErrors({});
                        setIsEditingCredentials(false);
                      }}
                      className="inline-flex min-h-[42px] items-center rounded-full border border-[#CBD7C8] px-4 text-[13.5px] font-medium text-[#3D5549] hover:bg-[#F3F7F0] transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                  )}
                  <motion.button
                    type="submit"
                    whileTap={{ scale: 0.97 }}
                    transition={IOS_SPRING_SNAPPY}
                    className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-[#173A2C] px-6 py-2 text-[14px] font-semibold text-white hover:bg-[#102B20] transition-colors cursor-pointer"
                  >
                    <FileCheck2 size={16} strokeWidth={2} aria-hidden="true" />
                    <span>Verify licenses</span>
                  </motion.button>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Step 2: Mandatory Statutory & Licensing Declarations */}
        <div>
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#E5ECE2]">
            <div className="flex items-start gap-2.5">
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#EAF1E8] font-mono text-[12.5px] font-bold text-[#153226]">
                02
              </span>
              <div>
                <h3 className="text-[16.5px] font-bold text-[#153226]">
                  Mandatory Statutory &amp; Trade Declarations
                </h3>
                <p className="text-[13px] text-[#556B5F]">
                  Confirm all four regulatory permissions required for B2B
                  pharmaceutical and nutraceutical supply.
                </p>
              </div>
            </div>

            <span className="font-mono text-[13px] font-semibold tabular-nums text-[#153226]">
              {b2bGate.declarationsCompleted} / {b2bGate.declarationsTotal}{' '}
              confirmed
            </span>
          </div>

          <ul className="mt-4 divide-y divide-[#EAEFE8]">
            {INFORMED_CHOICE_CHECKLIST.map((item) => {
              const checked = checkedIds.includes(item.id);
              return (
                <li key={item.id} className="py-3.5 first:pt-1 last:pb-0">
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.995 }}
                    transition={IOS_SPRING_SNAPPY}
                    onClick={() => toggleChecklistItem(item.id)}
                    aria-pressed={checked}
                    className={`flex w-full items-start gap-4 rounded-2xl p-3 -mx-1 text-left transition-colors cursor-pointer ${
                      checked
                        ? 'bg-[#F0F6EF] hover:bg-[#E7F1E5]'
                        : 'hover:bg-[#F5F8F3]'
                    }`}
                  >
                    <span
                      className={`mt-0.5 shrink-0 transition-colors ${
                        checked ? 'text-[#173A2C]' : 'text-[#738A7D]'
                      }`}
                      aria-hidden="true"
                    >
                      {checked ? (
                        <CheckCircle2 size={22} strokeWidth={2.1} />
                      ) : (
                        <Circle size={22} strokeWidth={1.75} />
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-[#3B5B4B]">
                          {item.badge}
                        </span>
                        <span className="text-[#C2D0C5]" aria-hidden="true">
                          ·
                        </span>
                        <span className="text-[11.5px] font-medium text-[#7A2E1D]">
                          Mandatory
                        </span>
                      </div>
                      <span className="mt-0.5 block text-[15.5px] font-semibold text-[#153226]">
                        {item.title}
                      </span>
                      <span className="mt-1 block text-[14px] leading-[1.58] text-[#4C6156]">
                        {item.description}
                      </span>
                    </div>
                  </motion.button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Bottom Compliance Gate Status Banner */}
        <div
          role="status"
          aria-live="polite"
          className={`rounded-2xl border p-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between ${
            b2bGate.isFullyVerified
              ? 'border-[#B6D4BA] bg-[#EAF4EB] text-[#153226]'
              : 'border-[#DFC994] bg-[#FBF5E6] text-[#46340C]'
          }`}
        >
          <div className="flex items-start gap-3">
            {b2bGate.isFullyVerified ? (
              <ShieldCheck
                size={21}
                strokeWidth={2.1}
                className="mt-0.5 shrink-0 text-[#173A2C]"
                aria-hidden="true"
              />
            ) : (
              <AlertTriangle
                size={20}
                strokeWidth={2}
                className="mt-0.5 shrink-0 text-[#8F6510]"
                aria-hidden="true"
              />
            )}
            <div>
              <p className="text-[15px] font-bold">
                {b2bGate.isFullyVerified
                  ? 'Authorized B2B Trade Partner — Wholesale Supply Unlocked'
                  : 'B2B Supply Form Locked Until Trade Licenses Are Verified'}
              </p>
              <p className="mt-0.5 text-[13.5px] leading-relaxed opacity-90">
                {b2bGate.isFullyVerified
                  ? `Verified for ${b2bVerification.businessName} (DL: ${b2bVerification.drugLicenseNumber} · GSTIN: ${b2bVerification.gstin}). You may now submit wholesale supply inquiries below.`
                  : [
                      !b2bGate.credentialsVerified
                        ? 'Verify your Drug License, GSTIN & FSSAI credentials in Step 01'
                        : null,
                      remainingDeclarations > 0
                        ? `Confirm ${remainingDeclarations} remaining statutory ${
                            remainingDeclarations === 1
                              ? 'declaration'
                              : 'declarations'
                          } in Step 02`
                        : null,
                    ]
                      .filter(Boolean)
                      .join(' and ') + '.'}
              </p>
            </div>
          </div>

          {b2bGate.isFullyVerified &&
            (embedded ? (
              <a
                href="#contact"
                onClick={(e) => {
                  triggerHaptic('light');
                  handleInPageAnchorClick(e, 'contact');
                }}
                className="inline-flex min-h-[42px] shrink-0 items-center justify-center gap-2 rounded-full bg-[#173A2C] px-5 py-2 text-[13.5px] font-semibold text-white hover:bg-[#102B20] transition-colors whitespace-nowrap"
              >
                <span>Proceed to B2B Supply Form</span>
                <ArrowRight size={14} aria-hidden="true" />
              </a>
            ) : (
              <Link
                to="/#contact"
                onClick={() => triggerHaptic('light')}
                className="inline-flex min-h-[42px] shrink-0 items-center justify-center gap-2 rounded-full bg-[#173A2C] px-5 py-2 text-[13.5px] font-semibold text-white hover:bg-[#102B20] transition-colors whitespace-nowrap"
              >
                <span>Proceed to B2B Supply Form</span>
                <ArrowRight size={14} aria-hidden="true" />
              </Link>
            ))}
        </div>
      </div>
    </div>
  );
}
