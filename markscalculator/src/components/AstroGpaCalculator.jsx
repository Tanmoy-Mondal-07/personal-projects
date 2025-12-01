import React, { useState, useEffect } from 'react';
import { Percent, GraduationCap, Settings, RotateCcw, ChevronDown, ChevronUp, Plus, Minus } from 'lucide-react';

const GradeConverter = ({ passformulaPreset = '' }) => {
  const [activeTab, setActiveTab] = useState('percentage');

  // --- STATE FOR PERCENTAGE CONVERTER ---
  const [gradeInput, setGradeInput] = useState('');
  const [scale, setScale] = useState(10);
  const [formulaPreset, setFormulaPreset] = useState('vtu');
  const [multiplier, setMultiplier] = useState(10);
  const [deduction, setDeduction] = useState(0.75);
  const [showSettings, setShowSettings] = useState(false);
  const [percentResult, setPercentResult] = useState(null);

  useEffect(() => {
    if (passformulaPreset !== '') {
      setFormulaPreset(passformulaPreset);
    }
  }, [passformulaPreset]);


  // --- STATE FOR SGPA -> CGPA ---
  const [numSemesters, setNumSemesters] = useState(2);
  const [sgpaValues, setSgpaValues] = useState({ 1: '', 2: '' });
  const [cgpaResult, setCgpaResult] = useState(null);

  // --- HELPER ---
  const handleWheel = (e) => e.target.blur();

  // --- EFFECTS ---
  useEffect(() => {
    switch (formulaPreset) {
      case 'vtu':
        setMultiplier(10);
        setDeduction(7.5);
        break;
      case 'simple':
        setMultiplier(10);
        setDeduction(0);
        break;
      case 'cbse':
        setMultiplier(9.5);
        setDeduction(0);
        break;
      case 'JNTUH':
        setMultiplier(10);
        setDeduction(5.0);
        break;
      default:
        break;
    }
  }, [formulaPreset]);

  useEffect(() => {
    const grade = parseFloat(gradeInput);
    if (!isNaN(grade) && scale >= grade && grade >= 0) {
      let res = (grade * multiplier) - deduction;
      if (res < 0) res = 0;
      if (res > 100) res = 100;
      setPercentResult(res.toFixed(2));
    } else {
      setPercentResult(null);
    }
  }, [gradeInput, multiplier, deduction, scale]);

  // --- LOGIC: SGPA -> CGPA ---
  const handleSemesterCountChange = (val) => {
    const count = parseInt(val);
    if (isNaN(count) || count < 1) return;
    if (count > 20) return;

    setNumSemesters(count);
    setSgpaValues(prev => {
      const newValues = {};
      for (let i = 1; i <= count; i++) {
        newValues[i] = prev[i] || '';
      }
      return newValues;
    });
  };

  const handleSgpaChange = (semIndex, value) => {
    setSgpaValues(prev => ({ ...prev, [semIndex]: value }));
  };

  useEffect(() => {
    const values = Object.values(sgpaValues).map(val => parseFloat(val)).filter(val => !isNaN(val));
    if (values.length > 0) {
      const sum = values.reduce((acc, curr) => acc + curr, 0);
      const avg = sum / values.length;
      setCgpaResult(avg.toFixed(2));
    } else {
      setCgpaResult(null);
    }
  }, [sgpaValues, numSemesters]);

  const resetSgpa = () => {
    setNumSemesters(2);
    setSgpaValues({ 1: '', 2: '' });
    setCgpaResult(null);
  };

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col h-full md:h-auto">
      {/* Tabs */}
      <div className="flex border-b border-(--c2)">
        <button
          onClick={() => setActiveTab('percentage')}
          className={`flex-1 py-4 text-sm font-medium flex justify-center items-center gap-2 transition-colors touch-manipulation
            ${activeTab === 'percentage'
              ? 'text-(--c3) border-b-2 border-(--c3) bg-(--c1)/50'
              : 'text-(--c4) hover:text-(--c3)'
            }`}
        >
          <Percent className="w-4 h-4" />
          <span className="hidden sm:inline">To Percentage</span>
          <span className="sm:hidden">Percentage</span>
        </button>
        <button
          onClick={() => setActiveTab('accumulator')}
          className={`flex-1 py-4 text-sm font-medium flex justify-center items-center gap-2 transition-colors touch-manipulation
            ${activeTab === 'accumulator'
              ? 'text-(--c3) border-b-2 border-(--c3) bg-(--c1)/50'
              : 'text-(--c4) hover:text-(--c3)'
            }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span className="hidden sm:inline">SGPA to CGPA</span>
          <span className="sm:hidden">CGPA Calc</span>
        </button>
      </div>

      {/* Content Area */}
      <div className="p-4 md:p-6 grow flex flex-col">

        {/* TAB 1: PERCENTAGE CONVERTER */}
        {activeTab === 'percentage' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">

            {/* Main Input */}
            <div>
              <label className="block text-sm font-medium text-(--c3) mb-2">
                Enter Score
              </label>
              <input
                type="number"
                onWheel={handleWheel}
                placeholder={`e.g. 8.5 (Max ${scale})`}
                value={gradeInput}
                onChange={(e) => setGradeInput(e.target.value)}
                step="0.01"
                max={scale}
                // text-base on mobile prevents iOS zoom, md:text-lg for desktop clarity
                className="w-full px-4 py-4 rounded-lg border border-(--c4) bg-(--c2) text-(--c4) 
                         text-base md:text-lg font-medium tracking-wide
                         focus:ring-2 focus:ring-(--c3) focus:outline-none transition-all 
                         [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>

            {/* Result Box */}
            <div className={`p-6 md:p-8 rounded-xl text-center transition-all duration-500 transform shadow-sm
              ${percentResult
                ? 'bg-gradient-to-br from-(--c1) to-(--c3)/10 border border-(--c3)/20 scale-100 opacity-100'
                : 'bg-(--c1) border border-transparent scale-95 opacity-60'
              }`}
            >
              <p className={`text-xs md:text-sm font-bold uppercase tracking-widest mb-2 
                ${percentResult ? 'text-(--c3)' : 'text-(--c4)'}`}>
                Equivalent Percentage
              </p>
              <div className={`text-4xl md:text-5xl font-black ${percentResult ? 'text-(--c3)' : 'text-(--c4)'}`}>
                {percentResult ? `${percentResult}%` : '--'}
              </div>
            </div>

            {/* Settings Toggle */}
            <div className="pt-4 border-t border-(--c2)">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="w-full flex justify-center items-center gap-2 text-sm text-(--c4)/60 hover:text-(--c3) transition-all p-2"
              >
                <Settings className="w-4 h-4" />
                <span>{showSettings ? 'Hide Settings' : 'Conversion Settings'}</span>
                {showSettings ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>

              {/* Settings Panel */}
              <div className={`grid transition-all duration-300 ease-in-out overflow-hidden ${showSettings ? 'grid-rows-[1fr] mt-4 opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="min-h-0 bg-(--c1)/50 rounded-lg border border-(--c2) p-4 space-y-4">

                  {/* Presets */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {[
                      { id: 'vtu', label: 'VTU' },
                      { id: 'simple', label: 'x10' },
                      { id: 'cbse', label: 'CBSE' },
                      { id: 'custom', label: 'Custom' },
                    ].map((p) => (
                      <button
                        key={p.id}
                        onClick={() => setFormulaPreset(p.id)}
                        className={`text-xs py-2 px-2 rounded font-medium border transition-all
                          ${formulaPreset === p.id
                            ? 'bg-(--c2) text-(--c3) border-(--c3)'
                            : 'bg-transparent text-(--c4) border-(--c4)/30 hover:bg-(--c2)'}`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>

                  {/* Manual Inputs */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-(--c4)/50 mb-1">Scale</label>
                      <input type="number" onWheel={handleWheel} value={scale} onChange={(e) => setScale(Number(e.target.value))} className="w-full text-sm px-3 py-2 rounded border border-(--c4)/30 bg-(--c1) text-(--c4) focus:border-(--c3) focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-(--c4)/50 mb-1">Multiplier</label>
                      <input type="number" onWheel={handleWheel} value={multiplier} onChange={(e) => { setMultiplier(Number(e.target.value)); setFormulaPreset('custom'); }} className="w-full text-sm px-3 py-2 rounded border border-(--c4)/30 bg-(--c1) text-(--c4) focus:border-(--c3) focus:outline-none" />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[10px] uppercase font-bold text-(--c4)/50 mb-1">Deduction</label>
                      <input type="number" onWheel={handleWheel} value={deduction} onChange={(e) => { setDeduction(Number(e.target.value)); setFormulaPreset('custom'); }} className="w-full text-sm px-3 py-2 rounded border border-(--c4)/30 bg-(--c1) text-(--c4) focus:border-(--c3) focus:outline-none" />
                      <p className="text-[10px] text-(--c4)/40 mt-1 font-mono text-center">(Score * {multiplier}) - {deduction}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SGPA TO CGPA */}
        {activeTab === 'accumulator' && (
          <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-2 duration-300">

            {/* Controls */}
            <div className="bg-(--c1)/30 p-4 rounded-xl border border-(--c2) mb-4 shrink-0">
              <label className="block text-xs font-bold uppercase text-(--c3)/70 mb-2 text-center md:text-left">
                Number of Semesters
              </label>
              <div className="flex items-center justify-center md:justify-start gap-4">
                <button
                  onClick={() => handleSemesterCountChange(numSemesters - 1)}
                  disabled={numSemesters <= 1}
                  className="w-10 h-10 flex items-center justify-center rounded-lg bg-(--c2) border border-(--c4)/20 hover:border-(--c3) disabled:opacity-30 active:scale-95 transition-all"
                >
                  <Minus className="w-5 h-5 text-(--c4)" />
                </button>

                <input
                  type="number"
                  onWheel={handleWheel}
                  value={numSemesters}
                  onChange={(e) => handleSemesterCountChange(e.target.value)}
                  className="w-16 text-center font-bold text-xl bg-transparent border-none focus:ring-0 text-(--c4) [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none"
                />

                <button
                  onClick={() => handleSemesterCountChange(numSemesters + 1)}
                  disabled={numSemesters >= 20}
                  className="w-10 h-10 flex items-center justify-center rounded-lg bg-(--c2) border border-(--c4)/20 hover:border-(--c3) disabled:opacity-30 active:scale-95 transition-all"
                >
                  <Plus className="w-5 h-5 text-(--c4)" />
                </button>
              </div>
            </div>

            {/* Scrollable Inputs Area */}
            {/* Added overflow-y-auto to allow scrolling only within this section if it gets too tall */}
            <div className="flex-1 overflow-y-auto min-h-[200px] md:max-h-[350px] pr-1 md:pr-2 -mr-1 md:-mr-2 mb-4">
              <div className="grid grid-cols-2 gap-3 md:gap-4 pb-2">
                {Array.from({ length: numSemesters }).map((_, index) => {
                  const semNum = index + 1;
                  return (
                    <div key={semNum} className="animate-in zoom-in-95 duration-200">
                      <label className="block text-[10px] uppercase font-bold text-(--c3)/60 mb-1 ml-1">
                        Sem {semNum}
                      </label>
                      <input
                        type="number"
                        onWheel={handleWheel}
                        placeholder="0.00"
                        value={sgpaValues[semNum] || ''}
                        onChange={(e) => handleSgpaChange(semNum, e.target.value)}
                        className="w-full px-3 py-3 rounded-lg bg-(--c1) text-(--c4) 
                                 text-base md:text-sm font-medium
                                 border border-transparent focus:border-(--c3) focus:outline-none focus:ring-1 focus:ring-(--c3)
                                 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none"
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer Result */}
            <div className="mt-auto pt-4 border-t border-(--c2) shrink-0 bg-(--c1)/10 backdrop-blur-sm md:bg-transparent">
              <div className="flex justify-between items-end mb-4">
                <span className="text-sm font-medium text-(--c4)/60 pb-1">Total CGPA</span>
                <span className={`text-4xl font-bold leading-none tracking-tight ${cgpaResult ? 'text-(--c3)' : 'text-(--c4)/20'}`}>
                  {cgpaResult || '--'}
                </span>
              </div>

              <button
                onClick={resetSgpa}
                className="w-full flex justify-center items-center gap-2 text-xs font-semibold uppercase tracking-wider text-(--c4)/40 hover:text-red-400 transition-colors py-3 rounded-lg hover:bg-red-500/5"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default GradeConverter;