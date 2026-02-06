// server/server.js
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config(); 
const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 10000;

// Mock-данные (30 игр)
const mockGames = [
  { 
    id: 1, 
    name: "Resident Evil 4", 
    released: "2023-03-24", 
    background_image: "https://img.ggsel.net/102110332/original/AUTOxAUTO/6c1a696f3176c1c8093b3fa46c9133a9.webp",
    description: "Ремейк культовой игры о приключениях Леона Кеннеди в испанской деревне, полной зомби-крестьян."
  },
  { 
    id: 2, 
    name: "Silent Hill 2", 
    released: "2001-09-24", 
    background_image: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2124490/capsule_616x353.jpg?t=1744248682",
    description: "Психологический хоррор о Джеймсе Сандерленде, который отправляется в город его кошмаров в поисках своей умершей жены."
  },
  { 
    id: 3, 
    name: "Dead Space 2", 
    released: "2023-01-27", 
    background_image: "https://cdn1.epicgames.com/spt-assets/3d281cbdd65142acbf834aeb20f7bc0c/dead-space-2-19wrn.jpg",
    description: "Ремастер классического хоррора в космосе. Айзек Кларк возвращается, чтобы противостоять Некроморфам."
  },
  { 
    id: 4, 
    name: "The Evil Within 2", 
    released: "2014-10-14", 
    background_image: "https://cdn1.epicgames.com/offer/5891aa5c4c6f4aabbf555a679e02cfb9/EGS_TheEvilWithin2_TangoGameworks_S1_2560x1440-c87f377e1990d84a98db5fb4836af9a9",
    description: "Детектив Себастьян Кастелланос погружается в мир кошмаров, чтобы спасти свою дочь."
  },
  { 
    id: 5, 
    name: "Outlast", 
    released: "2013-09-04", 
    background_image: "https://cdn1.epicgames.com/offer/78f42129096d4233bccc527733debfbd/EGS_Outlast_RedBarrels_S2_1200x1600-b02ebdfb4bcd3b1d608ab5b87257b3c4",
    description: "Журналист расследует тайны психиатрической лечебницы Маунт-Массив. Без оружия, только с камерой."
  },
  { 
    id: 6, 
    name: "DOOM Eternal", 
    released: "2020-03-20", 
    background_image: "https://cdn1.epicgames.com/offer/b5ac16dc12f3478e99dcfea07c13865c/EGS_DOOMEternalDeluxeEdition_idSoftware_Editions_S1_2560x1440-12a6ff734f43f831e6b90eec8e411b21",
    description: "Убивай демонов, качай рок-саундтрек. Самый быстрый и агрессивный шутер десятилетия."
  },
  { 
    id: 7, 
    name: "Call of Duty: Modern Warfare II", 
    released: "2022-10-28", 
    background_image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT60dk_gL8hJJtYCbCdPzmitAqQV_WQu-x1lw&s",
    description: "Тактический шутер от Task Force 141. Современная война, спецоперации, мультиплеер нового поколения."
  },
  { 
    id: 8, 
    name: "Halo Infinite", 
    released: "2021-12-08", 
    background_image: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1708091/capsule_616x353.jpg?t=1763578010",
    description: "Мастер Чиф возвращается на Звёздный Кольцо. Открытый мир, эпичные сражения, кооператив."
  },
  { 
    id: 9, 
    name: "Battlefield 2042", 
    released: "2021-11-19", 
    background_image: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1517290/header.jpg?t=1761752400",
    description: "Будущее войны. До 128 игроков в одном бою. Динамическая погода, разрушаемость, специалисты."
  },
  { 
    id: 10, 
    name: "Half-Life 2", 
    released: "2004-11-16", 
    background_image: "https://img.ggsel.net/5313041/original/AUTOxAUTO/8906514_imgwebp.webp",
    description: "Классика всех времён. Гордон Фримен против Альянса. Физика, повествование, инновации."
  },
  { 
    id: 11, 
    name: "The Witcher 3: Wild Hunt", 
    released: "2015-05-19", 
    background_image: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/292030/ad9240e088f953a84aee814034c50a6a92bf4516/header.jpg?t=1756366569",
    description: "Геральт из Ривии ищет свою приёмную дочь Цири. Огромный открытый мир, выбор и последствия."
  },
  { 
    id: 12, 
    name: "Cyberpunk 2077", 
    released: "2020-12-10", 
    background_image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRgK020HdJlnxesOkODk-1vJc7aVnM0aBd6Eg&s",
    description: "Жизнь в Найт-Сити. Вы — V, наёмник с чипом, содержащим сознание Джонни Сильверхэнда."
  },
  { 
    id: 13, 
    name: "Elden Ring", 
    released: "2022-02-25", 
    background_image: "https://www.nintendo.com/eu/media/images/assets/nintendo_switch_2_games/eldenringtarnishededition/2x1_NSwitch2_EldenRing.jpg",
    description: "От создателей Dark Souls и писателя Джорджа Мартина. Эпичный фэнтези-мир, боссы, свобода."
  },
  { 
    id: 14, 
    name: "Horizon Zero Dawn", 
    released: "2017-02-28", 
    background_image: "https://cdn2.unrealengine.com/egs-horizonzerodawnremastered-guerrillagames-g1a-00-1920x1080-c0d45f881715.jpg",
    description: "Алойша исследует постапокалиптический мир, где люди живут среди механических зверей."
  },
  { 
    id: 15, 
    name: "God of War ragnarok", 
    released: "2018-04-20", 
    background_image: "https://cdn1.epicgames.com/spt-assets/edaff839f0734d16bc89d2ddb1dc9339/steel-magnolia-15owu.jpg",
    description: "Кратос и Атрей в мире скандинавской мифологии. Отец и сын против богов."
  },
  { 
    id: 16, 
    name: "Red Dead Redemption 2", 
    released: "2018-10-26", 
    background_image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR37ZpX19YISFEH3Uc40X--F4MVmBI-SPXCGQ&s",
    description: "История Артура Моргана и банды Датча Ван дер Линде в конце Дикого Запада."
  },
  { 
    id: 17, 
    name: "The Last of Us Part I", 
    released: "2022-09-02", 
    background_image: "https://cdn1.epicgames.com/offer/0c40923dd1174a768f732a3b013dcff2/EGS_TheLastofUsPartI_NaughtyDogLLC_S2_1200x1600-41d1b88814bea2ee8cb7986ec24713e0",
    description: "Ремастер культовой истории выживания. Джоэл и Элли в мире, опустошённом грибковой инфекцией."
  },
  { 
    id: 18, 
    name: "Final Fantasy VII Remake", 
    released: "2020-04-10", 
    background_image: "https://cdn1.epicgames.com/offer/6f43ab8025ad42d18510aa91e9eb688b/EGS_FINALFANTASYVIIREMAKEINTERGRADE_SquareEnix_S1_2560x1440-85f829541a833442eaace75d02e0f07d",
    description: "Клауд и команда борются против корпорации Шин-Ра в мегаполисе Мидгар."
  },
  { 
    id: 19, 
    name: "Mass Effect Legendary Edition", 
    released: "2021-05-14", 
    background_image: "https://gamepropaganda.com/wp-content/uploads/2024/04/xK2b8gY5A5oyYlc1pnUUVEm5.jpg",
    description: "Командир Шепард спасает галактику от вторжения Жнецов. Трилогия в одном издании."
  },
  { 
    id: 20, 
    name: "Assassin's Creed Valhalla", 
    released: "2020-11-10", 
    background_image: "https://cdn1.epicgames.com/400347196e674de89c23cc2a7f2121db/offer/AC%20KINGDOM%20PREORDER_STANDARD%20EDITION_EPIC_Key_Art_Wide_3840x2160-3840x2160-485fe17203671386c71bde8110886c7d.jpg",
    description: "Вы — Эйвор, викинг, основывающий поселение в Англии IX века."
  },
  { 
    id: 21, 
    name: "Starfield", 
    released: "2023-09-06", 
    background_image: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1716740/header.jpg?t=1749757928",
    description: "Первая новая вселенная Bethesda за 25 лет. Исследуйте 1000+ планет в космосе."
  },
  { 
    id: 22, 
    name: "Baldur's Gate 3", 
    released: "2023-08-03", 
    background_image: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1086940/59827b3d0abf2f29adacfe72fdfd11059d6974e2/capsule_616x353.jpg?t=1765505948",
    description: "Эпическая RPG по миру Dungeons & Dragons. Ваш выбор формирует историю."
  },
  { 
    id: 23, 
    name: "Spider-Man: Miles Morales", 
    released: "2020-11-12", 
    background_image: "https://cdn1.epicgames.com/offer/f696430be718494fac1d6542cfb22542/EGS_MarvelsSpiderManMilesMorales_InsomniacGamesNixxesSoftware_S2_1200x1600-58989e7116de3f70a2ae6ea56ee202c6",
    description: "Майлз Моралес берёт на себя роль Человека-паука в Нью-Йорке."
  },
  { 
    id: 24, 
    name: "Hogwarts Legacy", 
    released: "2023-02-10", 
    background_image: "https://cdn1.epicgames.com/offer/e97659b501af4e3981d5430dad170911/EGS_HogwartsLegacy_AvalancheSoftware_S1_2560x1440-aa80981dd7c9b3f26b12606974a76dba_2560x1440-aa80981dd7c9b3f26b12606974a76dba",
    description: "Станьте студентом Хогвартса в XIX веке. Изучайте заклинания, питомцы, тайны."
  },
  { 
    id: 25, 
    name: "Diablo IV", 
    released: "2023-06-06", 
    background_image: "https://gamepropaganda.com/wp-content/uploads/2024/04/Oo1B84A7BLCT157YFSxjtwG0.jpg",
    description: "Тьма накрывает Санктуарий. Пять классов, кооператив, бесконечные подземелья."
  },
  { 
    id: 26, 
    name: "Forza Horizon 5", 
    released: "2021-11-09", 
    background_image: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1551360/capsule_616x353.jpg?t=1746471508",
    description: "Гонки в Мексике. Сезоны, сотни машин, онлайн-фестиваль."
  },
  { 
    id: 27, 
    name: "FIFA 23", 
    released: "2022-09-30", 
    background_image: "https://cdn2.unrealengine.com/ea-sports-fifa-23-is-coming-to-the-epic-games-store-1920x1080-398e19351a82.jpg",
    description: "Последняя часть под брендом FIFA. Реализм, Ultimate Team, карьерный режим."
  },
  { 
    id: 28, 
    name: "Minecraft", 
    released: "2011-11-18", 
    background_image: "https://image.api.playstation.com/vulcan/ap/rnd/202407/0401/670c294ded3baf4fa11068db2ec6758c63f7daeb266a35a1.png",
    description: "Создавайте, стройте, выживайте. Бесконечный песочниц-симулятор."
  },
  { 
    id: 29, 
    name: "The Sims 4", 
    released: "2014-09-02", 
    background_image: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1222670/capsule_616x353.jpg?t=1765476116",
    description: "Создавайте персонажей, стройте дома, управляйте жизнью."
  },
  { 
    id: 30, 
    name: "Stellaris", 
    released: "2016-05-09", 
    background_image: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/281990/header.jpg?t=1764336805",
    description: "Стратегия в реальном времени с элементами 4X, где игроки исследуют галактику, встречают инопланетные расы и строят империю."
  }
];

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  credentials: true
}));

app.use(express.json());

// Тестовый эндпоинт
app.get('/api', (req, res) => {
  res.json({ message: 'Eternal Fang backend is LIVE!' });
});

// Поиск игр
app.get('/api/games/search', (req, res) => {
  const { q } = req.query;
  const results = q
    ? mockGames.filter(g => g.name.toLowerCase().includes(q.toLowerCase()))
    : mockGames;
  res.json({ results });
});

// Создать пользователя
app.post('/api/user', async (req, res) => {
  try {
    const { username, email } = req.body;
    const user = await prisma.user.create({
      data: {
        username,
        email,
        games: [],
      }
    });
    res.status(201).json(user);
  } catch (err) {
    console.error('Ошибка создания пользователя:', err);
    if (err.code === 'P2002') {
      return res.status(400).json({ error: 'Пользователь уже существует' });
    }
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Получить пользователя
app.get('/api/user/:email', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { email: req.params.email }
    });
    if (!user) return res.status(404).json({ error: 'Пользователь не найден' });
    res.json(user);
  } catch (err) {
    console.error('Ошибка получения пользователя:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Добавить/обновить игру
app.post('/api/user/:email/game', async (req, res) => {
  try {
    const { email } = req.params;
    const { gameId, title, status = 'planning', progress = 0 } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: 'Пользователь не найден' });

    const games = Array.isArray(user.games) ? user.games : [];
    const existingIndex = games.findIndex(g => g.gameId.toString() === gameId.toString());

    let updatedGames;
    if (existingIndex >= 0) {
      games[existingIndex] = { ...games[existingIndex], status, progress };
      updatedGames = games;
    } else {
      updatedGames = [...games, { gameId, title, status, progress }];
    }

    const updatedUser = await prisma.user.update({
      where: { email },
      data: { games: updatedGames }
    });

    res.json(updatedUser);
  } catch (err) {
    console.error('Ошибка обновления игры:', err);
    res.status(500).json({ error: 'Ошибка при обновлении игры' });
  }
});

// Удалить игру
app.delete('/api/user/:email/game/:gameId', async (req, res) => {
  try {
    const { email, gameId } = req.params;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: 'Пользователь не найден' });

    const games = Array.isArray(user.games) ? user.games : [];
    const updatedGames = games.filter(game => game.gameId.toString() !== gameId.toString());

    const updatedUser = await prisma.user.update({
      where: { email },
      data: { games: updatedGames }
    });

    res.json(updatedUser);
  } catch (err) {
    console.error('Ошибка удаления игры:', err);
    res.status(500).json({ error: 'Ошибка при удалении игры' });
  }
});

// Обработчик 404
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Завершение работы
const shutdown = async () => {
  try {
    await prisma.$disconnect();
    console.log('✅ Отключились от базы данных');
    process.exit(0);
  } catch (err) {
    console.error('❌ Ошибка при отключении от базы данных:', err);
    process.exit(1);
  }
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// Обработчики ошибок
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  setTimeout(() => process.exit(1), 5000);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  setTimeout(() => process.exit(1), 5000);
});

// Подключение к БД и запуск сервера
prisma.$connect()
  .then(() => {
    console.log('✅ Подключение к БД успешно');
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`✅ Eternal Fang backend запущен на порту ${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ Ошибка подключения к БД:', err);
  });
