import React, { useState, useEffect } from 'react';
import { Heart, MapPin, Clock, Wallet, Car, Train, Utensils, ShoppingBag, Camera, Coffee, Music, Sparkles, Sun, Moon, Star, ChevronRight, ChevronLeft, Navigation, Globe, Check, Calendar, Gift, Users, Settings, Loader2, AlertCircle, RefreshCw, ExternalLink } from 'lucide-react';

// ===== 設定 =====
// Vercel: 同一ドメインなので空文字、ローカル: localhost:3000
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// ===== APIクライアント =====
const api = {
  async generatePlan(options) {
    const response = await fetch(`${API_BASE_URL}/api/plan/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(options)
    });
    return response.json();
  },
  
  async searchRestaurants(params) {
    const query = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/api/restaurant/search?${query}`);
    return response.json();
  },
  
  async searchRoute(from, to, datetime) {
    const params = new URLSearchParams({ from, to });
    if (datetime) params.append('datetime', datetime);
    const response = await fetch(`${API_BASE_URL}/api/route/search?${params}`);
    return response.json();
  },
  
  async getWeather(lat, lng) {
    const response = await fetch(`${API_BASE_URL}/api/weather/current?lat=${lat}&lng=${lng}`);
    return response.json();
  },
  
  async getForecast(lat, lng) {
    const response = await fetch(`${API_BASE_URL}/api/weather/forecast?lat=${lat}&lng=${lng}`);
    return response.json();
  },
  
  async getApiStatus() {
    const response = await fetch(`${API_BASE_URL}/api/settings/keys`);
    return response.json();
  },
  
  async getAreas() {
    const response = await fetch(`${API_BASE_URL}/api/plan/areas`);
    return response.json();
  }
};

// ===== 定数 =====
const TAG_OPTIONS = [
  { id: 'shopping', label: 'ショッピング', icon: ShoppingBag, color: '#D4A5A5' },
  { id: 'sightseeing', label: '観光', icon: Camera, color: '#9CAFB7' },
  { id: 'dining', label: '食事', icon: Utensils, color: '#E6B89C' },
  { id: 'cafe', label: 'カフェ', icon: Coffee, color: '#B4A7D6' },
  { id: 'entertainment', label: 'エンタメ', icon: Music, color: '#89ABE3' },
  { id: 'nature', label: '自然・公園', icon: Sun, color: '#98D8AA' },
  { id: 'night', label: '夜景', icon: Moon, color: '#6C567B' },
];

const PURPOSE_OPTIONS = [
  { id: 'first', label: '初デート', icon: Heart },
  { id: 'anniversary', label: '記念日', icon: Gift },
  { id: 'casual', label: 'カジュアル', icon: Coffee },
  { id: 'special', label: '特別な日', icon: Star },
  { id: 'proposal', label: 'プロポーズ', icon: Sparkles },
];

const DURATION_OPTIONS = [
  { id: 'short', label: '2-3時間', description: 'ショートデート' },
  { id: 'half', label: '4-6時間', description: '半日デート' },
  { id: 'full', label: '7-10時間', description: '1日デート' },
  { id: 'overnight', label: '1泊2日', description: 'お泊りデート' },
];

const BUDGET_OPTIONS = [
  { id: 'low', label: '〜¥10,000' },
  { id: 'medium', label: '¥10,000〜20,000' },
  { id: 'high', label: '¥20,000〜30,000' },
  { id: 'luxury', label: '¥30,000〜' },
];

const HOBBY_OPTIONS = ['グルメ', 'アウトドア', 'アート', '音楽', 'スポーツ', '映画', '読書', '旅行', 'ファッション'];

// ===== メインコンポーネント =====
export default function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [showResult, setShowResult] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [apiStatus, setApiStatus] = useState(null);
  
  const [formData, setFormData] = useState({
    myAge: '',
    myGender: '',
    myInterests: [],
    partnerAge: '',
    partnerGender: '',
    partnerInterests: [],
    departure: '',
    date: '',
    purpose: '',
    duration: '',
    budget: '',
    selectedTags: [],
    hasLicense: true,
    weatherPreference: 'any',
  });

  // API接続状態を確認
  useEffect(() => {
    checkApiStatus();
  }, []);

  const checkApiStatus = async () => {
    try {
      const status = await api.getApiStatus();
      setApiStatus(status);
    } catch (err) {
      setApiStatus({ connected: false, error: err.message });
    }
  };

  const updateFormData = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const toggleTag = (tagId) => {
    setFormData(prev => ({
      ...prev,
      selectedTags: prev.selectedTags.includes(tagId)
        ? prev.selectedTags.filter(t => t !== tagId)
        : [...prev.selectedTags, tagId]
    }));
  };

  const toggleInterest = (interest, type) => {
    const key = type === 'my' ? 'myInterests' : 'partnerInterests';
    setFormData(prev => ({
      ...prev,
      [key]: prev[key].includes(interest)
        ? prev[key].filter(i => i !== interest)
        : [...prev[key], interest]
    }));
  };

  const totalSteps = 4;

  const nextStep = async () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    } else {
      await generatePlans();
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  // プラン生成
  const generatePlans = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await api.generatePlan({
        departure: formData.departure || '東京',
        date: formData.date || new Date().toISOString(),
        duration: formData.duration || 'half',
        budget: formData.budget || 'medium',
        tags: formData.selectedTags.length > 0 ? formData.selectedTags : ['dining', 'sightseeing'],
        purpose: formData.purpose || 'casual',
        hasLicense: formData.hasLicense
      });
      
      if (result.success && result.plans) {
        setPlans(result.plans);
        setShowResult(true);
      } else {
        setError('プランの生成に失敗しました');
      }
    } catch (err) {
      setError(`API接続エラー: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // ステップ1: 自分の情報
  const Step1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-rose-100 to-pink-100 px-4 py-2 rounded-full mb-4">
          <Users size={18} className="text-rose-500" />
          <span className="text-rose-700 font-medium">あなたについて</span>
        </div>
        <p className="text-stone-500 text-sm">デートプランを最適化するための情報を入力してください</p>
      </div>

      <div className="grid gap-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-stone-600 mb-2">年齢</label>
            <input
              type="number"
              placeholder="25"
              value={formData.myAge}
              onChange={(e) => updateFormData('myAge', e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-rose-300 focus:ring-2 focus:ring-rose-100 outline-none transition-all bg-white/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-600 mb-2">性別</label>
            <select
              value={formData.myGender}
              onChange={(e) => updateFormData('myGender', e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-rose-300 focus:ring-2 focus:ring-rose-100 outline-none transition-all bg-white/50 appearance-none cursor-pointer"
            >
              <option value="">選択してください</option>
              <option value="male">男性</option>
              <option value="female">女性</option>
              <option value="other">その他</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-600 mb-2">運転免許</label>
          <div className="flex gap-3">
            <button
              onClick={() => updateFormData('hasLicense', true)}
              className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all ${
                formData.hasLicense
                  ? 'border-rose-400 bg-rose-50 text-rose-700'
                  : 'border-stone-200 bg-white text-stone-500 hover:border-stone-300'
              }`}
            >
              <Car size={20} className="inline mr-2" />
              持っている
            </button>
            <button
              onClick={() => updateFormData('hasLicense', false)}
              className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all ${
                !formData.hasLicense
                  ? 'border-rose-400 bg-rose-50 text-rose-700'
                  : 'border-stone-200 bg-white text-stone-500 hover:border-stone-300'
              }`}
            >
              <Train size={20} className="inline mr-2" />
              持っていない
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-600 mb-2">趣味・興味（複数選択可）</label>
          <div className="flex flex-wrap gap-2">
            {HOBBY_OPTIONS.map(hobby => (
              <button
                key={hobby}
                onClick={() => toggleInterest(hobby, 'my')}
                className={`px-4 py-2 rounded-full text-sm transition-all ${
                  formData.myInterests.includes(hobby)
                    ? 'bg-rose-500 text-white shadow-md'
                    : 'bg-white border border-stone-200 text-stone-600 hover:border-rose-300'
                }`}
              >
                {hobby}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // ステップ2: 相手の情報
  const Step2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-100 to-purple-100 px-4 py-2 rounded-full mb-4">
          <Heart size={18} className="text-pink-500" />
          <span className="text-pink-700 font-medium">お相手について</span>
        </div>
        <p className="text-stone-500 text-sm">デートする相手の情報を入力してください</p>
      </div>

      <div className="grid gap-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-stone-600 mb-2">年齢</label>
            <input
              type="number"
              placeholder="24"
              value={formData.partnerAge}
              onChange={(e) => updateFormData('partnerAge', e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-pink-300 focus:ring-2 focus:ring-pink-100 outline-none transition-all bg-white/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-600 mb-2">性別</label>
            <select
              value={formData.partnerGender}
              onChange={(e) => updateFormData('partnerGender', e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-pink-300 focus:ring-2 focus:ring-pink-100 outline-none transition-all bg-white/50 appearance-none cursor-pointer"
            >
              <option value="">選択してください</option>
              <option value="male">男性</option>
              <option value="female">女性</option>
              <option value="other">その他</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-600 mb-2">デートの目的</label>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {PURPOSE_OPTIONS.map(purpose => {
              const Icon = purpose.icon;
              return (
                <button
                  key={purpose.id}
                  onClick={() => updateFormData('purpose', purpose.id)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                    formData.purpose === purpose.id
                      ? 'border-pink-400 bg-pink-50 text-pink-700'
                      : 'border-stone-200 bg-white text-stone-500 hover:border-pink-200'
                  }`}
                >
                  <Icon size={20} />
                  <span className="text-xs font-medium">{purpose.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-600 mb-2">お相手の趣味・興味（複数選択可）</label>
          <div className="flex flex-wrap gap-2">
            {HOBBY_OPTIONS.map(hobby => (
              <button
                key={hobby}
                onClick={() => toggleInterest(hobby, 'partner')}
                className={`px-4 py-2 rounded-full text-sm transition-all ${
                  formData.partnerInterests.includes(hobby)
                    ? 'bg-pink-500 text-white shadow-md'
                    : 'bg-white border border-stone-200 text-stone-600 hover:border-pink-300'
                }`}
              >
                {hobby}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // ステップ3: デート条件
  const Step3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-100 to-orange-100 px-4 py-2 rounded-full mb-4">
          <Calendar size={18} className="text-amber-600" />
          <span className="text-amber-700 font-medium">デートの条件</span>
        </div>
        <p className="text-stone-500 text-sm">日程や予算などの条件を設定してください</p>
      </div>

      <div className="grid gap-6">
        <div>
          <label className="block text-sm font-medium text-stone-600 mb-2">
            <MapPin size={16} className="inline mr-1" />
            出発地（駅名）
          </label>
          <input
            type="text"
            placeholder="例: 東京、新宿、横浜"
            value={formData.departure}
            onChange={(e) => updateFormData('departure', e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-amber-300 focus:ring-2 focus:ring-amber-100 outline-none transition-all bg-white/50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-600 mb-2">
            <Calendar size={16} className="inline mr-1" />
            デート日
          </label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => updateFormData('date', e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-amber-300 focus:ring-2 focus:ring-amber-100 outline-none transition-all bg-white/50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-600 mb-2">
            <Clock size={16} className="inline mr-1" />
            所要時間
          </label>
          <div className="grid grid-cols-2 gap-3">
            {DURATION_OPTIONS.map(option => (
              <button
                key={option.id}
                onClick={() => updateFormData('duration', option.id)}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  formData.duration === option.id
                    ? 'border-amber-400 bg-amber-50'
                    : 'border-stone-200 bg-white hover:border-amber-200'
                }`}
              >
                <div className={`font-semibold ${formData.duration === option.id ? 'text-amber-700' : 'text-stone-700'}`}>
                  {option.label}
                </div>
                <div className="text-xs text-stone-500">{option.description}</div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-600 mb-2">
            <Wallet size={16} className="inline mr-1" />
            予算（2人分の合計）
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {BUDGET_OPTIONS.map(budget => (
              <button
                key={budget.id}
                onClick={() => updateFormData('budget', budget.id)}
                className={`py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all ${
                  formData.budget === budget.id
                    ? 'border-amber-400 bg-amber-50 text-amber-700'
                    : 'border-stone-200 bg-white text-stone-600 hover:border-amber-200'
                }`}
              >
                {budget.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // ステップ4: タグ選択
  const Step4 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-100 to-purple-100 px-4 py-2 rounded-full mb-4">
          <Sparkles size={18} className="text-violet-500" />
          <span className="text-violet-700 font-medium">やりたいこと</span>
        </div>
        <p className="text-stone-500 text-sm">デートで重視したいことを選んでください（複数選択可）</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {TAG_OPTIONS.map(tag => {
          const Icon = tag.icon;
          const isSelected = formData.selectedTags.includes(tag.id);
          return (
            <button
              key={tag.id}
              onClick={() => toggleTag(tag.id)}
              className={`relative p-5 rounded-2xl border-2 transition-all duration-300 ${
                isSelected
                  ? 'border-transparent shadow-lg scale-105'
                  : 'border-stone-200 bg-white hover:border-stone-300 hover:shadow-md'
              }`}
              style={{
                background: isSelected ? `linear-gradient(135deg, ${tag.color}20 0%, ${tag.color}40 100%)` : undefined,
                borderColor: isSelected ? tag.color : undefined,
              }}
            >
              {isSelected && (
                <div 
                  className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ background: tag.color }}
                >
                  <Check size={12} className="text-white" />
                </div>
              )}
              <Icon 
                size={28} 
                className="mx-auto mb-2"
                style={{ color: isSelected ? tag.color : '#78716c' }}
              />
              <div className={`text-sm font-medium ${isSelected ? 'text-stone-800' : 'text-stone-600'}`}>
                {tag.label}
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-8 p-4 rounded-xl bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-100">
        <div className="flex items-start gap-3">
          <Sun size={20} className="text-violet-500 mt-0.5" />
          <div>
            <div className="font-medium text-stone-700 mb-1">天気を考慮しますか？</div>
            <div className="flex gap-2">
              {[
                { id: 'any', label: '気にしない' },
                { id: 'sunny', label: '晴れ優先' },
                { id: 'indoor', label: '室内中心' },
              ].map(option => (
                <button
                  key={option.id}
                  onClick={() => updateFormData('weatherPreference', option.id)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                    formData.weatherPreference === option.id
                      ? 'bg-violet-500 text-white'
                      : 'bg-white text-stone-600 hover:bg-violet-100'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // プラン一覧表示
  const PlanList = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-100 to-teal-100 px-4 py-2 rounded-full mb-4">
          <Sparkles size={18} className="text-emerald-500" />
          <span className="text-emerald-700 font-medium">おすすめプラン</span>
        </div>
        <h2 className="text-2xl font-semibold text-stone-800 mb-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
          あなたにぴったりのデートプラン
        </h2>
        <p className="text-stone-500 text-sm">
          条件に合った{plans.length}件のプランが見つかりました
          {apiStatus?.configured && !Object.values(apiStatus.configured).some(v => v) && (
            <span className="text-amber-600 ml-2">（モックデータ）</span>
          )}
        </p>
      </div>

      <div className="space-y-4">
        {plans.map((plan, idx) => (
          <div
            key={plan.id || idx}
            onClick={() => setSelectedPlan(plan)}
            className="group p-5 rounded-2xl bg-white border border-stone-200 hover:border-rose-300 hover:shadow-xl transition-all duration-300 cursor-pointer"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-rose-100 text-rose-600">
                    おすすめ度 {plan.score || 4.5}
                  </span>
                  {plan.weather && (
                    <span className="text-lg">{plan.weather.icon}</span>
                  )}
                  <div className="flex gap-1">
                    {plan.tags?.map(tagId => {
                      const tag = TAG_OPTIONS.find(t => t.id === tagId);
                      if (!tag) return null;
                      return (
                        <span
                          key={tagId}
                          className="w-6 h-6 rounded-full flex items-center justify-center"
                          style={{ background: `${tag.color}30` }}
                        >
                          <tag.icon size={12} style={{ color: tag.color }} />
                        </span>
                      );
                    })}
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-stone-800 group-hover:text-rose-600 transition-colors">
                  {plan.name}
                </h3>
                <p className="text-sm text-stone-500 mt-1">{plan.description}</p>
                <div className="flex items-center gap-4 mt-3 text-sm text-stone-600">
                  <span className="flex items-center gap-1">
                    <Clock size={14} />
                    {plan.duration === 'half' ? '半日' : plan.duration === 'full' ? '1日' : plan.duration}
                  </span>
                  <span className="flex items-center gap-1">
                    <Wallet size={14} />
                    {plan.estimatedBudget?.display || '¥15,000〜20,000'}
                  </span>
                  {plan.mainArea && (
                    <span className="flex items-center gap-1">
                      <MapPin size={14} />
                      {plan.mainArea}
                    </span>
                  )}
                </div>
              </div>
              <ChevronRight size={24} className="text-stone-300 group-hover:text-rose-400 group-hover:translate-x-1 transition-all" />
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => {
          setShowResult(false);
          setCurrentStep(1);
          setPlans([]);
        }}
        className="w-full py-3 rounded-xl border-2 border-stone-200 text-stone-600 hover:border-rose-300 hover:text-rose-600 transition-all"
      >
        条件を変更する
      </button>
    </div>
  );

  // プラン詳細表示
  const PlanDetail = () => {
    if (!selectedPlan) return null;

    const getTypeStyle = (type) => {
      switch (type) {
        case 'start': return 'bg-gradient-to-br from-rose-400 to-rose-500';
        case 'move': return 'bg-gradient-to-br from-stone-400 to-stone-500';
        case 'dining': return 'bg-gradient-to-br from-amber-400 to-orange-500';
        case 'shopping': return 'bg-gradient-to-br from-pink-400 to-rose-500';
        case 'sightseeing': return 'bg-gradient-to-br from-cyan-400 to-blue-500';
        case 'cafe': return 'bg-gradient-to-br from-purple-400 to-violet-500';
        case 'entertainment': return 'bg-gradient-to-br from-indigo-400 to-blue-500';
        case 'nature': return 'bg-gradient-to-br from-emerald-400 to-green-500';
        case 'night': return 'bg-gradient-to-br from-indigo-500 to-purple-600';
        default: return 'bg-gradient-to-br from-emerald-400 to-teal-500';
      }
    };

    return (
      <div className="space-y-6">
        <button
          onClick={() => setSelectedPlan(null)}
          className="flex items-center gap-2 text-stone-500 hover:text-rose-500 transition-colors"
        >
          <ChevronLeft size={20} />
          <span>プラン一覧に戻る</span>
        </button>

        <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl p-6 border border-rose-100">
          <div className="flex items-center gap-2 mb-3">
            <Star size={18} className="text-amber-500 fill-amber-500" />
            <span className="font-semibold text-amber-600">{selectedPlan.score || 4.5}</span>
            {selectedPlan.weather && (
              <span className="ml-2 text-xl">{selectedPlan.weather.icon}</span>
            )}
          </div>
          <h2 className="text-2xl font-bold text-stone-800 mb-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            {selectedPlan.name}
          </h2>
          <p className="text-stone-600">{selectedPlan.description}</p>
          <div className="flex items-center gap-4 mt-4 flex-wrap">
            <span className="flex items-center gap-1.5 text-stone-600">
              <Clock size={16} />
              {selectedPlan.duration === 'half' ? '半日（4-6時間）' : selectedPlan.duration === 'full' ? '1日' : selectedPlan.duration}
            </span>
            <span className="flex items-center gap-1.5 text-stone-600">
              <Wallet size={16} />
              {selectedPlan.estimatedBudget?.display || '¥15,000〜20,000'}
            </span>
            {selectedPlan.weather && (
              <span className="flex items-center gap-1.5 text-stone-600">
                {selectedPlan.weather.descriptionJa || selectedPlan.weather.description}
                {selectedPlan.weather.temp && ` ${selectedPlan.weather.temp}°C`}
              </span>
            )}
          </div>
        </div>

        {/* 経路情報 */}
        {selectedPlan.routeInfo?.routes?.[0] && (
          <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
            <div className="flex items-center gap-2 mb-2">
              <Train size={18} className="text-blue-600" />
              <span className="font-medium text-blue-800">出発地からのアクセス</span>
            </div>
            <div className="text-sm text-blue-700">
              <span>{selectedPlan.routeInfo.routes[0].sections?.[0]?.line || '電車'}</span>
              <span className="mx-2">|</span>
              <span>約{selectedPlan.routeInfo.routes[0].summary?.totalTime || 30}分</span>
              <span className="mx-2">|</span>
              <span>¥{selectedPlan.routeInfo.routes[0].summary?.fare || 500}</span>
            </div>
          </div>
        )}

        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-stone-800 mb-4 flex items-center gap-2">
            <Navigation size={18} className="text-rose-500" />
            タイムライン
          </h3>
          
          <div className="relative">
            <div className="absolute left-[27px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-rose-300 via-pink-300 to-purple-300" />
            
            {selectedPlan.timeline?.map((item, idx) => (
              <div key={idx} className="relative flex gap-4 pb-6 last:pb-0">
                <div className={`relative z-10 w-14 h-14 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg ${getTypeStyle(item.type)}`}>
                  {item.time}
                </div>
                
                <div className="flex-1 bg-white rounded-xl p-4 border border-stone-100 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-stone-800">{item.activity || item.title}</h4>
                    {item.duration > 0 && (
                      <span className="text-xs text-stone-500 bg-stone-100 px-2 py-1 rounded-full">
                        {item.duration}分
                      </span>
                    )}
                  </div>
                  
                  {item.description && (
                    <p className="text-sm text-stone-600 mb-3">{item.description}</p>
                  )}
                  
                  {/* 移動情報 */}
                  {item.type === 'move' && item.route && (
                    <div className="flex items-center gap-2 text-sm text-stone-600 bg-stone-50 px-3 py-2 rounded-lg">
                      <Train size={14} />
                      <span>{item.route.sections?.[0]?.line || '電車'}</span>
                      <span className="text-stone-400">|</span>
                      <span>{item.route.summary?.totalTime || item.duration}分</span>
                    </div>
                  )}
                  
                  {/* レストラン情報 */}
                  {item.recommendedRestaurant && (
                    <div className="mt-3 p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Utensils size={14} className="text-amber-600" />
                            <span className="font-semibold text-stone-800">{item.recommendedRestaurant.name}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-stone-600 mb-2 flex-wrap">
                            {item.recommendedRestaurant.genre?.name && (
                              <>
                                <span>{item.recommendedRestaurant.genre.name}</span>
                                <span className="text-stone-300">|</span>
                              </>
                            )}
                            {item.recommendedRestaurant.budget?.average && (
                              <span>{item.recommendedRestaurant.budget.average}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="space-y-1.5 text-sm text-stone-600">
                        {item.recommendedRestaurant.address && (
                          <div className="flex items-center gap-2">
                            <MapPin size={12} />
                            <span>{item.recommendedRestaurant.address}</span>
                          </div>
                        )}
                        {item.recommendedRestaurant.access && (
                          <div className="flex items-center gap-2">
                            <Navigation size={12} />
                            <span>{item.recommendedRestaurant.access}</span>
                          </div>
                        )}
                        {item.recommendedRestaurant.urls?.pc && (
                          <div className="flex items-center gap-2">
                            <Globe size={12} />
                            <a 
                              href={item.recommendedRestaurant.urls.pc} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-rose-500 hover:underline flex items-center gap-1"
                            >
                              詳細を見る <ExternalLink size={12} />
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 複数のレストラン候補 */}
                  {item.restaurants && item.restaurants.length > 1 && !item.recommendedRestaurant && (
                    <div className="mt-3 space-y-2">
                      <div className="text-xs text-stone-500">おすすめのお店:</div>
                      {item.restaurants.slice(0, 3).map((rest, rIdx) => (
                        <div key={rIdx} className="p-2 bg-stone-50 rounded-lg text-sm">
                          <span className="font-medium">{rest.name}</span>
                          {rest.genre?.name && <span className="text-stone-500 ml-2">{rest.genre.name}</span>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button className="flex-1 py-3 px-6 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold shadow-lg shadow-rose-200 hover:shadow-xl hover:shadow-rose-300 transition-all">
            <Heart size={18} className="inline mr-2" />
            このプランで決定
          </button>
          <button className="py-3 px-6 rounded-xl border-2 border-stone-200 text-stone-600 hover:border-rose-300 hover:text-rose-600 transition-all">
            お気に入り
          </button>
        </div>
      </div>
    );
  };

  // プログレスバー
  const ProgressBar = () => (
    <div className="flex items-center justify-center gap-2 mb-8">
      {Array.from({ length: totalSteps }).map((_, idx) => (
        <React.Fragment key={idx}>
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
              idx + 1 < currentStep
                ? 'bg-gradient-to-br from-rose-400 to-pink-500 text-white'
                : idx + 1 === currentStep
                ? 'bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-lg shadow-rose-200 scale-110'
                : 'bg-stone-100 text-stone-400'
            }`}
          >
            {idx + 1 < currentStep ? <Check size={16} /> : idx + 1}
          </div>
          {idx < totalSteps - 1 && (
            <div className={`w-12 h-1 rounded-full transition-all duration-300 ${
              idx + 1 < currentStep ? 'bg-gradient-to-r from-rose-400 to-pink-400' : 'bg-stone-200'
            }`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  // ローディング画面
  const LoadingScreen = () => (
    <div className="text-center py-12">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 mb-4 animate-pulse">
        <Loader2 size={28} className="text-white animate-spin" />
      </div>
      <h3 className="text-lg font-semibold text-stone-800 mb-2">プランを生成中...</h3>
      <p className="text-stone-500 text-sm">あなたにぴったりのデートプランを探しています</p>
    </div>
  );

  // エラー表示
  const ErrorMessage = () => (
    <div className="text-center py-8">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-red-100 mb-4">
        <AlertCircle size={24} className="text-red-500" />
      </div>
      <h3 className="text-lg font-semibold text-stone-800 mb-2">エラーが発生しました</h3>
      <p className="text-stone-500 text-sm mb-4">{error}</p>
      <div className="flex gap-3 justify-center">
        <button
          onClick={() => { setError(null); generatePlans(); }}
          className="px-4 py-2 rounded-lg bg-rose-500 text-white text-sm flex items-center gap-2"
        >
          <RefreshCw size={16} />
          再試行
        </button>
        <button
          onClick={() => { setError(null); setShowResult(false); }}
          className="px-4 py-2 rounded-lg border border-stone-200 text-stone-600 text-sm"
        >
          戻る
        </button>
      </div>
    </div>
  );

  // API接続ステータス表示
  const ApiStatusBadge = () => {
    if (!apiStatus) return null;
    
    const isConnected = apiStatus.success;
    const hasApiKeys = apiStatus.configured && Object.values(apiStatus.configured).some(v => v);
    
    return (
      <button 
        onClick={checkApiStatus}
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all hover:scale-105 ${
          isConnected 
            ? hasApiKeys 
              ? 'bg-emerald-100 text-emerald-700' 
              : 'bg-amber-100 text-amber-700'
            : 'bg-red-100 text-red-700'
        }`}
      >
        <div className={`w-2 h-2 rounded-full ${
          isConnected 
            ? hasApiKeys ? 'bg-emerald-500' : 'bg-amber-500'
            : 'bg-red-500'
        }`} />
        {isConnected 
          ? hasApiKeys ? 'API接続中' : 'モックモード'
          : 'API未接続'}
        <Settings size={12} />
      </button>
    );
  };

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Outfit:wght@300;400;500;600&display=swap" rel="stylesheet" />
      
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50" style={{ fontFamily: "'Outfit', sans-serif" }}>
        {/* 背景装飾 */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-gradient-to-br from-rose-200/40 to-pink-200/40 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-gradient-to-br from-purple-200/40 to-violet-200/40 blur-3xl" />
        </div>

        <div className="relative max-w-2xl mx-auto px-4 py-8">
          {/* ヘッダー */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <ApiStatusBadge />
            </div>
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 shadow-xl shadow-rose-200 mb-4">
              <Heart size={28} className="text-white" fill="white" />
            </div>
            <h1 className="text-3xl font-bold text-stone-800 mb-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              Date Planner
            </h1>
            <p className="text-stone-500">ふたりだけの特別な時間をプランニング</p>
          </div>

          {/* メインコンテンツ */}
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl shadow-rose-100/50 border border-white/50 p-6 sm:p-8">
            {loading ? (
              <LoadingScreen />
            ) : error ? (
              <ErrorMessage />
            ) : !showResult ? (
              <>
                <ProgressBar />
                
                <div className="mb-8">
                  {currentStep === 1 && <Step1 />}
                  {currentStep === 2 && <Step2 />}
                  {currentStep === 3 && <Step3 />}
                  {currentStep === 4 && <Step4 />}
                </div>

                <div className="flex gap-3">
                  {currentStep > 1 && (
                    <button
                      onClick={prevStep}
                      className="flex-1 py-3 px-6 rounded-xl border-2 border-stone-200 text-stone-600 font-semibold hover:border-rose-300 hover:text-rose-600 transition-all flex items-center justify-center gap-2"
                    >
                      <ChevronLeft size={18} />
                      戻る
                    </button>
                  )}
                  <button
                    onClick={nextStep}
                    disabled={loading}
                    className="flex-1 py-3 px-6 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold shadow-lg shadow-rose-200 hover:shadow-xl hover:shadow-rose-300 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {currentStep === totalSteps ? (
                      <>
                        <Sparkles size={18} />
                        プランを作成
                      </>
                    ) : (
                      <>
                        次へ
                        <ChevronRight size={18} />
                      </>
                    )}
                  </button>
                </div>
              </>
            ) : selectedPlan ? (
              <PlanDetail />
            ) : (
              <PlanList />
            )}
          </div>

          {/* フッター */}
          <div className="text-center mt-8 text-sm text-stone-400">
            <p>Made with <Heart size={12} className="inline text-rose-400 fill-rose-400" /> for couples</p>
          </div>
        </div>
      </div>
    </>
  );
}
