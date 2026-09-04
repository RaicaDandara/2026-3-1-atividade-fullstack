import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface StarRatingProps {
  postId: string;
  initialAverage: number;
  initialCount: number;
  initialUserRating: number | null;
  onRateSuccess?: (average: number, count: number, userRating: number) => void;
}

export const StarRating: React.FC<StarRatingProps> = ({
  postId,
  initialAverage,
  initialCount,
  initialUserRating,
  onRateSuccess,
}) => {
  const [average, setAverage] = useState(initialAverage);
  const [count, setCount] = useState(initialCount);
  const [userRating, setUserRating] = useState<number | null>(initialUserRating);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleRate = async (stars: number) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await api.post<{
        rating: { stars: number };
        averageRating: number;
        ratingsCount: number;
      }>(`/posts/${postId}/rate`, { stars });

      setAverage(response.averageRating);
      setCount(response.ratingsCount);
      setUserRating(stars);

      if (onRateSuccess) {
        onRateSuccess(response.averageRating, response.ratingsCount, stars);
      }
    } catch (err) {
      console.error('Erro ao avaliar publicação:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      {/* 3 Estrelas Interativas (Regra 4: de 1 a 3 estrelas) */}
      <div className="flex items-center space-x-0.5">
        {[1, 2, 3].map((starIndex) => {
          const isFilled =
            hoverRating !== null
              ? starIndex <= hoverRating
              : userRating !== null
              ? starIndex <= userRating
              : starIndex <= Math.round(average);

          return (
            <button
              key={starIndex}
              type="button"
              disabled={isSubmitting}
              onMouseEnter={() => setHoverRating(starIndex)}
              onMouseLeave={() => setHoverRating(null)}
              onClick={() => handleRate(starIndex)}
              className={`p-1 rounded transition-transform active:scale-125 focus:outline-none ${
                isSubmitting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
              }`}
              title={`Avaliar com ${starIndex} estrela${starIndex > 1 ? 's' : ''}`}
            >
              <Star
                size={18}
                className={`transition-colors ${
                  isFilled
                    ? 'text-diatinf-yellow fill-diatinf-yellow'
                    : 'text-gray-300 hover:text-diatinf-yellow/60'
                }`}
              />
            </button>
          );
        })}
      </div>

      {/* Indicador Numérico e Total de Avaliações */}
      <div className="flex items-center text-xs text-gray-500 space-x-1">
        <span className="font-bold text-diatinf-blue-dark">
          {average > 0 ? average.toFixed(1) : '0.0'}
        </span>
        <span className="text-[10px] text-gray-400">({count})</span>
      </div>

      {userRating && (
        <span className="text-[10px] bg-diatinf-yellow/20 text-diatinf-primary font-semibold px-1.5 py-0.5 rounded-full">
          Sua nota: {userRating}★
        </span>
      )}
    </div>
  );
};

