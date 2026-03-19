import { useState, useEffect, useRef, useCallback } from 'react';
import peaks from '../data/peaks.json';

function fuzzyMatch(query, peak) {
  const q = query.toLowerCase();
  if (peak.name.toLowerCase().includes(q)) return true;
  if (peak.aliases?.some((a) => a.toLowerCase().includes(q))) return true;
  return false;
}

export default function SearchBar({ onSelect, compact }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const debounceRef = useRef(null);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  const search = useCallback((q) => {
    if (!q.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }
    const matches = peaks.filter((p) => fuzzyMatch(q, p)).slice(0, 8);
    setResults(matches);
    setIsOpen(matches.length > 0);
    setActiveIndex(-1);
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(query), 300);
    return () => clearTimeout(debounceRef.current);
  }, [query, search]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleSelect(peak) {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    onSelect(peak);
  }

  function handleKeyDown(e) {
    if (!isOpen) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      handleSelect(results[activeIndex]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <div
        className={`
          flex items-center rounded-full transition-all duration-300
          bg-white/[0.05] backdrop-blur-md border border-cyan-400/[0.08]
          ${compact
            ? 'px-3 py-1.5'
            : 'px-5 py-3'
          }
        `}
      >
        <svg
          className={`shrink-0 text-cyan-400/50 ${compact ? 'w-4 h-4 mr-2' : 'w-5 h-5 mr-3'}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
          />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim() && results.length > 0 && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={compact ? "Search another peak..." : "Search a peak..."}
          className={`
            w-full bg-transparent outline-none placeholder-gray-600 text-white/90
            ${compact ? 'text-sm' : 'text-lg'}
          `}
        />
      </div>

      {isOpen && (
        <ul className="absolute z-50 mt-1.5 w-full rounded-xl bg-[#0d1117]/95 backdrop-blur-xl border border-cyan-400/[0.08] overflow-hidden shadow-2xl">
          {results.map((peak, i) => (
            <li
              key={`${peak.name}-${peak.latitude}`}
              onClick={() => handleSelect(peak)}
              onMouseEnter={() => setActiveIndex(i)}
              className={`
                flex items-center justify-between px-4 py-2.5 cursor-pointer transition-colors
                ${i === activeIndex ? 'bg-cyan-400/[0.08]' : 'hover:bg-white/[0.04]'}
              `}
            >
              <div className="flex flex-col">
                <span className="text-sm text-white/90 font-medium">{peak.name}</span>
                <span className="text-[11px] text-gray-500">{peak.state}</span>
              </div>
              <span className="text-xs text-cyan-400/60 font-mono-data tabular-nums">
                {peak.elevation_ft.toLocaleString()} ft
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
