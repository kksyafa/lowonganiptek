import React, { useState, useEffect } from 'react';
import { 
  Briefcase, User, FileText, UploadCloud, CheckCircle, 
  ChevronRight, ChevronLeft, MapPin, GraduationCap, 
  Award, Send, AlertCircle, Loader2
} from 'lucide-react';

// --- KONFIGURASI API ---
const CONFIG = {
  SHEET_API_URL: 'https://sheetdb.io/api/v1/i0hvwpp56ut4x',
  CLOUDINARY_URL: 'https://api.cloudinary.com/v1_1/djfe10hfh/upload',
  CLOUDINARY_PRESET: 'kaririptek',
  EMAILJS_SERVICE_ID: 'YOUR_SERVICE_ID',
  EMAILJS_TEMPLATE_ID: 'YOUR_TEMPLATE_ID',
  EMAILJS_PUBLIC_KEY: 'YOUR_PUBLIC_KEY'
};

export default function App() {
  // State Management
  const [view, setView] = useState('landing'); // 'landing', 'form', 'success'
  const [currentStep, setCurrentStep] = useState(1);
  const [jobs, setJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');

  // Form Data State
  const [formData, setFormData] = useState({
    id_pelamar: `APP-${Date.now().toString().slice(-6)}`,
    nama: '',
    email: '',
    no_hp: '',
    alamat: '',
    pendidikan: '',
    posisi_id: '',
    posisi_nama: '',
    pengalaman: '',
    keahlian: '',
    motivasi: '',
    cv_file: null,
    portofolio_file: null,
    foto_file: null,
    cv_url: '',
    portofolio_url: '',
    foto_url: ''
  });

  // Fetch Data Lowongan dari Spreadsheet Nyata
  useEffect(() => {
    const fetchJobs = async () => {
      setLoadingJobs(true);
      try {
        const response = await fetch(`${CONFIG.SHEET_API_URL}?sheet=jobs`);
        const data = await response.json();
        
        if (Array.isArray(data)) {
          setJobs(data.filter(job => job.status?.toLowerCase() === 'aktif'));
        }
      } catch (error) {
        console.error("Error fetching jobs:", error);
      } finally {
        setLoadingJobs(false);
      }
    };

    fetchJobs();
  }, []);

  // Handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files.length > 0) {
      setFormData(prev => ({ ...prev, [name]: files[0] }));
    }
  };

  const handleJobSelect = (jobId, jobName) => {
    setFormData(prev => ({ ...prev, posisi_id: jobId, posisi_nama: jobName }));
  };

  const nextStep = () => {
    if (currentStep === 1) {
      if (!formData.nama || !formData.email || !formData.no_hp || !formData.pendidikan) {
        alert("Mohon lengkapi semua field yang wajib (Nama, Email, No HP, Pendidikan).");
        return;
      }
    } else if (currentStep === 2) {
      if (!formData.posisi_id) {
        alert("Mohon pilih posisi yang ingin dilamar.");
        return;
      }
    } else if (currentStep === 3) {
      if (!formData.keahlian || !formData.motivasi) {
        alert("Mohon lengkapi keahlian dan motivasi Anda.");
        return;
      }
    }
    setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => setCurrentStep(prev => prev - 1);

  const uploadFileToCloud = async (file) => {
    if (!file) return "";
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(`https://storage.iptek.school/mock/${file.name}`);
      }, 1000);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.cv_file || !formData.foto_file) {
      alert("CV dan Foto Diri wajib diunggah!");
      return;
    }

    setIsSubmitting(true);
    
    try {
      setUploadProgress('Mengunggah dokumen...');
      const cvUrl = await uploadFileToCloud(formData.cv_file);
      const portofolioUrl = await uploadFileToCloud(formData.portofolio_file);
      const fotoUrl = await uploadFileToCloud(formData.foto_file);

      setUploadProgress('Menyimpan data lamaran...');
      const payload = {
        timestamp: new Date().toLocaleString('id-ID'),
        id_pelamar: formData.id_pelamar,
        nama: formData.nama,
        email: formData.email,
        no_hp: `'${formData.no_hp}`, 
        alamat: formData.alamat,
        pendidikan: formData.pendidikan,
        posisi: formData.posisi_nama,
        pengalaman: formData.pengalaman,
        keahlian: formData.keahlian,
        motivasi: formData.motivasi,
        link_cv: cvUrl,
        link_portofolio: portofolioUrl,
        link_foto: fotoUrl
      };

      const response = await fetch(`${CONFIG.SHEET_API_URL}?sheet=applications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error("Gagal menyimpan ke spreadsheet");

      setView('success');
    } catch (error) {
      console.error("Gagal mengirim lamaran:", error);
      alert("Terjadi kesalahan saat mengirim data.");
    } finally {
      setIsSubmitting(false);
      setUploadProgress('');
    }
  };

  // --- RENDER COMPONENTS ---

  const renderLanding = () => (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-12">
      <div className="bg-blue-700 text-white rounded-b-[2.5rem] p-8 pb-16 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="max-w-3xl mx-auto relative z-10 text-center mt-8">
          <div className="inline-block bg-white/20 px-4 py-1 rounded-full text-sm font-medium mb-4 backdrop-blur-sm border border-white/30">
            IPTEK Career System
          </div>
          <h1 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">Bergabung Bersama<br/>IPTEK School</h1>
          <button 
            onClick={() => {
              setView('form');
              setCurrentStep(1); // Mulai dari awal
            }}
            className="bg-white text-blue-700 px-8 py-3.5 rounded-full font-semibold shadow-lg hover:shadow-xl hover:bg-blue-50 transition-all active:scale-95"
          >
            Mulai Lamar Sekarang
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 -mt-8 relative z-20">
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-slate-100">
          <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
            <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800">
              <Briefcase className="text-blue-600 w-5 h-5" />
              Lowongan Aktif Tersedia
            </h2>
            <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-1 rounded-full font-bold">
              {jobs.length} Posisi
            </span>
          </div>

          {loadingJobs ? (
            <div className="flex flex-col items-center justify-center py-10 space-y-3">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              <p className="text-sm text-slate-500">Memuat data lowongan...</p>
            </div>
          ) : jobs.length > 0 ? (
            <div className="grid gap-4">
              {jobs.map(job => (
                <div key={job.id} className="border border-slate-200 rounded-xl p-4 hover:border-blue-400 hover:shadow-md transition-all group">
                  <h3 className="font-bold text-lg text-slate-800 group-hover:text-blue-700">{job.posisi}</h3>
                  <p className="text-sm text-slate-500 mt-1 mb-3">{job.deskripsi}</p>
                  <button 
                    onClick={() => {
                      handleJobSelect(job.id, job.posisi);
                      setView('form');
                      setCurrentStep(1); // Perbaikan: Tetap ke Step 1 (Data Diri), tapi posisi sudah terpilih
                    }}
                    className="text-sm font-medium text-blue-600 flex items-center gap-1 hover:text-blue-800"
                  >
                    Lamar Posisi Ini <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
             <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                <AlertCircle className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                <h3 className="font-semibold text-slate-700">Belum Ada Lowongan</h3>
             </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderProgressBar = () => {
    const steps = [
      { num: 1, label: 'Data Diri', icon: User },
      { num: 2, label: 'Posisi', icon: Briefcase },
      { num: 3, label: 'Profesional', icon: Award },
      { num: 4, label: 'Berkas', icon: FileText }
    ];

    return (
      <div className="mb-8">
        <div className="flex justify-between relative">
          <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 -z-10 transform -translate-y-1/2 rounded-full"></div>
          <div 
            className="absolute top-1/2 left-0 h-1 bg-blue-600 -z-10 transform -translate-y-1/2 transition-all duration-300 ease-in-out rounded-full"
            style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
          ></div>

          {steps.map((s) => {
            const Icon = s.icon;
            const isActive = currentStep >= s.num;
            return (
              <div key={s.num} className="flex flex-col items-center gap-2 bg-white px-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors duration-300 ${isActive ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-200' : 'bg-white border-slate-300 text-slate-400'}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`text-[10px] md:text-xs font-semibold ${isActive ? 'text-blue-700' : 'text-slate-400'}`}>{s.label}</span>
              </div>
            )
          })}
        </div>
      </div>
    );
  };

  const renderForm = () => (
    <div className="min-h-screen bg-slate-50 py-8 px-4 font-sans text-slate-800">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => setView('landing')} className="flex items-center text-sm font-medium text-slate-500 hover:text-blue-600">
            <ChevronLeft className="w-4 h-4 mr-1" /> Kembali
          </button>
          <div className="text-sm font-bold text-slate-800 bg-white px-3 py-1 rounded-full shadow-sm border border-slate-100">
            ID: <span className="text-blue-600">{formData.id_pelamar}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-10 border border-slate-100 animate-fade-in">
          <h2 className="text-2xl font-bold mb-6 text-center text-slate-800">Formulir Lamaran Kerja</h2>
          
          {renderProgressBar()}

          <form onSubmit={handleSubmit} className="mt-8">
            {currentStep === 1 && (
              <div className="space-y-4 animate-fade-in">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Nama Lengkap <span className="text-red-500">*</span></label>
                  <input type="text" name="nama" value={formData.nama} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="Misal: Budi Santoso" required />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Email <span className="text-red-500">*</span></label>
                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="budi@email.com" required />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">No. WhatsApp <span className="text-red-500">*</span></label>
                    <input type="tel" name="no_hp" value={formData.no_hp} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="08123456789" required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Domisili (Kota) <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                    <input type="text" name="alamat" value={formData.alamat} onChange={handleInputChange} className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="Misal: Jakarta Selatan" required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Pendidikan Terakhir <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                    <select name="pendidikan" value={formData.pendidikan} onChange={handleInputChange} className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all appearance-none bg-white" required>
                      <option value="">Pilih Pendidikan...</option>
                      <option value="SMA/SMK">SMA/SMK Sederajat</option>
                      <option value="D3">Diploma (D3)</option>
                      <option value="S1">Sarjana (S1)</option>
                      <option value="S2">Magister (S2)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4 animate-fade-in">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">Pilih Posisi yang Dilamar <span className="text-red-500">*</span></label>
                  <div className="grid grid-cols-1 gap-3">
                    {jobs.map(job => (
                      <label 
                        key={job.id} 
                        className={`relative flex cursor-pointer rounded-xl border p-4 shadow-sm focus:outline-none transition-all ${
                          formData.posisi_id === job.id ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600' : 'border-slate-300 bg-white hover:bg-slate-50'
                        }`}
                      >
                        <input 
                          type="radio" 
                          name="posisi" 
                          value={job.id} 
                          checked={formData.posisi_id === job.id}
                          onChange={() => handleJobSelect(job.id, job.posisi)}
                          className="sr-only" 
                        />
                        <span className="flex flex-1">
                          <span className="flex flex-col">
                            <span className="block text-sm font-bold text-slate-900">{job.posisi}</span>
                            <span className="mt-1 flex items-center text-xs text-slate-500">{job.deskripsi}</span>
                          </span>
                        </span>
                        {formData.posisi_id === job.id && <CheckCircle className="h-5 w-5 text-blue-600" />}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4 animate-fade-in">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Pengalaman Kerja Terakhir (Opsional)</label>
                  <textarea name="pengalaman" value={formData.pengalaman} onChange={handleInputChange} rows="3" className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none" placeholder="Ceritakan pengalaman kerja Anda secara singkat..."></textarea>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Keahlian Utama <span className="text-red-500">*</span></label>
                  <input type="text" name="keahlian" value={formData.keahlian} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="Misal: Mengajar, Microsoft Office, Desain Grafis" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Motivasi Melamar <span className="text-red-500">*</span></label>
                  <textarea name="motivasi" value={formData.motivasi} onChange={handleInputChange} rows="3" className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none" placeholder="Mengapa Anda ingin bergabung dengan IPTEK School?" required></textarea>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-5 animate-fade-in">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Curriculum Vitae (CV) <span className="text-red-500">*</span></label>
                  <div className="relative border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:bg-slate-50 transition-colors group cursor-pointer">
                    <input type="file" name="cv_file" onChange={handleFileChange} accept=".pdf" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" required />
                    <UploadCloud className="w-6 h-6 text-slate-400 mx-auto mb-2 group-hover:text-blue-500 transition-colors" />
                    <span className="text-sm text-slate-600 font-medium">{formData.cv_file ? formData.cv_file.name : 'Klik atau Drag file PDF kesini'}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Pas Foto Terbaru <span className="text-red-500">*</span></label>
                  <div className="relative border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:bg-slate-50 transition-colors group cursor-pointer">
                    <input type="file" name="foto_file" onChange={handleFileChange} accept=".jpg,.jpeg,.png" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" required />
                    <UploadCloud className="w-6 h-6 text-slate-400 mx-auto mb-2 group-hover:text-blue-500 transition-colors" />
                    <span className="text-sm text-slate-600 font-medium">{formData.foto_file ? formData.foto_file.name : 'Klik atau Drag foto (JPG/PNG)'}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-8 flex justify-between pt-6 border-t border-slate-100">
              {currentStep > 1 ? (
                <button type="button" onClick={prevStep} disabled={isSubmitting} className="px-6 py-2.5 rounded-xl text-slate-600 font-semibold hover:bg-slate-100 transition-colors disabled:opacity-50">
                  Kembali
                </button>
              ) : <div></div>}

              {currentStep < 4 ? (
                <button type="button" onClick={nextStep} className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-md shadow-blue-200 flex items-center gap-2">
                  Lanjut <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button type="submit" disabled={isSubmitting} className="px-8 py-2.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-md shadow-emerald-200 flex items-center gap-2">
                  {isSubmitting ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> {uploadProgress || 'Memproses...'}</>
                  ) : (
                    <><Send className="w-4 h-4" /> Kirim Lamaran</>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  const renderSuccess = () => (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 md:p-12 rounded-[2rem] shadow-2xl text-center max-w-md w-full animate-fade-in">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-emerald-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Lamaran Berhasil Terkirim!</h2>
        <p className="text-slate-500 mb-6 text-sm">ID Lamaran: <span className="font-bold text-blue-600">{formData.id_pelamar}</span></p>
        <button onClick={() => window.location.reload()} className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-semibold hover:bg-slate-800 transition-colors">
          Kembali ke Beranda
        </button>
      </div>
    </div>
  );

  return (
    <>
      <style>{`
        .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      
      {view === 'landing' && renderLanding()}
      {view === 'form' && renderForm()}
      {view === 'success' && renderSuccess()}
    </>
  );
}
