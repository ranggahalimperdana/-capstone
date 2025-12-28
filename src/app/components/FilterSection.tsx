import { Filter, X } from 'lucide-react';

interface FilterSectionProps {
  selectedFaculty: string;
  selectedProdi: string;
  selectedSemester: string;
  onFacultyChange: (faculty: string) => void;
  onProdiChange: (prodi: string) => void;
  onSemesterChange: (semester: string) => void;
  onClearFilters: () => void;
  facultiesData: FacultyData[];
}

export interface FacultyData {
  name: string;
  prodi: string[];
}

export default function FilterSection({
  selectedFaculty,
  selectedProdi,
  selectedSemester,
  onFacultyChange,
  onProdiChange,
  onSemesterChange,
  onClearFilters,
  facultiesData
}: FilterSectionProps) {
  const hasActiveFilters = selectedFaculty || selectedProdi || selectedSemester;
  
  // Get available prodi based on selected faculty
  const availableProdi = selectedFaculty
    ? facultiesData.find(f => f.name === selectedFaculty)?.prodi || []
    : [];

  const semesters = [1, 2, 3, 4, 5, 6, 7, 8];

  return (
    <div className="bg-white border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-12 font-mono relative z-10 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b-2 border-black bg-[#FBBC05]">
        <div className="flex items-center gap-3">
          <div className="bg-black p-1.5 rounded-lg shadow-sm">
            <Filter className="w-5 h-5 text-white" />
          </div>
          <h3 className="font-black text-black text-xl uppercase tracking-tight">Filter Mata Kuliah</h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="group flex items-center gap-2 text-sm font-bold text-black bg-white hover:text-white hover:bg-[#EA4335] px-4 py-2 border-2 border-black transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none rounded-lg"
          >
            <X className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200" />
            BERSIHKAN
          </button>
        )}
      </div>

      <div className="p-8">
        {/* Filter Dropdowns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Faculty Filter */}
          <div className="group">
            <label className="block text-sm font-black text-black mb-3 uppercase group-hover:text-[#4285F4] transition-colors">
              Fakultas
            </label>
            <div className="relative">
              <select
                value={selectedFaculty}
                onChange={(e) => onFacultyChange(e.target.value)}
                className="w-full px-4 py-4 border-2 border-black bg-white font-bold focus:outline-none focus:bg-[#4285F4]/5 focus:border-[#4285F4] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] appearance-none cursor-pointer rounded-xl transition-all hover:-translate-y-0.5"
              >
                <option value="">SEMUA FAKULTAS</option>
                {facultiesData.map((faculty) => (
                  <option key={faculty.name} value={faculty.name}>
                    {faculty.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-white border-l-2 border-black bg-[#4285F4] rounded-r-[10px]">
                <svg className="fill-current h-4 w-4 transform group-hover:rotate-180 transition-transform duration-300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Prodi Filter */}
          <div className="group">
            <label className={`block text-sm font-black text-black mb-3 uppercase transition-colors ${selectedFaculty ? 'group-hover:text-[#EA4335]' : 'opacity-50'}`}>
              Program Studi
            </label>
            <div className="relative">
              <select
                value={selectedProdi}
                onChange={(e) => onProdiChange(e.target.value)}
                disabled={!selectedFaculty}
                className="w-full px-4 py-4 border-2 border-black bg-white font-bold focus:outline-none focus:bg-[#EA4335]/5 focus:border-[#EA4335] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] appearance-none disabled:bg-gray-100 disabled:text-gray-400 disabled:shadow-none disabled:border-gray-300 cursor-pointer rounded-xl transition-all hover:-translate-y-0.5"
              >
                <option value="">
                  {selectedFaculty ? 'SEMUA PROGRAM STUDI' : 'PILIH FAKULTAS DULU'}
                </option>
                {availableProdi.map((prodi) => (
                  <option key={prodi} value={prodi}>
                    {prodi}
                  </option>
                ))}
              </select>
              <div className={`pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 border-l-2 border-black rounded-r-[10px] text-white transition-colors ${!selectedFaculty ? 'bg-gray-300 border-gray-300' : 'bg-[#EA4335]'}`}>
                <svg className="fill-current h-4 w-4 transform group-hover:rotate-180 transition-transform duration-300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Semester Filter */}
          <div className="group">
            <label className="block text-sm font-black text-black mb-3 uppercase group-hover:text-[#34A853] transition-colors">
              Semester
            </label>
            <div className="relative">
              <select
                value={selectedSemester}
                onChange={(e) => onSemesterChange(e.target.value)}
                className="w-full px-4 py-4 border-2 border-black bg-white font-bold focus:outline-none focus:bg-[#34A853]/5 focus:border-[#34A853] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] appearance-none cursor-pointer rounded-xl transition-all hover:-translate-y-0.5"
              >
                <option value="">SEMUA SEMESTER</option>
                {semesters.map((sem) => (
                  <option key={sem} value={sem.toString()}>
                    SEMESTER {sem}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-white border-l-2 border-black bg-[#34A853] rounded-r-[10px]">
                <svg className="fill-current h-4 w-4 transform group-hover:rotate-180 transition-transform duration-300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="mt-8 pt-8 border-t-2 border-black border-dashed animate-in slide-in-from-top-2 duration-300">
            <p className="text-sm font-black text-black mb-4 uppercase tracking-wider">Filter Aktif:</p>
            <div className="flex flex-wrap gap-3">
              {selectedFaculty && (
                <span className="inline-flex items-center gap-2 bg-[#4285F4] border-2 border-black text-white px-4 py-2 text-xs font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-lg animate-in zoom-in-95 duration-200">
                  FAKULTAS: {selectedFaculty}
                  <button
                    onClick={() => onFacultyChange('')}
                    className="bg-black hover:bg-white hover:text-[#4285F4] text-white p-0.5 rounded-sm transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {selectedProdi && (
                <span className="inline-flex items-center gap-2 bg-[#EA4335] border-2 border-black text-white px-4 py-2 text-xs font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-lg animate-in zoom-in-95 duration-200 delay-75">
                  PRODI: {selectedProdi}
                  <button
                    onClick={() => onProdiChange('')}
                    className="bg-black hover:bg-white hover:text-[#EA4335] text-white p-0.5 rounded-sm transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {selectedSemester && (
                <span className="inline-flex items-center gap-2 bg-[#34A853] border-2 border-black text-white px-4 py-2 text-xs font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-lg animate-in zoom-in-95 duration-200 delay-150">
                  SEMESTER: {selectedSemester}
                  <button
                    onClick={() => onSemesterChange('')}
                    className="bg-black hover:bg-white hover:text-[#34A853] text-white p-0.5 rounded-sm transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
