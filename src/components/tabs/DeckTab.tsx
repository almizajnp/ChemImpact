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
    title: "Pencegahan Limbah",
    summary:
      "Lebih baik mencegah limbah sejak awal daripada harus mengolah atau membersihkan limbah yang timbul.",
    details:
      "Contohnya membawa botol minum sendiri lebih baik daripada mengolah limbah botol plastik yang menumpuk.",
    icon: <ShieldCheck size={38} className="text-emerald-700" />,
    color: "from-emerald-50 to-emerald-100 border-emerald-300",
  },
  {
    id: 2,
    title: "Ekonomi Atom",
    summary: "Memaksimalkan penggunaan atom dalam reaksi.",
    details:
      "Contohnya dalam kegiatan memasak, idealnya seluruh bahan yang kita digunakan menjadi bagian dari makanan tanpa menghasilkan sisa. Dalam reaksi kimia, kita usahakan atom-atom awal menjadi bagian dari produk akhir.",
    icon: <Layers size={38} className="text-cyan-700" />,
    color: "from-cyan-50 to-cyan-100 border-cyan-300",
  },
  {
    id: 3,
    title: "Sintesis Kimia Lebih Aman",
    summary: "Metode sintesis harus dirancang dengan meminimalkan zat beracun.",
    details:
      "Contohnya, dalam pembuatan sabun digunakan bahan dan proses yang tidak menghasilkan zat berbahaya, sehingga aman bagi kesehatan dan lingkungan.",
    icon: <Leaf size={38} className="text-lime-700" />,
    color: "from-lime-50 to-lime-100 border-lime-300",
  },
  {
    id: 4,
    title: "Desain Bahan Kimia Lebih Aman",
    summary:
      "Produk kimia harus dirancang dengan efektif dan tidak berbahaya bagi manusia dan lingkungan.",
    details:
      "Contohnya menggunakan produk sabun yang efektif membersihkan namun tidak membahayakan seperti menyebabkan iritasi kulit.",
    icon: <Sparkles size={38} className="text-yellow-600" />,
    color: "from-yellow-50 to-yellow-100 border-yellow-300",
  },
  {
    id: 5,
    title: "Pelarut dan Bahan Pembantu Lebih Aman",
    summary:
      "Penggunaan zat pembantu seperti pelarut dan zat pemisah sebaiknya dihindari serta dipastikan tidak berbahaya.",
    details:
      "Contohnya dalam kegiatan praktikum, penggunaan air sebagai pelarut lebih diutamakan dibandingkan pelarut organik berbahaya. Air bersifat lebih aman, tidak beracun, dan mudah diperoleh.",
    icon: <Droplet size={38} className="text-sky-600" />,
    color: "from-sky-50 to-sky-100 border-sky-300",
  },
  {
    id: 6,
    title: "Efisiensi Energi",
    summary:
      "Kebutuhan energi dalam proses kimia harus diminimalkan dengan mempertimbangkan dampak lingkungan dan ekonomi.",
    details:
      "Contohnya memasak menggunakan api secukupnya atau menggunakan peralatan hemat energi karena reaksi pada suhu dan tekanan rendah dapat menghemat energi.",
    icon: <BatteryCharging size={38} className="text-orange-600" />,
    color: "from-orange-50 to-orange-100 border-orange-300",
  },
  {
    id: 7,
    title: "Bahan Baku Terbarukan",
    summary:
      "Bahan baku sebaiknya berasal dari sumber terbarukan, bukan yang tidak terbarukan.",
    details:
      "Contohnya menggunakan bioetanol dari tumbuhan sebagai bahan bakar karena dapat diperbarui daripada menggunakan bahan bakar bensin dari minyak bumi.",
    icon: <Globe2 size={38} className="text-emerald-700" />,
    color: "from-emerald-50 to-emerald-100 border-emerald-300",
  },
  {
    id: 8,
    title: "Sederhanakan Turunan",
    summary:
      "Menggunaan bahan kimia derivatif sebaiknya dihindari atau diminimalkan karena menambah tahapan, energi, dan limbah.",
    details:
      "Contohnya memilih cara paling sederhana tanpa banyak langkah tambahan; dalam kimia hal ini berarti menghindari penggunaan bahan tambahan yang tidak perlu karena dapat menambah limbah.",
    icon: <BookOpen size={38} className="text-violet-700" />,
    color: "from-violet-50 to-violet-100 border-violet-300",
  },
  {
    id: 9,
    title: "Katalisis",
    summary:
      "Katalis dapat mengurangi energi, bahan pereaksi, waktu reaksi, serta meningkatkan keamanan reaksi.",
    details:
      "Contohnya pada pembuatan roti atau tempe digunakan ragi sebagai katalis yang mempercepat proses fermentasi",
    icon: <Flame size={38} className="text-red-600" />,
    color: "from-red-50 to-red-100 border-red-300",
  },
  {
    id: 10,
    title: "Desain untuk Degradasi",
    summary:
      "Produk kimia harus dirancang agar mudah terurai setelah digunakan dan tidak menghasilkan zat berbahaya di lingkungan.",
    details:
      "Contohnya penggunaan daun pisang sebagai pembungkus makanan merupakan contoh bahan yang mudah terurai di alam. Setelah dibuang, bahan tersebut tidak mencemari lingkungan karena dapat terdegradasi secara alami.",
    icon: <Recycle size={38} className="text-cyan-700" />,
    color: "from-cyan-50 to-cyan-100 border-cyan-300",
  },
  {
    id: 11,
    title: "Analisis Real-time",
    summary:
      "Memantau real-time untuk mengendalikan proses dan mencegah terbentuknya zat berbahaya.",
    details:
      "Contohnya saat memasak, kita harus terus memantau makanan agar tidak gosong. Dalam proses kimia, pemantauan dilakukan secara terus-menerus agar jika mulai terbentuk zat berbahaya, proses dapat segera dihentikan atau dikendalikan.",
    icon: <Globe size={38} className="text-blue-700" />,
    color: "from-blue-50 to-blue-100 border-blue-300",
  },
  {
    id: 12,
    title: "Kimia yang Lebih Aman untuk Pencegahan Kecelakaan",
    summary:
      "Peminimalan risiko melalui pemilihan pereaksi yang lebih aman untuk mengurangi potensi kecelakaan.",
    details:
      "Contohnya memilih bahan kimia yang tidak mudah terbakar atau meledak untuk digunakan dalam laboratorium sekolah, sehingga mengurangi risiko kecelakaan.",
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
            const index = sectionRefs.current.indexOf(
              entry.target as HTMLElement,
            );
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
      <div
        className="sticky top-4 z-40 flex justify-center gap-3 mb-6 py-3 backdrop-blur-md rounded-full w-fit mx-auto px-6 shadow-sm border"
        style={{
          backgroundColor: theme?.secondary
            ? `${theme.secondary}95`
            : "rgba(255,255,255,0.95)",
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
        ref={(el) => {
          if (el) sectionRefs.current[0] = el;
        }}
        className="rounded-2xl shadow-sm p-6 mb-8 scroll-mt-24 transition-all hover:shadow-md"
        style={{
          backgroundColor: theme?.secondary
            ? `${theme.secondary}e0`
            : "#111827",
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
          <div
            className="rounded-3xl p-8 text-white shadow-xl border"
            style={{
              backgroundImage: `linear-gradient(135deg, ${theme?.primary ?? "#3b82f6"}, ${theme?.secondary ?? "#8b5cf6"})`,
              borderColor: theme?.primary ?? "#3b82f6",
            }}
          >
            <h3 className="text-2xl font-bold mb-6">
              Green Chemistry bukan sekadar teori
            </h3>
            <div className="space-y-4 text-base leading-relaxed">
              <p>
                Green chemistry bukan sekedar teori namun pendekatan ilmu kimia
                yang menekankan pada perancangan dan proses kimia yang dapat
                mengurangi atau menghilangkan penggunaan dan pembentukan bahan
                kimia berbahaya.
              </p>
              <p>
                Fokus dari Green Chemistry sederhana namun powerful yaitu
                menggunakan bahan tidak berbahaya, desain proses yang efisien,
                dan menciptakan produk yang mudah terurai tanpa meninggalkan
                kerusakan.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        ref={(el) => {
          if (el) sectionRefs.current[1] = el;
        }}
        className="rounded-2xl shadow-sm p-6 mb-8 scroll-mt-24 transition-all hover:shadow-md"
        style={{
          backgroundColor: theme?.secondary
            ? `${theme.secondary}e0`
            : "#111827",
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
              Green Chemistry penting karena membantu membangun sistem kimia
              yang selaras dengan tujuan pembangunan berkelanjutan. Dengan
              merancang proses dan produk yang lebih aman, hemat sumber daya,
              dan ramah lingkungan, Green Chemistry mendukung praktik industri
              dan penelitian yang tidak merusak ekosistem.
            </p>
            <p className="text-white leading-relaxed text-lg">
              Hubungan Green Chemistry dengan Education for Sustainable
              Development (ESD) muncul saat pembelajaran kimia tidak hanya fokus
              pada teori, tetapi juga pada penerapan prinsip keberlanjutan dalam
              kehidupan sehari-hari. ESD melalui kimia hijau menguatkan
              kompetensi siswa untuk menjadi pelaku perubahan yang kritis,
              kreatif, dan bertanggung jawab.
            </p>
          </div>

          <div
            className="rounded-3xl border p-6 shadow-sm"
            style={{
              backgroundColor: theme?.primary
                ? `${theme.primary}d0`
                : "#1f2937",
              borderColor: theme?.primary ? `${theme.primary}80` : "#4b5563",
            }}
          >
            <h3 className="text-lg font-semibold text-white mb-4">
              Kaitan Green Chemistry dan Keberlanjutan
            </h3>
            <ul className="space-y-4">
              <li className="flex gap-3">
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-white/20 text-white">
                  SDG
                </span>
                <div>
                  <p className="font-semibold text-white">
                    Pembangunan Berkelanjutan
                  </p>
                  <p className="text-sm text-slate-200">
                    Green Chemistry mendukung tujuan seperti air bersih,
                    konsumsi bertanggung jawab, dan aksi iklim.
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-white/20 text-white">
                  ESD
                </span>
                <div>
                  <p className="font-semibold text-white">
                    Education for Sustainable Development
                  </p>
                  <p className="text-sm text-slate-200">
                    Green Chemistry dalam ESD membentuk siswa yang mampu membuat
                    keputusan kimia berkelanjutan.
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section
        ref={(el) => {
          if (el) sectionRefs.current[2] = el;
        }}
        className="rounded-2xl shadow-sm p-6 mb-8 scroll-mt-24 transition-all hover:shadow-md"
        style={{
          backgroundColor: theme?.secondary
            ? `${theme.secondary}e0`
            : "#111827",
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
              onClick={() => {
                if (flippedCard === card.id) {
                  // Card is closing
                  playSound("/audio/open.mp3");
                  setFlippedCard(null);
                } else {
                  // Card is opening
                  playSound("/audio/open.mp3");
                  setFlippedCard(card.id);
                }
              }}
              className="group perspective-1000 h-[320px]"
            >
              <motion.div
                className="relative w-full h-full rounded-[28px] shadow-xl"
                animate={{ rotateY: flippedCard === card.id ? 180 : 0 }}
                transition={{
                  duration: 0.6,
                  type: "spring",
                  stiffness: 220,
                  damping: 24,
                }}
                style={{ transformStyle: "preserve-3d" }}
              >
                <div
                  className={`absolute inset-0 rounded-[28px] border-2 p-6 text-gray-900 ${card.color}`}
                  style={{
                    backfaceVisibility: "hidden",
                    backgroundColor: "#fef3c7",
                  }}
                >
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <motion.div
                      className="rounded-3xl bg-white/80 p-4 shadow-inner mb-4 cursor-pointer"
                      animate={{ y: [0, -8, 0] }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      whileHover={{ scale: 1.15, rotate: 360 }}
                    >
                      {card.icon}
                    </motion.div>
                    <div className="text-xs uppercase tracking-[0.3em] text-gray-500 font-semibold mb-2">
                      Prinsip {card.id}
                    </div>
                    <h3 className="text-xl font-bold mb-3">{card.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed mb-4">
                      {card.summary}
                    </p>
                    <div className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-700">
                      penjelasan
                    </div>
                  </div>
                </div>

                <div
                  className={`absolute inset-0 rounded-[28px] border-2 p-6 text-gray-900 ${card.color}`}
                  style={{
                    backfaceVisibility: "hidden",
                    transform: "rotateY(180deg)",
                    backgroundColor: "#fef3c7",
                  }}
                >
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <motion.div
                      className="rounded-3xl bg-white/80 p-4 shadow-inner mb-4 cursor-pointer"
                      animate={{ y: [0, -8, 0] }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      whileHover={{ scale: 1.15, rotate: 360 }}
                    >
                      {card.icon}
                    </motion.div>
                    <div className="text-xs uppercase tracking-[0.3em] text-gray-500 font-semibold mb-2">
                      {card.title}
                    </div>
                    <h3 className="text-xl font-bold mb-3">Penjelasan</h3>
                    <p className="text-sm text-gray-600 leading-relaxed mb-4">
                      {card.details}
                    </p>
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
        ref={(el) => {
          if (el) sectionRefs.current[3] = el;
        }}
        className="rounded-2xl shadow-sm p-6 mb-8 scroll-mt-24 transition-all hover:shadow-md"
        style={{
          backgroundColor: theme?.secondary
            ? `${theme.secondary}e0`
            : "#111827",
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
          <div
            className="rounded-3xl border p-6 shadow-sm"
            style={{
              backgroundColor: theme?.primary
                ? `${theme.primary}d0`
                : "#111827",
              borderColor: theme?.primary ? `${theme.primary}80` : "#4b5563",
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white/20 text-white">
                <Droplet className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-white">
                  Green Chemistry Mengatasi Pencemaran Lingkungan Global
                </h3>
                <p className="text-sm text-slate-200 mt-1">
                  Peran kimia hijau dalam mengurangi limbah dan polusi air
                </p>
              </div>
            </div>
            <p className="text-slate-200 leading-relaxed text-sm">
              Green Chemistry adalah solusi nyata untuk mengatasi permasalahan
              pencemaran lingkungan seperti eutrofikasi perairan (algal bloom),
              polusi tanah, dan kontaminasi bahan kimia berbahaya. Dengan
              menerapkan prinsip Green Chemistry, kita bisa merancang produk dan
              proses yang tidak menghasilkan limbah beracun sejak dari awal.
            </p>
          </div>
          <div
            className="rounded-3xl border p-6 shadow-sm"
            style={{
              backgroundColor: theme?.primary
                ? `${theme.primary}d0`
                : "#111827",
              borderColor: theme?.primary ? `${theme.primary}80` : "#4b5563",
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white/20 text-white">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-white">
                  Kompetensi Antisipatif dalam Green Chemistry
                </h3>
                <p className="text-sm text-slate-200 mt-1">
                  Kemampuan untuk memikirkan dampak jangka panjang dari setiap
                  keputusan yang diambil.
                </p>
              </div>
            </div>
            <p className="text-slate-200 leading-relaxed text-sm">
              Green Chemistry mengembangkan kemampuan kita buat mengantisipasi:
              melihat ke depan, memahami dampak jangka panjang, dan bikin
              keputusan yang bijak buat generasi mendatang. Ini skill penting di
              era perubahan iklim global.
            </p>
          </div>
          <div
            className="rounded-3xl border p-6 shadow-sm"
            style={{
              backgroundColor: theme?.primary
                ? `${theme.primary}d0`
                : "#111827",
              borderColor: theme?.primary ? `${theme.primary}80` : "#4b5563",
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white/20 text-white">
                <Globe2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-white">
                  Green Chemistry dan Pendidikan Pembangunan Berkelanjutan (ESD)
                </h3>
                <p className="text-sm text-slate-200 mt-1">
                  Mengembangkan literasi kimia untuk keberlanjutan
                </p>
              </div>
            </div>
            <p className="text-slate-200 leading-relaxed text-sm">
              Green Chemistry adalah kunci dalam Education for Sustainable
              Development (ESD). Dengan mempelajari dan menerapkan 12 prinsip
              Green Chemistry, siswa dapat membangun pemahaman kritis tentang
              bagaimana pilihan kimia mempengaruhi masa depan planet. ESD
              melalui Green Chemistry menciptakan generasi yang sadar dan
              bertanggung jawab terhadap keberlanjutan.
            </p>
          </div>
          <div
            className="rounded-3xl border p-6 shadow-sm"
            style={{
              background:
                theme?.primary && theme?.secondary
                  ? `linear-gradient(to right, ${theme.primary}, ${theme.secondary})`
                  : "linear-gradient(to right, #0ea5e9, #10b981)",
              borderColor: theme?.primary
                ? `${theme.primary}80`
                : "transparent",
            }}
          >
            <div className="flex flex-col gap-4 h-full">
              <div className="inline-flex items-center gap-3">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white/20">
                  <Lightbulb className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-white">
                  Kenapa kamu harus tertarik?
                </h3>
              </div>
              <p className="leading-relaxed text-sm text-white">
                Green Chemistry memberi kamu kesempatan untuk melihat kimia
                sebagai kekuatan positif: menciptakan solusi, melindungi
                lingkungan, dan menjawab tantangan pembangunan berkelanjutan.
                Bila kamu belajar ini, kamu ikut membangun masa depan yang lebih
                bersih.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
