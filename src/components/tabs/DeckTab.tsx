import React, { useRef, useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  BookOpen,
  Lightbulb,
  Leaf,
  Sparkles,
  Globe2,
  Recycle,
  Droplet,
  Flame,
  Bolt,
  ShieldCheck,
  BatteryCharging,
  Layers,
  Eye,
  Globe,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAudio } from "../../hooks/useAudio";

const principleCards = [
  {
    id: 1,
    title: "Mencegah limbah",
    summary: "Cegah limbah sebelum terbentuk.",
    details:
      "Lebih baik mencegah limbah sejak awal daripada harus membersihkan polusi nanti. Jadi kita design proses kimia yang dari awal tidak menghasilkan buangan berbahaya.",
    icon: <ShieldCheck size={38} className="text-emerald-700" />,
    color: "from-emerald-50 to-emerald-100 border-emerald-300",
  },
  {
    id: 2,
    title: "Ekonomi Atom",
    summary: "Gunakan semua atom dalam reaksi.",
    details:
      "Bayangkan membuat resep masakan. Ideal kalau semua bahan yang kita pakai jadi hidangan akhir, bukan jadi sampah. Di reaksi kimia, kita usahakan atom-atom dari awal bahan jadi produk akhir.",
    icon: <Layers size={38} className="text-cyan-700" />,
    color: "from-cyan-50 to-cyan-100 border-cyan-300",
  },
  {
    id: 3,
    title: "Kurangi Bahaya",
    summary: "Pilih reaksi yang lebih aman.",
    details:
      "Gak perlu pakai bahan yang beracun atau berbahaya kalau ada alternatif yang lebih aman. Kita pilih material dan kondisi reaksi yang nggak bikin kerusakan sama manusia dan alam.",
    icon: <Leaf size={38} className="text-lime-700" />,
    color: "from-lime-50 to-lime-100 border-lime-300",
  },
  {
    id: 4,
    title: "Desain Kimia Lebih Aman",
    summary: "Produk akhir harus aman.",
    details:
      "Produk akhir harus dirancang supaya aman buat manusia, hewan, dan lingkungan sekitarnya. Jadi meskipun berguna, produk nggak boleh bikin orang sakit atau merusak alam.",
    icon: <Sparkles size={38} className="text-yellow-600" />,
    color: "from-yellow-50 to-yellow-100 border-yellow-300",
  },
  {
    id: 5,
    title: "Pelarut Lebih Aman",
    summary: "Gunakan pelarut yang ramah.",
    details:
      "Pelarut yang kita pakai dalam reaksi juga harus dipikirkan. Pilih yang mudah terurai dan nggak beracun, bukan yang tahan lama di lingkungan dan nyebabkan masalah.",
    icon: <Droplet size={38} className="text-sky-600" />,
    color: "from-sky-50 to-sky-100 border-sky-300",
  },
  {
    id: 6,
    title: "Efisiensi Energi",
    summary: "Hemat energi dalam reaksi.",
    details:
      "Reaksi kimia yang butuh energy gemedean bekin merusak lingkungan. Jadi kita cari cara buat reaksi jalan di suhu dan tekanan rendah supaya hemat listrik dan ramah bumi.",
    icon: <BatteryCharging size={38} className="text-orange-600" />,
    color: "from-orange-50 to-orange-100 border-orange-300",
  },
  {
    id: 7,
    title: "Bahan Baku Terbarukan",
    summary: "Pilih bahan baku terbarukan.",
    details:
      "Daripada terus pakai bahan fosil yang terbatas, lebih baik pakai sumber bahan yang bisa tumbuh lagi kayak tanaman atau limbah biomassa. Itu lebih sustainable buat masa depan.",
    icon: <Globe2 size={38} className="text-emerald-700" />,
    color: "from-emerald-50 to-emerald-100 border-emerald-300",
  },
  {
    id: 8,
    title: "Kurangi Tahap Derivasi",
    summary: "Minimalkan langkah tambahan.",
    details:
      "Semakin banyak langkah dalam reaksi, semakin banyak limbah yang dihasilkan. Jadi kita simplify prosesnya, langsung dari bahan awal jadi produk akhir tanpa terlalu banyak perantara.",
    icon: <BookOpen size={38} className="text-violet-700" />,
    color: "from-violet-50 to-violet-100 border-violet-300",
  },
  {
    id: 9,
    title: "Katalisis",
    summary: "Gunakan katalis untuk efisiensi.",
    details:
      "Katalis kayak pembantu yang mempercepat reaksi tapi nggak habis terpakai. Dengan katalis, reaksi jalan lebih cepat dan efisien tanpa mbuang-buang bahan.",
    icon: <Flame size={38} className="text-red-600" />,
    color: "from-red-50 to-red-100 border-red-300",
  },
  {
    id: 10,
    title: "Desain untuk Penguraian",
    summary: "Jadikan produk mudah terurai.",
    details:
      "Bayangin produk yang kita buat akhirnya jadi sampah di alam. Lebih baik design-nya supaya mudah terurai dan gak meninggalkan jejak bahaya. Gitu cara berpikir green chemistry.",
    icon: <Recycle size={38} className="text-cyan-700" />,
    color: "from-cyan-50 to-cyan-100 border-cyan-300",
  },
  {
    id: 11,
    title: "Analisis Real-time",
    summary: "Pantau reaksi untuk cegah polusi.",
    details:
      "Kalau kita bisa monitor reaksi secara riil (langsung sambil jalan), kita bisa tangkap emisi berbahaya sebelum terbang ke udara. Jadi pencegahan lebih efektif daripada pembersihan.",
    icon: <Globe size={38} className="text-blue-700" />,
    color: "from-blue-50 to-blue-100 border-blue-300",
  },
  {
    id: 12,
    title: "Keamanan Intrinsik",
    summary: "Pilih bahan yang minim risiko.",
    details:
      "Ada bahan yang secara alami lebih aman dibanding bahan lain. Dengan milih bahan yang inherently safer, kita minimize risiko kecelakaan dan dampak buruk ke lingkungan.",
    icon: <ShieldCheck size={38} className="text-slate-700" />,
    color: "from-slate-50 to-slate-100 border-slate-300",
  },
];

interface DeckTabProps {
  currentBg?: string;
  theme?: { id: string; name: string; primary: string; secondary: string };
}

export default function DeckTab({ currentBg = "bg.png", theme }: DeckTabProps) {
  const { playSound } = useAudio();
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);
  const [activeSection, setActiveSection] = useState(0);
  const [flippedCard, setFlippedCard] = useState<number | null>(null);

  const scrollToSection = (index: number) => {
    if (index < 0 || index >= 4) return;
    setActiveSection(index);
    sectionRefs.current[index]?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = sectionRefs.current.indexOf(entry.target as HTMLElement);
            if (index !== -1) {
              setActiveSection(index);
            }
          }
        });
      },
      {
        root: null,
        rootMargin: "-35% 0px -35% 0px",
        threshold: 0.1,
      },
    );

    sectionRefs.current.forEach((section) => {
      if (section) observer.observe(section);
    });

    return () => {
      sectionRefs.current.forEach((section) => {
        if (section) observer.unobserve(section);
      });
    };
  }, []);

  return (
    <div
      className="pt-20 pb-24 px-4 min-h-screen text-white font-sans relative"
      style={{
        backgroundImage: `url(/images/${currentBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="sticky top-4 z-40 flex justify-center gap-3 mb-6 py-3 backdrop-blur-md rounded-full w-fit mx-auto px-6 shadow-sm border"
        style={{
          backgroundColor: theme?.secondary ? `${theme.secondary}95` : "rgba(255,255,255,0.95)",
          borderColor: theme?.primary ?? "#e5e7eb",
        }}
      >
        {[0, 1, 2, 3].map((index) => (
          <button
            key={index}
            onClick={() => scrollToSection(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              activeSection === index
                ? "bg-emerald-600 scale-125 w-6"
                : "bg-gray-300 hover:bg-gray-400"
            }`}
            aria-label={`Go to section ${index + 1}`}
          />
        ))}
      </div>

      <section
        ref={(el) => (sectionRefs.current[0] = el)}
        className="rounded-2xl shadow-sm p-6 mb-8 scroll-mt-24 transition-all hover:shadow-md"
        style={{
          backgroundColor: theme?.secondary ? `${theme.secondary}e0` : "#111827",
        }}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-full bg-violet-100">
            <BookOpen className="text-violet-600 w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white font-poppins">
              Apa itu Green Chemistry?
            </h2>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-200 font-semibold mt-1">
              Dasar penting bagi kimia masa depan
            </p>
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-3xl p-8 text-white shadow-xl border"
            style={{
              backgroundImage: `linear-gradient(135deg, ${theme?.primary ?? "#3b82f6"}, ${theme?.secondary ?? "#8b5cf6"})`,
              borderColor: theme?.primary ?? "#3b82f6",
            }}
          >
            <h3 className="text-2xl font-bold mb-6">Green Chemistry bukan sekadar teori</h3>
            <div className="space-y-4 text-base leading-relaxed">
              <p>
                Green chemistry bukan sekedar teori namun pendekatan ilmu kimia yang menekankan pada perancangan dan proses kimia yang dapat mengurangi atau menghilangkan penggunaan dan pembentukan bahan kimia berbahaya.
              </p>
              <p>
                Fokus dari GC sederhana namun powerful yaitu menggunakan bahan tidak berbahaya, design proses yang efisien, dan ciptakan produk yang mudah terurai tanpa meninggalkan kerusakan.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        ref={(el) => (sectionRefs.current[1] = el)}
        className="rounded-2xl shadow-sm p-6 mb-8 scroll-mt-24 transition-all hover:shadow-md"
        style={{
          backgroundColor: theme?.secondary ? `${theme.secondary}e0` : "#111827",
        }}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-full bg-sky-100">
            <Globe2 className="text-sky-600 w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white font-poppins">
              Mengapa Green Chemistry Penting?
            </h2>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-200 font-semibold mt-1">
              Hubungan green chemistry dengan keberlanjutan
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[2fr_1fr] items-start">
          <div className="space-y-5">
            <p className="text-white leading-relaxed text-lg">
              Green Chemistry penting karena membantu membangun sistem kimia yang selaras dengan tujuan pembangunan berkelanjutan. Dengan merancang proses dan produk yang lebih aman, hemat sumber daya, dan ramah lingkungan, GC mendukung praktik industri dan penelitian yang tidak merusak ekosistem.
            </p>
            <p className="text-white leading-relaxed text-lg">
              Hubungan GC dengan Education for Sustainable Development (ESD) muncul saat pembelajaran kimia tidak hanya fokus pada teori, tetapi juga pada penerapan prinsip keberlanjutan dalam kehidupan sehari-hari. ESD melalui kimia hijau menguatkan kompetensi siswa untuk menjadi pelaku perubahan yang kritis, kreatif, dan bertanggung jawab.
            </p>
          </div>

          <div className="rounded-3xl border p-6 shadow-sm"
            style={{
              backgroundColor: theme?.primary ? `${theme.primary}d0` : "#1f2937",
              borderColor: theme?.primary ? `${theme.primary}80` : "#4b5563",
            }}
          >
            <h3 className="text-lg font-semibold text-white mb-4">Kaitan Green Chemistry dan Keberlanjutan</h3>
            <ul className="space-y-4">
              <li className="flex gap-3">
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-white/20 text-white">SDG</span>
                <div>
                  <p className="font-semibold text-white">Pembangunan Berkelanjutan</p>
                  <p className="text-sm text-slate-200">GC mendukung tujuan seperti air bersih, konsumsi bertanggung jawab, dan aksi iklim.</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-white/20 text-white">ESD</span>
                <div>
                  <p className="font-semibold text-white">Education for Sustainable Development</p>
                  <p className="text-sm text-slate-200">GC dalam ESD membentuk siswa yang mampu membuat keputusan kimia berkelanjutan.</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section
        ref={(el) => (sectionRefs.current[2] = el)}
        className="rounded-2xl shadow-sm p-6 mb-8 scroll-mt-24 transition-all hover:shadow-md"
        style={{
          backgroundColor: theme?.secondary ? `${theme.secondary}e0` : "#111827",
        }}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-full bg-emerald-100">
            <Leaf className="text-emerald-700 w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white font-poppins">
              12 Prinsip Green Chemistry
            </h2>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-200 font-semibold mt-1">
              Klik kartu untuk membuka penjelasan lengkap
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {principleCards.map((card) => (
            <button
              key={card.id}
              type="button"
              onClick={() => setFlippedCard(flippedCard === card.id ? null : card.id)}
              className="group perspective-1000 h-[320px]"
            >
              <motion.div
                className="relative w-full h-full rounded-[28px] shadow-xl"
                animate={{ rotateY: flippedCard === card.id ? 180 : 0 }}
                transition={{ duration: 0.6, type: "spring", stiffness: 220, damping: 24 }}
                style={{ transformStyle: "preserve-3d" }}
              >
                <div
                  className={`absolute inset-0 rounded-[28px] border-2 p-6 text-gray-900 ${card.color}`}
                  style={{ backfaceVisibility: "hidden", backgroundColor: "#fef3c7" }}
                >
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <motion.div
                      className="rounded-3xl bg-white/80 p-4 shadow-inner mb-4 cursor-pointer"
                      animate={{ y: [0, -8, 0] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                      whileHover={{ scale: 1.15, rotate: 360 }}
                    >
                      {card.icon}
                    </motion.div>
                    <div className="text-xs uppercase tracking-[0.3em] text-gray-500 font-semibold mb-2">
                      Prinsip {card.id}
                    </div>
                    <h3 className="text-xl font-bold mb-3">{card.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed mb-4">{card.summary}</p>
                    <div className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-700">
                      penjelasan
                    </div>
                  </div>
                </div>

                <div
                  className={`absolute inset-0 rounded-[28px] border-2 p-6 text-gray-900 ${card.color}`}
                  style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)", backgroundColor: "#fef3c7" }}
                >
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <motion.div
                      className="rounded-3xl bg-white/80 p-4 shadow-inner mb-4 cursor-pointer"
                      animate={{ y: [0, -8, 0] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                      whileHover={{ scale: 1.15, rotate: 360 }}
                    >
                      {card.icon}
                    </motion.div>
                    <div className="text-xs uppercase tracking-[0.3em] text-gray-500 font-semibold mb-2">
                      {card.title}
                    </div>
                    <h3 className="text-xl font-bold mb-3">Penjelasan</h3>
                    <p className="text-sm text-gray-600 leading-relaxed mb-4">{card.details}</p>
                    <div className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-700">
                      Klik lagi untuk tutup
                    </div>
                  </div>
                </div>
              </motion.div>
            </button>
          ))}
        </div>
      </section>

      <section
        ref={(el) => (sectionRefs.current[3] = el)}
        className="rounded-2xl shadow-sm p-6 mb-8 scroll-mt-24 transition-all hover:shadow-md"
        style={{
          backgroundColor: theme?.secondary ? `${theme.secondary}e0` : "#111827",
        }}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-full bg-blue-100">
            <Sparkles className="text-blue-600 w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white font-poppins">
              Fakta Menarik Green Chemistry
            </h2>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-200 font-semibold mt-1">
              Biar makin penasaran belajar kimia hijau
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl border p-6 shadow-sm"
            style={{
              backgroundColor: theme?.primary ? `${theme.primary}d0` : "#111827",
              borderColor: theme?.primary ? `${theme.primary}80` : "#4b5563",
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white/20 text-white">
                <Droplet className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-white">GC Mengatasi Pencemaran Lingkungan Global</h3>
                <p className="text-sm text-slate-200 mt-1">Peran kimia hijau dalam mengurangi limbah dan polusi air</p>
              </div>
            </div>
            <p className="text-slate-200 leading-relaxed text-sm">
              Green Chemistry adalah solusi nyata untuk mengatasi permasalahan pencemaran lingkungan seperti eutrofikasi perairan (algal bloom), polusi tanah, dan kontaminasi bahan kimia berbahaya. Dengan menerapkan prinsip GC, kita bisa merancang produk dan proses yang tidak menghasilkan limbah beracun sejak dari awal.
            </p>
          </div>
          <div className="rounded-3xl border p-6 shadow-sm"
            style={{
              backgroundColor: theme?.primary ? `${theme.primary}d0` : "#111827",
              borderColor: theme?.primary ? `${theme.primary}80` : "#4b5563",
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white/20 text-white">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Kompetensi Antisipatif dalam Green Chemistry</h3>
                <p className="text-sm text-slate-200 mt-1">Thinking ahead untuk dampak jangka panjang dari setiap keputusan kimia.</p>
              </div>
            </div>
            <p className="text-slate-200 leading-relaxed text-sm">
              Green Chemistry mengembangkan kemampuan kita buat mengantisipasi: melihat ke depan, memahami dampak jangka panjang, dan bikin keputusan yang bijak buat generasi mendatang. Ini skill penting di era perubahan iklim global.
            </p>
          </div>
          <div className="rounded-3xl border p-6 shadow-sm"
            style={{
              backgroundColor: theme?.primary ? `${theme.primary}d0` : "#111827",
              borderColor: theme?.primary ? `${theme.primary}80` : "#4b5563",
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white/20 text-white">
                <Globe2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-white">GC dan Pendidikan Pembangunan Berkelanjutan (ESD)</h3>
                <p className="text-sm text-slate-200 mt-1">Mengembangkan literasi kimia untuk keberlanjutan</p>
              </div>
            </div>
            <p className="text-slate-200 leading-relaxed text-sm">
              Green Chemistry adalah kunci dalam Education for Sustainable Development (ESD). Dengan mempelajari dan menerapkan 12 prinsip GC, siswa dapat membangun pemahaman kritis tentang bagaimana pilihan kimia mempengaruhi masa depan planet. ESD melalui GC menciptakan generasi yang sadar dan bertanggung jawab terhadap keberlanjutan.
            </p>
          </div>
        </div>

        <div 
          className="mt-8 rounded-3xl p-6 text-white shadow-xl"
          style={{
            background: theme?.primary && theme?.secondary 
              ? `linear-gradient(to right, ${theme.primary}, ${theme.secondary})`
              : "linear-gradient(to right, #0ea5e9, #10b981)"
          }}
        >
          <div className="flex flex-col gap-4">
            <div className="inline-flex items-center gap-3">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white/20">
                <Lightbulb className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold">Kenapa kamu harus tertarik?</h3>
            </div>
            <p className="leading-relaxed text-sm">
              Green Chemistry memberi kamu kesempatan untuk melihat kimia sebagai kekuatan positif: menciptakan solusi, melindungi lingkungan, dan menjawab tantangan pembangunan berkelanjutan. Bila kamu belajar ini, kamu ikut membangun masa depan yang lebih bersih.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
