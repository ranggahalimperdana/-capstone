/**
 * UniNotes - Notes Service
 * 
 * Service layer untuk notes/posts operations.
 * Saat ini menggunakan localStorage, nantinya akan diintegrasikan dengan Supabase.
 * 
 * 🔄 SUPABASE INTEGRATION GUIDE:
 * ============================================================================
 * 
 * 1. Database Schema:
 *    CREATE TABLE notes (
 *      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
 *      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
 *      course_code TEXT NOT NULL,
 *      course_title TEXT NOT NULL,
 *      type TEXT CHECK (type IN ('PDF', 'IMG')),
 *      title TEXT NOT NULL,
 *      description TEXT NOT NULL,
 *      file_name TEXT NOT NULL,
 *      file_size TEXT NOT NULL,
 *      file_url TEXT, -- URL dari Supabase Storage
 *      faculty TEXT NOT NULL,
 *      prodi TEXT NOT NULL,
 *      semester TEXT NOT NULL,
 *      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
 *      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
 *    );
 * 
 * 2. Supabase Storage Setup:
 *    - Buat bucket 'notes-files' di Supabase Storage
 *    - Set policy: authenticated users can upload
 *    - Set policy: public can read
 * 
 * 3. File Upload Flow:
 *    a) Upload file ke Supabase Storage:
 *       const { data, error } = await supabase.storage
 *         .from('notes-files')
 *         .upload(`${userId}/${fileName}`, file)
 *    
 *    b) Get public URL:
 *       const { data } = supabase.storage
 *         .from('notes-files')
 *         .getPublicUrl(`${userId}/${fileName}`)
 *    
 *    c) Save metadata ke database:
 *       const { data, error } = await supabase
 *         .from('notes')
 *         .insert({ ...metadata, file_url: publicUrl })
 * 
 * 4. RLS Policies:
 *    - Users can CRUD their own notes
 *    - Admins can read/delete all notes
 *    - Public can read all notes
 * 
 * ============================================================================
 */

import { STORAGE_KEYS } from '../constants';
import type { UserNote } from '../types';

/**
 * Get all notes from localStorage
 * 
 * 🔄 SUPABASE: Replace dengan query
 * const { data, error } = await supabase
 *   .from('notes')
 *   .select('*, users(name, email)')
 *   .order('created_at', { ascending: false })
 */
export const getAllNotes = (): UserNote[] => {
  const notes = localStorage.getItem(STORAGE_KEYS.POSTS);
  return notes ? JSON.parse(notes) : [];
};

/**
 * Save notes to localStorage
 * 
 * 🔄 SUPABASE: Tidak perlu function ini, data otomatis tersimpan di database
 */
const saveNotes = (notes: UserNote[]): void => {
  localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(notes));
};

/**
 * Get notes by user email
 * 
 * 🔄 SUPABASE: Replace dengan query
 * const { data, error } = await supabase
 *   .from('notes')
 *   .select('*')
 *   .eq('user_id', userId)
 *   .order('created_at', { ascending: false })
 */
export const getNotesByUser = (userEmail: string): UserNote[] => {
  const allNotes = getAllNotes();
  return allNotes.filter(note => note.uploadedBy === userEmail);
};

/**
 * Create new note
 * 
 * 🔄 SUPABASE: Replace dengan file upload + insert query
 * 
 * // 1. Upload file to Storage
 * const fileName = `${Date.now()}_${file.name}`;
 * const { data: uploadData, error: uploadError } = await supabase.storage
 *   .from('notes-files')
 *   .upload(`${userId}/${fileName}`, file);
 * 
 * // 2. Get public URL
 * const { data: urlData } = supabase.storage
 *   .from('notes-files')
 *   .getPublicUrl(`${userId}/${fileName}`);
 * 
 * // 3. Insert metadata to database
 * const { data, error } = await supabase
 *   .from('notes')
 *   .insert({
 *     user_id: userId,
 *     course_code: courseCode,
 *     course_title: courseTitle,
 *     type: type,
 *     title: title,
 *     description: description,
 *     file_name: fileName,
 *     file_size: fileSize,
 *     file_url: urlData.publicUrl,
 *     faculty: faculty,
 *     prodi: prodi,
 *     semester: semester
 *   })
 *   .select()
 *   .single()
 */
export const createNote = (note: UserNote): { success: boolean; message: string } => {
  const allNotes = getAllNotes();
  allNotes.push(note);
  saveNotes(allNotes);

  return {
    success: true,
    message: 'Catatan berhasil diupload!',
  };
};

/**
 * Update note
 * 
 * 🔄 SUPABASE: Replace dengan update query (dan file upload jika file berubah)
 * 
 * // If file changed, upload new file first
 * if (newFile) {
 *   // Delete old file
 *   await supabase.storage
 *     .from('notes-files')
 *     .remove([oldFilePath]);
 *   
 *   // Upload new file
 *   const { data: uploadData } = await supabase.storage
 *     .from('notes-files')
 *     .upload(`${userId}/${fileName}`, newFile);
 *   
 *   fileUrl = getPublicUrl(...);
 * }
 * 
 * // Update metadata
 * const { data, error } = await supabase
 *   .from('notes')
 *   .update({
 *     course_code: courseCode,
 *     title: title,
 *     description: description,
 *     file_url: fileUrl, // if changed
 *     updated_at: new Date()
 *   })
 *   .eq('id', noteId)
 *   .eq('user_id', userId) // Security: only owner can update
 */
export const updateNote = (
  noteId: string,
  updatedData: Partial<UserNote>
): { success: boolean; message: string } => {
  const allNotes = getAllNotes();
  const noteIndex = allNotes.findIndex(note => note.id === noteId);

  if (noteIndex === -1) {
    return {
      success: false,
      message: 'Catatan tidak ditemukan',
    };
  }

  allNotes[noteIndex] = {
    ...allNotes[noteIndex],
    ...updatedData,
  };

  saveNotes(allNotes);

  return {
    success: true,
    message: 'Catatan berhasil diperbarui!',
  };
};

/**
 * Delete note
 * 
 * 🔄 SUPABASE: Replace dengan delete query + delete file from storage
 * 
 * // 1. Get note data to get file path
 * const { data: note } = await supabase
 *   .from('notes')
 *   .select('file_url')
 *   .eq('id', noteId)
 *   .single();
 * 
 * // 2. Delete file from storage
 * const filePath = extractPathFromUrl(note.file_url);
 * await supabase.storage
 *   .from('notes-files')
 *   .remove([filePath]);
 * 
 * // 3. Delete from database
 * const { error } = await supabase
 *   .from('notes')
 *   .delete()
 *   .eq('id', noteId)
 *   .eq('user_id', userId) // Security: only owner can delete (atau admin)
 */
export const deleteNote = (noteId: string): { success: boolean; message: string } => {
  const allNotes = getAllNotes();
  const filteredNotes = allNotes.filter(note => note.id !== noteId);

  if (filteredNotes.length === allNotes.length) {
    return {
      success: false,
      message: 'Catatan tidak ditemukan',
    };
  }

  saveNotes(filteredNotes);

  return {
    success: true,
    message: 'Catatan berhasil dihapus',
  };
};

/**
 * Get notes with filters
 * 
 * 🔄 SUPABASE: Replace dengan query builder
 * 
 * let query = supabase
 *   .from('notes')
 *   .select('*, users(name, email)');
 * 
 * if (faculty) query = query.eq('faculty', faculty);
 * if (prodi) query = query.eq('prodi', prodi);
 * if (semester) query = query.eq('semester', semester);
 * if (type !== 'ALL') query = query.eq('type', type);
 * if (searchQuery) {
 *   query = query.or(
 *     `title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,course_title.ilike.%${searchQuery}%`
 *   );
 * }
 * 
 * const { data, error } = await query.order('created_at', { ascending: false });
 */
export const getFilteredNotes = (filters: {
  faculty?: string;
  prodi?: string;
  semester?: string;
  type?: 'PDF' | 'IMG' | 'ALL';
  searchQuery?: string;
}): UserNote[] => {
  let notes = getAllNotes();

  // Filter by faculty
  if (filters.faculty && filters.faculty !== '') {
    notes = notes.filter(note => note.faculty === filters.faculty);
  }

  // Filter by prodi
  if (filters.prodi && filters.prodi !== '') {
    notes = notes.filter(note => note.prodi === filters.prodi);
  }

  // Filter by semester
  if (filters.semester && filters.semester !== '') {
    notes = notes.filter(note => note.semester === filters.semester);
  }

  // Filter by type
  if (filters.type && filters.type !== 'ALL') {
    notes = notes.filter(note => note.type === filters.type);
  }

  // Filter by search query
  if (filters.searchQuery && filters.searchQuery !== '') {
    const query = filters.searchQuery.toLowerCase();
    notes = notes.filter(
      note =>
        note.title.toLowerCase().includes(query) ||
        note.description.toLowerCase().includes(query) ||
        note.courseTitle.toLowerCase().includes(query) ||
        note.courseCode.toLowerCase().includes(query)
    );
  }

  return notes;
};

/**
 * Get note by ID
 * 
 * 🔄 SUPABASE: Replace dengan query
 * const { data, error } = await supabase
 *   .from('notes')
 *   .select('*, users(name, email)')
 *   .eq('id', noteId)
 *   .single()
 */
export const getNoteById = (noteId: string): UserNote | null => {
  const allNotes = getAllNotes();
  return allNotes.find(note => note.id === noteId) || null;
};
