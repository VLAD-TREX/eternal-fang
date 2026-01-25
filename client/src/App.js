// src/App.js
import React, { useState, useEffect } from 'react';
import './App.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const App = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [games, setGames] = useState([]);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [usernameError, setUsernameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedGame, setSelectedGame] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [hoveredGameId, setHoveredGameId] = useState(null);

  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const addNotification = (message, type = 'success') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  };

  const addGameToProfile = async (game, status) => {
    if (!user) {
      addNotification('Сначала войдите в систему', 'error');
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/user/${user.email}/game`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId: game.id, title: game.name, status, progress: 0 })
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data);
        setShowStatusModal(false);
        addNotification('Игра добавлена!', 'success');
      } else {
        addNotification('Ошибка при добавлении игры', 'error');
      }
    } catch (err) {
      console.error('Ошибка:', err);
      addNotification('Не удалось подключиться к серверу', 'error');
    }
  };

  const updateGameStatus = async (gameId, newStatus) => {
    if (!user) return;
    const gameToUpdate = user.games.find(g => g.gameId === gameId);
    if (!gameToUpdate) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/user/${user.email}/game`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameId: gameToUpdate.gameId,
          title: gameToUpdate.title,
          status: newStatus,
          progress: gameToUpdate.progress || 0
        })
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data);
        addNotification('Статус обновлён!', 'success');
      } else {
        addNotification('Ошибка при обновлении', 'error');
      }
    } catch (err) {
      console.error('Ошибка:', err);
      addNotification('Не удалось подключиться к серверу', 'error');
    }
  };

  const removeGameFromProfile = async (gameId) => {
    if (!user) {
      addNotification('Сначала войдите в систему', 'error');
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/user/${user.email}/game/${gameId}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        setUser(data);
        addNotification('Игра удалена', 'success');
      } else {
        addNotification('Ошибка при удалении игры', 'error');
      }
    } catch (err) {
      console.error('Ошибка:', err);
      addNotification('Не удалось подключиться к серверу', 'error');
    }
  };

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/games/search?q=${searchQuery}`);
        const data = await res.json();
        setGames(data.results || []);
      } catch (err) {
        console.error('Ошибка загрузки игр:', err);
        setGames([]);
      }
    };
    const delay = setTimeout(fetchGames, 300);
    return () => clearTimeout(delay);
  }, [searchQuery]);

  const handleUsernameChange = (e) => {
    const value = e.target.value;
    setUsername(value);
    if (usernameError && value.trim()) setUsernameError('');
  };

  const handleEmailChange = (e) => {
    let value = e.target.value.replace(/[^a-zA-Z0-9._@]/g, '');
    setEmail(value);
    if (emailError && value.trim()) {
      const allowedDomains = ['gmail.com', 'yandex.ru', 'mail.ru'];
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      const domain = value.split('@')[1];
      if (emailRegex.test(value) && allowedDomains.includes(domain)) {
        setEmailError('');
      }
    }
  };

  const handleLogin = async () => {
    let hasError = false;

    if (!username.trim()) {
      setUsernameError('Никнейм обязателен');
      hasError = true;
    } else {
      setUsernameError('');
    }

    if (!email.trim()) {
      setEmailError('Email обязателен');
      hasError = true;
    } else {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(email)) {
        setEmailError('Некорректный формат email');
        hasError = true;
      } else {
        const domain = email.split('@')[1];
        const allowedDomains = ['gmail.com', 'yandex.ru', 'mail.ru'];
        if (!allowedDomains.includes(domain)) {
          setEmailError('Разрешены только gmail.com, yandex.ru или mail.ru');
          hasError = true;
        } else {
          setEmailError('');
        }
      }
    }

    if (hasError) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email })
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data);
        addNotification('Добро пожаловать!', 'success');
      } else if (data.error === 'Пользователь уже существует') {
        const userRes = await fetch(`${API_BASE_URL}/api/user/${email}`);
        const userData = await userRes.json();
        if (userRes.ok) {
          setUser(userData);
          addNotification('С возвращением!', 'success');
        } else {
          addNotification('Не удалось загрузить профиль', 'error');
        }
      } else {
        addNotification(data.error || 'Ошибка регистрации', 'error');
      }
    } catch (err) {
      console.error('Ошибка:', err);
      addNotification('Не удалось подключиться к серверу', 'error');
    }
  };

  const logout = () => {
    setUser(null);
    setActiveTab('all');
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <div className="app">
      {/* Уведомления */}
      <div className="notification-container">
        {notifications.map(n => (
          <div key={n.id} className={`notification ${n.type}`}>
            {n.message}
          </div>
        ))}
      </div>

      {/* Шапка */}
      <header className="app-header">
        <div
          className={`logo-container ${isMobile ? 'mobile-logo' : ''}`}
          onClick={() => isMobile && setIsMobileMenuOpen(true)}
        >
          <img
            src="/logo2.png"
            alt="Eternal Fang"
            className={`logo ${isMobileMenuOpen ? 'logo-open' : ''}`}
          />
        </div>
        <div className="search-box">
          <input
            type="text"
            placeholder="найти игру..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </header>

      <div className="app-container">
        {/* Боковое меню */}
        <aside
          className={`sidebar ${isMobile ? (isMobileMenuOpen ? 'open' : '') : 'desktop'}`}
          onClick={handleOverlayClick}
        >
          <div className="sidebar-content" onClick={(e) => e.stopPropagation()}>
            {!user ? (
              <div className="auth-section">
                <h3>Регистрация</h3>
                <input
                  type="text"
                  value={username}
                  onChange={handleUsernameChange}
                  placeholder="Никнейм"
                />
                {usernameError && <p className="error-text">{usernameError}</p>}
                <input
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  placeholder="@gmail.com"
                />
                {emailError && <p className="error-text">{emailError}</p>}
                <button
                  className="login-btn"
                  onClick={handleLogin}
                  disabled={!username.trim() || !email.trim() || !!usernameError || !!emailError}
                >
                  продолжить
                </button>
              </div>
            ) : (
              <div className="profile-preview">
                <h4>{user.username}</h4>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Игр в профиле:</strong> {user.games?.length || 0}</p>
                <button className="logout-btn" onClick={logout}>
                  Выйти
                </button>
              </div>
            )}

            {isMobile && (
              <div
                className="sidebar-close-icon"
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="Закрыть меню"
              >
                <img
                  src="/logo2.png"
                  alt="Закрыть"
                  className={`sidebar-logo-icon ${isMobileMenuOpen ? 'animate' : ''}`}
                />
              </div>
            )}

            {/* Соцсети — красивые кнопки */}
            <div className="social-icons">
              <a href="https://t.me/your_channel" target="_blank" rel="noopener noreferrer" className="social-icon-btn" aria-label="Telegram">T</a>
              <a href="https://youtube.com/@your_channel" target="_blank" rel="noopener noreferrer" className="social-icon-btn" aria-label="YouTube">Y</a>
              <a href="https://discord.gg/your_invite" target="_blank" rel="noopener noreferrer" className="social-icon-btn" aria-label="Discord">D</a>
            </div>
          </div>
        </aside>

        {/* Мобильный оверлей */}
        {isMobile && isMobileMenuOpen && (
          <div className="mobile-overlay" onClick={handleOverlayClick}></div>
        )}

        {/* Основной контент */}
        <main className="main-content">
          {user && (
            <div className="tabs">
              <button className={`tab-button ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>
                Все игры
              </button>
              <button className={`tab-button ${activeTab === 'planning' ? 'active' : ''}`} onClick={() => setActiveTab('planning')}>
                Хочу поиграть ({user.games?.filter(g => g.status === 'planning').length || 0})
              </button>
              <button className={`tab-button ${activeTab === 'playing' ? 'active' : ''}`} onClick={() => setActiveTab('playing')}>
                Играю ({user.games?.filter(g => g.status === 'playing').length || 0})
              </button>
              <button className={`tab-button ${activeTab === 'completed' ? 'active' : ''}`} onClick={() => setActiveTab('completed')}>
                Пройдено ({user.games?.filter(g => g.status === 'completed').length || 0})
              </button>
            </div>
          )}

          <div className="games-grid">
            {games.map(game => {
              const isAdded = user?.games?.some(g => g.gameId === game.id);
              const gameStatus = user?.games?.find(g => g.gameId === game.id)?.status;
              if (user && activeTab !== 'all' && gameStatus !== activeTab) return null;
              return (
                <div
                  key={game.id}
                  className="game-card"
                  onMouseEnter={() => setHoveredGameId(game.id)}
                  onMouseLeave={() => setHoveredGameId(null)}
                >
                  <img
                    src={game.background_image}
                    alt={game.name}
                    onError={(e) => e.target.src = 'https://via.placeholder.com/300x150?text=No+Image'}
                  />
                  <div className="game-info">
                    <h3>{game.name}</h3>
                    <p className="release-date">{game.released}</p>
                    <div className={`game-description ${hoveredGameId === game.id ? 'visible' : ''}`}>
                      {game.description || 'Нет описания'}
                    </div>
                    {isAdded ? (
                      <div className="game-actions">
                        {gameStatus === 'completed' ? (
                          <button className="remove-btn" onClick={() => removeGameFromProfile(game.id)}>
                            удалить
                          </button>
                        ) : (
                          <>
                            <button className="remove-btn" onClick={() => removeGameFromProfile(game.id)}>
                              удалить
                            </button>
                            <button
                              className="edit-btn"
                              onClick={() => updateGameStatus(game.id, gameStatus === 'playing' ? 'completed' : 'playing')}
                            >
                              {gameStatus === 'playing' ? 'Пройдено' : 'Играю'}
                            </button>
                          </>
                        )}
                      </div>
                    ) : (
                      <button
                        className="add-btn"
                        onClick={() => {
                          setSelectedGame(game);
                          setShowStatusModal(true);
                        }}
                        disabled={!user}
                      >
                        {user ? 'Добавить в профиль' : 'Войдите, чтобы добавить'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

          </div>
        </main>
      </div>

      {/* Модальное окно выбора статуса */}
      {showStatusModal && selectedGame && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Куда добавить "{selectedGame.name}"?</h3>
            <div className="modal-buttons">
              <button className="modal-btn planning" onClick={() => { addGameToProfile(selectedGame, 'planning'); setShowStatusModal(false); }}>
                Хочу поиграть
              </button>
              <button className="modal-btn playing" onClick={() => { addGameToProfile(selectedGame, 'playing'); setShowStatusModal(false); }}>
                Играю
              </button>
              <button className="modal-btn completed" onClick={() => { addGameToProfile(selectedGame, 'completed'); setShowStatusModal(false); }}>
                Пройдено
              </button>
            </div>
            <button className="modal-close" onClick={() => setShowStatusModal(false)}>
              Отмена
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
