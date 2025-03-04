// In src/utils/airtable.js
import Airtable from 'airtable';

// Access environment variables
const apiKey = process.env.REACT_APP_AIRTABLE_API_KEY;
const baseId = process.env.REACT_APP_AIRTABLE_BASE_ID;

// Set up Airtable configuration
const base = new Airtable({ apiKey }).base(baseId);
