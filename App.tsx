import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  User, Calendar, ShoppingCart, ChefHat, Activity, 
  Menu, X, Sparkles, Utensils, ArrowRight, Upload, 
  CheckCircle, Plus, Trash2, Moon, Sun, Send, MessageCircle 
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';
import { UserProfile, DietPlan, RecipeSuggestion, GroceryItem, AppStatus } from './types';
import * as GeminiService from './services/geminiService';

// --- Components ---

// 1. Navigation Sidebar/Mobile Menu
const Navbar: React.FC<{ logoUrl: string | null }> = ({ logoUrl }) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const links = [
    { name: 'Dashboard', icon: Activity, path: '/dashboard' },
    { name: 'My Plan', icon: Calendar, path: '/plan' },
    { name: 'Recipes', icon: ChefHat, path: '/recipes' },
    { name: 'Shopping List', icon: ShoppingCart, path: '/list' },
    { name: 'Profile', icon: User, path: '/profile' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 w-full bg-white z-50 px-4 py-3 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2" onClick={() => navigate('/')}>
          {logoUrl ? <img src={logoUrl} className="w-8 h-8 rounded-full" /> : <Utensils className="text-emerald-600" />}
          <span className="font-bold text-lg text-emerald-800 tracking-tight">MealCraft</span>
        </div>
        <button onClick={() => setIsOpen(!isOpen)} className="text-gray-600">
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar (Desktop) & Drawer (Mobile) */}
      <div className={`fixed inset-y-0 left-0 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition duration-200 ease-in-out z-40 w-64 bg-white border-r border-gray-100 flex flex-col md:top-0 top-14 h-[calc(100vh-3.5rem)] md:h-screen`}>
        <div className="hidden md:flex items-center gap-3 px-6 py-6 border-b border-gray-50 cursor-pointer" onClick={() => navigate('/')}>
           {logoUrl ? (
             <img src={logoUrl} className="w-10 h-10 object-cover rounded-full shadow-sm" alt="Logo" />
           ) : (
             <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
               <Utensils size={20} />
             </div>
           )}
           <div>
             <h1 className="font-bold text-xl text-emerald-900 tracking-tight">MealCraft</h1>
             <p className="text-xs text-orange-500 font-medium">eat and happy</p>
           </div>
        </div>

        <div className="flex-1 py-6 space-y-1 overflow-y-auto">
          {links.map((link) => (
            <div key={link.name} className="px-3">
              <button
                onClick={() => { navigate(link.path); setIsOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 ${isActive(link.path) ? 'bg-emerald-50 text-emerald-700 shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'}`}
              >
                <link.icon size={20} strokeWidth={isActive(link.path) ? 2.5 : 2} />
                <span className="font-medium text-sm">{link.name}</span>
              </button>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-gray-50">
           <div className="bg-orange-50 rounded-xl p-4">
             <div className="flex items-center gap-2 mb-2 text-orange-700 font-semibold text-sm">
                <Sparkles size={16} />
                <span>Pro Tip</span>
             </div>
             <p className="text-xs text-orange-800/80">Update your weight weekly for better AI accuracy.</p>
           </div>
        </div>
      </div>
    </>
  );
};

// 2. Dashboard Page
const Dashboard: React.FC<{ profile: UserProfile | null, plan: DietPlan | null }> = ({ profile, plan }) => {
  if (!profile) return <div className="p-8 text-center"><p>Please set up your profile first.</p><Link to="/profile" className="text-emerald-600 underline">Go to Setup</Link></div>;

  const bmr = 10 * profile.weight + 6.25 * profile.height - 5 * profile.age + (profile.gender === 'male' ? 5 : -161);
  const tdee = Math.round(bmr * (profile.activityLevel === 'sedentary' ? 1.2 : profile.activityLevel === 'active' ? 1.55 : 1.375));

  const chartData = plan?.days.map(day => ({
    name: day.day.substring(0, 3),
    cal: day.totalNutrition.calories,
    pro: day.totalNutrition.protein
  })) || [];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">Hello, {profile.name} 👋</h1>
        <p className="text-gray-500">Here's your daily nutrition snapshot.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-orange-100 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
          <div className="relative z-10">
            <h3 className="text-gray-500 font-medium text-sm mb-1">Daily Target</h3>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-gray-900">{tdee}</span>
              <span className="text-sm text-gray-400">kcal</span>
            </div>
            <div className="mt-4 flex gap-2">
               <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">Goal: {profile.goal}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
          <h3 className="text-gray-500 font-medium text-sm mb-4">Macronutrient Split</h3>
          <div className="flex items-center gap-4">
            <div className="flex-1 text-center">
              <div className="w-3 h-20 bg-blue-100 mx-auto rounded-full overflow-hidden relative">
                 <div className="absolute bottom-0 w-full bg-blue-500 h-[30%]"></div>
              </div>
              <span className="text-xs font-semibold text-gray-600 mt-2 block">Pro</span>
            </div>
             <div className="flex-1 text-center">
              <div className="w-3 h-20 bg-yellow-100 mx-auto rounded-full overflow-hidden relative">
                 <div className="absolute bottom-0 w-full bg-yellow-400 h-[50%]"></div>
              </div>
              <span className="text-xs font-semibold text-gray-600 mt-2 block">Carb</span>
            </div>
             <div className="flex-1 text-center">
              <div className="w-3 h-20 bg-red-100 mx-auto rounded-full overflow-hidden relative">
                 <div className="absolute bottom-0 w-full bg-red-400 h-[20%]"></div>
              </div>
              <span className="text-xs font-semibold text-gray-600 mt-2 block">Fat</span>
            </div>
          </div>
        </div>

        <div className="bg-emerald-600 p-6 rounded-2xl shadow-lg text-white flex flex-col justify-between">
           <div>
             <h3 className="font-semibold opacity-90 mb-1">AI Insight</h3>
             <p className="text-sm opacity-80 leading-relaxed">
               "Based on your goal to {profile.goal}, try increasing your protein intake in the morning to stay satiated longer."
             </p>
           </div>
           <button className="self-start mt-4 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium backdrop-blur-sm transition-colors">
             View Analysis
           </button>
        </div>
      </div>

      {plan && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-900">Weekly Calorie Trend</h3>
            <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">Last 7 days</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                />
                <Bar dataKey="cal" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40}>
                   {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.cal > tdee ? '#f97316' : '#10b981'} />
                    ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

// 3. Profile Setup Page
const ProfileSetup: React.FC<{ onSave: (p: UserProfile) => void, initialData: UserProfile | null }> = ({ onSave, initialData }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<UserProfile>>(initialData || {
    name: '', age: 25, height: 170, weight: 70, gender: 'male',
    activityLevel: 'moderate', goal: 'maintain', dietType: 'non-veg',
    cuisinePreferences: [], allergies: [], medicalConditions: []
  });

  const handleChange = (f: string, v: any) => setFormData(prev => ({ ...prev, [f]: v }));
  
  const handleArrayToggle = (field: keyof UserProfile, value: string) => {
    const current = (formData[field] as string[]) || [];
    const updated = current.includes(value) ? current.filter(i => i !== value) : [...current, value];
    handleChange(field, updated);
  };

  const steps = [
    { title: "Basics", desc: "Let's start with you." },
    { title: "Goals", desc: "What do you want to achieve?" },
    { title: "Preferences", desc: "What do you like to eat?" }
  ];

  return (
    <div className="max-w-2xl mx-auto p-6 md:py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{steps[step-1].title}</h1>
        <p className="text-gray-500">{steps[step-1].desc}</p>
        <div className="flex gap-2 mt-6">
          {steps.map((_, i) => (
            <div key={i} className={`h-2 flex-1 rounded-full ${i + 1 <= step ? 'bg-emerald-500' : 'bg-gray-200'}`} />
          ))}
        </div>
      </div>

      <div className="space-y-6 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        {step === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
              <input type="text" className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition" value={formData.name} onChange={e => handleChange('name', e.target.value)} placeholder="e.g. John Doe" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
              <input type="number" className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition" value={formData.age} onChange={e => handleChange('age', parseInt(e.target.value))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
              <select className="w-full p-3 border border-gray-200 rounded-xl outline-none" value={formData.gender} onChange={e => handleChange('gender', e.target.value)}>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Height (cm)</label>
              <input type="number" className="w-full p-3 border border-gray-200 rounded-xl outline-none" value={formData.height} onChange={e => handleChange('height', parseInt(e.target.value))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Weight (kg)</label>
              <input type="number" className="w-full p-3 border border-gray-200 rounded-xl outline-none" value={formData.weight} onChange={e => handleChange('weight', parseInt(e.target.value))} />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Activity Level</label>
              <div className="grid grid-cols-1 gap-3">
                {['sedentary', 'light', 'moderate', 'active', 'very_active'].map(lvl => (
                  <button key={lvl} onClick={() => handleChange('activityLevel', lvl)}
                    className={`p-3 text-left rounded-xl border ${formData.activityLevel === lvl ? 'border-emerald-500 bg-emerald-50 text-emerald-800' : 'border-gray-200 hover:bg-gray-50'}`}>
                    <span className="capitalize font-medium">{lvl.replace('_', ' ')}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Primary Goal</label>
              <div className="flex gap-4">
                {['loss', 'maintain', 'gain'].map(g => (
                  <button key={g} onClick={() => handleChange('goal', g)}
                    className={`flex-1 p-4 rounded-xl border text-center ${formData.goal === g ? 'border-emerald-500 bg-emerald-50 text-emerald-800' : 'border-gray-200'}`}>
                    <span className="capitalize font-bold block">{g}</span>
                    <span className="text-xs text-gray-500">Weight</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Diet Type</label>
              <div className="flex flex-wrap gap-2">
                {['veg', 'non-veg', 'vegan', 'keto', 'paleo'].map(d => (
                   <button key={d} onClick={() => handleChange('dietType', d)}
                    className={`px-4 py-2 rounded-full border text-sm font-medium ${formData.dietType === d ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-200 text-gray-600 hover:border-gray-400'}`}>
                    {d}
                  </button>
                ))}
              </div>
            </div>
            <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">Cuisines you enjoy</label>
               <div className="flex flex-wrap gap-2">
                 {['Indian', 'Italian', 'Chinese', 'Mexican', 'Continental', 'Mediterranean'].map(c => (
                   <button key={c} onClick={() => handleArrayToggle('cuisinePreferences', c)}
                     className={`px-3 py-1.5 rounded-lg border text-sm transition-colors ${formData.cuisinePreferences?.includes(c) ? 'bg-orange-100 border-orange-200 text-orange-800' : 'border-gray-200 text-gray-600'}`}>
                     {c}
                   </button>
                 ))}
               </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Allergies / Restrictions</label>
               <div className="flex flex-wrap gap-2">
                 {['Nuts', 'Dairy', 'Gluten', 'Soy', 'Shellfish'].map(a => (
                   <button key={a} onClick={() => handleArrayToggle('allergies', a)}
                     className={`px-3 py-1.5 rounded-lg border text-sm transition-colors ${formData.allergies?.includes(a) ? 'bg-red-50 border-red-200 text-red-800' : 'border-gray-200 text-gray-600'}`}>
                     {a}
                   </button>
                 ))}
               </div>
            </div>
          </div>
        )}

        <div className="flex justify-between pt-4 border-t border-gray-50">
          <button 
            disabled={step === 1}
            onClick={() => setStep(s => s - 1)}
            className={`px-6 py-2.5 rounded-xl text-gray-600 font-medium ${step === 1 ? 'opacity-0' : 'hover:bg-gray-100'}`}
          >
            Back
          </button>
          <button 
            onClick={() => step === 3 ? onSave(formData as UserProfile) : setStep(s => s + 1)}
            className="px-8 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-sm shadow-emerald-200 transition-all active:scale-95"
          >
            {step === 3 ? 'Generate Plan' : 'Next Step'}
          </button>
        </div>
      </div>
    </div>
  );
};

// 4. Meal Planner Page
const DietPlanView: React.FC<{ plan: DietPlan | null, onGenerate: () => void, status: AppStatus }> = ({ plan, onGenerate, status }) => {
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);

  if (!plan && status !== AppStatus.LOADING) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center">
        <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mb-6">
          <Sparkles className="text-emerald-500 w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Ready to Eat Better?</h2>
        <p className="text-gray-500 max-w-md mb-8">AI will generate a personalized meal plan tailored to your body type, goals, and taste buds.</p>
        <button onClick={onGenerate} className="px-8 py-3 bg-emerald-600 text-white rounded-xl font-medium shadow-lg hover:bg-emerald-700 transition-all flex items-center gap-2">
          <Sparkles size={18} /> Generate My Plan
        </button>
      </div>
    );
  }

  if (status === AppStatus.LOADING) {
     return (
       <div className="h-full flex flex-col items-center justify-center p-8">
         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mb-4"></div>
         <h3 className="text-lg font-medium text-gray-700 animate-pulse">Crafting your perfect meals...</h3>
       </div>
     )
  }

  const currentDay = plan!.days[selectedDayIndex];

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{plan!.title}</h1>
          <p className="text-gray-500 text-sm mt-1">{plan!.description}</p>
        </div>
        <button onClick={onGenerate} className="flex items-center gap-2 px-4 py-2 text-sm text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-200">
          <Sparkles size={16} /> Regenerate Plan
        </button>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-4 mb-4 scrollbar-hide">
        {plan!.days.map((day, idx) => (
          <button 
            key={idx} 
            onClick={() => setSelectedDayIndex(idx)}
            className={`flex-shrink-0 px-5 py-3 rounded-xl border transition-all ${selectedDayIndex === idx ? 'bg-gray-900 text-white border-gray-900 shadow-md' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-400'}`}
          >
            <span className="font-medium whitespace-nowrap">{day.day}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl flex items-start gap-3">
            <div className="bg-white p-2 rounded-full shadow-sm text-orange-500 mt-1">
               <Activity size={18} />
            </div>
            <div>
              <h4 className="font-semibold text-orange-900 text-sm">Daily Summary</h4>
              <p className="text-orange-800/80 text-sm leading-relaxed mt-1">{currentDay.summary}</p>
            </div>
          </div>

          <div className="space-y-4">
            {currentDay.meals.map((meal, idx) => (
              <div key={idx} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wide
                      ${meal.type === 'breakfast' ? 'bg-yellow-100 text-yellow-700' : 
                        meal.type === 'lunch' ? 'bg-blue-100 text-blue-700' :
                        meal.type === 'dinner' ? 'bg-indigo-100 text-indigo-700' : 'bg-pink-100 text-pink-700'
                      }`}>
                      {meal.type}
                    </span>
                    <h3 className="font-bold text-gray-900 text-lg">{meal.name}</h3>
                  </div>
                  <div className="text-right">
                    <span className="block font-bold text-emerald-600">{meal.nutrition.calories} kcal</span>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-4">{meal.description}</p>
                <div className="bg-gray-50 rounded-lg p-3">
                  <span className="text-xs font-semibold text-gray-500 uppercase mb-2 block">Ingredients</span>
                  <div className="flex flex-wrap gap-2">
                    {meal.ingredients.map(ing => (
                      <span key={ing} className="text-xs bg-white border border-gray-200 px-2 py-1 rounded text-gray-700">{ing}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
           <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
              <h3 className="font-bold text-gray-900 mb-4">Daily Nutrition</h3>
              <div className="space-y-4">
                 <div className="flex justify-between items-center pb-2 border-b border-gray-50">
                    <span className="text-gray-600">Calories</span>
                    <span className="font-bold text-gray-900">{currentDay.totalNutrition.calories}</span>
                 </div>
                 <div className="flex justify-between items-center pb-2 border-b border-gray-50">
                    <span className="text-gray-600">Protein</span>
                    <span className="font-bold text-blue-600">{currentDay.totalNutrition.protein}g</span>
                 </div>
                 <div className="flex justify-between items-center pb-2 border-b border-gray-50">
                    <span className="text-gray-600">Carbs</span>
                    <span className="font-bold text-yellow-600">{currentDay.totalNutrition.carbs}g</span>
                 </div>
                 <div className="flex justify-between items-center pb-2 border-b border-gray-50">
                    <span className="text-gray-600">Fats</span>
                    <span className="font-bold text-red-600">{currentDay.totalNutrition.fats}g</span>
                 </div>
              </div>
              <button className="w-full mt-6 bg-gray-900 text-white py-3 rounded-xl font-medium text-sm hover:bg-gray-800 transition">
                Export to PDF
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

// 5. Recipe AI
const Recipes: React.FC = () => {
  const [input, setInput] = useState('');
  const [recipes, setRecipes] = useState<RecipeSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSearch = async () => {
    if (!input) return;
    setLoading(true);
    try {
      const result = await GeminiService.generateRecipesFromIngredients(input.split(','));
      setRecipes(result);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLoading(true);
      const reader = new FileReader();
      reader.onloadend = async () => {
         const base64 = (reader.result as string).split(',')[1];
         try {
           const result = await GeminiService.generateRecipesFromIngredients([], base64);
           setRecipes(result);
         } finally {
           setLoading(false);
         }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto min-h-screen">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">AI Kitchen Assistant</h1>
      
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <input 
              type="text" 
              className="w-full pl-4 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
              placeholder="Enter ingredients (e.g. chicken, broccoli, rice)..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <div className="flex gap-2">
             <button onClick={handleSearch} disabled={loading} className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition disabled:opacity-50">
               {loading ? 'Thinking...' : 'Find Recipes'}
             </button>
             <button onClick={() => fileInputRef.current?.click()} className="px-4 py-3 bg-orange-100 text-orange-700 rounded-xl hover:bg-orange-200 transition">
               <Upload size={20} />
             </button>
             <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-2 ml-1">Tip: Upload a photo of your fridge content to get instant ideas!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {recipes.map((r, i) => (
          <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition">
             <div className="h-32 bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center p-6">
                <h3 className="text-white text-xl font-bold text-center">{r.title}</h3>
             </div>
             <div className="p-6">
               <div className="flex justify-between text-sm mb-4 text-gray-500">
                  <span className="flex items-center gap-1"><Activity size={14}/> {r.calories} kcal</span>
                  <span>{r.timeToCook}</span>
                  <span className="capitalize">{r.difficulty}</span>
               </div>
               <div className="space-y-4">
                 <div>
                   <h4 className="font-semibold text-gray-900 text-sm mb-2">Ingredients</h4>
                   <p className="text-sm text-gray-600 leading-relaxed">{r.ingredients.join(", ")}</p>
                 </div>
                 <div>
                   <h4 className="font-semibold text-gray-900 text-sm mb-2">Instructions</h4>
                   <ol className="list-decimal list-inside text-sm text-gray-600 space-y-1">
                     {r.instructions.slice(0, 3).map((step, si) => <li key={si}>{step}</li>)}
                     {r.instructions.length > 3 && <li>...and more</li>}
                   </ol>
                 </div>
               </div>
             </div>
          </div>
        ))}
      </div>
      
      {recipes.length === 0 && !loading && (
        <div className="text-center py-20 opacity-50">
          <ChefHat size={64} className="mx-auto mb-4 text-gray-300" />
          <p>Ready to cook something delicious?</p>
        </div>
      )}
    </div>
  );
};

// 6. Floating Chatbot
const Chatbot: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<{role: 'user'|'model', text: string}[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if(scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [messages]);

    const handleSend = async () => {
        if(!input.trim()) return;
        const userMsg = input;
        setMessages(prev => [...prev, {role: 'user', text: userMsg}]);
        setInput('');
        setLoading(true);

        try {
            const history = messages.map(m => ({
                role: m.role,
                parts: [{ text: m.text }]
            }));
            const response = await GeminiService.chatWithFoodAI(userMsg, history);
            setMessages(prev => [...prev, {role: 'model', text: response}]);
        } catch (error) {
            setMessages(prev => [...prev, {role: 'model', text: "Sorry, I'm having trouble connecting right now."}]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {!isOpen && (
                <button 
                    onClick={() => setIsOpen(true)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white p-4 rounded-full shadow-lg shadow-emerald-200 transition-all hover:scale-110"
                >
                    <MessageCircle size={24} />
                </button>
            )}
            
            {isOpen && (
                <div className="bg-white rounded-2xl shadow-xl w-80 md:w-96 flex flex-col border border-gray-100 overflow-hidden mb-4 mr-2" style={{height: '500px'}}>
                    <div className="bg-emerald-600 p-4 flex justify-between items-center text-white">
                        <div className="flex items-center gap-2">
                           <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
                           <h3 className="font-medium">MealCraft Assistant</h3>
                        </div>
                        <button onClick={() => setIsOpen(false)}><X size={18} /></button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50" ref={scrollRef}>
                        {messages.length === 0 && (
                            <div className="text-center text-xs text-gray-400 mt-10">
                                Ask me anything about nutrition, diets, or food!
                            </div>
                        )}
                        {messages.map((m, i) => (
                            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${m.role === 'user' ? 'bg-emerald-600 text-white rounded-br-none' : 'bg-white border border-gray-200 text-gray-700 rounded-bl-none shadow-sm'}`}>
                                    {m.text}
                                </div>
                            </div>
                        ))}
                        {loading && <div className="text-xs text-gray-400 ml-4 animate-pulse">Typing...</div>}
                    </div>

                    <div className="p-3 bg-white border-t border-gray-100 flex gap-2">
                        <input 
                            type="text" 
                            className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-emerald-500"
                            placeholder="Ask a question..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        />
                        <button onClick={handleSend} disabled={loading} className="p-2 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 transition disabled:opacity-50">
                            <Send size={16} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

// 7. Home Landing Page
const Home: React.FC<{ logoUrl: string | null }> = ({ logoUrl }) => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 pt-8 pb-20">
        <nav className="flex justify-between items-center mb-16">
          <div className="flex items-center gap-2">
             {logoUrl ? <img src={logoUrl} className="w-10 h-10 rounded-full" /> : <div className="w-10 h-10 bg-emerald-100 rounded-full"></div>}
             <span className="font-bold text-xl text-gray-900">MealCraft</span>
          </div>
          <button onClick={() => navigate('/profile')} className="text-sm font-medium text-gray-600 hover:text-emerald-600">Log In</button>
        </nav>
        
        <div className="grid md:grid-cols-2 gap-12 items-center">
           <div className="space-y-6">
             <div className="inline-block px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold tracking-wide mb-2">
               AI-POWERED NUTRITION
             </div>
             <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight">
               Smart Eating <br/> <span className="text-emerald-600">Made Simple.</span>
             </h1>
             <p className="text-lg text-gray-500 max-w-md">
               Generate personalized diet plans, shopping lists, and delicious recipes in seconds with the power of AI.
             </p>
             <div className="flex gap-4 pt-4">
               <button onClick={() => navigate('/profile')} className="px-8 py-4 bg-emerald-600 text-white rounded-xl font-semibold shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition flex items-center gap-2">
                 Get Started <ArrowRight size={18} />
               </button>
               <button className="px-8 py-4 bg-white border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition">
                 Learn More
               </button>
             </div>
           </div>
           <div className="relative">
             <div className="absolute inset-0 bg-gradient-to-tr from-emerald-200 to-orange-100 rounded-full blur-3xl opacity-50"></div>
             <img src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" alt="Healthy Food" className="relative rounded-3xl shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-500" />
             
             <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-lg border border-gray-100 max-w-xs animate-bounce" style={{animationDuration: '3s'}}>
                <div className="flex items-center gap-3">
                   <div className="bg-green-100 p-2 rounded-full text-green-600"><CheckCircle size={20} /></div>
                   <div>
                     <p className="font-bold text-gray-900 text-sm">Balanced Diet</p>
                     <p className="text-xs text-gray-500">Your daily protein goal reached!</p>
                   </div>
                </div>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [dietPlan, setDietPlan] = useState<DietPlan | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [planStatus, setPlanStatus] = useState<AppStatus>(AppStatus.IDLE);
  
  const navigate = useNavigate();
  const location = useLocation();

  // Load logo on mount if not present (simulate app branding fetch)
  useEffect(() => {
    const fetchLogo = async () => {
      // In a real app, this would be stored or fetched once. 
      // We generate it here to satisfy the "Generate a logo concept" requirement dynamically.
      const savedLogo = localStorage.getItem('mealcraft_logo');
      if (savedLogo) {
          setLogoUrl(savedLogo);
      } else {
         // Trigger generation only if user enters main app to save costs/time, or use a default placeholder initially
         // For demo purposes, we will provide a button in Profile to generate it to show off the AI.
      }
    };
    fetchLogo();
  }, []);

  const handleGenerateLogo = async () => {
      const url = await GeminiService.generateAppLogo();
      if (url) {
          setLogoUrl(url);
          localStorage.setItem('mealcraft_logo', url);
      }
  };

  const handleProfileSave = (profile: UserProfile) => {
    setUserProfile(profile);
    navigate('/plan');
  };

  const handleGeneratePlan = async () => {
    if (!userProfile) return;
    setPlanStatus(AppStatus.LOADING);
    try {
      const plan = await GeminiService.generateDietPlan(userProfile, 7);
      setDietPlan(plan);
      setPlanStatus(AppStatus.SUCCESS);
      // Trigger logo generation in background if not exists
      if (!logoUrl) handleGenerateLogo();
    } catch (e) {
      console.error(e);
      setPlanStatus(AppStatus.ERROR);
    }
  };

  // Simple layout wrapper
  const isPublic = location.pathname === '/';
  
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-gray-900 selection:bg-emerald-100 selection:text-emerald-900">
      {!isPublic && <Navbar logoUrl={logoUrl} />}
      
      <main className={`${!isPublic ? 'md:ml-64 pt-14 md:pt-0' : ''} min-h-screen transition-all`}>
        <Routes>
          <Route path="/" element={<Home logoUrl={logoUrl} />} />
          <Route path="/profile" element={<ProfileSetup onSave={handleProfileSave} initialData={userProfile} />} />
          <Route path="/plan" element={<DietPlanView plan={dietPlan} onGenerate={handleGeneratePlan} status={planStatus} />} />
          <Route path="/dashboard" element={<Dashboard profile={userProfile} plan={dietPlan} />} />
          <Route path="/recipes" element={<Recipes />} />
          <Route path="/list" element={
            <div className="p-8 text-center text-gray-500">
               {dietPlan ? (
                 <div className="max-w-2xl mx-auto text-left">
                   <h1 className="text-2xl font-bold text-gray-900 mb-6">Smart Grocery List</h1>
                   <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                      {/* Simulating list generation from plan */}
                      {dietPlan.days[0].meals.flatMap(m => m.ingredients).slice(0, 10).map((ing, i) => (
                        <div key={i} className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0">
                          <input type="checkbox" className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500 border-gray-300" />
                          <span className="text-gray-700 capitalize">{ing}</span>
                        </div>
                      ))}
                      <button className="w-full mt-6 py-2 border border-emerald-600 text-emerald-600 rounded-lg font-medium hover:bg-emerald-50">
                        Add Custom Item
                      </button>
                   </div>
                 </div>
               ) : (
                 <p>Generate a diet plan first to see your shopping list!</p>
               )}
            </div>
          } />
        </Routes>
      </main>

      {!isPublic && <Chatbot />}
    </div>
  );
}
