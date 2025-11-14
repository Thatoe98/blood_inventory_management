interface StatsCardProps {
  title: string;
  value: string | number;
  icon: string;
  color: 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'orange';
  subtitle?: string;
}

const colorClasses = {
  red: 'from-red-500 to-red-600 shadow-red-200',
  blue: 'from-blue-500 to-blue-600 shadow-blue-200',
  green: 'from-green-500 to-green-600 shadow-green-200',
  yellow: 'from-yellow-500 to-yellow-600 shadow-yellow-200',
  purple: 'from-purple-500 to-purple-600 shadow-purple-200',
  orange: 'from-orange-500 to-orange-600 shadow-orange-200',
};

const iconBgClasses = {
  red: 'bg-red-100 text-red-600',
  blue: 'bg-blue-100 text-blue-600',
  green: 'bg-green-100 text-green-600',
  yellow: 'bg-yellow-100 text-yellow-600',
  purple: 'bg-purple-100 text-purple-600',
  orange: 'bg-orange-100 text-orange-600',
};

export default function StatsCard({ title, value, icon, color, subtitle }: StatsCardProps) {
  return (
    <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden border border-gray-100 animate-fade-in-up">
      {/* Background gradient overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br ${colorClasses[color]} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
      
      {/* Animated corner accent */}
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${colorClasses[color]} opacity-10 rounded-bl-full transform translate-x-16 -translate-y-16 group-hover:translate-x-12 group-hover:-translate-y-12 transition-transform duration-500`}></div>
      
      <div className="relative p-6">
        <div className="flex items-center justify-between mb-4">
          {/* Icon with animation */}
          <div className={`${iconBgClasses[color]} w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-lg transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
            {icon}
          </div>
        </div>
        
        {/* Value with gradient */}
        <div className="mb-2">
          <div className={`text-4xl font-bold bg-gradient-to-r ${colorClasses[color]} bg-clip-text text-transparent`}>
            {value}
          </div>
        </div>
        
        {/* Title */}
        <div className="text-sm font-medium text-gray-600 uppercase tracking-wide">
          {title}
        </div>
        
        {/* Subtitle (optional) */}
        {subtitle && (
          <div className="text-xs text-gray-500 mt-1">
            {subtitle}
          </div>
        )}
        
        {/* Bottom accent line */}
        <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${colorClasses[color]} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left`}></div>
      </div>
    </div>
  );
}
