import { getDatabase } from './database';

export function seedDatabase() {
  const db = getDatabase();

  const countRow = db.prepare('SELECT COUNT(*) as count FROM leaderboard;').get() as { count: number };
  if (countRow && countRow.count > 0) {
    console.log('Database already seeded.');
    return;
  }

  console.log('Seeding initial leaderboard and sample achievements...');

  const sampleLeaderboard = [
    {
      id: 'seed-1',
      player_name: 'Mayor EcoMira',
      city_name: 'Solar Haven',
      avatar: 'mira',
      difficulty: 'normal',
      sustainability_index: 88.5,
      resilience_score: 92.0,
      stars_total: 15,
      credits: 140,
      created_at: new Date(Date.now() - 86400000 * 3).toISOString()
    },
    {
      id: 'seed-2',
      player_name: 'Chief Volt',
      city_name: 'Electron Bay',
      avatar: 'volt',
      difficulty: 'hard',
      sustainability_index: 82.1,
      resilience_score: 85.5,
      stars_total: 13,
      credits: 110,
      created_at: new Date(Date.now() - 86400000 * 2).toISOString()
    },
    {
      id: 'seed-3',
      player_name: 'Captain Zoomer',
      city_name: 'Transitopolis',
      avatar: 'zoom',
      difficulty: 'normal',
      sustainability_index: 78.4,
      resilience_score: 79.0,
      stars_total: 11,
      credits: 95,
      created_at: new Date(Date.now() - 86400000 * 1).toISOString()
    },
    {
      id: 'seed-4',
      player_name: 'Green Pioneer',
      city_name: 'Recycle City',
      avatar: 'rina',
      difficulty: 'easy',
      sustainability_index: 74.0,
      resilience_score: 72.5,
      stars_total: 9,
      credits: 75,
      created_at: new Date().toISOString()
    }
  ];

  const insertStmt = db.prepare(`
    INSERT INTO leaderboard (id, player_name, city_name, avatar, difficulty, sustainability_index, resilience_score, stars_total, credits, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const item of sampleLeaderboard) {
    insertStmt.run(
      item.id,
      item.player_name,
      item.city_name,
      item.avatar,
      item.difficulty,
      item.sustainability_index,
      item.resilience_score,
      item.stars_total,
      item.credits,
      item.created_at
    );
  }

  console.log('Seed completed successfully!');
}

if (require.main === module) {
  seedDatabase();
}
