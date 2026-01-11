import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, X, AlertCircle, Check } from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { MobileHeader } from '../components/MobileHeader';
import gcoinImage from 'figma:asset/815824d9c86b41bb7e8aa0f765dd2b20dee5b8ab.png';

type QuestionType = 'yes_no' | 'single_choice' | 'multiple_choice';
type MechanismType = 'PARIMUTUEL_V1' | 'LMSR_V2';

export default function CreateQuestion() {
  const navigate = useNavigate();
  const [isLoggedIn] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const mockUser = {
    name: '神預測玩家',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
    totalAssets: 15000,
    totalInvested: 8500,
    profitRate: 76.5,
    dailyQuests: 3,
    weeklyQuests: 5,
    unclaimedRewards: 2,
    followedMarkets: 12,
    inviteCode: 'PRED2026'
  };

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questionType, setQuestionType] = useState<QuestionType>('yes_no');
  const [mechanismType, setMechanismType] = useState<MechanismType>('LMSR_V2');
  const [category, setCategory] = useState('');
  const [closingDate, setClosingDate] = useState('');
  const [options, setOptions] = useState<string[]>(['', '']);
  const [creationFee, setCreationFee] = useState(100);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const categories = ['政治', '經濟', '體育', '娛樂', '科技', '其他'];
  const creationFees = [100, 1000, 10000, 100000];

  const handleAddOption = () => {
    setOptions([...options, '']);
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = '題目為必填項目';
    }

    if (!category) {
      newErrors.category = '請選擇分類';
    }

    if (!closingDate) {
      newErrors.closingDate = '請選擇截止時間';
    } else {
      const selected = new Date(closingDate);
      if (selected <= new Date()) {
        newErrors.closingDate = '截止時間必須在未來';
      }
    }

    if ((questionType === 'single_choice' || questionType === 'multiple_choice')) {
      const filledOptions = options.filter(o => o.trim());
      if (filledOptions.length < 2) {
        newErrors.options = '至少需要 2 個選項';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Mock submission
    console.log('Creating question:', {
      title,
      description,
      questionType,
      mechanismType,
      category,
      closingDate,
      options: questionType !== 'yes_no' ? options.filter(o => o.trim()) : [],
      creationFee,
    });

    // Redirect to market detail
    alert(`問題創建成功！花費 ${creationFee.toLocaleString()} G Coin`);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <MobileHeader 
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        isLoggedIn={isLoggedIn}
        user={mockUser}
      />

      <div className="flex w-full">
        <Sidebar 
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          isLoggedIn={isLoggedIn}
          user={mockUser}
          onLogin={() => {}}
          onLogout={() => {}}
        />

        <main className="flex-1 w-full min-w-0 lg:ml-64 pt-16 lg:pt-0">
          <div className="max-w-3xl mx-auto px-3 md:px-4 py-4 md:py-6">
            {/* Page Header */}
            <div className="mb-4">
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">創建新問題</h1>
              <p className="text-sm text-slate-600">創建一個新的預測市場，讓大家來參與預測</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Title */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  題目 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="例如：2026 台灣總統大選，民進黨會繼續執政嗎？"
                  className={`w-full px-4 py-3 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.title ? 'border-red-500' : 'border-slate-300'
                  }`}
                />
                {errors.title && (
                  <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.title}
                  </p>
                )}
              </div>

              {/* Description */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  描述 <span className="text-slate-400">(可選)</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="詳細描述這個問題的背景、結算規則等..."
                  rows={4}
                  className="w-full px-4 py-3 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              {/* Question Type */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-6">
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  問題類型 <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setQuestionType('yes_no')}
                    className={`p-4 border-2 rounded-lg text-left transition-all ${
                      questionType === 'yes_no'
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-slate-200 hover:border-indigo-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {questionType === 'yes_no' && <Check className="w-4 h-4 text-indigo-600" />}
                      <span className="font-bold text-sm">是非題</span>
                    </div>
                    <p className="text-xs text-slate-600">只有一個圈圈和叉叉</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuestionType('single_choice')}
                    className={`p-4 border-2 rounded-lg text-left transition-all ${
                      questionType === 'single_choice'
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-slate-200 hover:border-indigo-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {questionType === 'single_choice' && <Check className="w-4 h-4 text-indigo-600" />}
                      <span className="font-bold text-sm">單選題</span>
                    </div>
                    <p className="text-xs text-slate-600">每個選項都有 O/X</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuestionType('multiple_choice')}
                    className={`p-4 border-2 rounded-lg text-left transition-all ${
                      questionType === 'multiple_choice'
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-slate-200 hover:border-indigo-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {questionType === 'multiple_choice' && <Check className="w-4 h-4 text-indigo-600" />}
                      <span className="font-bold text-sm">多選題</span>
                    </div>
                    <p className="text-xs text-slate-600">可能有多個答案</p>
                  </button>
                </div>
              </div>

              {/* Options (for single/multiple choice) */}
              {(questionType === 'single_choice' || questionType === 'multiple_choice') && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-6">
                  <label className="block text-sm font-medium text-slate-700 mb-3">
                    選項 <span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-2 mb-3">
                    {options.map((option, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => handleOptionChange(index, e.target.value)}
                          placeholder={`選項 ${index + 1}`}
                          className="flex-1 px-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        {options.length > 2 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveOption(index)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={handleAddOption}
                    className="flex items-center gap-2 px-4 py-2 text-sm bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    新增選項
                  </button>
                  {errors.options && (
                    <p className="mt-2 text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.options}
                    </p>
                  )}
                </div>
              )}

              {/* Mechanism Type */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-6">
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  機制類型 <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setMechanismType('LMSR_V2')}
                    className={`p-4 border-2 rounded-lg text-left transition-all ${
                      mechanismType === 'LMSR_V2'
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-slate-200 hover:border-indigo-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {mechanismType === 'LMSR_V2' && <Check className="w-4 h-4 text-indigo-600" />}
                      <span className="font-bold text-sm">LMSR 交易機制</span>
                    </div>
                    <p className="text-xs text-slate-600">自動做市商，隨時可交易</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMechanismType('PARIMUTUEL_V1')}
                    className={`p-4 border-2 rounded-lg text-left transition-all ${
                      mechanismType === 'PARIMUTUEL_V1'
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-slate-200 hover:border-indigo-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {mechanismType === 'PARIMUTUEL_V1' && <Check className="w-4 h-4 text-indigo-600" />}
                      <span className="font-bold text-sm">對賭機制</span>
                    </div>
                    <p className="text-xs text-slate-600">簡單直接的對賭池</p>
                  </button>
                </div>
              </div>

              {/* Category */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  分類 <span className="text-red-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className={`w-full px-4 py-3 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.category ? 'border-red-500' : 'border-slate-300'
                  }`}
                >
                  <option value="">選擇分類</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                {errors.category && (
                  <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.category}
                  </p>
                )}
              </div>

              {/* Closing Date */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  截止時間 <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={closingDate}
                  onChange={(e) => setClosingDate(e.target.value)}
                  className={`w-full px-4 py-3 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.closingDate ? 'border-red-500' : 'border-slate-300'
                  }`}
                />
                {errors.closingDate && (
                  <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.closingDate}
                  </p>
                )}
              </div>

              {/* Creation Fee */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-6">
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  創建費用 <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {creationFees.map((fee) => (
                    <button
                      key={fee}
                      type="button"
                      onClick={() => setCreationFee(fee)}
                      className={`p-3 border-2 rounded-lg transition-all ${
                        creationFee === fee
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-slate-200 hover:border-indigo-300'
                      }`}
                    >
                      <div className="flex flex-col items-center gap-1">
                        <img src={gcoinImage} alt="G coin" className="w-5 h-5" />
                        <span className="font-bold text-sm">{fee.toLocaleString()}</span>
                      </div>
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  💡 費用越高，您的問題會獲得更高的曝光度
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="flex-1 px-6 py-3 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg hover:shadow-lg transition-all"
                >
                  創建問題
                </button>
              </div>

              {/* Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  ℹ️ 創建問題後，您將花費相應的 G Coin。問題一旦創建就無法刪除，請仔細填寫。
                </p>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
