import { ArrowLeft, Upload, FileText, Image as ImageIcon, X, Calendar, Trash2, Edit2, Check, BookOpen, GraduationCap, Layers } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getSemestersByProdi, getCoursesBySemester, getFacultyByProdi, normalizeProdiName } from '../data/allCoursesData';

interface UserNote {
  id: string;
  courseCode: string;
  courseTitle: string;
  type: 'PDF' | 'IMG';
  title: string;
  description: string;
  fileName: string;
  fileSize: string;
  uploadDate: string;
  createdAt: string;
  author: string;
  faculty: string;
  prodi: string;
  uploadedBy: string;
  fileType: string;
  semester: string;
  fileData?: string; // Base64 encoded file data for preview
}

interface UploadNotesProps {
  onBack: () => void;
  userName: string;
  userEmail?: string;
  userFaculty?: string;
  userProdi?: string;
}

export default function UploadNotes({ onBack, userName, userEmail, userFaculty, userProdi }: UploadNotesProps) {
  const [userNotes, setUserNotes] = useState<UserNote[]>([]);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState<'success' | 'error'>('success');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);

  // Form states
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [noteType, setNoteType] = useState<'PDF' | 'IMG'>('PDF');
  const [noteTitle, setNoteTitle] = useState('');
  const [noteDescription, setNoteDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string>('');

  // Debug log untuk cek userProdi
  console.log('UploadNotes - userProdi:', userProdi);
  console.log('UploadNotes - userFaculty:', userFaculty);
  console.log('UploadNotes - userEmail:', userEmail);

  // Get dynamic data based on user's prodi
  const availableSemesters = userProdi ? getSemestersByProdi(userProdi) : [];
  const availableCoursesData = userProdi && selectedSemester 
    ? getCoursesBySemester(userProdi, selectedSemester) 
    : [];
  const userFacultyAuto = userProdi ? getFacultyByProdi(userProdi) : userFaculty;

  // Debug log untuk cek hasil filter
  console.log('availableSemesters:', availableSemesters);
  console.log('selectedSemester:', selectedSemester);
  console.log('availableCoursesData:', availableCoursesData);

  // Transform courses data to match the expected format
  const availableCourses = availableCoursesData.map(course => ({
    code: course.kode,
    title: course.nama
  }));

  // Show warning if no prodi data
  useEffect(() => {
    if (!userProdi) {
      console.error('❌ USER PRODI TIDAK TERSEDIA!');
      console.log('User harus register ulang dengan prodi yang valid');
    } else if (availableSemesters.length === 0) {
      console.error('❌ SEMESTER DATA KOSONG untuk prodi:', userProdi);
      console.log('Cek apakah nama prodi di localStorage match dengan data di allCoursesData.ts');
    }
  }, [userProdi, availableSemesters]);

  // Load user notes from localStorage
  useEffect(() => {
    // Migrasi data lama ke key baru
    const oldData = localStorage.getItem('uninotes_user_uploads');
    const newData = localStorage.getItem('uninotes_all_posts');
    
    if (oldData && !newData) {
      // Pindahkan data lama ke key baru
      localStorage.setItem('uninotes_all_posts', oldData);
      localStorage.removeItem('uninotes_user_uploads');
    }
    
    // Load dari key baru
    const savedNotes = localStorage.getItem('uninotes_all_posts');
    if (savedNotes) {
      setUserNotes(JSON.parse(savedNotes));
    }
  }, []);

  // Filter notes untuk hanya menampilkan catatan user yang sedang login
  const myNotes = userNotes.filter(note => note.uploadedBy === userEmail);

  const showNotif = (message: string, type: 'success' | 'error' = 'success') => {
    setNotificationMessage(message);
    setNotificationType(type);
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
    }, 3000);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = noteType === 'PDF' 
        ? ['application/pdf']
        : ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      
      if (!validTypes.includes(file.type)) {
        showNotif(`Hanya file ${noteType} yang diperbolehkan`, 'error');
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        showNotif('Ukuran file maksimal 10MB', 'error');
        return;
      }

      setSelectedFile(file);

      // Create base64 data for ALL file types (PDF and IMG)
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!selectedSemester) {
      showNotif('Pilih semester terlebih dahulu', 'error');
      return;
    }
    if (!selectedCourse) {
      showNotif('Pilih mata kuliah terlebih dahulu', 'error');
      return;
    }
    if (!noteTitle.trim()) {
      showNotif('Judul catatan harus diisi', 'error');
      return;
    }
    if (!noteDescription.trim()) {
      showNotif('Deskripsi catatan harus diisi', 'error');
      return;
    }
    if (!selectedFile && !editingNoteId) {
      showNotif('Upload file terlebih dahulu', 'error');
      return;
    }

    const course = availableCourses.find(c => c.code === selectedCourse);
    if (!course) return;

    if (editingNoteId) {
      // Update existing note
      const updatedNotes = userNotes.map(note => {
        if (note.id === editingNoteId) {
          return {
            ...note,
            courseCode: selectedCourse,
            courseTitle: course.title,
            type: noteType,
            title: noteTitle,
            description: noteDescription,
            fileName: selectedFile ? selectedFile.name : note.fileName,
            fileSize: selectedFile ? formatFileSize(selectedFile.size) : note.fileSize,
            fileData: selectedFile ? filePreview : note.fileData
          };
        }
        return note;
      });

      setUserNotes(updatedNotes);
      localStorage.setItem('uninotes_all_posts', JSON.stringify(updatedNotes));
      showNotif('Catatan berhasil diperbarui! ✓', 'success');
      setEditingNoteId(null);
    } else {
      // Create new note
      const newNote: UserNote = {
        id: Date.now().toString(),
        courseCode: selectedCourse,
        courseTitle: course.title,
        type: noteType,
        title: noteTitle,
        description: noteDescription,
        fileName: selectedFile!.name,
        fileSize: formatFileSize(selectedFile!.size),
        uploadDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        author: userName,
        faculty: userFacultyAuto || '',
        prodi: userProdi || '',
        uploadedBy: userEmail || '',
        fileType: noteType,
        semester: selectedSemester,
        fileData: filePreview
      };

      const updatedNotes = [...userNotes, newNote];
      setUserNotes(updatedNotes);
      localStorage.setItem('uninotes_all_posts', JSON.stringify(updatedNotes));
      showNotif('Catatan berhasil diupload! 🎉', 'success');
    }

    // Reset form
    resetForm();
    setShowUploadForm(false);
  };

  const resetForm = () => {
    setSelectedSemester('');
    setSelectedCourse('');
    setNoteType('PDF');
    setNoteTitle('');
    setNoteDescription('');
    setSelectedFile(null);
    setFilePreview('');
  };

  const handleDelete = (noteId: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus catatan ini?')) {
      const updatedNotes = userNotes.filter(note => note.id !== noteId);
      setUserNotes(updatedNotes);
      localStorage.setItem('uninotes_all_posts', JSON.stringify(updatedNotes));
      showNotif('Catatan berhasil dihapus', 'success');
    }
  };

  const handleEdit = (note: UserNote) => {
    setEditingNoteId(note.id);
    setSelectedSemester(note.semester);
    setSelectedCourse(note.courseCode);
    setNoteType(note.type);
    setNoteTitle(note.title);
    setNoteDescription(note.description);
    setShowUploadForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingNoteId(null);
    resetForm();
    setShowUploadForm(false);
  };

  return (
    <div className="min-h-screen bg-white font-mono">
      {/* Header */}
      <div className="bg-white border-b-2 border-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Button */}
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-black hover:text-[#4285F4] mb-6 transition-colors font-bold uppercase"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Kembali ke Beranda</span>
          </button>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-4xl font-black text-black mb-2 uppercase tracking-tight">Catatan Saya</h1>
              <p className="text-black font-bold">Kelola dan bagikan catatan kuliah Anda</p>
            </div>
            <button
              onClick={() => {
                setShowUploadForm(true);
                setEditingNoteId(null);
                resetForm();
              }}
              className="bg-[#34A853] border-2 border-black text-white px-6 py-3 font-black uppercase tracking-wider hover:bg-[#2D8E47] transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none flex items-center gap-2 justify-center lg:justify-start"
            >
              <Upload className="w-5 h-5" />
              Upload Catatan Baru
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Upload Form */}
        {showUploadForm && (
          <div className="bg-white border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 mb-12">
            <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-black border-dashed">
              <h2 className="text-2xl font-black text-black uppercase">
                {editingNoteId ? 'Edit Catatan' : 'Upload Catatan Baru'}
              </h2>
              <button
                onClick={cancelEdit}
                className="text-black hover:text-[#EA4335] transition-colors bg-white border-2 border-transparent hover:border-black p-1"
              >
                <X className="w-8 h-8" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Info User - Fakultas & Prodi (Read-only) */}
              <div className="bg-[#4285F4]/10 border-2 border-[#4285F4] p-4 border-dashed">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-black mb-1 uppercase">
                      Fakultas
                    </label>
                    <div className="bg-white border-2 border-black px-4 py-2 font-bold text-black">
                      {userFacultyAuto || 'Tidak diketahui'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-black mb-1 uppercase">
                      Program Studi
                    </label>
                    <div className="bg-white border-2 border-black px-4 py-2 font-bold text-black">
                      {userProdi || 'Tidak diketahui'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Semester Selection */}
              <div>
                <label className="block text-sm font-black text-black mb-2 uppercase">
                  Semester <span className="text-[#EA4335]">*</span>
                </label>
                <div className="relative">
                  <select
                    value={selectedSemester}
                    onChange={(e) => {
                      setSelectedSemester(e.target.value);
                      setSelectedCourse(''); // Reset mata kuliah saat semester berubah
                    }}
                    className="w-full px-4 py-3 border-2 border-black rounded-none focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-bold bg-white appearance-none cursor-pointer"
                    required
                  >
                    <option value="">PILIH SEMESTER</option>
                    {availableSemesters.map((semester) => (
                      <option key={semester} value={semester}>
                        Semester {semester}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-black border-l-2 border-black bg-[#FBBC05]">
                    <svg className="fill-black h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Course Selection */}
              <div>
                <label className="block text-sm font-black text-black mb-2 uppercase">
                  Mata Kuliah <span className="text-[#EA4335]">*</span>
                </label>
                {!selectedSemester && (
                  <p className="text-sm text-gray-600 font-bold mb-2 bg-yellow-50 border-2 border-[#FBBC05] p-2">
                    ⚠️ Pilih semester terlebih dahulu
                  </p>
                )}
                <div className="relative">
                  <select
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-black rounded-none focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-bold bg-white appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    required
                    disabled={!selectedSemester}
                  >
                    <option value="">PILIH MATA KULIAH</option>
                    {availableCourses.map((course) => (
                      <option key={course.code} value={course.code}>
                        {course.code} - {course.title}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-black border-l-2 border-black bg-[#FBBC05]">
                    <svg className="fill-black h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                    </svg>
                  </div>
                </div>
                {selectedSemester && availableCourses.length === 0 && (
                  <p className="text-sm text-gray-600 font-bold mt-2 bg-red-50 border-2 border-[#EA4335] p-2">
                    ❌ Tidak ada mata kuliah untuk semester {selectedSemester}
                  </p>
                )}
              </div>

              {/* Note Type */}
              <div>
                <label className="block text-sm font-black text-black mb-2 uppercase">
                  Tipe Catatan <span className="text-[#EA4335]">*</span>
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <div className={`w-6 h-6 border-2 border-black flex items-center justify-center ${noteType === 'PDF' ? 'bg-[#34A853]' : 'bg-white'}`}>
                       <input
                        type="radio"
                        name="noteType"
                        value="PDF"
                        checked={noteType === 'PDF'}
                        onChange={(e) => setNoteType(e.target.value as 'PDF' | 'IMG')}
                        className="hidden"
                      />
                      {noteType === 'PDF' && <Check className="w-4 h-4 text-white" />}
                    </div>
                    <div className="bg-white border-2 border-black p-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] group-hover:shadow-none group-hover:translate-x-[1px] group-hover:translate-y-[1px] transition-all flex items-center gap-2">
                       <FileText className="w-5 h-5 text-black" />
                       <span className="text-sm font-bold text-black uppercase">PDF Document</span>
                    </div>
                  </label>
                  
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <div className={`w-6 h-6 border-2 border-black flex items-center justify-center ${noteType === 'IMG' ? 'bg-[#34A853]' : 'bg-white'}`}>
                       <input
                        type="radio"
                        name="noteType"
                        value="IMG"
                        checked={noteType === 'IMG'}
                        onChange={(e) => setNoteType(e.target.value as 'PDF' | 'IMG')}
                        className="hidden"
                      />
                      {noteType === 'IMG' && <Check className="w-4 h-4 text-white" />}
                    </div>
                    <div className="bg-white border-2 border-black p-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] group-hover:shadow-none group-hover:translate-x-[1px] group-hover:translate-y-[1px] transition-all flex items-center gap-2">
                       <ImageIcon className="w-5 h-5 text-black" />
                       <span className="text-sm font-bold text-black uppercase">Gambar/Scan</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-black text-black mb-2 uppercase">
                  Upload File {!editingNoteId && <span className="text-[#EA4335]">*</span>}
                </label>
                <div className="border-2 border-dashed border-black bg-gray-50 p-8 text-center hover:bg-[#FFF8E1] transition-colors relative">
                  <input
                    type="file"
                    id="fileInput"
                    accept={noteType === 'PDF' ? '.pdf' : 'image/*'}
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <label
                    htmlFor="fileInput"
                    className="cursor-pointer flex flex-col items-center gap-4 w-full h-full"
                  >
                    {selectedFile ? (
                      <>
                        <div className="bg-white border-2 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                          {noteType === 'PDF' ? (
                            <FileText className="w-12 h-12 text-[#EA4335]" />
                          ) : (
                            <ImageIcon className="w-12 h-12 text-[#4285F4]" />
                          )}
                        </div>
                        <div>
                          <p className="font-black text-lg text-black">{selectedFile.name}</p>
                          <p className="text-sm font-bold text-gray-500 bg-white inline-block px-2 border border-black mt-1">{formatFileSize(selectedFile.size)}</p>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            setSelectedFile(null);
                            setFilePreview('');
                          }}
                          className="text-sm font-bold text-white bg-[#EA4335] px-4 py-2 border-2 border-black hover:bg-red-600 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
                        >
                          HAPUS FILE
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="bg-white border-2 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:rotate-3 transition-transform">
                           <Upload className="w-12 h-12 text-black" />
                        </div>
                        <div>
                          <p className="font-black text-lg text-black uppercase">
                            Klik untuk upload file {noteType}
                          </p>
                          <p className="text-sm font-bold text-gray-500">MAKSIMAL 10MB</p>
                        </div>
                      </>
                    )}
                  </label>
                </div>

                {/* Image Preview */}
                {filePreview && noteType === 'IMG' && (
                  <div className="mt-4 border-2 border-black p-2 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <p className="text-sm font-black text-black mb-2 uppercase bg-[#FBBC05] inline-block px-2">Preview:</p>
                    <img
                      src={filePreview}
                      alt="Preview"
                      className="max-w-full h-auto max-h-64 border-2 border-black"
                    />
                  </div>
                )}
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-black text-black mb-2 uppercase">
                  Judul Catatan <span className="text-[#EA4335]">*</span>
                </label>
                <input
                  type="text"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  placeholder="Contoh: Rangkuman Bab 1-5"
                  className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all font-bold placeholder:text-gray-400 placeholder:font-normal"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-black text-black mb-2 uppercase">
                  Deskripsi <span className="text-[#EA4335]">*</span>
                </label>
                <textarea
                  value={noteDescription}
                  onChange={(e) => setNoteDescription(e.target.value)}
                  placeholder="Jelaskan isi catatan, topik yang dibahas, dll."
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all font-bold placeholder:text-gray-400 placeholder:font-normal resize-none"
                  required
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4 pt-4 border-t-2 border-black border-dashed">
                <button
                  type="submit"
                  className="flex-1 bg-[#34A853] text-white px-6 py-4 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all font-black uppercase tracking-wide flex items-center justify-center gap-2"
                >
                  {editingNoteId ? (
                    <>
                      <Check className="w-5 h-5" />
                      Perbarui Catatan
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5" />
                      Upload Catatan
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="px-6 py-4 border-2 border-black bg-white text-black hover:bg-gray-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all font-black uppercase tracking-wide"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Notes List */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black text-black uppercase border-l-8 border-[#4285F4] pl-3">
              Catatan yang Diupload ({myNotes.length})
            </h2>
          </div>

          {myNotes.length === 0 ? (
            <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-12 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 border-2 border-black mb-4">
                <FileText className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-2xl font-black text-black mb-2 uppercase">Belum Ada Catatan</h3>
              <p className="text-black font-bold mb-8 max-w-md mx-auto">
                Mulai berbagi pengetahuan dengan mengupload catatan pertama Anda
              </p>
              <button
                onClick={() => setShowUploadForm(true)}
                className="bg-[#34A853] text-white px-6 py-3 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all inline-flex items-center gap-2 font-black uppercase"
              >
                <Upload className="w-5 h-5" />
                Upload Catatan Pertama
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {myNotes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onDelete={handleDelete}
                  onEdit={handleEdit}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Notification */}
      {showNotification && (
        <div className={`fixed bottom-4 right-4 ${notificationType === 'success' ? 'bg-[#34A853]' : 'bg-[#EA4335]'} text-white px-6 py-4 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-3 z-50`}>
          <div className="bg-black p-1">
             <div className="w-4 h-4 bg-white" />
          </div>
          <p className="text-sm font-black uppercase tracking-wide">{notificationMessage}</p>
        </div>
      )}
    </div>
  );
}

interface NoteCardProps {
  note: UserNote;
  onDelete: (id: string) => void;
  onEdit: (note: UserNote) => void;
}

function NoteCard({ note, onDelete, onEdit }: NoteCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all hover:-translate-y-1 group flex flex-col h-full">
      {/* Header with Course Code */}
      <div className="bg-[#4285F4] border-b-2 border-black px-4 py-3 flex justify-between items-center">
        <span className="text-white font-black text-sm uppercase">{note.courseCode}</span>
        <div className="flex gap-1">
            <div className="w-2 h-2 bg-white border border-black"></div>
            <div className="w-2 h-2 bg-white border border-black"></div>
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1">
        {/* Course Title */}
        <p className="text-xs font-bold text-gray-500 mb-2 uppercase">{note.courseTitle}</p>

        {/* Note Type Badge */}
        <div className="mb-3">
          <span className={`inline-flex items-center gap-2 px-2 py-1 border-2 border-black text-xs font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
            note.type === 'PDF' 
              ? 'bg-[#EA4335] text-white' 
              : 'bg-[#FBBC05] text-black'
          }`}>
            {note.type === 'PDF' ? <FileText className="w-3 h-3" /> : <ImageIcon className="w-3 h-3" />}
            {note.type}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-black text-xl text-black mb-2 line-clamp-2 uppercase">{note.title}</h3>

        {/* Description */}
        <p className="text-sm font-bold text-gray-600 mb-4 line-clamp-3 border-l-2 border-gray-300 pl-2">{note.description}</p>

        {/* File Info */}
        <div className="bg-gray-50 border-2 border-black p-3 mb-4 mt-auto">
          <p className="text-xs font-bold text-black mb-1 truncate">📎 {note.fileName}</p>
          <p className="text-xs font-mono text-gray-500">{note.fileSize}</p>
        </div>

        {/* Meta Info */}
        <div className="flex items-center gap-2 text-xs font-bold text-gray-500 mb-4 pb-4 border-b-2 border-gray-100 border-dashed">
          <Calendar className="w-3 h-3 text-black" />
          <span>DIUPLOAD {formatDate(note.uploadDate)}</span>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={() => onEdit(note)}
            className="flex-1 bg-white text-black border-2 border-black px-3 py-2 hover:bg-[#FBBC05] transition-all flex items-center justify-center gap-2 text-xs font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
          >
            <Edit2 className="w-3 h-3" />
            Edit
          </button>
          <button
            onClick={() => onDelete(note.id)}
            className="flex-1 bg-white text-black border-2 border-black px-3 py-2 hover:bg-[#EA4335] hover:text-white transition-all flex items-center justify-center gap-2 text-xs font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
          >
            <Trash2 className="w-3 h-3" />
            Hapus
          </button>
        </div>
      </div>
    </div>
  );
}