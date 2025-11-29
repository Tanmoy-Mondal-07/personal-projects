import React, { useState, useEffect } from 'react';
import { Percent, GraduationCap, Settings, RotateCcw, ChevronDown, ChevronUp, Plus, Minus } from 'lucide-react';

const GradeConverter = () => {
  const [activeTab, setActiveTab] = useState('percentage'); // 'percentage' | 'accumulator'

  // --- STATE FOR PERCENTAGE CONVERTER ---
  const [gradeInput, setGradeInput] = useState('');
  const [scale, setScale] = useState(10);
  const [formulaPreset, setFormulaPreset] = useState('vtu'); // 'vtu', 'cbse', 'simple', 'custom'
  const [multiplier, setMultiplier] = useState(10);
  const [deduction, setDeduction] = useState(0.75); // (Score * 10) - 7.5
  const [showSettings, setShowSettings] = useState(false);
  const [percentResult, setPercentResult] = useState(null);

  // --- STATE FOR SGPA -> CGPA (Dynamic Fields) ---
  const [numSemesters, setNumSemesters] = useState(2); // Default to 2 sems
  const [sgpaValues, setSgpaValues] = useState({ 1: '', 2: '' });
  const [cgpaResult, setCgpaResult] = useState(null);

  // --- HELPER: Prevent Scroll Change on Inputs ---
  const handleWheel = (e) => e.target.blur();

  // --- EFFECTS: Percentage Calculation ---
  useEffect(() => {
    switch (formulaPreset) {
      case 'vtu': // (CGPA - 0.75) * 10 => (CGPA * 10) - 7.5
        setMultiplier(10);
        setDeduction(7.5);
        break;
      case 'simple': // x10
        setMultiplier(10);
        setDeduction(0);
        break;
      case 'cbse': // x9.5
        setMultiplier(9.5);
        setDeduction(0);
        break;
      case 'custom':
        break;
      default:
        break;
    }
  }, [formulaPreset]);

  useEffect(() => {
    const grade = parseFloat(gradeInput);
    // FIX: Using "scale >= grade" instead of "grade <= scale" to prevent JSX parser
    // from misinterpreting the "<" symbol as a Fragment tag start.
    if (!isNaN(grade) && scale >= grade && grade >= 0) {
      let res = (grade * multiplier) - deduction;
      if (res < 0) res = 0
      if (res > 100) res = 100;
      setPercentResult(res.toFixed(2));
    } else {
      setPercentResult(null);
    }
  }, [gradeInput, multiplier, deduction, scale]);

  // --- LOGIC: SGPA -> CGPA Calculation ---

  // Update the number of input fields when user changes total semesters
  const handleSemesterCountChange = (e) => {
    const count = parseInt(e.target.value);
    if (isNaN(count) || count < 1) {
      setNumSemesters('')
      return
    }
    if (count > 20) return; // Cap at 20 to prevent crashes

    setNumSemesters(count);

    // Preserve existing values, add new keys if needed
    setSgpaValues(prev => {
      const newValues = {};
      for (let i = 1; i <= count; i++) {
        newValues[i] = prev[i] || '';
      }
      return newValues;
    });
  };

  const handleSgpaChange = (semIndex, value) => {
    setSgpaValues(prev => ({
      ...prev,
      [semIndex]: value
    }));
  };

  useEffect(() => {
    // Calculate Average of all non-empty inputs
    const values = Object.values(sgpaValues).map(val => parseFloat(val)).filter(val => !isNaN(val));

    if (values.length > 0) {
      const sum = values.reduce((acc, curr) => acc + curr, 0);
      // We divide by the number of filled inputs (or should we divide by total sems? Usually filled inputs for "Current CGPA")
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
    <>
      {/* Tabs */}
      <div className="flex min-w-xl border-b border-(--c2)">
        <button
          onClick={() => setActiveTab('percentage')}
          className={`flex-1 py-4 text-sm font-medium flex justify-center items-center gap-2 transition-colors
            ${activeTab === 'percentage'
              ? 'text-(--c3) border-b-2 border-(--c3) bg-(--c1) '
              : 'text-(--c4) hover:text-(--c3)'
            }`}
        >
          <Percent className="w-4 h-4" />
          To Percentage
        </button>
        <button
          onClick={() => setActiveTab('accumulator')}
          className={`flex-1 py-4 text-sm font-medium flex justify-center items-center gap-2 transition-colors
            ${activeTab === 'accumulator'
              ? 'text-(--c3) border-b-2 border-(--c3) bg-(--c1) '
              : 'text-(--c4) hover:text-(--c3)'
            }`}
        >
          <GraduationCap className="w-4 h-4" />
          SGPA to CGPA
        </button>
      </div>

      {/* Content Area */}
      <div className="p-6 min-h-[400px]">

        {/* TAB 1: PERCENTAGE CONVERTER */}
        {activeTab === 'percentage' && (
          <div className="space-y-6 animate-in fade-in duration-300">

            {/* Main Input */}
            <div>
              <label className="block text-sm font-medium text-(--c3)">
                Enter Score (SGPA / CGPA)
              </label>
              <div className="relative">
                <input
                  type="number"
                  onWheel={handleWheel}
                  placeholder={`e.g. 8.5 (Max ${scale})`}
                  value={gradeInput}
                  onChange={(e) => setGradeInput(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-(--c4) bg-(--c2) text-slate-(--c4) focus:ring-2 focus:ring-(--c3) focus:outline-none transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  step="0.01"
                  max={scale}
                />
              </div>
            </div>

            {/* Result Box */}
            <div className={`p-6 rounded-xl text-center transition-all duration-500 transform
              ${percentResult
                ? 'bg-gradient-to-br from-(--c1) to-(--c3) scale-100 opacity-100'
                : 'bg-(--c1) scale-95 opacity-50'
              }`}
            >
              <p className={`text-sm font-medium uppercase tracking-wider mb-1 
                ${percentResult ? 'text-(--c4)' : 'text-(--c3)'}`}>
                Equivalent Percentage
              </p>
              <div className={`text-4xl font-bold ${percentResult ? 'text-(--c4)' : 'text-(--c3)'}`}>
                {percentResult ? `${percentResult}%` : '--'}
              </div>
            </div>

            {/* Settings */}
            <div className="pt-4 border-t border-slate-(--c3)">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="flex items-center gap-2 text-sm text-(--c4) opacity-40 hover:text-(--c3) hover:opacity-100 transition-all mx-auto"
              >
                <Settings className="w-4 h-4" />
                {showSettings ? 'Hide Settings' : 'Conversion Settings'}
                {showSettings ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>

              {showSettings && (
                <div className="mt-4 p-4 bg-(--c1) rounded-lg space-y-4 border border-(--c3)">
                  {/* Preset Selector */}
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'vtu', label: 'VTU/Engg' },
                      { id: 'simple', label: 'Simple x10' },
                      { id: 'cbse', label: 'CBSE x9.5' },
                      { id: 'custom', label: 'Custom' },
                    ].map((p) => (
                      <button
                        key={p.id}
                        onClick={() => setFormulaPreset(p.id)}
                        className={`text-xs py-2 px-3 rounded border transition-all
                            ${formulaPreset === p.id
                            ? 'bg-(--c2) text-(--c3) border-(--c3)'
                            : 'bg-(--c1) text-(--c4) opacity-50 border-(--c4) hover:bg-(--c2)'}`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase text-(--c4) opacity-50 mb-1">Scale</label>
                      <input type="number" onWheel={handleWheel} value={scale} onChange={(e) => setScale(Number(e.target.value))} className="w-full text-sm px-2 py-1.5 rounded border border-(--c4) bg-(--c1) text-(--c4) [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase text-(--c4) opacity-50 mb-1">Multiplier</label>
                      <input type="number" onWheel={handleWheel} value={multiplier} onChange={(e) => { setMultiplier(Number(e.target.value)); setFormulaPreset('custom'); }} className="w-full text-sm px-2 py-1.5 rounded border border-(--c4) bg-(--c1) text-(--c4) [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[10px] uppercase text-(--c4) opacity-50 mb-1">Deduction</label>
                      <input type="number" onWheel={handleWheel} value={deduction} onChange={(e) => { setDeduction(Number(e.target.value)); setFormulaPreset('custom'); }} className="w-full text-sm px-2 py-1.5 rounded border border-(--c4) bg-(--c1) text-(--c4) [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                      <p className="text-[10px] text-(--c4) opacity-25 mt-1">Formula: (Score * {multiplier}) - {deduction}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: SGPA TO CGPA (DYNAMIC FIELDS) */}
        {activeTab === 'accumulator' && (
          <div className="space-y-4 animate-in fade-in duration-300 flex flex-col h-full">

            {/* Semester Count Controller */}
            <div className="bg-(--c1) p-4 rounded-lg border border-(--c1)">
              <label className="block text-xs font-bold uppercase text-(--c3) opacity-60 mb-2">
                Number of Semesters
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleSemesterCountChange({ target: { value: numSemesters - 1 } })}
                  disabled={numSemesters <= 1}
                  className="p-2 rounded-md bg-(--c2) shadow-sm border border-(--c2) hover:border-(--c3) hover:scale-105 disabled:opacity-50 transition-all"
                >
                  <Minus className="w-4 h-4 text-(--c4)" />
                </button>

                <input
                  type="number"
                  onWheel={handleWheel}
                  value={numSemesters}
                  onChange={handleSemesterCountChange}
                  className="w-16 text-center font-bold text-lg bg-transparent border-none focus:ring-0 text-(--c4) [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />

                <button
                  onClick={() => handleSemesterCountChange({ target: { value: numSemesters + 1 } })}
                  disabled={numSemesters >= 20}
                  className="p-2 rounded-md bg-(--c2) shadow-sm border border-(--c2) hover:border-(--c3) hover:scale-105  disabled:opacity-50 transition-colors"
                >
                  <Plus className="w-4 h-4 text-(--c4)" />
                </button>
              </div>
            </div>

            {/* Dynamic Inputs Grid */}
            <div className="grid grid-cols-2 gap-3 max-h-[300px] pr-2 custom-scrollbar">
              {Array.from({ length: numSemesters }).map((_, index) => {
                const semNum = index + 1;
                return (
                  <div key={semNum} className="animate-in zoom-in-95 duration-200">
                    <label className="block text-[10px] uppercase font-bold text-(--c3) opacity-60 mb-1 ml-1">
                      Sem {semNum}
                    </label>
                    <input
                      type="number"
                      onWheel={handleWheel}
                      placeholder={`SGPA ${semNum}`}
                      value={sgpaValues[semNum] || ''}
                      onChange={(e) => handleSgpaChange(semNum, e.target.value)}
                      className="w-full
  px-3
  py-2
  rounded-md
  bg-(--c1)
  text-(--c4)
  text-sm
  focus:outline-none
  focus:ring-2
  focus:ring-(--c3)
  [appearance:textfield]
  [&::-webkit-outer-spin-button]:appearance-none
  [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                );
              })}
            </div>

            {/* Fixed Footer Result */}
            <div className="mt-auto pt-4 border-t border-slate-800">
              <div className="flex justify-between items-end mb-3">
                <span className="text-sm font-medium text-slate-400">Total CGPA:</span>
                <span className={`text-3xl font-bold leading-none ${cgpaResult ? 'text-(--c3)' : 'text-(--c4) opacity-25'}`}>
                  {cgpaResult || '--'}
                </span>
              </div>

              <button
                onClick={resetSgpa}
                className="w-full flex justify-center items-center gap-2 text-xs font-medium text-slate-400 hover:text-red-400 transition-colors py-2"
              >
                <RotateCcw className="w-3 h-3" /> Reset All Fields
              </button>
            </div>

          </div>
        )}

      </div>
    </>
  );
};

export default GradeConverter;