import React, { useState, useEffect } from 'react';
import { X, Mail, Phone, Globe, Filter } from 'lucide-react';

const TruePrimeCRM = () => {
  // State for leads, salespeople, filters, and UI elements
  const [leads, setLeads] = useState([]);
  const [salesPeople, setSalesPeople] = useState([]);
  const [filterIndustry, setFilterIndustry] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const [industries, setIndustries] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedLead, setSelectedLead] = useState(null);
  const [note, setNote] = useState('');
  const [disposition, setDisposition] = useState('');
  const [draggedLead, setDraggedLead] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);

  // Mock data fetch function - would be replaced with actual Airtable API calls
  useEffect(() => {
    const fetchData = async () => {
      try {
        // This would be replaced with actual Airtable API calls
        const mockLeads = [
          { id: 'lead1', name: 'Acme Corporation', phone: '555-123-4567', email: 'contact@acme.com', website: 'https://acme.com', industry: 'Manufacturing', address: '123 Main St, Boston, MA', assignedTo: null, disposition: null },
          { id: 'lead2', name: 'TechStart Inc', phone: '555-987-6543', email: 'info@techstart.io', website: 'https://techstart.io', industry: 'Technology', address: '456 Innovation Ave, San Francisco, CA', assignedTo: null, disposition: null },
          { id: 'lead3', name: 'Green Earth Foods', phone: '555-456-7890', email: 'hello@greenearth.com', website: 'https://greenearth.com', industry: 'Food', address: '789 Organic Lane, Portland, OR', assignedTo: null, disposition: null },
          { id: 'lead4', name: 'Financial Partners', phone: '555-246-8102', email: 'clients@finpartners.com', website: 'https://finpartners.com', industry: 'Finance', address: '101 Money St, New York, NY', assignedTo: null, disposition: null },
          { id: 'lead5', name: 'Creative Solutions', phone: '555-135-7924', email: 'design@creativesol.com', website: 'https://creativesol.com', industry: 'Design', address: '202 Art Blvd, Austin, TX', assignedTo: null, disposition: null },
        ];
        
        const mockSalesPeople = [
          { id: 'sp1', name: 'Alex Johnson', email: 'alex@trueprime.com', phone: 'x1001', openLeads: 0, totalLeads: 0 },
          { id: 'sp2', name: 'Sam Williams', email: 'sam@trueprime.com', phone: 'x1002', openLeads: 0, totalLeads: 0 },
          { id: 'sp3', name: 'Jordan Smith', email: 'jordan@trueprime.com', phone: 'x1003', openLeads: 0, totalLeads: 0 },
        ];
        
        // Extract industries and cities for filters
        const uniqueIndustries = [...new Set(mockLeads.map(lead => lead.industry))];
        const uniqueCities = [...new Set(mockLeads.map(lead => {
          const addressParts = lead.address.split(',');
          return addressParts[addressParts.length - 2]?.trim() || '';
        }))];
        
        setLeads(mockLeads);
        setSalesPeople(mockSalesPeople);
        setIndustries(uniqueIndustries);
        setCities(uniqueCities);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    
    fetchData();
  }, []);

  // Filter leads based on selected filters
  const filteredLeads = leads.filter(lead => {
    const matchesIndustry = !filterIndustry || lead.industry === filterIndustry;
    const addressParts = lead.address.split(',');
    const city = addressParts[addressParts.length - 2]?.trim() || '';
    const matchesCity = !filterCity || city === filterCity;
    return matchesIndustry && matchesCity && !lead.assignedTo;
  });

  // Drag handlers
  const handleDragStart = (lead) => {
    setDraggedLead(lead);
  };

  const handleDragOver = (e, columnId) => {
    e.preventDefault();
    setDragOverColumn(columnId);
  };

  const handleDragEnd = () => {
    setDraggedLead(null);
    setDragOverColumn(null);
  };

  const handleDrop = (e, salesPersonId) => {
    e.preventDefault();
    if (!draggedLead) return;
    
    // Check if this is a valid drop target
    if (!salesPersonId.startsWith('sp')) return;
    
    const salesperson = salesPeople.find(sp => sp.id === salesPersonId);
    
    // Check if salesperson has reached their open lead limit
    if (salesperson.openLeads >= 25) {
      alert(`${salesperson.name} has reached the maximum limit of 25 open leads.`);
      return;
    }
    
    // Assign lead to salesperson
    setLeads(leads.map(lead => {
      if (lead.id === draggedLead.id) {
        return { ...lead, assignedTo: salesPersonId };
      }
      return lead;
    }));
    
    // Update salesperson's lead counts
    setSalesPeople(salesPeople.map(sp => {
      if (sp.id === salesPersonId) {
        return { 
          ...sp, 
          openLeads: sp.openLeads + 1, 
          totalLeads: sp.totalLeads + 1 
        };
      }
      return sp;
    }));
    
    setDraggedLead(null);
    setDragOverColumn(null);
  };

  // Open lead details modal
  const openLeadDetails = (lead) => {
    setSelectedLead(lead);
    setDisposition(lead.disposition || '');
    setNote('');
  };

  // Close lead details modal
  const closeLeadDetails = () => {
    setSelectedLead(null);
    setDisposition('');
    setNote('');
  };

  // Save lead disposition and note
  const saveLeadDetails = () => {
    if (!selectedLead) return;
    
    // Update lead with new disposition
    const updatedLeads = leads.map(lead => {
      if (lead.id === selectedLead.id) {
        return { ...lead, disposition };
      }
      return lead;
    });
    
    setLeads(updatedLeads);
    
    // If lead is assigned and disposition is updated, update salesperson's open lead count
    if (selectedLead.assignedTo && !selectedLead.disposition && disposition) {
      setSalesPeople(salesPeople.map(sp => {
        if (sp.id === selectedLead.assignedTo) {
          return { ...sp, openLeads: sp.openLeads - 1 };
        }
        return sp;
      }));
    }
    
    // Save note (in a real implementation, this would create a note in Airtable)
    if (note) {
      console.log(`Saving note for lead ${selectedLead.id}: ${note}`);
      // This would call the Airtable API to create a new note
    }
    
    closeLeadDetails();
  };

  // Render a lead card
  const renderLeadCard = (lead) => (
    <div 
      key={lead.id}
      className={`bg-white p-3 mb-2 rounded shadow cursor-pointer hover:shadow-md ${
        lead.disposition ? 'border-l-4 border-green-500' : ''
      }`}
      onClick={() => openLeadDetails(lead)}
      draggable={!lead.assignedTo}
      onDragStart={() => handleDragStart(lead)}
      onDragEnd={handleDragEnd}
    >
      <h3 className="font-semibold">{lead.name}</h3>
      <div className="text-sm flex items-center mt-1">
        <Phone size={14} className="mr-1" />
        <span>{lead.phone}</span>
      </div>
      {lead.email && (
        <div className="text-sm flex items-center mt-1">
          <Mail size={14} className="mr-1" />
          <span className="truncate">{lead.email}</span>
        </div>
      )}
      {lead.website && (
        <div className="text-sm flex items-center mt-1">
          <Globe size={14} className="mr-1" />
          <span className="truncate">{lead.website}</span>
        </div>
      )}
      {lead.disposition && (
        <div className="mt-1 text-sm font-medium bg-green-100 px-2 py-1 rounded text-green-800">
          {lead.disposition}
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-blue-700 text-white p-4 shadow-md">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">True Prime B2B CRM</h1>
          <div className="flex space-x-4">
            <div className="flex items-center">
              <Filter className="mr-2" size={18} />
              <select 
                className="bg-blue-600 text-white p-2 rounded"
                value={filterIndustry}
                onChange={(e) => setFilterIndustry(e.target.value)}
              >
                <option value="">All Industries</option>
                {industries.map(industry => (
                  <option key={industry} value={industry}>{industry}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center">
              <Filter className="mr-2" size={18} />
              <select 
                className="bg-blue-600 text-white p-2 rounded"
                value={filterCity}
                onChange={(e) => setFilterCity(e.target.value)}
              >
                <option value="">All Cities</option>
                {cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </header>
      
      {/* Kanban Board */}
      <div className="flex overflow-x-auto h-full p-4 space-x-4">
        {/* Leads Column */}
        <div 
          className="flex-shrink-0 w-80"
          onDragOver={(e) => handleDragOver(e, 'leads')}
        >
          <div className="bg-gray-200 rounded-t-lg p-3">
            <h2 className="font-bold text-lg">LEADS ({filteredLeads.length})</h2>
          </div>
          <div 
            className={`bg-gray-100 rounded-b-lg p-2 h-full overflow-y-auto ${
              dragOverColumn === 'leads' ? 'bg-blue-50' : ''
            }`}
            style={{ minHeight: "calc(100vh - 160px)" }}
          >
            {filteredLeads.map(lead => renderLeadCard(lead))}
          </div>
        </div>
        
        {/* Sales People Columns */}
        {salesPeople.map(salesperson => {
          const assignedLeads = leads.filter(lead => lead.assignedTo === salesperson.id);
          
          return (
            <div 
              key={salesperson.id} 
              className="flex-shrink-0 w-80"
              onDragOver={(e) => handleDragOver(e, salesperson.id)}
              onDrop={(e) => handleDrop(e, salesperson.id)}
            >
              <div className="bg-gray-200 rounded-t-lg p-3">
                <h2 className="font-bold text-lg">{salesperson.name}</h2>
                <div className="flex justify-between text-sm mt-1">
                  <div className="flex items-center">
                    <Mail size={14} className="mr-1" />
                    <span>{salesperson.email}</span>
                  </div>
                  <span>Ext: {salesperson.phone}</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className={salesperson.openLeads >= 25 ? 'text-red-600 font-bold' : ''}>
                    Open Leads: {salesperson.openLeads}/25
                  </span>
                  <span>Total Leads: {salesperson.totalLeads}</span>
                </div>
              </div>
              <div 
                className={`bg-gray-100 rounded-b-lg p-2 overflow-y-auto ${
                  dragOverColumn === salesperson.id ? 'bg-blue-50 border-2 border-dashed border-blue-300' : ''
                }`}
                style={{ minHeight: "calc(100vh - 200px)" }}
              >
                {assignedLeads.map(lead => renderLeadCard(lead))}
                {dragOverColumn === salesperson.id && assignedLeads.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    Drop lead here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Lead Details Modal */}
      {selectedLead && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-bold">{selectedLead.name}</h2>
              <button onClick={closeLeadDetails} className="text-gray-500 hover:text-gray-800">
                <X size={20} />
              </button>
            </div>
            <div className="p-4">
              <div className="space-y-3">
                <div>
                  <div className="flex items-center">
                    <Phone size={16} className="mr-2 text-gray-600" />
                    <span>{selectedLead.phone}</span>
                  </div>
                  {selectedLead.email && (
                    <div className="flex items-center mt-2">
                      <Mail size={16} className="mr-2 text-gray-600" />
                      <span>{selectedLead.email}</span>
                    </div>
                  )}
                  {selectedLead.website && (
                    <div className="flex items-center mt-2">
                      <Globe size={16} className="mr-2 text-gray-600" />
                      <a href={selectedLead.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {selectedLead.website}
                      </a>
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-gray-700">{selectedLead.address}</p>
                  <p className="text-gray-700">Industry: {selectedLead.industry}</p>
                </div>
                
                <div className="pt-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Disposition
                  </label>
                  <select
                    className="w-full border border-gray-300 rounded-md shadow-sm p-2"
                    value={disposition}
                    onChange={(e) => setDisposition(e.target.value)}
                  >
                    <option value="">Select disposition...</option>
                    <option value="Transferred">Transferred</option>
                    <option value="LM">Left Message</option>
                    <option value="Interested">Interested</option>
                    <option value="Not Interested">Not Interested</option>
                    <option value="Call Back">Call Back</option>
                  </select>
                </div>
                
                <div className="pt-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Add Note
                  </label>
                  <textarea
                    className="w-full border border-gray-300 rounded-md shadow-sm p-2 h-24"
                    placeholder="Enter notes about this lead..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  ></textarea>
                </div>
              </div>
            </div>
            <div className="px-4 py-3 bg-gray-50 text-right rounded-b-lg">
              <button
                onClick={saveLeadDetails}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TruePrimeCRM;
