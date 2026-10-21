'use client';

import React, { useState } from 'react';
import { X, BookOpen, Volume2, Sparkles, CheckCircle2 } from 'lucide-react';

interface ManasikDoaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ManasikDoaModal({ isOpen, onClose }: ManasikDoaModalProps) {
  const [activeTab, setActiveTab] = useState<'thawaf' | 'sai' | 'ihram' | 'masjid'>('thawaf');
  const [activePutaran, setActivePutaran] = useState<number>(1);

  if (!isOpen) return null;

  const DOA_THAWAF: Record<number, { title: string; arab: string; latin: string; arti: string }> = {
    1: {
      title: 'Doa Thawaf Putaran ke-1 (Hajar Aswad ke Rukun Yamani)',
      arab: 'سُبْحَانَ اللهِ وَالْحَمْدُ لِلَّهِ وَلَا إِلَهَ إِلَّا اللهُ وَاللهُ أَكْبَرُ، وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللهِ الْعَلِيِّ الْعَظِيمِ',
      latin: 'Subhanallah walhamdulillah wa laa ilaha illallah wallahu akbar, wa laa hawla wa laa quwwata illa billahil \'aliyyil \'azhim.',
      arti: 'Maha Suci Allah, segala puji bagi Allah, tiada Tuhan selain Allah, Allah Maha Besar. Tiada daya dan upaya kecuali dengan pertolongan Allah Yang Maha Tinggi lagi Maha Agung.'
    },
    2: {
      title: 'Doa Thawaf Putaran ke-2',
      arab: 'اللَّهُمَّ إِنَّ هَذَا الْبَيْتَ بَيْتُكَ، وَالْحَرَمَ حَرَمُكَ، وَالأَمْنَ أَمْنُكَ، وَهَذَا مَقَامُ الْعَائِذِ بِكَ مِنَ النَّارِ',
      latin: 'Allahumma inna hadzal baita baituka, wal harama haramuka, wal amna amnuka, wa hadza maqamul \'a-idzi bika minan naar.',
      arti: 'Ya Allah, sesungguhnya Bait ini adalah rumah-Mu, tanah suci ini tanah suci-Mu, keamanan ini keamanan-Mu, dan ini tempat berlindung kepada-Mu dari siksa neraka.'
    },
    3: {
      title: 'Doa Thawaf Putaran ke-3',
      arab: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الشَّكِّ وَالشِّرْكِ وَالشِّقَاقِ وَالنِّفَاقِ وَسُوءِ الأَخْلَاقِ',
      latin: 'Allahumma inni a\'udzu bika minasy syakki wasy syirki wasy syiqaqi wan nifaqi wa su-il akhlaq.',
      arti: 'Ya Allah, aku berlindung kepada-Mu dari keraguan, kemusyrikan, perpecahan, kemunafikan, dan akhlak yang buruk.'
    },
    4: {
      title: 'Doa Thawaf Putaran ke-4',
      arab: 'اللَّهُمَّ اجْعَلْهُ حَجًّا مَبْرُورًا، وَسَعْيًا مَشْكُورًا، وَذَنْبًا مَغْفُورًا، وَعَمَلًا صَالِحًا مَقْبُولًا',
      latin: 'Allahummaj\'alhu hajjan mabruura, wa sa\'yan masykura, wa dzanban maghfura, wa \'amalan shalihan maqbuula.',
      arti: 'Ya Allah, jadikanlah ini haji/umroh yang mabrur, sa\'i yang diterima, dosa yang diampuni, dan amal saleh yang diterima.'
    },
    5: {
      title: 'Doa Thawaf Putaran ke-5',
      arab: 'اللَّهُمَّ أَظِلَّنِي تَحْتَ ظِلِّ عَرْشِكَ يَوْمَ لَا ظِلَّ إِلَّا ظِلُّكَ، وَلَا بَاقِيَ إِلَّا وَجْهُكَ',
      latin: 'Allahumma azhillani tahta zhilli \'arsyika yauma laa zhilla illa zhilluka, wa laa baqiya illa wajhuka.',
      arti: 'Ya Allah, naungilah aku di bawah naungan \'Arsy-Mu pada hari ketika tiada naungan selain naungan-Mu, dan tiada yang kekal kecuali Wajah-Mu.'
    },
    6: {
      title: 'Doa Thawaf Putaran ke-6',
      arab: 'اللَّهُمَّ إِنَّ لَكَ عَلَيَّ حُقُوقًا كَثِيرَةً فِيمَا بَيْنِي وَبَيْنَكَ، وَحُقُوقًا كَثِيرَةً فِيمَا بَيْنِي وَبَيْنَ خَلْقِكَ',
      latin: 'Allahumma inna laka \'alayya huquuqan katsiratan fima baini wa bainaka, wa huquuqan katsiratan fima baini wa baina khalqika.',
      arti: 'Ya Allah, sesungguhnya Engkau memiliki banyak hak atasku dalam hubungan antara aku dan Engkau, dan antara aku dan sesama makhluk-Mu.'
    },
    7: {
      title: 'Doa Thawaf Putaran ke-7',
      arab: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ إِيمَانًا كَامِلًا، وَيَقِينًا صَادِقًا، وَرِزْقًا وَاسِعًا، وَقَلْبًا خَاشِعًا، وَلِسَانًا ذَاكِرًا',
      latin: 'Allahumma inni as-aluka iimaanan kaamila, wa yaqiinan shaadiqa, wa rizqan waasi\'a, wa qalban khaasyi\'a, wa lisaanan dzaakira.',
      arti: 'Ya Allah, sesungguhnya aku memohon kepada-Mu keimanan yang sempurna, keyakinan yang benar, rezeki yang luas, hati yang khusyuk, dan lisan yang senantiasa berdzikir.'
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
      <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-2xl max-h-[90vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-[#005B31] text-white">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-lg">
              📖
            </div>
            <div>
              <h3 className="text-sm font-bold leading-tight">Panduan Manasik &amp; Doa Digital</h3>
              <p className="text-[10px] text-emerald-200">Siap digunakan offline di Tanah Suci</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub Navigation Tabs */}
        <div className="flex items-center justify-around border-b border-slate-200 bg-slate-50 text-xs font-bold px-2 py-1.5">
          <button
            type="button"
            onClick={() => setActiveTab('thawaf')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'thawaf' ? 'bg-white text-[#005B31] shadow-2xs font-extrabold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🕋 Doa Thawaf
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('sai')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'sai' ? 'bg-white text-[#005B31] shadow-2xs font-extrabold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ⛰️ Doa Sa&apos;i
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ihram')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'ihram' ? 'bg-white text-[#005B31] shadow-2xs font-extrabold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🤍 Niat Ihram
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('masjid')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'masjid' ? 'bg-white text-[#005B31] shadow-2xs font-extrabold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🕌 Doa Masjid
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {activeTab === 'thawaf' && (
            <div className="space-y-4">
              {/* Putaran Pill Selector */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setActivePutaran(num)}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                      activePutaran === num
                        ? 'bg-[#007A41] text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Putaran {num}
                  </button>
                ))}
              </div>

              {/* Doa Content Card */}
              <div className="bg-[#F7F8FA] border border-slate-200 rounded-2xl p-4 space-y-3">
                <span className="text-xs font-bold text-[#007A41] block">
                  {DOA_THAWAF[activePutaran].title}
                </span>

                {/* Tulisan Arab */}
                <div className="text-right text-lg sm:text-xl font-serif text-slate-900 leading-loose py-2 border-y border-slate-200/60 font-semibold">
                  {DOA_THAWAF[activePutaran].arab}
                </div>

                {/* Transliterasi Latin */}
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Latin:
                  </span>
                  <p className="text-xs text-slate-700 italic leading-relaxed mt-0.5">
                    {DOA_THAWAF[activePutaran].latin}
                  </p>
                </div>

                {/* Arti Indonesia */}
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Artinya:
                  </span>
                  <p className="text-xs text-slate-600 leading-relaxed mt-0.5">
                    &quot;{DOA_THAWAF[activePutaran].arti}&quot;
                  </p>
                </div>
              </div>

              {/* Tips Thawaf */}
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/80 text-[11px] text-amber-900 space-y-1">
                <strong>💡 Catatan Penting Thawaf:</strong>
                <p>
                  Setiap melewati Rukun Yamani menuju Hajar Aswad, disunnahkan membaca doa Sapu Jagad:
                  <em> &quot;Rabbana aatina fiddunya hasanah, wa fil akhirati hasanah, wa qinaa \'adzaban naar.&quot;</em>
                </p>
              </div>
            </div>
          )}

          {activeTab === 'sai' && (
            <div className="space-y-3 text-xs">
              <div className="bg-[#F7F8FA] border border-slate-200 rounded-2xl p-4 space-y-3">
                <span className="font-bold text-[#007A41] text-xs">Doa Saat Berada di Atas Bukit Shafa &amp; Marwah</span>
                <p className="text-right text-lg font-serif text-slate-900 leading-loose">
                  إِنَّ الصَّفَا وَالْمَرْوَةَ مِنْ شَعَائِرِ اللَّهِ ۖ أَبْدَأُ بِمَا بَدَأَ اللَّهُ بِهِ
                </p>
                <p className="italic text-slate-700 leading-relaxed">
                  Innash shafaa wal marwata min sya\'a-irillah, abda-u bimaa bada-allahu bih.
                </p>
                <p className="text-slate-600">
                  &quot;Sesungguhnya Shafa dan Marwah adalah sebagian dari syiar-syiar Allah. Aku memulai dengan apa yang dimulai oleh Allah.&quot;
                </p>
              </div>

              <div className="bg-[#F7F8FA] border border-slate-200 rounded-2xl p-4 space-y-2">
                <span className="font-bold text-slate-900 text-xs">Doa di Antara Dua Pilar Hijau (Lari Kecil / Ikhwan):</span>
                <p className="text-right text-base font-serif text-slate-900 leading-relaxed">
                  رَبِّ اغْفِرْ وَارْحَمْ وَاعْفُ وَتَكَرَّمْ وَتَجَاوَزْ عَمَّا تَعْلَمْ إِنَّكَ تَعْلَمُ مَا لَا نَعْلَمُ
                </p>
                <p className="italic text-slate-700">
                  Rabbighfir warham, wa\'fu wa takarram, wa tajaawaz \'amma ta\'lam, innaka ta\'lamu maa laa na\'lam.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'ihram' && (
            <div className="space-y-3 text-xs">
              <div className="bg-[#F7F8FA] border border-slate-200 rounded-2xl p-4 space-y-3">
                <span className="font-bold text-[#007A41] text-xs">Lafadz Niat Umroh di Miqat</span>
                <p className="text-right text-xl font-serif text-slate-900 leading-loose">
                  لَبَّيْكَ اللَّهُمَّ عُمْرَةً
                </p>
                <p className="italic text-slate-700 font-semibold">
                  Labbaika Allahumma \'umratan.
                </p>
                <p className="text-slate-600">
                  &quot;Aku sambut panggilan-Mu ya Allah untuk berumroh.&quot;
                </p>
              </div>

              <div className="bg-[#F7F8FA] border border-slate-200 rounded-2xl p-4 space-y-2">
                <span className="font-bold text-slate-900 text-xs">Bacaan Talbiyah:</span>
                <p className="text-right text-lg font-serif text-slate-900 leading-loose">
                  لَبَّيْكَ اللَّهُمَّ لَبَّيْكَ، لَبَّيْكَ لَا شَرِيكَ لَكَ لَبَّيْكَ، إِنَّ الْحَمْدَ وَالنِّعْمَةَ لَكَ وَالْمُلْكَ لَا شَرِيكَ لَكَ
                </p>
                <p className="italic text-slate-700">
                  Labbaik Allahumma labbaik, labbaika laa syariika laka labbaik. Innal hamda wan ni\'mata laka wal mulk, laa syariika lak.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'masjid' && (
            <div className="space-y-3 text-xs">
              <div className="bg-[#F7F8FA] border border-slate-200 rounded-2xl p-4 space-y-3">
                <span className="font-bold text-[#007A41] text-xs">Doa Melihat Ka&apos;bah</span>
                <p className="text-right text-lg font-serif text-slate-900 leading-loose">
                  اللَّهُمَّ زِدْ هَذَا الْبَيْتَ تَشْرِيفًا وَتَعْظِيمًا وَتَكْرِيمًا وَمَهَابَةً
                </p>
                <p className="italic text-slate-700">
                  Allahumma zid hadzal baita tasyriifan wa ta\'zhiiman wa takriiman wa mahaabah.
                </p>
                <p className="text-slate-600">
                  &quot;Ya Allah, tambahkanlah kemuliaan, keagungan, kehormatan, dan wibawa pada Rumah (Ka\'bah) ini.&quot;
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#03AC0E]" />
            Sesuai Tuntunan Sunnah Rasulullah SAW
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-[#005B31] text-white text-xs font-bold hover:bg-[#007A41] transition-colors cursor-pointer"
          >
            Tutup Panduan
          </button>
        </div>
      </div>
    </div>
  );
}
