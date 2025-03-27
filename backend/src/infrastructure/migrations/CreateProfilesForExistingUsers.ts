// import { MigrationInterface, QueryRunner } from 'typeorm';

// export class CreateProfilesForExistingUsers1234567890124
//   implements MigrationInterface
// {
//   public async up(queryRunner: QueryRunner): Promise<void> {
//     // Hole alle Benutzer, die noch kein Profil haben
//     const users = await queryRunner.query(`
//       SELECT u.* FROM users u
//       LEFT JOIN user_profiles up ON u.id = up.user_id
//       WHERE up.id IS NULL
//     `);

//     // Erstelle Profile für jeden Benutzer
//     for (const user of users) {
//       await queryRunner.query(
//         `
//         INSERT INTO user_profiles (
//           username,
//           email,
//           user_id,
//           follower_count,
//           created_at,
//           updated_at
//         ) VALUES (
//           $1,
//           $2,
//           $3,
//           $4,
//           CURRENT_TIMESTAMP,
//           CURRENT_TIMESTAMP
//         )
//       `,
//         [user.username, user.email, user.id, 0],
//       );
//     }
//   }

//   public async down(queryRunner: QueryRunner): Promise<void> {
//     // Optional: Lösche alle automatisch erstellten Profile
//     await queryRunner.query(`
//       DELETE FROM user_profiles
//       WHERE user_id IN (
//         SELECT id FROM users
//       )
//     `);
//   }
// }
