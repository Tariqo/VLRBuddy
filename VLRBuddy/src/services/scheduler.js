import { fetchAllData } from './dataFetcher';

let schedulerInterval = null;
let isInitialFetchComplete = false;

export const startScheduler = async () => {
  try {
    console.log('=== Starting Data Scheduler ===');
    
    // Force immediate data fetch
    console.log('Forcing immediate data fetch...');
    try {
      await fetchAllData();
      isInitialFetchComplete = true;
      console.log('Initial data fetch completed successfully');
    } catch (error) {
      console.error('Initial data fetch failed:', error);
      throw error; // Re-throw to handle in the outer catch
    }

    // Schedule updates every 5 minutes
    console.log('Setting up scheduled updates (every 5 minutes)...');
    schedulerInterval = setInterval(async () => {
      console.log('=== Running scheduled data update ===');
      try {
        await fetchAllData();
        console.log('Scheduled data update completed successfully');
      } catch (error) {
        console.error('Error during scheduled data update:', error);
      }
    }, 5 * 60 * 1000); // 5 minutes

    console.log('=== Data scheduler started successfully ===');
  } catch (error) {
    console.error('=== Error starting scheduler ===', error);
    throw error;
  }
};

export const stopScheduler = () => {
  if (schedulerInterval) {
    console.log('=== Stopping data scheduler ===');
    clearInterval(schedulerInterval);
    schedulerInterval = null;
    isInitialFetchComplete = false;
    console.log('=== Data scheduler stopped successfully ===');
  }
};

export const isSchedulerRunning = () => {
  return schedulerInterval !== null;
};

export const isDataFetched = () => {
  return isInitialFetchComplete;
}; 