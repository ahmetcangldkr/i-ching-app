import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  Animated, StyleSheet, Dimensions, StatusBar, SafeAreaView
} from 'react-native';


const { width: SW } = Dimensions.get('window');

// ── DATA ─────────────────────────────────────────────────────────────────────

const LINE_MEANINGS = {
  yang: [
    'Sağlam bir temel — bu alanda güvendesin.',
    'Güç ve netlik — doğru yoldasın.',
    'Hareket zamanı — hareketsizlik seni zorlar.',
    'Denge noktası — dikkatli ama kararlı ol.',
    'Doruk noktası — en yüksek potansiyelin burada.',
    'Tamamlanma — döngü kapanıyor, yeni başlıyor.',
  ],
  yin: [
    'Belirsizlik var — sabırla bekle.',
    'Yumuşaklık gerekiyor — direnmek yorar.',
    'Geri çekilme anı — iç sesi dinle.',
    'Geçiş hali — acele etme, köklerin derinleşsin.',
    'Boşluk bir davet — neyi bırakman gerekiyor?',
    'Köklere dön — geçmişte cevap saklı.',
  ],
};

const HEXAGRAMS = {
  '111111': { num: 1, name: 'Qian — Yaratıcı', element: 'Gökyüzü', color: '#d4a04a', direction: 'Güney', season: 'Yaz', energyColor: 'Altın — bereket, netlik', advice: 'Harekete geç, beklemek sana zarar verir. Liderliği üstlen ve enerjini bir amaca yönelt.', desc: 'Büyük güç ve yaratıcı enerji seni bekliyor. Saf yang enerjisi seninle — cesur adımlar at, çünkü evren seni destekliyor.' },
  '000000': { num: 2, name: 'Kun — Alıcı', element: 'Toprak', color: '#c8b87a', direction: 'Kuzey', season: 'Kış', energyColor: 'Altın — bereket, netlik', advice: 'Kontrol etmeyi bırak. Dinle, gözlemle, kabul et — cevap zaten geliyor.', desc: 'Toprak gibi sabırlı ve kabul edici ol. Bu dönemde pasif kalmak güç değil, bilgeliktir.' },
  '100010': { num: 3, name: 'Zhun — Başlangıçtaki Güçlük', element: 'Su & Gök Gürültüsü', color: '#7a9bb5', direction: 'Doğu', season: 'İlkbahar', energyColor: 'Mavi — akış, sezgi', advice: 'Çabuk sonuç bekleme. Küçük adımlar at, destek ara ve sabırlı ol.', desc: 'Her büyük yolculuk karmaşayla başlar. Aceleci davranma; köklerin derinleşmesine izin ver.' },
  '010001': { num: 4, name: 'Meng — Gençlik Ahmaklığı', element: 'Su & Dağ', color: '#8ab5a0', direction: 'Kuzey-Doğu', season: 'Kış sonu', energyColor: 'Yeşil — büyüme, tazelik', advice: 'Bildiğini sanmaktan vazgeç. Mentor ya da yeni bakış açısı şu an altın değerindedir.', desc: 'Cevaplar sana hazır verilmeyecek — onları deneyimleyerek bulacaksın.' },
  '111010': { num: 5, name: 'Xu — Bekleme', element: 'Su & Gökyüzü', color: '#7a9bb5', direction: 'Batı', season: 'Sonbahar', energyColor: 'Mavi — akış, sezgi', advice: 'Zamanlamaya güven. Dinlen, beslen, güçlen — an gelecek.', desc: 'Doğru an henüz gelmedi. Bekleme bir strateji olabilir.' },
  '010111': { num: 6, name: 'Song — Çatışma', element: 'Gökyüzü & Su', color: '#b57a7a', direction: 'Kuzey-Batı', season: 'Geç sonbahar', energyColor: 'Mor-gri — geçiş, derin', advice: 'Kazanmak için savaşma, anlaşmak için konuş. Orta yolu bul.', desc: 'Haklı olsan bile kavgayı körükleme; en güçlü savaşçı savaşmadan kazanandır.' },
  '010000': { num: 7, name: 'Shi — Ordu', element: 'Toprak & Su', color: '#8a7a5a', direction: 'Kuzey', season: 'Kış', energyColor: 'Toprak — denge, köklülük', advice: 'Enerjiyi organize et. Disiplin ve adalet bu dönemde seni yükseltir.', desc: 'Liderlik zamanı. İnsanları ortak bir amaç etrafında topla.' },
  '000010': { num: 8, name: 'Bi — Birlik', element: 'Su & Toprak', color: '#7a9bb5', direction: 'Kuzey', season: 'Kış', energyColor: 'Mavi — akış, sezgi', advice: 'Gerçek bağlar karşılıklı besler. Yanlış ittifakları bırak.', desc: 'Gerçek bağlar kurma zamanı. Samimi ittifak, yalnız kazanılan zaferden değerlidir.' },
  '111011': { num: 9, name: 'Xiao Chu — Küçük Evcilleştirme', element: 'Rüzgar & Gökyüzü', color: '#a0c8a0', direction: 'Güney-Doğu', season: 'İlkbahar', energyColor: 'Yeşil — büyüme, tazelik', advice: 'Büyük hamle değil, ince dokunuş. Tutarlı küçük adımlar daha etkili.', desc: 'Büyük değişimler yerine küçük ayarlamalar zamanı.' },
  '110111': { num: 10, name: 'Lu — Yürüyüş', element: 'Gökyüzü & Göl', color: '#d4a04a', direction: 'Güney-Batı', season: 'Yaz', energyColor: 'Altın — bereket, netlik', advice: 'Korkuyla değil, saygıyla ilerle. Farkındalık seni korur.', desc: 'Tehlikeli bir yolda ilerliyorsun ama dikkatli adımlar seni koruyacak.' },
  '111000': { num: 11, name: 'Tai — Uyum', element: 'Toprak & Gökyüzü', color: '#a0c8a0', direction: 'Güney', season: 'İlkbahar-Yaz', energyColor: 'Yeşil — büyüme, tazelik', advice: 'Bu bereketli dönemin farkında ol. Cömert ol, paylaş.', desc: 'Altın bir dönemdesin. Yin ve yang dengede, akış serbest.' },
  '000111': { num: 12, name: 'Pi — Durgunluk', element: 'Gökyüzü & Toprak', color: '#8a7a8a', direction: 'Kuzey', season: 'Kış', energyColor: 'Mor-gri — geçiş, derin', advice: 'Zorlamak işe yaramaz. İçine çekil, güçlen, bekle.', desc: 'İletişim kopuk, enerji donmuş hissediyor. Karanlığın ardından ışık gelir.' },
  '101111': { num: 13, name: 'Tong Ren — Ortak İnsanlık', element: 'Gökyüzü & Ateş', color: '#d4844a', direction: 'Güney', season: 'Yaz', energyColor: 'Turuncu — ateş, dönüşüm', advice: 'Ortak zemin ara. Benzerliklerin üzerinden köprü kur.', desc: 'Topluluk ve işbirliği dönemin özü.' },
  '111101': { num: 14, name: 'Da You — Büyük Sahiplik', element: 'Ateş & Gökyüzü', color: '#d4a04a', direction: 'Güney', season: 'Yaz', energyColor: 'Altın — bereket, netlik', advice: 'Cömert ol — bolluk paylaşıldığında büyür.', desc: 'Bolluk ve başarı kapında. Gerçek zenginlik akıtmaktır.' },
  '001000': { num: 15, name: 'Qian — Alçakgönüllülük', element: 'Toprak & Dağ', color: '#c8b87a', direction: 'Kuzey-Doğu', season: 'Kış', energyColor: 'Altın — bereket, netlik', advice: 'Büyüklüğünü sessizce taşı. Gerçek güç kendini kanıtlamaz.', desc: 'En yüksek dağ sessizce büyüktür.' },
  '000100': { num: 16, name: 'Yu — Coşku', element: 'Gök Gürültüsü & Toprak', color: '#d4844a', direction: 'Doğu', season: 'İlkbahar', energyColor: 'Turuncu — ateş, dönüşüm', advice: 'Coşkunu yönlendir, bastırma. İlham geldiğinde harekete geç.', desc: 'İlham ve hareket zamanı! İçindeki coşkuyu doğru kanale yönlendir.' },
  '100110': { num: 17, name: 'Sui — Takip Etme', element: 'Göl & Gök Gürültüsü', color: '#7ab5b5', direction: 'Doğu', season: 'İlkbahar', energyColor: 'Mavi — akış, sezgi', advice: "Ego'yu bırak ve akışı takip et.", desc: 'Şu an lider değil, takipçi ol. Doğal akışa kendini bırak.' },
  '011001': { num: 18, name: 'Gu — Bozulmuşun Onarımı', element: 'Dağ & Rüzgar', color: '#b5a07a', direction: 'Kuzey-Doğu', season: 'Kış sonu', energyColor: 'Toprak — denge, köklülük', advice: 'Kaçınma, yüzleş. Geçmişten gelen yükü bırak.', desc: 'Geçmişten miras kalan bir sorunu çözme zamanı.' },
  '110000': { num: 19, name: 'Lin — Yaklaşma', element: 'Toprak & Göl', color: '#a0c8a0', direction: 'Kuzey', season: 'Kış-İlkbahar', energyColor: 'Yeşil — büyüme, tazelik', advice: 'Fırsat yaklaşıyor ama uzun sürmez. Açık kapıdan geç.', desc: 'Büyük bir fırsat yaklaşıyor. Hazırlığını yap.' },
  '000011': { num: 20, name: 'Guan — Gözlem', element: 'Rüzgar & Toprak', color: '#a0b5c8', direction: 'Güney-Doğu', season: 'İlkbahar', energyColor: 'Mavi — akış, sezgi', advice: 'Hareketten önce gör. Büyük resmi görmeden adım atma.', desc: 'Harekete geçmeden önce gözlemle. Ağaca değil, ormana bak.' },
  '100101': { num: 21, name: 'Shi He — Isırma', element: 'Ateş & Gök Gürültüsü', color: '#d4844a', direction: 'Güney', season: 'Yaz', energyColor: 'Turuncu — ateş, dönüşüm', advice: 'Geciktirme — bu engeli şimdi aş. Kararlı ve net ol.', desc: 'Bir engeli köklü biçimde çözme zamanı.' },
  '101001': { num: 22, name: 'Bi — Zarafet', element: 'Dağ & Ateş', color: '#d4a04a', direction: 'Kuzey-Doğu', season: 'Kış', energyColor: 'Altın — bereket, netlik', advice: "Görünüşe önem ver ama özden taviz verme.", desc: 'Güzellik içten gelir. Nasıl sunduğun önemli bu dönemde.' },
  '000001': { num: 23, name: 'Bo — Parçalanma', element: 'Dağ & Toprak', color: '#8a7a8a', direction: 'Kuzey-Batı', season: 'Sonbahar', energyColor: 'Mor-gri — geçiş, derin', advice: 'Bırakmaya izin ver. Çöken şey artık sana ait değil.', desc: 'Eski yapılar çöküyor. Yıkım olmadan yeniden yapılanma olmaz.' },
  '100000': { num: 24, name: 'Fu — Dönüş', element: 'Toprak & Gök Gürültüsü', color: '#a0c8a0', direction: 'Kuzey', season: 'Kış dönümü', energyColor: 'Yeşil — büyüme, tazelik', advice: 'Yeni başlangıcı karşıla. Geçmişin ağırlığını bırak.', desc: 'Bir dönüş noktasındasın. Yeni bir başlangıç filizleniyor.' },
  '100111': { num: 25, name: 'Wu Wang — Saflık', element: 'Gökyüzü & Gök Gürültüsü', color: '#d4a04a', direction: 'Doğu', season: 'İlkbahar', energyColor: 'Altın — bereket, netlik', advice: 'Sonuçlara takılma, niyetine odaklan.', desc: 'Beklenti olmadan hareket et. Hesapsız, dürüst ve doğal ol.' },
  '111001': { num: 26, name: 'Da Chu — Büyük Evcilleştirme', element: 'Dağ & Gökyüzü', color: '#b5a07a', direction: 'Kuzey-Doğu', season: 'Kış', energyColor: 'Toprak — denge, köklülük', advice: 'Büyük gücü disiplinle yönlendir. Ham enerji tek başına yetmez.', desc: 'Büyük güçleri dizginleme ve yönlendirme zamanı.' },
  '100011': { num: 27, name: 'Yi — Beslenme', element: 'Dağ & Gök Gürültüsü', color: '#a0c8a0', direction: 'Kuzey-Doğu', season: 'Kış', energyColor: 'Yeşil — büyüme, tazelik', advice: 'Hem kendini hem çevrendekileri besle.', desc: 'Neyle beslendiğine dikkat et — hem bedenini hem ruhunu.' },
  '011110': { num: 28, name: 'Da Guo — Büyük Aşma', element: 'Göl & Rüzgar', color: '#b57a7a', direction: 'Batı', season: 'Sonbahar', energyColor: 'Mor-gri — geçiş, derin', advice: 'Yük çok ağır — bir şeyleri bırakma vakti.', desc: 'Aşırı yük altında kirişler kırılıyor. Ağır yükü hafiflet.' },
  '010010': { num: 29, name: 'Kan — Su', element: 'Su', color: '#7a9bb5', direction: 'Kuzey', season: 'Kış', energyColor: 'Mavi — akış, sezgi', advice: 'Su gibi ol — her engeli aşar. Direnmek değil, akmak kurtarır.', desc: 'Tehlike üstüne tehlike. Ama su kayaları delerek akar.' },
  '101101': { num: 30, name: 'Li — Ateş', element: 'Ateş', color: '#d4844a', direction: 'Güney', season: 'Yaz', energyColor: 'Turuncu — ateş, dönüşüm', advice: 'Tutku seni besliyor ama tüketiyor da. Sana enerji veren şeylere bağlı kal.', desc: 'Parlak ateş gibi yaşıyorsun — ışık veriyorsun ama yakıta muhtaçsın.' },
};

const TRIGRAMS = {
  '111': '☰ Gökyüzü', '000': '☷ Toprak', '100': '☳ Gök Gürültüsü',
  '010': '☵ Su', '001': '☶ Dağ', '110': '☴ Rüzgar', '101': '☲ Ateş', '011': '☱ Göl',
};

function getHexagram(lines) {
  return HEXAGRAMS[lines.join('')] || {
    num: 0, name: 'Gizemli Hexagram', element: 'Bilinmez', color: '#a08878',
    direction: 'Merkez', season: 'Dönüşüm', energyColor: 'Toprak — denge, köklülük',
    advice: 'Cevap belirsizliğin içinde saklı. Bilinmeyeni kucakla.',
    desc: 'Bu hexagram sana özel bir mesaj taşıyor. Sessizlikte dinle.',
  };
}
function getTrigramName(lines) { return TRIGRAMS[lines.join('')] || '☯ Gizemli'; }

// ── HEXAGRAM LINES ────────────────────────────────────────────────────────────

function HexagramDisplay({ lines }) {
  return (
    <View style={{ alignItems: 'center', gap: 8 }}>
      {[...lines].reverse().map((line, i) => (
        <View key={i}>
          {line === 1 ? (
            <View style={{ width: 90, height: 9, borderRadius: 5, backgroundColor: '#d4a04a' }} />
          ) : (
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <View style={{ width: 40, height: 9, borderRadius: 5, backgroundColor: '#7a9bb5' }} />
              <View style={{ width: 40, height: 9, borderRadius: 5, backgroundColor: '#7a9bb5' }} />
            </View>
          )}
        </View>
      ))}
    </View>
  );
}

// ── INTRO ─────────────────────────────────────────────────────────────────────

function IntroScreen({ onStart }) {
  const fade = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fade, { toValue: 1, duration: 1200, useNativeDriver: true }).start();
  }, []);

  return (
    <Animated.View style={[styles.centered, { opacity: fade, paddingHorizontal: 36 }]}>
      <Text style={styles.glyph}>☯</Text>
      <Text style={styles.title}>I Ching</Text>
      <Text style={styles.sub}>易經 · Değişimler Kitabı</Text>
      <View style={styles.divider} />
      <Text style={[styles.body, { textAlign: 'center', marginBottom: 40 }]}>
        {'Üç bin yılı aşkın geçmişiyle I Ching, evrenin değişim döngülerini ve insan yazgısını 64 hexagram aracılığıyla yorumlayan kadim Çin bilgelik kitabıdır.\n\nAltı satırdan oluşan her hexagram, yin ve yang\'ın farklı bileşimlerini temsil eder.\n\n'}
        <Text style={{ color: '#7a6445', fontStyle: 'italic' }}>Soruyu kalbinde tut. Cevap gelecek.</Text>
      </Text>
      <TouchableOpacity onPress={onStart} style={styles.btn} activeOpacity={0.7}>
        <Text style={styles.btnTxt}>Yorumlamaya Başla →</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ── MEDITATION ────────────────────────────────────────────────────────────────

function MeditationScreen({ onReady }) {
  const [breathPhase, setBreathPhase] = useState('in');
  const [done, setDone] = useState(false);
  const [countdown, setCountdown] = useState(8);
  const fade = useRef(new Animated.Value(0)).current;
  const orbScale = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.timing(fade, { toValue: 1, duration: 1000, useNativeDriver: true }).start();
  }, []);

  useEffect(() => {
    const iv = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) { clearInterval(iv); return 0; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    const sequence = [
      { phase: 'in', dur: 3000, scale: 1 },
      { phase: 'hold', dur: 2000, scale: 1 },
      { phase: 'out', dur: 3000, scale: 0.5 },
    ];
    let idx = 0, count = 0, timeout;
    const run = () => {
      const step = sequence[idx];
      setBreathPhase(step.phase);
      Animated.timing(orbScale, {
        toValue: step.scale,
        duration: step.dur,
        useNativeDriver: true,
      }).start();
      timeout = setTimeout(() => {
        idx = (idx + 1) % sequence.length;
        if (idx === 0) count++;
        if (count >= 1) { setDone(true); return; }
        run();
      }, step.dur);
    };
    run();
    return () => clearTimeout(timeout);
  }, []);

  const breathLabel = { in: 'Nefes al...', hold: 'Tut...', out: 'Yavaşça bırak...' };


  return (
    <Animated.View style={[styles.centered, { opacity: fade, paddingHorizontal: 32 }]}>
      {!done ? (
        <ScrollView contentContainerStyle={{ alignItems: 'center', paddingVertical: 40 }} showsVerticalScrollIndicator={false}>
          <Text style={{ color: 'rgba(100,75,35,0.6)', fontSize: 11, letterSpacing: 2, textAlign: 'center', marginBottom: 36 }}>
            🌑  Işıkları kıs · sessizliğe geç · gözlerini kapat
          </Text>

          {/* Orb */}
          <View style={{ height: 180, alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
            <Animated.View style={{
              width: 140, height: 140, borderRadius: 70,
              borderWidth: 1, borderColor: 'rgba(212,160,74,0.25)',
              backgroundColor: 'rgba(80,50,15,0.1)',
              alignItems: 'center', justifyContent: 'center',
              transform: [{ scale: orbScale }],
            }}>
              <Text style={{ fontSize: 32, color: 'rgba(212,160,74,0.4)' }}>☯</Text>
            </Animated.View>
          </View>

          <Text style={{ fontSize: 16, color: 'rgba(180,130,60,0.75)', letterSpacing: 2, marginBottom: 20, fontStyle: 'italic' }}>
            {breathLabel[breathPhase]}
          </Text>

          {/* Countdown */}
          <View style={{ alignItems: 'center', marginBottom: 36 }}>
            <View style={{ width: 64, height: 64, borderRadius: 32, borderWidth: 1, borderColor: 'rgba(212,160,74,0.3)', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(212,160,74,0.04)' }}>
              <Text style={{ color: 'rgba(212,160,74,0.75)', fontSize: 20 }}>{countdown}</Text>
            </View>
            <Text style={{ color: 'rgba(100,75,35,0.5)', fontSize: 10, letterSpacing: 2, marginTop: 6 }}>saniye sonra devam</Text>
          </View>

          <View style={{ borderTopWidth: 1, borderTopColor: 'rgba(212,160,74,0.08)', paddingTop: 24, width: '100%' }}>
            <Text style={{ color: 'rgba(212,160,74,0.4)', fontSize: 10, letterSpacing: 3, textAlign: 'center', marginBottom: 16 }}>
              SORUNLA İLGİLİ REHBERLİK
            </Text>
            {[
              { icon: '✗', text: '"Bugün ne yapmalıyım?" gibi anlık sorular sorma', col: 'rgba(200,80,60,0.65)' },
              { icon: '✗', text: '"Yarın kazanır mıyım?" gibi tahmin soruları sorma', col: 'rgba(200,80,60,0.65)' },
              { icon: '✓', text: 'Hayatının önemli bir dönüm noktasını, ilişkini ya da yolunu sor', col: 'rgba(80,180,100,0.65)' },
              { icon: '✓', text: 'Cevabı aylar, yıllar sonra anlam taşıyacak bir soru seç', col: 'rgba(80,180,100,0.65)' },
            ].map((item, i) => (
              <View key={i} style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
                <Text style={{ color: item.col, fontSize: 14, width: 16 }}>{item.icon}</Text>
                <Text style={{ color: 'rgba(150,115,65,0.75)', fontSize: 12, lineHeight: 19, flex: 1 }}>{item.text}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      ) : (
        <View style={{ alignItems: 'center' }}>
          <View style={{ width: 70, height: 70, borderRadius: 35, borderWidth: 1, borderColor: 'rgba(212,160,74,0.4)', alignItems: 'center', justifyContent: 'center', marginBottom: 28 }}>
            <Text style={{ fontSize: 30, color: '#d4a04a' }}>☯</Text>
          </View>
          <Text style={{ color: 'rgba(200,165,100,0.95)', fontSize: 22, letterSpacing: 3, marginBottom: 10 }}>Zihin hazır.</Text>
          <Text style={{ color: 'rgba(80,60,30,0.8)', fontSize: 13, marginBottom: 44, textAlign: 'center' }}>
            Soruyu kalbinde tut ve pullarını çek.
          </Text>
          <TouchableOpacity onPress={onReady} style={styles.btn} activeOpacity={0.7}>
            <Text style={styles.btnTxt}>Pulları Çek</Text>
          </TouchableOpacity>
        </View>
      )}
    </Animated.View>
  );
}

// ── DRAW ──────────────────────────────────────────────────────────────────────

function DrawScreen({ onComplete, drawCount }) {
  const TOKENS = [
    { id: 1, symbol: '陽', value: 1, label: 'Yang', color: '#d4a04a' },
    { id: 2, symbol: '陰', value: 0, label: 'Yin', color: '#7a9bb5' },
    { id: 3, symbol: '陽', value: 1, label: 'Yang', color: '#d4a04a' },
    { id: 4, symbol: '陰', value: 0, label: 'Yin', color: '#7a9bb5' },
    { id: 5, symbol: '陽', value: 1, label: 'Yang', color: '#d4a04a' },
    { id: 6, symbol: '陰', value: 0, label: 'Yin', color: '#7a9bb5' },
  ];

  const [bag, setBag] = useState([]);
  const [drawn, setDrawn] = useState([]);
  const [flash, setFlash] = useState(null);
  const shakeX = useRef(new Animated.Value(0)).current;
  const flashOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setBag([...TOKENS].sort(() => Math.random() - 0.5));
    setDrawn([]);
  }, [drawCount]);

  const drawToken = () => {
    if (bag.length === 0 || drawn.length >= 6) return;
    Animated.sequence([
      Animated.timing(shakeX, { toValue: 10, duration: 70, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: -10, duration: 70, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: 6, duration: 70, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: 0, duration: 70, useNativeDriver: true }),
    ]).start();

    setTimeout(() => {
      const idx = Math.floor(Math.random() * bag.length);
      const token = bag[idx];
      const newBag = bag.filter((_, i) => i !== idx);
      const newDrawn = [...drawn, token];
      setBag(newBag);
      setDrawn(newDrawn);
      setFlash(token);
      flashOpacity.setValue(1);
      Animated.timing(flashOpacity, { toValue: 0, duration: 900, useNativeDriver: true }).start();
      if (newDrawn.length === 6) {
        setTimeout(() => onComplete(newDrawn.map(t => t.value)), 900);
      }
    }, 350);
  };

  return (
    <ScrollView contentContainerStyle={{ alignItems: 'center', paddingVertical: 40, paddingHorizontal: 24 }}>
      <Text style={[styles.glyph, { fontSize: 38, marginBottom: 6 }]}>卦</Text>
      <Text style={[styles.title, { fontSize: 22 }]}>Hexagramını Çek</Text>
      <Text style={styles.sub}>Altı pul — altı satır</Text>
      <View style={styles.divider} />

      <Text style={{ color: '#c8a97e', fontSize: 14, marginBottom: 4 }}>Torbadan {drawn.length}/6 pul çekildi</Text>
      <Text style={{ color: '#5a4a35', fontSize: 11, marginBottom: 28 }}>Her çekiş hexagramının bir satırını belirler</Text>

      <TouchableOpacity onPress={drawToken} activeOpacity={0.8}>
        <Animated.View style={{ transform: [{ translateX: shakeX }] }}>
          {/* Torba */}
          <View style={{ width: 130, height: 150, alignItems: 'center', justifyContent: 'flex-end' }}>
            {/* İp / bağlama */}
            <View style={{ position: 'absolute', top: 0, alignItems: 'center' }}>
              <View style={{ width: 2, height: 18, backgroundColor: '#8b6420' }} />
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ width: 2, height: 14, backgroundColor: '#8b6420', transform: [{ rotate: '-15deg' }] }} />
                <View style={{ width: 2, height: 14, backgroundColor: '#8b6420', transform: [{ rotate: '15deg' }] }} />
              </View>
            </View>
            {/* Torba gövdesi */}
            <View style={{
              width: 110, height: 110,
              borderRadius: 55,
              backgroundColor: '#5a3510',
              borderWidth: 2, borderColor: '#8b6420',
              alignItems: 'center', justifyContent: 'center',
              shadowColor: '#d4a04a', shadowOpacity: 0.3, shadowRadius: 15,
              overflow: 'hidden',
            }}>
              {/* Kadife doku efekti */}
              <View style={{ position: 'absolute', top: 8, left: 8, width: 30, height: 30, borderRadius: 15, backgroundColor: 'rgba(255,200,100,0.08)' }} />
              <View style={{ position: 'absolute', bottom: 15, right: 12, width: 20, height: 20, borderRadius: 10, backgroundColor: 'rgba(0,0,0,0.15)' }} />
              {/* Sembol */}
              <Text style={{ fontSize: 36, color: 'rgba(212,160,74,0.6)' }}>☯</Text>
            </View>
            {/* Alt gölge */}
            <View style={{ width: 80, height: 8, borderRadius: 4, backgroundColor: 'rgba(0,0,0,0.3)', marginTop: 4 }} />
          </View>
          <View style={{ position: 'absolute', bottom: 16, left: 0, right: 0, alignItems: 'center' }}>
            <Text style={{ fontSize: 16, color: '#c8a97e' }}>{drawn.length < 6 ? '' : '✓'}</Text>
          </View>
          {drawn.length < 6 && (
            <View style={{ position: 'absolute', top: -6, right: -6, backgroundColor: '#d4a04a', borderRadius: 12, width: 26, height: 26, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: '#1a120a', fontSize: 11, fontWeight: 'bold' }}>{bag.length}</Text>
            </View>
          )}
        </Animated.View>
      </TouchableOpacity>

      {drawn.length < 6 && (
        <Text style={{ color: '#5a4a35', fontSize: 11, marginTop: 10 }}>Torbaya dokun — pul çek</Text>
      )}

      {flash && (
        <Animated.View style={{
          position: 'absolute', top: '30%', alignSelf: 'center',
          backgroundColor: 'rgba(5,3,2,0.97)',
          borderWidth: 2, borderColor: flash.color, borderRadius: 20,
          padding: 28, alignItems: 'center', opacity: flashOpacity,
        }}>
          <Text style={{ fontSize: 50, color: flash.color }}>{flash.symbol}</Text>
          <Text style={{ color: flash.color, fontSize: 15, marginTop: 8 }}>{flash.label}</Text>
        </Animated.View>
      )}

      <View style={{ marginTop: 24, gap: 8, width: '100%', alignItems: 'center' }}>
        {drawn.map((token, i) => (
          <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Text style={{ color: '#4a3c2c', fontSize: 10, width: 14 }}>{i + 1}</Text>
            {token.value === 1 ? (
              <View style={{ width: 76, height: 7, borderRadius: 3, backgroundColor: token.color }} />
            ) : (
              <View style={{ flexDirection: 'row', gap: 6 }}>
                <View style={{ width: 33, height: 7, borderRadius: 3, backgroundColor: token.color }} />
                <View style={{ width: 33, height: 7, borderRadius: 3, backgroundColor: token.color }} />
              </View>
            )}
            <Text style={{ color: token.color, fontSize: 10 }}>{token.label}</Text>
          </View>
        ))}
        {Array.from({ length: 6 - drawn.length }).map((_, i) => (
          <View key={'e' + i} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Text style={{ color: '#2a2018', fontSize: 10, width: 14 }}>{drawn.length + i + 1}</Text>
            <View style={{ width: 76, height: 7, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.05)' }} />
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

// ── RESULT ────────────────────────────────────────────────────────────────────

function ResultScreen({ lines, hexagram, onRestart, onHome }) {
  const fade = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fade, { toValue: 1, duration: 900, useNativeDriver: true }).start();
  }, []);

  return (
    <Animated.View style={{ flex: 1, opacity: fade }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 22, paddingTop: 16, paddingBottom: 50 }}>

        {/* Header */}
        <View style={{ alignItems: 'center', paddingBottom: 22, borderBottomWidth: 1, borderBottomColor: 'rgba(212,160,74,0.1)', marginBottom: 22 }}>
          <Text style={styles.hexNum}>— Hexagram {hexagram.num} —</Text>
          <Text style={[styles.title, { fontSize: 20, marginTop: 10 }]}>{hexagram.name}</Text>
          <Text style={[styles.sub, { marginBottom: 18 }]}>{hexagram.element}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 20 }}>
            <View style={{ alignItems: 'center' }}>
              <Text style={[styles.hexNum, { marginBottom: 5 }]}>Alt Trigram</Text>
              <Text style={{ color: '#c8a97e', fontSize: 11 }}>{getTrigramName(lines.slice(0, 3))}</Text>
            </View>
            <HexagramDisplay lines={lines} />
            <View style={{ alignItems: 'center' }}>
              <Text style={[styles.hexNum, { marginBottom: 5 }]}>Üst Trigram</Text>
              <Text style={{ color: '#c8a97e', fontSize: 11 }}>{getTrigramName(lines.slice(3))}</Text>
            </View>
          </View>
        </View>

        {/* Genel Yorum */}
        <Text style={[styles.hexNum, { marginBottom: 10 }]}>Genel Yorum</Text>
        <Text style={{ color: '#b8996a', fontSize: 14, lineHeight: 24, fontStyle: 'italic', marginBottom: 22 }}>
          "{hexagram.desc}"
        </Text>
        <View style={styles.sep} />

        {/* Tavsiye */}
        <View style={{ backgroundColor: `${hexagram.color}12`, borderLeftWidth: 2, borderLeftColor: `${hexagram.color}55`, padding: 14, borderRadius: 4, marginBottom: 22 }}>
          <Text style={[styles.hexNum, { marginBottom: 8 }]}>✦  Ne Yapmalısın</Text>
          <Text style={{ color: '#d4c090', fontSize: 14, lineHeight: 23 }}>{hexagram.advice}</Text>
        </View>
        <View style={styles.sep} />

        {/* Satır Yorumları */}
        <Text style={[styles.hexNum, { marginBottom: 12 }]}>Satır Yorumları</Text>
        {lines.map((line, i) => {
          const isYang = line === 1;
          return (
            <View key={i} style={{
              flexDirection: 'row', gap: 10, marginBottom: 9, padding: 11,
              backgroundColor: isYang ? 'rgba(212,160,74,0.05)' : 'rgba(122,155,181,0.05)',
              borderLeftWidth: 2, borderLeftColor: isYang ? 'rgba(212,160,74,0.3)' : 'rgba(122,155,181,0.25)',
              borderRadius: 3,
            }}>
              <View style={{ paddingTop: 5 }}>
                {isYang ? (
                  <View style={{ width: 20, height: 4, borderRadius: 2, backgroundColor: '#d4a04a' }} />
                ) : (
                  <View style={{ flexDirection: 'row', gap: 3 }}>
                    <View style={{ width: 8, height: 4, borderRadius: 2, backgroundColor: '#7a9bb5' }} />
                    <View style={{ width: 8, height: 4, borderRadius: 2, backgroundColor: '#7a9bb5' }} />
                  </View>
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: isYang ? 'rgba(212,160,74,0.5)' : 'rgba(122,155,181,0.5)', fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 3 }}>
                  {i + 1}. satır · {isYang ? 'Yang' : 'Yin'}
                </Text>
                <Text style={{ color: isYang ? '#c8a97e' : '#9ab5c8', fontSize: 13, lineHeight: 20 }}>
                  {LINE_MEANINGS[isYang ? 'yang' : 'yin'][i]}
                </Text>
              </View>
            </View>
          );
        })}
        <View style={styles.sep} />

        {/* Sembolik Eşleşmeler */}
        <Text style={[styles.hexNum, { marginBottom: 12 }]}>Sembolik Eşleşmeler</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 32 }}>
          {[
            { label: 'Element', value: hexagram.element },
            { label: 'Mevsim', value: hexagram.season },
            { label: 'Yön', value: hexagram.direction },
            { label: 'Renk Enerjisi', value: hexagram.energyColor },
          ].map((item, i) => (
            <View key={i} style={{
              width: (SW - 54) / 2, padding: 12,
              borderWidth: 1, borderColor: 'rgba(212,160,74,0.12)',
              borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.015)',
            }}>
              <Text style={{ color: '#5a4a30', fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 5 }}>{item.label}</Text>
              <Text style={{ color: '#c8a97e', fontSize: 13 }}>{item.value}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity onPress={onRestart} style={[styles.btn, { width: '100%', marginBottom: 10 }]} activeOpacity={0.7}>
          <Text style={[styles.btnTxt, { textAlign: 'center' }]}>Yeniden Yorumla</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onHome} style={[styles.btn, { width: '100%', borderColor: 'rgba(122,155,181,0.3)' }]} activeOpacity={0.7}>
          <Text style={[styles.btnTxt, { color: '#7a9bb5', textAlign: 'center' }]}>Ana Sayfa</Text>
        </TouchableOpacity>
      </ScrollView>
    </Animated.View>
  );
}

// ── APP ───────────────────────────────────────────────────────────────────────

export default function App() {
  const [screen, setScreen] = useState('intro');
  const [showMed, setShowMed] = useState(false);
  const [lines, setLines] = useState([]);
  const [hexagram, setHexagram] = useState(null);
  const [drawCount, setDrawCount] = useState(0);

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0805" />
      {showMed ? (
        <MeditationScreen onReady={() => { setShowMed(false); setScreen('draw'); }} />
      ) : screen === 'intro' ? (
        <IntroScreen onStart={() => setShowMed(true)} />
      ) : screen === 'draw' ? (
        <DrawScreen
          drawCount={drawCount}
          onComplete={drawnLines => {
            setLines(drawnLines);
            setHexagram(getHexagram(drawnLines));
            setScreen('result');
          }}
        />
      ) : screen === 'result' && hexagram ? (
        <ResultScreen
          lines={lines}
          hexagram={hexagram}
          onRestart={() => { setScreen('draw'); setLines([]); setHexagram(null); setDrawCount(c => c + 1); }}
          onHome={() => { setScreen('intro'); setShowMed(false); setLines([]); setHexagram(null); }}
        />
      ) : null}
    </SafeAreaView>
  );
}

// ── STYLES ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0a0805',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glyph: {
    fontSize: 70,
    color: '#d4a04a',
    textAlign: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 30,
    fontWeight: '300',
    color: '#e8d5b0',
    letterSpacing: 4,
    textAlign: 'center',
    marginBottom: 6,
  },
  sub: {
    fontSize: 11,
    color: '#8a7455',
    letterSpacing: 4,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginBottom: 24,
  },
  divider: {
    width: 50,
    height: 1,
    backgroundColor: '#d4a04a',
    opacity: 0.35,
    marginVertical: 18,
    alignSelf: 'center',
  },
  body: {
    fontSize: 14,
    lineHeight: 26,
    color: '#b09070',
  },
  btn: {
    borderWidth: 1,
    borderColor: 'rgba(212,160,74,0.45)',
    paddingHorizontal: 30,
    paddingVertical: 13,
    borderRadius: 2,
    alignItems: 'center',
  },
  btnTxt: {
    color: '#d4a04a',
    fontSize: 12,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  hexNum: {
    fontSize: 10,
    color: '#5a4a35',
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  sep: {
    height: 1,
    backgroundColor: 'rgba(212,160,74,0.07)',
    marginBottom: 20,
  },
});
