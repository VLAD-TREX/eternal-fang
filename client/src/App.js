
import React, { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const App = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [games, setGames] = useState([]);
  const [filteredGames, setFilteredGames] = useState([]);
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
  const [isLoading, setIsLoading] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const gameCardsRef = useRef([]);
  const searchInputRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (filteredGames.length > 0 && gameCardsRef.current) {
      gameCardsRef.current.forEach((card, index) => {
        if (card) {
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, index * 100);
        }
      });
    }
  }, [filteredGames]);

  useEffect(() => {
    const loadAllGames = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/api/games/search`);
        const data = await res.json();
        setGames(data.results || []);
        setFilteredGames(data.results || []);
      } catch (err) {
        console.error('Ошибка загрузки игр:', err);
        setGames([]);
        setFilteredGames([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadAllGames();
  }, []);

  useEffect(() => {
    let result = games;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = games.filter(game => 
        game.name.toLowerCase().includes(query)
      );
    }
 
    if (user && activeTab !== 'all') {
      result = result.filter(game => {
        const gameInProfile = user.games?.find(g => g.gameId === game.id);
        return gameInProfile && gameInProfile.status === activeTab;
      });
    }
    
    setFilteredGames(result);
  }, [searchQuery, activeTab, games, user]);

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
    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  const updateGameStatus = async (gameId, newStatus) => {
    if (!user) return;
    const gameToUpdate = user.games.find(g => g.gameId === gameId);
    if (!gameToUpdate) return;
    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  const removeGameFromProfile = async (gameId) => {
    if (!user) {
      addNotification('Сначала войдите в систему', 'error');
      return;
    }
    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  const handleUsernameChange = (e) => {
    const value = e.target.value.slice(0, 30);
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
    } else if (username.length < 3) {
      setUsernameError('Никнейм должен быть не менее 3 символов');
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

    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setActiveTab('all');
    addNotification('Вы вышли из системы', 'info');
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      setIsMobileMenuOpen(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Неизвестно';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const getStats = () => {
    if (!user || !user.games) return { planning: 0, playing: 0, completed: 0 };
    return {
      planning: user.games.filter(g => g.status === 'planning').length,
      playing: user.games.filter(g => g.status === 'playing').length,
      completed: user.games.filter(g => g.status === 'completed').length
    };
  };

  return (
    <div className="app">
      <div className="notification-container">
        {notifications.map(n => (
          <div key={n.id} className={`notification ${n.type}`}>
            <span className="notification-icon">
              {n.type === 'success' && '✓'}
              {n.type === 'error' && '✗'}
              {n.type === 'info' && 'ℹ'}
            </span>
            {n.message}
          </div>
        ))}
      </div>

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
          <div className="logo-text">
            <span className="logo-main">Eternal</span>
            <span className="logo-accent">Fang</span>
          </div>
        </div>
        
        <div className="header-actions">
          <div className="search-box">
            <svg className="search-icon" viewBox="0 0 24 24">
              <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
            <input
              ref={searchInputRef}
              type="text"
              placeholder=" найти игру..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            {searchQuery && (
              <button
                className="clear-search"
                onClick={() => setSearchQuery('')}
                aria-label="Очистить поиск"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="app-container">
        <aside
          className={`sidebar ${isMobile ? (isMobileMenuOpen ? 'open' : 'closed') : 'desktop'}`}
          onClick={handleOverlayClick}
        >
          <div className="sidebar-content" onClick={(e) => e.stopPropagation()}>
            {!user ? (
              <div className="auth-section">
                <h3 className="auth-title">Вход / Регистрация</h3>
                <div className="input-group">
                  <label htmlFor="username">Никнейм</label>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={handleUsernameChange}
                    placeholder="Ваш игровой ник"
                    maxLength={30}
                    className={usernameError ? 'error' : ''}
                  />
                  {usernameError && <p className="error-text">{usernameError}</p>}
                </div>
                <div className="input-group">
                  <label htmlFor="email">Email</label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    placeholder="user@gmail.com"
                    className={emailError ? 'error' : ''}
                  />
                  {emailError && <p className="error-text">{emailError}</p>}
                </div>
                <button
                  className="login-btn"
                  onClick={handleLogin}
                  disabled={!username.trim() || !email.trim() || !!usernameError || !!emailError || isLoading}
                >
                  {isLoading ? 'загрузка' : 'продолжить'}
                </button>
                <p className="auth-hint">
                  После входа вы сможете отслеживать свои игры, создавать списки и многое другое!
                </p>
              </div>
            ) : (
              <div className="profile-preview">
                <div className="profile-header">
                  <div className="profile-avatar">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <h4>{user.username}</h4>
                  <p className="profile-email">{user.email}</p>
                </div>
              
                <button className="logout-btn" onClick={logout}>
                  Выйти из аккаунта
                </button>
              </div>
            )}

            {isMobile && (
              <div
                className="sidebar-close-icon"
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="Закрыть меню"
              >
                ✕
              </div>
            )}

            <div className="sidebar-footer">
              <div className="social-icons">
                <a href="https://t.me/your_channel" target="_blank" rel="noopener noreferrer" className="social-icon-btn" aria-label="Telegram">
                  <span className="social-text">TG</span>
                </a>
                <a href="https://youtube.com/@your_channel" target="_blank" rel="noopener noreferrer" className="social-icon-btn" aria-label="YouTube">
                  <span className="social-text">YT</span>
                </a>
                <a href="https://discord.gg/your_invite" target="_blank" rel="noopener noreferrer" className="social-icon-btn" aria-label="Discord">
                  <span className="social-text">DS</span>
                </a>
              </div>
              
              <div className="app-version">
                <span>© 2026 Eternal Fang</span>
              </div>
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
              <button 
                className={`tab-button ${activeTab === 'all' ? 'active' : ''}`} 
                onClick={() => setActiveTab('all')}
              >
                <span className="tab-icon"></span>
                Все игры
              </button>
              <button 
                className={`tab-button ${activeTab === 'planning' ? 'active' : ''}`} 
                onClick={() => setActiveTab('planning')}
              >
                <span className="tab-icon"></span>
                Хочу поиграть ({getStats().planning})
              </button>
              <button 
                className={`tab-button ${activeTab === 'playing' ? 'active' : ''}`} 
                onClick={() => setActiveTab('playing')}
              >
                <span className="tab-icon"></span>
                Играю ({getStats().playing})
              </button>
              <button 
                className={`tab-button ${activeTab === 'completed' ? 'active' : ''}`} 
                onClick={() => setActiveTab('completed')}
              >
                <span className="tab-icon"></span>
                Пройдено ({getStats().completed})
              </button>
            </div>
          )}

          {isLoading && (
            <div className="loading-indicator">
              <div className="spinner"></div>
              <p>Загрузка игр...</p>
            </div>
          )}

          {searchQuery && filteredGames.length === 0 && !isLoading && (
            <div className="no-results">
              <svg viewBox="0 0 24 24" className="no-results-icon">
                <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
              </svg>
              <p>Ничего не найдено по запросу "{searchQuery}"</p>
              <button onClick={() => setSearchQuery('')} className="reset-search-btn">
                Очистить поиск
              </button>
            </div>
          )}

          <div className="games-grid">
            {filteredGames.map((game, index) => {
              const isAdded = user?.games?.some(g => g.gameId === game.id);
              const gameStatus = user?.games?.find(g => g.gameId === game.id)?.status;
              
              return (
                <div
                  key={game.id}
                  ref={el => gameCardsRef.current[index] = el}
                  className={`game-card ${isAdded ? 'added' : ''} ${hoveredGameId === game.id ? 'hovered' : ''}`}
                  onMouseEnter={() => setHoveredGameId(game.id)}
                  onMouseLeave={() => setHoveredGameId(null)}
                  style={{ opacity: 0, transform: 'translateY(20px)' }}
                >
                  <div className="game-image-wrapper">
                    <img
                      src={game.background_image || 'https://via.placeholder.com/300x150?text=No+Image'}
                      alt={game.name}
                      className="game-image"
                      onError={(e) => e.target.src = 'https://via.placeholder.com/300x150/2d2d3d/ffffff?text=No+Image'}
                    />
                    {isAdded && (
                      <div className={`status-badge ${gameStatus}`}>
                        {gameStatus === 'planning' && 'Хочу поиграть'}
                        {gameStatus === 'playing' && 'Играю'}
                        {gameStatus === 'completed' && 'Пройдено'}
                      </div>
                    )}
                  </div>
                  
                  <div className="game-info">
                    <h3 className="game-title">{game.name}</h3>
                    <p className="release-date">{formatDate(game.released)}</p>
                    
                    <div className={`game-description ${hoveredGameId === game.id ? 'visible' : ''}`}>
                      {game.description_raw?.slice(0, 150) || game.description?.slice(0, 150) || 'Нет описания'}
                      {game.description_raw?.length > 150 && '...'}
                    </div>
                    
                    {isAdded ? (
                      <div className="game-actions">
                        <button 
                          className="action-btn remove-btn" 
                          onClick={() => removeGameFromProfile(game.id)}
                          title="Удалить из профиля"
                        >
                          Удалить
                        </button>
                        
                        {gameStatus === 'completed' ? (
                          <button 
                            className="action-btn edit-btn" 
                            onClick={() => updateGameStatus(game.id, 'playing')}
                            title="Переместить в 'Играю'"
                          >
                            В процессе
                          </button>
                        ) : (
                          <button 
                            className="action-btn edit-btn" 
                            onClick={() => updateGameStatus(game.id, gameStatus === 'playing' ? 'completed' : 'playing')}
                            title={gameStatus === 'playing' ? "Отметить как пройденное" : "Начать играть"}
                          >
                            {gameStatus === 'playing' ? 'Пройдено' : 'В процессе'}
                          </button>
                        )}
                      </div>
                    ) : (
                      <button
                        className={`add-btn ${user ? '' : 'disabled'}`}
                        onClick={() => {
                          if (user) {
                            setSelectedGame(game);
                            setShowStatusModal(true);
                          }
                        }}
                        disabled={!user}
                        title={user ? "Добавить в профиль" : "Войдите, чтобы добавить"}
                      >
                        {user ? 'Добавить' : 'Войдите'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {filteredGames.length > 0 && (
            <div className="games-count">
              Найдено: <span>{filteredGames.length}</span> {filteredGames.length === 1 ? 'игра' : filteredGames.length < 5 ? 'игры' : 'игр'}
            </div>
          )}
        </main>
      </div>

     // Модальное окно выбора статуса
{showStatusModal && selectedGame && (
  <div className="modal-overlay" onClick={() => setShowStatusModal(false)}>
    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
      <div className="modal-header">
        <h3>Куда добавить?</h3>
        <p className="modal-subtitle">"{selectedGame.name}"</p>
        <button className="modal-close" onClick={() => setShowStatusModal(false)}>
          ✕
        </button>
      </div>
      
      <div className="modal-buttons">
        <button 
          className="modal-btn planning" 
          onClick={() => { addGameToProfile(selectedGame, 'planning'); setShowStatusModal(false); }}
        >
          <span className="btn-text">
            <span className="btn-title">Хочу поиграть</span>
            <span className="btn-desc">Добавить в список желаемого</span>
          </span>
        </button>
        
        <button 
          className="modal-btn playing" 
          onClick={() => { addGameToProfile(selectedGame, 'playing'); setShowStatusModal(false); }}
        >
          <span className="btn-text">
            <span className="btn-title">Играю сейчас</span>
            <span className="btn-desc">Начать прохождение</span>
          </span>
        </button>
        
        <button 
          className="modal-btn completed" 
          onClick={() => { addGameToProfile(selectedGame, 'completed'); setShowStatusModal(false); }}
        >
          <span className="btn-text">
            <span className="btn-title">Пройдено</span>
            <span className="btn-desc">Отметить как завершённое</span>
          </span>
        </button>
      </div>
    </div>
  </div>
)}

      {/* Кнопка прокрутки наверх */}
      {showScrollTop && (
        <button className="scroll-to-top" onClick={scrollToTop} aria-label="Вернуться наверх">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"/>
          </svg>
        </button>
      )}
    </div>
  );
};

export default App;
