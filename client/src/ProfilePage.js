// src/ProfilePage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';

const ProfilePage = ({ user, gamesByStatus, updateGameStatus, removeGameFromProfile }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('planning');

  // Защита: если user не передан — показываем заглушку
  if (!user) {
    return (
      <div className="profile-page">
        <div className="profile-header">
          <h2>Ошибка: профиль не загружен</h2>
          <button onClick={() => navigate('/')}>На главную</button>
        </div>
      </div>
    );
  }

  // Защита от undefined
  const safeGames = {
    planning: Array.isArray(gamesByStatus?.planning) ? gamesByStatus.planning : [],
    playing: Array.isArray(gamesByStatus?.playing) ? gamesByStatus.playing : [],
    completed: Array.isArray(gamesByStatus?.completed) ? gamesByStatus.completed : []
  };

  const tabs = [
    { key: 'planning', label: 'Хочу поиграть', games: safeGames.planning },
    { key: 'playing', label: 'Играю', games: safeGames.playing },
    { key: 'completed', label: 'Пройдено', games: safeGames.completed }
  ];

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div
            onClick={() => navigate('/')}
            style={{ cursor: 'pointer' }}
          >
            <img
              src="/logo2.png"
              alt="Eternal Fang"
              style={{ width: '40px', height: '40px', marginRight: '10px' }}
            />
          </div>
          <div>
            <h2>👤 {user.username}</h2>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Всего игр:</strong> {Array.isArray(user.games) ? user.games.length : 0}</p>
          </div>
        </div>
      </div>

      <div className="tabs">
        {tabs.map(tab => (
          <button
            key={tab.key}
            className={`tab-button ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label} ({tab.games.length})
          </button>
        ))}
      </div>

      <div className="games-grid">
        {safeGames[activeTab].map(game => (
          <div key={game.gameId} className="game-card">
            <img
              src={game.background_image}
              alt={game.title}
              onError={(e) => e.target.src = 'https://via.placeholder.com/300x150?text=No+Image'}
            />
            <div className="game-info">
              <h3>{game.title}</h3>
              {game.status === 'playing' && (
                <p className="progress">Прогресс: {game.progress}%</p>
              )}
              <div className="game-actions">
                <button
                  className="remove-btn"
                  onClick={() => removeGameFromProfile(game.gameId)}
                >
                  ✕ Удалить
                </button>
                <button
                  className="edit-btn"
                  onClick={() => updateGameStatus(game.gameId, game.status === 'playing' ? 'completed' : 'playing')}
                >
                  {game.status === 'playing' ? '✅ Пройдено' : '▶️ Играю'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProfilePage;