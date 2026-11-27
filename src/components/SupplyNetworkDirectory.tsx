import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  ArrowUpRight,
  BadgeCheck,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Lock,
  Search,
  ShieldCheck,
  Truck,
  X,
} from 'lucide-react';
import {
  INDIAN_SUPPLY_LOCATIONS,
  type IndianSupplyLocation,
} from '../data/indianLocations';
import { useRegimen } from '../context/RegimenContext';
import {
  computeSupplyNetworkStats,
  deriveLocationVerificationMarkers,
  filterSupplyLocations,
  GENOVARIS_NETWORK_CREDENTIALS,
  SUPPLY_NETWORK_ZONES,
  type SupplyAvailabilityFilter,
  type SupplyZoneFilter,
} from '../utils/supplyNetwork';
import { triggerHaptic } from '../utils/haptics';
import { handleInPageAnchorClick } from '../utils/sectionNavigation';

export interface SupplyNetworkDirectoryProps {
  embedded?: boolean;
  selectedPincode?: string;
  onSelectLocation?: (location: IndianSupplyLocation) => void;
}

export function SupplyNetworkDirectory({
  embedded = false,
  selectedPincode = '',
  onSelectLocation,
}: SupplyNetworkDirectoryProps) {
  const { b2bVerification, b2bGate } = useRegimen();

  const [query, setQuery] = useState('');
  const [availability, setAvailability] =
    useState<SupplyAvailabilityFilter>('all');
  const [zone, setZone] = useState<SupplyZoneFilter>('All');
  const [expandedList, setExpandedList] = useState(false);

  const stats = useMemo(
    () => computeSupplyNetworkStats(INDIAN_SUPPLY_LOCATIONS),
    [],
  );

  const filteredLocations = useMemo(
    () =>
      filterSupplyLocations(INDIAN_SUPPLY_LOCATIONS, {
        query,
        availability,
        zone,
      }),
    [query, availability, zone],
  );

  const hasActiveFilters =
    query.trim().length > 0 || availability !== 'all' || zone !== 'All';

  const resetFilters = () => {
    triggerHaptic('selection');
    setQuery('');
    setAvailability('all');
    setZone('All');
  };

  const availabilityTabs: Array<{
    value: SupplyAvailabilityFilter;
    label: string;
    count: number;
  }> = [
    { value: 'all', label: 'All', count: stats.totalLocations },
    { value: 'available', label: 'Available', count: stats.availableCount },
    {
      value: 'unavailable',
      label: 'Not available',
      count: stats.unavailableCount,
    },
  ];

  return (
    <section
      id="supply-network"
      aria-labelledby="supply-network-heading"
      data-testid="supply-network-directory"
      className="mt-14 scroll-mt-24 overflow-hidden rounded-3xl border border-[#E3E9E0] bg-[#FEFDF9]"
    >
      {/* Authoritative Network Transparency Header */}
      <div className="bg-[#153226] px-6 py-6 sm:px-9 sm:py-8 text-white">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 font-mono text-[11px] font-medium uppercase tracking-[0.13em] text-[#B9D2C4]">
              <Truck size={15} strokeWidth={2} aria-hidden="true" />
              <span>Pan-India B2B Supply Network Transparency</span>
            </div>
            <h2
              id="supply-network-heading"
              className="mt-2.5 text-[clamp(1.5rem,2.5vw,1.95rem)] font-semibold leading-[1.18] tracking-[-0.018em] text-white"
            >
              Indian Supply Locations &amp; Business Verification Directory
            </h2>
            <p className="mt-2 text-[14.5px] leading-[1.62] text-[#D3E3DA]">
              Review real-time wholesale dispatch availability across{' '}
              <span className="font-mono font-semibold tabular-nums text-white">
                {stats.totalLocations}
              </span>{' '}
              Indian cities covering all{' '}
              <span className="font-mono font-semibold tabular-nums text-white">
                {stats.stateCount}
              </span>{' '}
              States &amp; Union Territories, alongside corridor and B2B license
              verification markers.
            </p>
          </div>

          {/* Supplier & Live Buyer Business Verification Status Panel */}
          <div className="shrink-0 rounded-2xl border border-white/15 bg-white/8 p-4 lg:w-[340px]">
            <div className="flex items-center justify-between gap-2 border-b border-white/12 pb-3">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#A9C7B7]">
                  Verified Dispatch Origin
                </p>
                <p className="mt-0.5 text-[13px] font-semibold text-white truncate">
                  {GENOVARIS_NETWORK_CREDENTIALS.hubName}
                </p>
                <p className="mt-0.5 font-mono text-[11.5px] tabular-nums text-[#C9DDD2]">
                  GSTIN {GENOVARIS_NETWORK_CREDENTIALS.gstin} · FSSAI{' '}
                  {GENOVARIS_NETWORK_CREDENTIALS.fssai}
                </p>
              </div>
              <ShieldCheck
                size={18}
                strokeWidth={2}
                className="shrink-0 text-[#8FD9A8]"
                aria-hidden="true"
              />
            </div>

            <div className="mt-3 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#A9C7B7]">
                  Your Business Verification
                </p>
                {b2bGate.isFullyVerified ? (
                  <>
                    <p className="mt-0.5 flex items-center gap-1.5 text-[13px] font-semibold text-[#A8E6BE]">
                      <BadgeCheck
                        size={15}
                        className="shrink-0"
                        aria-hidden="true"
                      />
                      <span className="truncate">
                        B2B Verified · {b2bVerification.businessName}
                      </span>
                    </p>
                    <p className="mt-0.5 font-mono text-[11.5px] tabular-nums text-[#D3E3DA] truncate">
                      DL {b2bVerification.drugLicenseNumber}
                      {b2bVerification.gstStateName
                        ? ` · ${b2bVerification.gstStateName}`
                        : ''}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="mt-0.5 flex items-center gap-1.5 text-[13px] font-semibold text-[#F2D48A]">
                      <Lock size={14} className="shrink-0" aria-hidden="true" />
                      <span>
                        Verification Pending ({b2bGate.overallPercent}%)
                      </span>
                    </p>
                    <p className="mt-0.5 text-[12px] text-[#C9DDD2]">
                      Drug License, GSTIN &amp; FSSAI required for dispatch.
                    </p>
                  </>
                )}
              </div>

              {!b2bGate.isFullyVerified &&
                (embedded ? (
                  <a
                    href="#b2b-verification"
                    onClick={(e) => {
                      triggerHaptic('light');
                      handleInPageAnchorClick(e, 'b2b-verification');
                    }}
                    className="inline-flex min-h-[34px] shrink-0 items-center gap-1 rounded-full bg-white/14 px-3 py-1 text-[12px] font-semibold text-white hover:bg-white/22 transition-colors whitespace-nowrap"
                  >
                    <span>Verify</span>
                    <ArrowUpRight size={12} aria-hidden="true" />
                  </a>
                ) : (
                  <Link
                    to="/responsible-use#b2b-verification"
                    onClick={() => triggerHaptic('light')}
                    className="inline-flex min-h-[34px] shrink-0 items-center gap-1 rounded-full bg-white/14 px-3 py-1 text-[12px] font-semibold text-white hover:bg-white/22 transition-colors whitespace-nowrap"
                  >
                    <span>Verify</span>
                    <ArrowUpRight size={12} aria-hidden="true" />
                  </Link>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4-Column Flat Network Metrics Strip */}
      <dl className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-[#E5ECE2] border-b border-[#E5ECE2]">
        <div className="bg-[#F7F8F1] px-5 py-4 sm:px-6">
          <dt className="text-[12px] font-medium text-[#556B5F]">
            Indian locations listed
          </dt>
          <dd className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <span className="font-mono text-[22px] font-bold tabular-nums text-[#153226]">
              {stats.totalLocations}
            </span>
            <span className="text-[12.5px] text-[#556B5F]">
              {stats.stateCount} States &amp; UTs
            </span>
          </dd>
        </div>

        <div className="bg-[#F7F8F1] px-5 py-4 sm:px-6">
          <dt className="text-[12px] font-medium text-[#556B5F]">
            Active supply routes
          </dt>
          <dd className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <span className="font-mono text-[22px] font-bold tabular-nums text-[#173A2C]">
              {stats.availableCount}
            </span>
            <span className="font-mono text-[12.5px] tabular-nums text-[#2F5744]">
              {stats.coveragePercent}% active
            </span>
          </dd>
        </div>

        <div className="bg-[#F7F8F1] px-5 py-4 sm:px-6">
          <dt className="text-[12px] font-medium text-[#556B5F]">
            Currently unavailable
          </dt>
          <dd className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <span className="font-mono text-[22px] font-bold tabular-nums text-[#8E2F1B]">
              {stats.unavailableCount}
            </span>
            <span className="text-[12.5px] text-[#6E493F]">
              Paused / remote
            </span>
          </dd>
        </div>

        <div className="bg-[#F7F8F1] px-5 py-4 sm:px-6">
          <dt className="text-[12px] font-medium text-[#556B5F]">
            B2B verification scope
          </dt>
          <dd className="mt-1 flex items-baseline gap-2">
            <span className="font-mono text-[14px] sm:text-[15px] font-bold text-[#153226]">
              DL · GSTIN · FSSAI
            </span>
          </dd>
          <dd className="mt-0.5 text-[12px] text-[#556B5F]">
            Mandatory B2B trade gate
          </dd>
        </div>
      </dl>

      {/* Search, Availability & Zone Filter Toolbar */}
      <div className="border-b border-[#EAEFE8] bg-[#FEFDF9] px-6 py-5 sm:px-8 space-y-4">
        <div className="flex flex-col gap-3.5 lg:flex-row lg:items-center lg:justify-between">
          {/* Search Input */}
          <div className="relative w-full lg:max-w-sm">
            <Search
              size={16}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5B7266]"
              aria-hidden="true"
            />
            <input
              id="supply-network-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search city, state, or 6-digit pincode..."
              aria-label="Search Indian supply locations by city, state, or pincode"
              className="min-h-[44px] w-full rounded-2xl border border-[#D8E1D5] bg-[#F7F8F1] pl-10 pr-10 text-[14px] text-[#153226] placeholder:text-[#73877C] focus:border-[#173A2C] focus:bg-white focus:outline-none transition-colors"
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('selection');
                  setQuery('');
                }}
                aria-label="Clear location search"
                className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-7 w-7 items-center justify-center rounded-full text-[#5B7266] hover:bg-[#E7EFE4] hover:text-[#153226] cursor-pointer"
              >
                <X size={14} aria-hidden="true" />
              </button>
            )}
          </div>

          {/* Availability Segmented Tabs */}
          <div className="flex w-full sm:w-auto items-center overflow-x-auto">
            <div
              role="tablist"
              aria-label="Filter Indian locations by supply availability"
              className="inline-flex w-full sm:w-auto items-center gap-1 rounded-2xl bg-[#EEF3EC] p-1"
            >
              {availabilityTabs.map((tab) => {
                const active = availability === tab.value;
                return (
                  <button
                    key={tab.value}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => {
                      triggerHaptic('selection');
                      setAvailability(tab.value);
                    }}
                    className={`flex-1 sm:flex-none min-h-[38px] rounded-xl px-2.5 sm:px-3.5 py-1.5 text-[12.5px] sm:text-[13px] font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                      active
                        ? 'bg-[#173A2C] text-white'
                        : 'text-[#445C50] hover:text-[#153226]'
                    }`}
                  >
                    <span>{tab.label}</span>{' '}
                    <span
                      className={`font-mono text-[11.5px] sm:text-[12px] tabular-nums ${
                        active ? 'text-[#C6DDD0]' : 'text-[#627A6D]'
                      }`}
                    >
                      ({tab.count})
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Zone Filter Bar */}
        <div
          role="tablist"
          aria-label="Filter Indian locations by geographic zone"
          className="flex items-center gap-1.5 overflow-x-auto pb-0.5 -mx-1 px-1"
        >
          {SUPPLY_NETWORK_ZONES.map((zoneItem) => {
            const active = zone === zoneItem;
            const zoneLabel = zoneItem === 'All' ? 'All zones' : zoneItem;
            return (
              <button
                key={zoneItem}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => {
                  triggerHaptic('selection');
                  setZone(zoneItem);
                }}
                className={`min-h-[36px] rounded-xl px-3 py-1.5 text-[12.5px] font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  active
                    ? 'bg-[#EDF5EE] text-[#153226] font-semibold border border-[#BFD7C2]'
                    : 'text-[#556B5F] border border-transparent hover:bg-[#F3F6F1] hover:text-[#153226]'
                }`}
              >
                <span>{zoneLabel}</span>{' '}
                <span className="font-mono text-[11.5px] tabular-nums opacity-75">
                  {stats.zoneCounts[zoneItem]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Quiet Inline Result Count & Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-[13px] text-[#556B5F]">
          <p className="font-mono tabular-nums" data-testid="supply-network-count">
            Showing {filteredLocations.length} of {stats.totalLocations} Indian
            locations
          </p>

          <div className="flex items-center gap-4">
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="font-semibold text-[#173A2C] hover:text-[#102B20] underline underline-offset-4 cursor-pointer whitespace-nowrap"
              >
                Reset filters
              </button>
            )}

            {filteredLocations.length > 10 && (
              <button
                type="button"
                aria-expanded={expandedList}
                onClick={() => {
                  triggerHaptic('light');
                  setExpandedList((prev) => !prev);
                }}
                className="inline-flex items-center gap-1 font-semibold text-[#173A2C] hover:text-[#102B20] cursor-pointer whitespace-nowrap"
              >
                {expandedList ? (
                  <>
                    <span>Compact scroll view</span>
                    <ChevronUp size={15} aria-hidden="true" />
                  </>
                ) : (
                  <>
                    <span>Expand all {filteredLocations.length} rows</span>
                    <ChevronDown size={15} aria-hidden="true" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Directory Content: Empty State vs Desktop Table + Mobile List */}
      {filteredLocations.length === 0 ? (
        <div className="px-6 py-12 text-center">
          <p className="text-[16px] font-semibold text-[#153226]">
            No matching Indian locations found
          </p>
          <p className="mt-1.5 text-[14px] text-[#556B5F]">
            Try searching another Indian city, state, or 6-digit pincode, or
            clear your active filters.
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="mt-4 inline-flex min-h-[42px] items-center rounded-full bg-[#173A2C] px-5 py-2 text-[13.5px] font-semibold text-white hover:bg-[#102B20] transition-colors cursor-pointer"
          >
            Reset filters
          </button>
        </div>
      ) : (
        <>
          {/* Desktop / Tablet Structured Table */}
          <div
            className={`hidden md:block ${
              expandedList ? '' : 'max-h-[560px] overflow-y-auto'
            }`}
          >
            <table className="w-full border-collapse text-left">
              <thead className="sticky top-0 z-10 bg-[#F4F7F0] border-b border-[#E3E9E0] text-[11.5px] font-semibold uppercase tracking-[0.09em] text-[#4C6156]">
                <tr>
                  <th scope="col" className="py-3.5 pl-8 pr-4">
                    Location &amp; Pincode
                  </th>
                  <th scope="col" className="py-3.5 px-4">
                    Availability &amp; Transit
                  </th>
                  <th scope="col" className="py-3.5 px-4">
                    Business Verification Markers
                  </th>
                  {onSelectLocation && (
                    <th scope="col" className="py-3.5 pl-4 pr-8 text-right">
                      Supply Form
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAEFE8] text-[14px]">
                {filteredLocations.map((loc) => {
                  const markers = deriveLocationVerificationMarkers(
                    loc,
                    b2bGate,
                    b2bVerification,
                  );
                  const isSelected = selectedPincode === loc.pincode;

                  return (
                    <tr
                      key={loc.pincode}
                      data-location-pincode={loc.pincode}
                      data-availability={loc.available ? 'available' : 'unavailable'}
                      className={`transition-colors ${
                        isSelected
                          ? 'bg-[#EDF5EE]/85'
                          : 'hover:bg-[#F7F9F4]'
                      }`}
                    >
                      {/* Location & Pincode */}
                      <td className="py-4 pl-8 pr-4 align-top">
                        <div className="flex items-baseline gap-2.5">
                          <span className="font-semibold text-[#153226]">
                            {loc.city}
                          </span>
                          <span className="font-mono text-[12.5px] font-medium tabular-nums text-[#2E5542]">
                            {loc.pincode}
                          </span>
                        </div>
                        <p className="mt-0.5 text-[12.5px] text-[#556B5F]">
                          {loc.state} <span aria-hidden="true">·</span>{' '}
                          {loc.zone} India
                        </p>
                      </td>

                      {/* Availability & Transit */}
                      <td className="py-4 px-4 align-top">
                        <div
                          className={`inline-flex items-center gap-1.5 font-semibold ${
                            loc.available ? 'text-[#173A2C]' : 'text-[#8E2F1B]'
                          }`}
                        >
                          {loc.available ? (
                            <CheckCircle2
                              size={15}
                              strokeWidth={2.1}
                              className="shrink-0"
                              aria-hidden="true"
                            />
                          ) : (
                            <AlertCircle
                              size={15}
                              strokeWidth={2.1}
                              className="shrink-0"
                              aria-hidden="true"
                            />
                          )}
                          <span>
                            {loc.available ? 'Available' : 'Not available'}
                          </span>
                        </div>
                        <p className="mt-1 text-[12.5px] leading-snug text-[#4C6156] max-w-xs">
                          {loc.available
                            ? (loc.etaLabel ?? loc.note)
                            : loc.note}
                        </p>
                      </td>

                      {/* Business Verification Markers */}
                      <td className="py-4 px-4 align-top">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-[13px]">
                            <span
                              className={`inline-flex items-center gap-1.5 font-medium ${
                                markers.corridorVerified
                                  ? 'text-[#153226]'
                                  : 'text-[#6B463D]'
                              }`}
                            >
                              {markers.corridorVerified ? (
                                <ShieldCheck
                                  size={14}
                                  strokeWidth={2}
                                  className="shrink-0 text-[#173A2C]"
                                  aria-hidden="true"
                                />
                              ) : (
                                <Clock
                                  size={14}
                                  strokeWidth={2}
                                  className="shrink-0 text-[#8E2F1B]"
                                  aria-hidden="true"
                                />
                              )}
                              <span>{markers.corridorMarker}</span>
                            </span>
                          </div>

                          <p className="font-mono text-[11.5px] text-[#556B5F]">
                            {markers.requiredLicenses}
                          </p>

                          <div
                            className={`inline-flex items-center gap-1.5 text-[12.5px] ${
                              markers.buyerMarkerTone === 'same-state'
                                ? 'font-semibold text-[#173A2C]'
                                : markers.buyerMarkerTone === 'verified'
                                  ? 'font-medium text-[#2F5744]'
                                  : 'text-[#8C5B12]'
                            }`}
                          >
                            {markers.buyerMarkerTone === 'same-state' ||
                            markers.buyerMarkerTone === 'verified' ? (
                              <BadgeCheck
                                size={14}
                                strokeWidth={2.1}
                                className="shrink-0"
                                aria-hidden="true"
                              />
                            ) : (
                              <Lock
                                size={13}
                                strokeWidth={2}
                                className="shrink-0"
                                aria-hidden="true"
                              />
                            )}
                            <span>{markers.buyerMarkerLabel}</span>
                          </div>
                        </div>
                      </td>

                      {/* Action */}
                      {onSelectLocation && (
                        <td className="py-4 pl-4 pr-8 align-top text-right">
                          <button
                            type="button"
                            onClick={() => onSelectLocation(loc)}
                            aria-label={`Use ${loc.city} (${loc.pincode}) in supply inquiry form`}
                            className={`inline-flex min-h-[38px] items-center justify-center gap-1.5 rounded-xl px-3.5 py-1.5 text-[12.5px] font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                              isSelected
                                ? 'bg-[#173A2C] text-white'
                                : 'border border-[#CFDAD0] bg-white text-[#153226] hover:border-[#173A2C] hover:bg-[#EDF5EE]'
                            }`}
                          >
                            {isSelected ? (
                              <>
                                <Check size={13} strokeWidth={2.4} aria-hidden="true" />
                                <span>Selected</span>
                              </>
                            ) : (
                              <span>Use pincode</span>
                            )}
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Stacked List */}
          <ul
            className={`md:hidden divide-y divide-[#EAEFE8] ${
              expandedList ? '' : 'max-h-[540px] overflow-y-auto'
            }`}
          >
            {filteredLocations.map((loc) => {
              const markers = deriveLocationVerificationMarkers(
                loc,
                b2bGate,
                b2bVerification,
              );
              const isSelected = selectedPincode === loc.pincode;

              return (
                <li
                  key={loc.pincode}
                  className={`px-5 py-4 space-y-2.5 ${
                    isSelected ? 'bg-[#EDF5EE]/85' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[15px] font-semibold text-[#153226]">
                        {loc.city}{' '}
                        <span className="font-mono text-[13px] font-medium tabular-nums text-[#2E5542]">
                          {loc.pincode}
                        </span>
                      </p>
                      <p className="text-[12.5px] text-[#556B5F]">
                        {loc.state} <span aria-hidden="true">·</span> {loc.zone}{' '}
                        India
                      </p>
                    </div>

                    <div
                      className={`inline-flex shrink-0 items-center gap-1 text-[13px] font-semibold whitespace-nowrap ${
                        loc.available ? 'text-[#173A2C]' : 'text-[#8E2F1B]'
                      }`}
                    >
                      {loc.available ? (
                        <CheckCircle2 size={14} aria-hidden="true" />
                      ) : (
                        <AlertCircle size={14} aria-hidden="true" />
                      )}
                      <span>
                        {loc.available ? 'Available' : 'Not available'}
                      </span>
                    </div>
                  </div>

                  <p className="text-[13px] leading-snug text-[#4C6156]">
                    {loc.available ? (loc.etaLabel ?? loc.note) : loc.note}
                  </p>

                  <div className="space-y-1 text-[12.5px]">
                    <p className="flex items-center gap-1.5 text-[#153226]">
                      {markers.corridorVerified ? (
                        <ShieldCheck
                          size={13}
                          className="shrink-0 text-[#173A2C]"
                          aria-hidden="true"
                        />
                      ) : (
                        <Clock
                          size={13}
                          className="shrink-0 text-[#8E2F1B]"
                          aria-hidden="true"
                        />
                      )}
                      <span className="font-medium">
                        {markers.corridorMarker}
                      </span>
                    </p>

                    <p className="font-mono text-[11.5px] text-[#556B5F]">
                      {markers.requiredLicenses}
                    </p>

                    <p
                      className={`inline-flex items-center gap-1.5 ${
                        markers.buyerMarkerTone === 'same-state'
                          ? 'font-semibold text-[#173A2C]'
                          : markers.buyerMarkerTone === 'verified'
                            ? 'font-medium text-[#2F5744]'
                            : 'text-[#8C5B12]'
                      }`}
                    >
                      {markers.buyerMarkerTone === 'same-state' ||
                      markers.buyerMarkerTone === 'verified' ? (
                        <BadgeCheck size={13} aria-hidden="true" />
                      ) : (
                        <Lock size={12} aria-hidden="true" />
                      )}
                      <span>{markers.buyerMarkerLabel}</span>
                    </p>
                  </div>

                  {onSelectLocation && (
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => onSelectLocation(loc)}
                        aria-label={`Use ${loc.city} (${loc.pincode}) in supply inquiry form`}
                        className={`inline-flex min-h-[44px] w-full items-center justify-center gap-1.5 rounded-xl px-4 py-2 text-[13px] font-semibold transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-[#173A2C] text-white'
                            : 'border border-[#CFDAD0] bg-white text-[#153226] hover:border-[#173A2C] hover:bg-[#EDF5EE]'
                        }`}
                      >
                        {isSelected ? (
                          <>
                            <Check size={14} strokeWidth={2.4} aria-hidden="true" />
                            <span>Selected for inquiry</span>
                          </>
                        ) : (
                          <span>Use {loc.pincode} in supply form</span>
                        )}
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </>
      )}
    </section>
  );
}
