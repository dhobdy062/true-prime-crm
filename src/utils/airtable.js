import Airtable from 'airtable';

// Access environment variables
const apiKey = process.env.REACT_APP_AIRTABLE_API_KEY;
const baseId = process.env.REACT_APP_AIRTABLE_BASE_ID;

// Set up Airtable configuration
const base = new Airtable({ apiKey }).base(baseId);

// Tables based on the schema
const TABLES = {
  LEADS: 'Leads',
  SALES_PERSON: 'SalesPerson',
  NOTE: 'Note',
  STAGE: 'Stage'
};

// Get all leads
export const getLeads = async () => {
  try {
    const records = await base(TABLES.LEADS).select().all();
    return records.map(record => ({
      id: record.id,
      name: record.get('Name'),
      companyName: record.get('Company Name'),
      address: record.get('Address'),
      phone: record.get('Phone Number'),
      email: record.get('Email'),
      website: record.get('Website'),
      industry: record.get('industry'),
      assignedTo: record.get('Sales Person')?.[0],
      disposition: record.get('Disposition')?.[0],
      createdTime: record.get('Date Created'),
      // Extract city from address for filtering
      city: extractCityFromAddress(record.get('Address'))
    }));
  } catch (error) {
    console.error('Error fetching leads:', error);
    throw error;
  }
};

// Helper function to extract city from address
const extractCityFromAddress = (address) => {
  if (!address) return '';
  const parts = address.split(',');
  if (parts.length >= 2) {
    // Assuming format like "123 Main St, City, State Zip"
    return parts[1].trim();
  }
  return '';
};

// Get all sales people
export const getSalesPeople = async () => {
  try {
    const records = await base(TABLES.SALES_PERSON).select().all();
    return records.map(record => ({
      id: record.id,
      name: record.get('SalesPerson'),
      email: record.get('Name'), // Email is in the Name field
      phone: record.get('Phone Ext'),
      openLeads: record.get('Total Open Leads') || 0,
      totalLeads: 0, // We'll calculate this from leads assigned to this person
      leadIds: record.get('Leads') || []
    }));
  } catch (error) {
    console.error('Error fetching sales people:', error);
    throw error;
  }
};

// Assign lead to sales person (with proper linked record updates)
export const assignLeadToSalesPerson = async (leadId, salesPersonId) => {
  try {
    // First, get the current lead record to see if it's already assigned
    const lead = await base(TABLES.LEADS).find(leadId);
    const currentSalesPersonId = lead.fields['Sales Person'] ? lead.fields['Sales Person'][0] : null;
    
    // 1. Update the lead record with the new sales person
    await base(TABLES.LEADS).update(leadId, {
      'Sales Person': [salesPersonId],
    });
    
    // 2. If the lead was previously assigned to a different sales person,
    // remove it from their Leads array
    if (currentSalesPersonId && currentSalesPersonId !== salesPersonId) {
      const currentSalesPerson = await base(TABLES.SALES_PERSON).find(currentSalesPersonId);
      const updatedLeads = (currentSalesPerson.fields['Leads'] || [])
        .filter(id => id !== leadId);
      
      await base(TABLES.SALES_PERSON).update(currentSalesPersonId, {
        'Leads': updatedLeads
      });
    }
    
    // 3. Add the lead to the new sales person's Leads array
    const newSalesPerson = await base(TABLES.SALES_PERSON).find(salesPersonId);
    const existingLeads = newSalesPerson.fields['Leads'] || [];
    
    // Only add the lead if it's not already in the array
    if (!existingLeads.includes(leadId)) {
      await base(TABLES.SALES_PERSON).update(salesPersonId, {
        'Leads': [...existingLeads, leadId]
      });
    }
    
    return true;
  } catch (error) {
    console.error('Error assigning lead:', error);
    throw error;
  }
};

// Update lead disposition
export const updateLeadDisposition = async (leadId, disposition) => {
  try {
    await base(TABLES.LEADS).update(leadId, {
      'Disposition': disposition ? [disposition] : [],
    });
    return true;
  } catch (error) {
    console.error('Error updating disposition:', error);
    throw error;
  }
};

// Add a note to a lead
export const addNote = async (leadId, noteText, salesPersonId, communicationType = 'Call') => {
  try {
    await base(TABLES.NOTE).create({
      'Account': [leadId],
      'Note': noteText,
      'SalesPerson (from Sales Person)': salesPersonId ? [salesPersonId] : [],
      'Communication': communicationType,
    });
    return true;
  } catch (error) {
    console.error('Error adding note:', error);
    throw error;
  }
};

// Get notes for a lead
export const getNotesForLead = async (leadId) => {
  try {
    const records = await base(TABLES.NOTE)
      .select({
        filterByFormula: `FIND("${leadId}", ARRAYJOIN({Account})) > 0`
      })
      .all();
      
    return records.map(record => ({
      id: record.id,
      note: record.get('Note'),
      created: record.get('Created'),
      communication: record.get('Communication'),
      salesPerson: record.get('SalesPerson (from SalesPerson (from Sales Person))')?.[0]
    }));
  } catch (error) {
    console.error('Error fetching notes:', error);
    throw error;
  }
};

// Get disposition options (from Airtable schema)
export const getDispositionOptions = () => {
  return ["Transferred", "LM"]; // These are the options from the Airtable schema
};