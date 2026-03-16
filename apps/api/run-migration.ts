import 'reflect-metadata';
import { controlPlaneDataSource } from './src/persistence/control-plane.datasource.js';

async function runMigrations() {
  try {
    await controlPlaneDataSource.initialize();
    console.log('Data source initialized');
    
    const migrations = await controlPlaneDataSource.runMigrations();
    console.log(`Ran ${migrations.length} migrations`);
    console.log('Migrations completed successfully');
    
    await controlPlaneDataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();
