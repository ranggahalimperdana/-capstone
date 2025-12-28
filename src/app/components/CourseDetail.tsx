import { ArrowLeft, FileText, Calendar, User, ThumbsUp, Download, Search } from 'lucide-react';
import { useState, useEffect } from 'react';

interface Note {
  id: number;
  type: 'PDF' | 'IMG';
  title: string;
  description: string;
  date: string;
  author: string;
  likes: number;
  uploadedBy?: string; // Real user who uploaded
}

interface Course {
  code: string;
  title: string;
  description: string;
  notes: number;
  faculty?: string;
}

interface CourseDetailProps {
  course: Course;
  onBack: () => void;
}

export default function CourseDetail({ course, onBack }: CourseDetailProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [likedNotes, setLikedNotes] = useState<Set<number>>(new Set());
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState<'success' | 'info'>('success');

  // Load notes from localStorage and merge with sample data
  useEffect(() => {
    // Generate sample notes based on course code
    const generateSampleNotes = (courseCode: string): Note[] => {
      // Common sample authors
      const authors = ['Budi Santoso', 'Siti Aminah', 'Ahmad Fauzi', 'Dewi Lestari', 'Rian Pratama'];
      
      // Generate 2-3 sample notes per course
      const sampleTemplates = [
        {
          type: 'PDF' as const,
          titleTemplate: 'Rangkuman Lengkap {course}',
          description: 'Materi lengkap dari pertemuan 1 hingga UTS dengan penjelasan detail.',
          likes: 15
        },
        {
          type: 'IMG' as const,
          titleTemplate: 'Catatan Kuliah {course}',
          description: 'Scan catatan tangan yang ditulis langsung dari kuliah.',
          likes: 8
        },
        {
          type: 'PDF' as const,
          titleTemplate: 'Soal dan Pembahasan UAS',
          description: 'Kumpulan soal UAS tahun lalu dengan pembahasan lengkap.',
          likes: 22
        }
      ];

      return sampleTemplates.slice(0, 2).map((template, index) => ({
        id: index + 1,
        type: template.type,
        title: template.titleTemplate.replace('{course}', courseCode),
        description: template.description,
        date: `2023-${10 + index}-${15 + index * 5}`,
        author: authors[index % authors.length],
        likes: template.likes,
        uploadedBy: authors[index % authors.length]
      }));
    };

    const sampleNotes = generateSampleNotes(course.code);

    // Load user uploaded notes
    const userUploadsStr = localStorage.getItem('uninotes_user_uploads');
    if (userUploadsStr) {
      const userUploads = JSON.parse(userUploadsStr);
      
      // Filter notes for this course
      const courseNotes = userUploads
        .filter((upload: any) => upload.courseCode === course.code)
        .map((upload: any, index: number) => ({
          id: 1000 + index, // Use high IDs to avoid conflicts
          type: upload.fileType === 'application/pdf' ? 'PDF' : 'IMG',
          title: upload.title,
          description: upload.description,
          date: upload.uploadDate,
          author: upload.uploaderName,
          likes: 0,
          uploadedBy: upload.uploaderName
        }));

      // Combine sample notes with user notes
      setNotes([...courseNotes, ...sampleNotes]);
    } else {
      setNotes(sampleNotes);
    }

    // Load liked notes from localStorage
    const savedLikes = localStorage.getItem('uninotes_liked_notes');
    if (savedLikes) {
      setLikedNotes(new Set(JSON.parse(savedLikes)));
    }
  }, [course.code]);

  const showNotif = (message: string, type: 'success' | 'info' = 'success') => {
    setNotificationMessage(message);
    setNotificationType(type);
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
    }, 3000);
  };

  const handleLike = (noteId: number) => {
    const newLikedNotes = new Set(likedNotes);
    const isLiked = likedNotes.has(noteId);

    if (isLiked) {
      // Unlike
      newLikedNotes.delete(noteId);
      setNotes(notes.map(note => 
        note.id === noteId ? { ...note, likes: note.likes - 1 } : note
      ));
      showNotif('Like dibatalkan', 'info');
    } else {
      // Like
      newLikedNotes.add(noteId);
      setNotes(notes.map(note => 
        note.id === noteId ? { ...note, likes: note.likes + 1 } : note
      ));
      showNotif('Catatan disukai!', 'success');
    }

    setLikedNotes(newLikedNotes);
    localStorage.setItem('uninotes_liked_notes', JSON.stringify(Array.from(newLikedNotes)));
  };

  const handleDownload = (note: Note) => {
    // Simulate download
    showNotif(`Mengunduh "${note.title}"...`, 'success');
    
    // In a real app, this would trigger actual file download
    setTimeout(() => {
      showNotif(`"${note.title}" berhasil diunduh!`, 'success');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-white font-mono bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px]">
      {/* Header Section */}
      <div className="bg-white border-b-2 border-black relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#FBBC05] rounded-full filter blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
          {/* Back Button */}
          <button 
            onClick={onBack}
            className="group flex items-center gap-3 text-black mb-8 font-black uppercase tracking-wider hover:-translate-x-1 transition-transform duration-200 w-fit"
          >
            <div className="bg-white border-2 border-black p-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] group-hover:shadow-none group-hover:translate-x-[1px] group-hover:translate-y-[1px] transition-all rounded-lg">
               <ArrowLeft className="w-4 h-4" />
            </div>
            <span>Kembali ke Daftar</span>
          </button>

          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-12">
            {/* Course Info */}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-6 animate-in slide-in-from-left-5 duration-500">
                <span className="bg-[#34A853] border-2 border-black text-white text-sm font-black px-4 py-1.5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-lg">
                  {course.code}
                </span>
                {course.faculty && (
                  <span className="bg-[#4285F4] border-2 border-black text-white text-sm font-black px-4 py-1.5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] uppercase rounded-lg">
                    {course.faculty}
                  </span>
                )}
              </div>

              <h1 className="text-4xl sm:text-6xl font-black text-black mb-6 uppercase leading-none tracking-tighter animate-in slide-in-from-bottom-5 duration-500 delay-100">
                {course.title}
              </h1>

              <div className="relative animate-in slide-in-from-bottom-5 duration-500 delay-200">
                <div className="absolute -left-3 top-0 bottom-0 w-1 bg-[#FBBC05]"></div>
                <p className="text-lg font-bold text-gray-700 pl-6 max-w-2xl leading-relaxed">
                  {course.description}
                </p>
              </div>
            </div>

            {/* Total Documents Card */}
            <div className="lg:w-72 animate-in zoom-in-95 duration-500 delay-300">
              <div className="bg-white border-2 border-black p-8 text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-xl hover:-translate-y-1 transition-transform">
                <p className="text-xs font-black text-black uppercase tracking-widest mb-4 bg-[#FBBC05] inline-block px-3 py-1 border border-black rounded-full">
                  Total Dokumen
                </p>
                <div className="text-7xl font-black text-black mb-2 leading-none tracking-tighter">
                  {notes.length}
                </div>
                <p className="font-bold text-gray-500 uppercase text-sm tracking-wider">Catatan Tersedia</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notes Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-12">
          <div className="flex items-center gap-4">
            <div className="bg-black text-white p-3 rounded-xl shadow-[4px_4px_0px_0px_rgba(255,255,255,1),4px_4px_0px_2px_rgba(0,0,0,1)]">
              <FileText className="w-6 h-6" />
            </div>
            <h2 className="text-3xl font-black text-black uppercase tracking-tight">Daftar Catatan</h2>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-black group-focus-within:text-[#4285F4] transition-colors" />
            <input
              type="text"
              placeholder="CARI CATATAN..."
              className="w-full pl-12 pr-4 py-3 border-2 border-black font-bold bg-white rounded-xl focus:outline-none focus:ring-4 focus:ring-[#FBBC05]/20 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* Notes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {notes.map((note, index) => (
            <div key={note.id} className="animate-in slide-in-from-bottom-5 fade-in duration-500" style={{ animationDelay: `${index * 100}ms` }}>
              <NoteCard 
                note={note}
                handleLike={handleLike} 
                handleDownload={handleDownload} 
                isLiked={likedNotes.has(note.id)} 
              />
            </div>
          ))}
        </div>
      </div>

      {/* Notification */}
      {showNotification && (
        <div
          className={`fixed bottom-6 right-6 px-6 py-4 border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.5)] z-50 flex items-center gap-4 rounded-xl animate-in slide-in-from-bottom-10 duration-300 ${
            notificationType === 'success' ? 'bg-[#34A853] text-white' : 'bg-[#4285F4] text-white'
          }`}
        >
          <div className="bg-black p-2 rounded-lg shadow-sm">
             {notificationType === 'success' ? <ThumbsUp className="w-5 h-5 text-white" /> : <div className="w-5 h-5 bg-white rounded-full animate-pulse" />}
          </div>
          <p className="text-sm font-black uppercase tracking-wide">
            {notificationMessage}
          </p>
        </div>
      )}
    </div>
  );
}

function NoteCard({ note, handleLike, handleDownload, isLiked }: { note: Note, handleLike: (noteId: number) => void, handleDownload: (note: Note) => void, isLiked: boolean }) {
  const typeColors = {
    PDF: {
      bg: 'bg-[#EA4335]',
      border: 'border-black',
      text: 'text-white'
    },
    IMG: {
      bg: 'bg-[#4285F4]',
      border: 'border-black',
      text: 'text-white'
    }
  };

  const colors = typeColors[note.type];

  return (
    <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 hover:-translate-y-1.5 group flex flex-col h-full rounded-xl overflow-hidden">
      {/* Top Bar */}
      <div className="h-6 bg-black w-full flex items-center px-3 gap-1.5 border-b-2 border-black">
        <div className="w-2.5 h-2.5 rounded-full bg-[#EA4335] border border-white/20"></div>
        <div className="w-2.5 h-2.5 rounded-full bg-[#FBBC05] border border-white/20"></div>
        <div className="w-2.5 h-2.5 rounded-full bg-[#34A853] border border-white/20"></div>
      </div>

      <div className="p-6 flex-1 flex flex-col relative">
        {/* Pattern Background for Card Header */}
        <div className="absolute top-0 right-0 p-4 opacity-5">
           <FileText className="w-24 h-24 rotate-12" />
        </div>

        {/* Header */}
        <div className="flex items-start justify-between mb-4 relative z-10">
          <span className={`${colors.bg} ${colors.text} border-2 border-black text-xs font-black px-3 py-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-md`}>
            {note.type}
          </span>
          <div className="flex items-center gap-2 text-black text-xs font-bold border-2 border-black px-3 py-1 bg-gray-50 rounded-md">
            <Calendar className="w-3 h-3" />
            {note.date}
          </div>
        </div>

        {/* Title */}
        <h3 className="font-black text-xl text-black mb-3 leading-tight line-clamp-2 uppercase group-hover:text-[#4285F4] transition-colors relative z-10">
          {note.title}
        </h3>

        {/* Description */}
        <p className="text-sm font-medium text-gray-600 mb-8 line-clamp-3 flex-1 border-l-2 border-gray-200 pl-4 relative z-10">
          {note.description}
        </p>

        {/* Footer */}
        <div className="mt-auto relative z-10">
          {/* Uploader Info - More Prominent */}
          <div className="flex items-center gap-3 mb-5 bg-gray-50 p-3 border-2 border-black rounded-lg">
            <div className="w-10 h-10 bg-[#FBBC05] border-2 border-black flex items-center justify-center flex-shrink-0 rounded-md shadow-sm">
              <span className="text-black font-black text-sm">
                {note.uploadedBy && note.uploadedBy.charAt(0).toUpperCase() || note.author && note.author.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] uppercase font-black text-gray-500 mb-0.5">Diupload oleh</p>
              <p className="font-bold text-black text-sm truncate">
                {note.uploadedBy || note.author || 'Unknown'}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              className={`flex-1 flex items-center justify-center gap-2 border-2 border-black px-4 py-2.5 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none rounded-lg ${
                isLiked 
                  ? 'bg-[#34A853] text-white' 
                  : 'bg-white text-black hover:bg-gray-50'
              }`}
              onClick={() => handleLike(note.id)}
            >
              <ThumbsUp className={`w-4 h-4 ${isLiked ? 'fill-white animate-bounce' : ''}`} />
              <span className="text-sm font-black">{note.likes}</span>
            </button>
            <button
              className="flex-1 bg-black text-white border-2 border-black px-4 py-2.5 hover:bg-[#EA4335] transition-all flex items-center justify-center gap-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none rounded-lg group/btn"
              onClick={() => handleDownload(note)}
            >
              <Download className="w-4 h-4 group-hover/btn:translate-y-1 transition-transform" />
              <span className="text-sm font-black uppercase">Unduh</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}