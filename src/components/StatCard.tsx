
import React from 'react';
import { StatCardData } from '../../types';

interface StatCardProps {
  data: StatCardData;
}

const StatCard: React.FC<StatCardProps> = ({ data }) => {
  const { title, value, change, isPositive, icon } = data;
  const changeColor = isPositive ? 'text-green-400' : 'text-red-400';

  return (
    <div className="bg-slate-800 p-6 rounded-xl shadow-lg flex flex-col justify-between hover:bg-slate-700/50 transition-colors duration-300">
      <div className="flex justify-between items-start mb-4">
        <div className="flex flex-col">
          <p className="text-sm text-slate-400">{title}</p>
          <p className="text-3xl font-bold text-white mt-1">{value}</p>
        </div>
        <div className="bg-slate-700 p-3 rounded-lg text-blue-400">
          {icon}
        </div>
      </div>
      {change && (
        <div className="flex items-center text-sm">
            <span className={`font-semibold ${changeColor}`}>{change}</span>
            <span className="text-slate-500 ml-2">from yesterday</span>
        </div>
      )}
    </div>
  );
};

export default StatCard;