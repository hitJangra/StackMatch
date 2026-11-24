import React from 'react';
import { MapPin, Search, X } from 'lucide-react';

export const LOCATION_PILLS = [
    'All India',
    'Remote',
    'Bengaluru',
    'Hyderabad',
    'Pune',
    'Delhi NCR',
    'Mumbai',
    'Chennai',
];

export const matchJobLocation = (jobLocation, filterValue) => {
    if (!filterValue || filterValue === 'All' || filterValue === 'All India') return true;
    if (!jobLocation) return false;
    const loc = String(jobLocation).toLowerCase();
    const target = String(filterValue).toLowerCase().trim();

    if (target === 'remote') {
        return loc.includes('remote') || loc.includes('wfh') || loc.includes('work from home') || loc.includes('anywhere');
    }
    if (target === 'bengaluru' || target === 'bangalore') {
        return loc.includes('bengaluru') || loc.includes('bangalore');
    }
    if (target === 'delhi ncr' || target === 'delhi' || target === 'ncr') {
        return (
            loc.includes('delhi') ||
            loc.includes('noida') ||
            loc.includes('gurgaon') ||
            loc.includes('gurugram') ||
            loc.includes('faridabad') ||
            loc.includes('ghaziabad') ||
            loc.includes('ncr')
        );
    }
    if (target === 'mumbai') {
        return loc.includes('mumbai') || loc.includes('navi mumbai') || loc.includes('thane');
    }
    if (target === 'hyderabad') {
        return loc.includes('hyderabad') || loc.includes('secunderabad');
    }
    if (target === 'pune') {
        return loc.includes('pune');
    }
    if (target === 'chennai') {
        return loc.includes('chennai') || loc.includes('madras');
    }
    return loc.includes(target);
};

export const LocationFilterBar = ({
    activeLocation = 'All India',
    onChange,
    customCity = '',
    onCustomCityChange,
    className = ''
}) => {
    const isCustomActive = customCity.trim() !== '' && !LOCATION_PILLS.includes(activeLocation);

    const handlePillClick = (pill) => {
        if (onCustomCityChange) {
            onCustomCityChange('');
        }
        onChange(pill);
    };

    const handleCustomChange = (e) => {
        const val = e.target.value;
        if (onCustomCityChange) {
            onCustomCityChange(val);
        }
        if (val.trim()) {
            onChange(val.trim());
        } else {
            onChange('All India');
        }
    };

    const handleClearCustom = () => {
        if (onCustomCityChange) {
            onCustomCityChange('');
        }
        onChange('All India');
    };

    return (
        <div className={`flex flex-wrap items-center gap-2 p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xs ${className}`}>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400 mr-1 flex-shrink-0">
                <MapPin className="w-3.5 h-3.5 text-[#163300] dark:text-[#9FE870]" />
                <span className="hidden sm:inline">Location:</span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 flex-1 min-w-0">
                {LOCATION_PILLS.map((pill) => {
                    const isSelected = !isCustomActive && activeLocation.toLowerCase() === pill.toLowerCase();
                    return (
                        <button
                            key={pill}
                            type="button"
                            onClick={() => handlePillClick(pill)}
                            className={`px-3 py-1 rounded-full text-xs transition-all cursor-pointer select-none font-medium ${
                                isSelected
                                    ? 'bg-[#9FE870] text-[#163300] dark:text-[#163300] shadow-xs font-semibold'
                                    : 'bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700/80 text-zinc-700 dark:text-zinc-300'
                            }`}
                        >
                            {pill}
                        </button>
                    );
                })}

                {/* Custom City Input */}
                <div className="relative inline-flex items-center">
                    <Search className="w-3 h-3 text-zinc-400 absolute left-2.5 pointer-events-none" />
                    <input
                        type="text"
                        value={customCity}
                        onChange={handleCustomChange}
                        placeholder="Other city..."
                        className={`pl-7 pr-6 py-1 rounded-full text-xs border transition-all w-28 sm:w-36 focus:outline-none focus:ring-1 focus:ring-[#163300] dark:focus:ring-[#9FE870] ${
                            isCustomActive
                                ? 'border-[#163300] dark:border-[#9FE870] bg-[#9FE870]/10 text-zinc-900 dark:text-zinc-100 font-medium'
                                : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400'
                        }`}
                    />
                    {customCity && (
                        <button
                            type="button"
                            onClick={handleClearCustom}
                            className="absolute right-2 p-0.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                            title="Clear custom city"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LocationFilterBar;
