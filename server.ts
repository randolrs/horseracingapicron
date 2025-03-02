// server.js
import express from 'express';
import cron from 'node-cron';
import fs from 'file-system';
import path from 'path';

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON
app.use(express.json());

// Simple route to check if server is running
app.get('/', (req, res) => {
  res.json({ status: 'Server is running', lastJobRun: getLastRunTime() });
});

// Function to perform daily task
function dailyTask() {
  console.log('Running daily task at:', new Date().toISOString());
  
  // Example task: Log to a file
  const logDir = path.join('/', 'logs');
  
  // Create logs directory if it doesn't exist
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
  }
  
  const logFile = path.join(logDir, 'daily-task.log');
  const logEntry = `Task executed at ${new Date().toISOString()}\n`;
  
  fs.appendFileSync(logFile, logEntry);
  
  // Store last run time
  fs.writeFileSync(path.join('/', 'last-run.txt'), new Date().toISOString());
  
  return true;
}

// Helper to get last run time
function getLastRunTime() {
  try {
    const lastRunFile = path.join('/', 'last-run.txt');
    if (fs.existsSync(lastRunFile)) {
      return fs.readFileSync(lastRunFile, 'utf8');
    }
  } catch (error) {
    console.error('Error reading last run time:', error);
  }
  return 'Never';
}

// Schedule task to run hourly at top of the hour (xx:00)
cron.schedule('0 * * * *', () => {
  try {
    const result = dailyTask();
    console.log('Scheduled task completed successfully:', result);
  } catch (error) {
    console.error('Error in scheduled task:', error);
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Cron job scheduled to run daily at midnight');
});