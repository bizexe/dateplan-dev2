// Vercel Serverless Function for Plan Generation

// 主要エリアのデータ
const AREAS = {
  tokyo: { name: '東京駅周辺', lat: 35.6812, lng: 139.7671, station: '東京' },
  shibuya: { name: '渋谷', lat: 35.6580, lng: 139.7016, station: '渋谷' },
  shinjuku: { name: '新宿', lat: 35.6896, lng: 139.7006, station: '新宿' },
  yokohama: { name: '横浜', lat: 35.4437, lng: 139.6380, station: '横浜' },
  minatomirai: { name: 'みなとみらい', lat: 35.4576, lng: 139.6323, station: 'みなとみらい' },
  kamakura: { name: '鎌倉', lat: 35.3192, lng: 139.5467, station: '鎌倉' },
  odaiba: { name: 'お台場', lat: 35.6267, lng: 139.7750, station: 'お台場海浜公園' },
  ginza: { name: '銀座', lat: 35.6717, lng: 139.7649, station: '銀座' }
};

// デートプランのテンプレート
const PLAN_TEMPLATES = [
  {
    id: 'yokohama_romantic',
    name: '横浜ロマンティックデート',
    description: '海沿いの景色を楽しみながら、ショッピングとグルメを満喫',
    duration: 'half',
    tags: ['shopping', 'dining', 'sightseeing'],
    areas: ['yokohama', 'minatomirai'],
    timeline: [
      { time: '11:00', activity: '横浜駅集合', duration: 0, type: 'start' },
      { time: '11:15', activity: '横浜ベイクォーター', duration: 90, type: 'shopping', description: 'おしゃれなショップが並ぶベイサイドモール' },
      { time: '12:45', activity: 'ランチ', duration: 60, type: 'dining', needsRestaurant: true },
      { time: '14:00', activity: '赤レンガ倉庫へ移動', duration: 15, type: 'move' },
      { time: '14:15', activity: '赤レンガ倉庫散策', duration: 90, type: 'shopping', description: 'レトロな雰囲気のショッピングスポット' },
      { time: '15:45', activity: '大さん橋へ移動', duration: 10, type: 'move' },
      { time: '16:00', activity: '大さん橋でサンセット', duration: 60, type: 'nature', description: '横浜港を一望できる絶景スポット' },
      { time: '17:00', activity: 'ディナー', duration: 90, type: 'dining', needsRestaurant: true }
    ]
  },
  {
    id: 'kamakura_retro',
    name: '鎌倉レトロ散歩デート',
    description: '歴史ある街並みを歩きながら、食べ歩きと縁結び祈願',
    duration: 'full',
    tags: ['sightseeing', 'cafe', 'nature'],
    areas: ['kamakura'],
    timeline: [
      { time: '10:00', activity: '鎌倉駅集合', duration: 0, type: 'start' },
      { time: '10:15', activity: '小町通り食べ歩き', duration: 90, type: 'dining', description: '鎌倉名物のグルメを楽しむ' },
      { time: '11:45', activity: '鶴岡八幡宮参拝', duration: 60, type: 'sightseeing', description: '鎌倉を代表する神社' },
      { time: '13:00', activity: 'ランチ', duration: 60, type: 'dining', needsRestaurant: true },
      { time: '14:15', activity: '江ノ電で長谷へ移動', duration: 15, type: 'move' },
      { time: '14:30', activity: '長谷寺・大仏参拝', duration: 120, type: 'sightseeing', description: '鎌倉大仏と美しい庭園' },
      { time: '16:30', activity: '由比ヶ浜サンセット', duration: 60, type: 'nature', description: '海辺でロマンチックな夕日' }
    ]
  },
  {
    id: 'shibuya_trendy',
    name: '渋谷トレンドデート',
    description: '最新のカルチャーとグルメを楽しむ都会派デート',
    duration: 'half',
    tags: ['shopping', 'cafe', 'entertainment'],
    areas: ['shibuya'],
    timeline: [
      { time: '12:00', activity: '渋谷駅集合', duration: 0, type: 'start' },
      { time: '12:15', activity: '渋谷スクランブルスクエア', duration: 90, type: 'shopping', description: '渋谷の新ランドマーク' },
      { time: '13:45', activity: 'ランチ', duration: 60, type: 'dining', needsRestaurant: true },
      { time: '15:00', activity: '代官山散策', duration: 90, type: 'shopping', description: 'おしゃれなセレクトショップ巡り' },
      { time: '16:30', activity: 'カフェ休憩', duration: 60, type: 'cafe', needsRestaurant: true },
      { time: '17:30', activity: '恵比寿ガーデンプレイス', duration: 60, type: 'sightseeing', description: '夜景の美しいスポット' },
      { time: '18:30', activity: 'ディナー', duration: 90, type: 'dining', needsRestaurant: true }
    ]
  },
  {
    id: 'odaiba_night',
    name: 'お台場夜景デート',
    description: 'ベイエリアの絶景と最先端エンタメを楽しむ',
    duration: 'half',
    tags: ['entertainment', 'night', 'dining'],
    areas: ['odaiba'],
    timeline: [
      { time: '14:00', activity: 'お台場海浜公園駅集合', duration: 0, type: 'start' },
      { time: '14:15', activity: 'チームラボ', duration: 120, type: 'entertainment', description: 'デジタルアートの世界' },
      { time: '16:15', activity: 'ダイバーシティ', duration: 90, type: 'shopping', description: 'ガンダム像と大型ショッピングモール' },
      { time: '17:45', activity: 'サンセット鑑賞', duration: 45, type: 'nature', description: '海辺で夕日を眺める' },
      { time: '18:30', activity: 'ディナー', duration: 90, type: 'dining', needsRestaurant: true },
      { time: '20:00', activity: 'レインボーブリッジ夜景', duration: 60, type: 'night', description: 'ロマンチックな夜景スポット' }
    ]
  },
  {
    id: 'ginza_luxury',
    name: '銀座大人デート',
    description: '洗練された街で上質な時間を過ごす',
    duration: 'half',
    tags: ['shopping', 'dining', 'cafe'],
    areas: ['ginza', 'tokyo'],
    timeline: [
      { time: '13:00', activity: '銀座駅集合', duration: 0, type: 'start' },
      { time: '13:15', activity: 'GINZA SIX', duration: 90, type: 'shopping', description: '銀座最大級の商業施設' },
      { time: '14:45', activity: 'アフタヌーンティー', duration: 90, type: 'cafe', needsRestaurant: true },
      { time: '16:15', activity: '銀座散策', duration: 60, type: 'sightseeing', description: '老舗店舗が並ぶ街を歩く' },
      { time: '17:15', activity: 'KITTE', duration: 45, type: 'shopping', description: '東京駅隣接のショッピングスポット' },
      { time: '18:00', activity: 'ディナー', duration: 120, type: 'dining', needsRestaurant: true }
    ]
  }
];

// モックレストランデータ
const MOCK_RESTAURANTS = [
  {
    id: 'mock001',
    name: 'イタリアン ビストロ AMORE',
    address: '東京都渋谷区恵比寿1-1-1',
    genre: { name: 'イタリアン・フレンチ' },
    budget: { average: '3500円' },
    access: '恵比寿駅から徒歩3分',
    urls: { pc: 'https://www.hotpepper.jp/' }
  },
  {
    id: 'mock002',
    name: '和食ダイニング 花鳥風月',
    address: '神奈川県横浜市中区山下町1-1',
    genre: { name: '和食' },
    budget: { average: '4500円' },
    access: '元町・中華街駅から徒歩5分',
    urls: { pc: 'https://www.hotpepper.jp/' }
  },
  {
    id: 'mock003',
    name: 'カフェ ル・シエル',
    address: '神奈川県鎌倉市小町2-1-1',
    genre: { name: 'カフェ・スイーツ' },
    budget: { average: '1200円' },
    access: '鎌倉駅から徒歩2分',
    urls: { pc: 'https://www.hotpepper.jp/' }
  }
];

// プラン生成ロジック
function generateDatePlan(options) {
  const { duration, tags = [], purpose } = options;
  
  // 条件に合うテンプレートを選択
  let matchingTemplates = PLAN_TEMPLATES.filter(template => {
    if (duration && template.duration !== duration) return false;
    if (tags.length > 0) {
      const hasMatchingTag = tags.some(tag => template.tags.includes(tag));
      if (!hasMatchingTag) return false;
    }
    return true;
  });
  
  if (matchingTemplates.length === 0) {
    matchingTemplates = PLAN_TEMPLATES;
  }
  
  // プランを詳細化
  const enrichedPlans = matchingTemplates.map(template => {
    let score = 5;
    
    if (tags.length > 0) {
      const matchCount = tags.filter(tag => template.tags.includes(tag)).length;
      score += matchCount * 0.5;
    }
    
    if (purpose) {
      switch (purpose) {
        case 'first':
          if (template.tags.includes('cafe') || template.tags.includes('sightseeing')) score += 1;
          break;
        case 'anniversary':
          if (template.tags.includes('dining') || template.tags.includes('night')) score += 1;
          break;
        case 'special':
          if (template.tags.includes('night') || template.tags.includes('entertainment')) score += 1;
          break;
      }
    }
    
    const mainArea = AREAS[template.areas[0]] || AREAS.tokyo;
    
    // タイムラインにレストラン情報を追加
    const timeline = template.timeline.map(item => {
      if (item.needsRestaurant) {
        return {
          ...item,
          recommendedRestaurant: MOCK_RESTAURANTS[Math.floor(Math.random() * MOCK_RESTAURANTS.length)]
        };
      }
      return item;
    });
    
    // 予算計算
    let totalMin = 0, totalMax = 0;
    timeline.forEach(item => {
      switch (item.type) {
        case 'dining':
          if (item.time >= '17:00') { totalMin += 4000; totalMax += 8000; }
          else { totalMin += 1500; totalMax += 3000; }
          break;
        case 'cafe':
          totalMin += 800; totalMax += 1500;
          break;
        case 'entertainment':
          totalMin += 2000; totalMax += 4000;
          break;
      }
    });
    
    return {
      ...template,
      score: Math.round(score * 10) / 10,
      weather: { icon: '☀️', description: '晴れ', temp: 22 },
      routeInfo: {
        routes: [{
          summary: { totalTime: 30, fare: 500 },
          sections: [{ line: 'JR線' }]
        }]
      },
      timeline,
      estimatedBudget: {
        min: totalMin * 2,
        max: totalMax * 2,
        display: `¥${(totalMin * 2).toLocaleString()}〜${(totalMax * 2).toLocaleString()}`
      },
      mainArea: mainArea.name
    };
  });
  
  enrichedPlans.sort((a, b) => b.score - a.score);
  
  return { success: true, plans: enrichedPlans };
}

export default function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const result = generateDatePlan(req.body);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
