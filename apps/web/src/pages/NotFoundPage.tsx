import React from 'react';
import { useNavigate } from 'react-router-dom';
import { NpcAvatar } from '../components/art/NpcAvatar';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[calc(100vh-60px)] bg-slate-900 text-white p-6 flex flex-col items-center justify-center text-center">
      <NpcAvatar id="mira" size="xl" animate={true} />
      <h1 className="text-4xl font-display font-black text-emerald-400 mt-4">
        404 - Lost in the Suburbs!
      </h1>
      <p className="text-sm text-slate-300 max-w-md mt-2">
        Mayor Mira couldn't find this municipal sector on our blueprints. Let's return to the City Map hub!
      </p>
      <button
        onClick={() => navigate('/map')}
        className="mt-6 btn-cartoon-green"
      >
        🗺️ Return to City Map
      </button>
    </div>
  );
};
